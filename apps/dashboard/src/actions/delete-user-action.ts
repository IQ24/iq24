"use server";

import { resend } from "@/utils/resend";
import { LogEvents } from "@iq24/events/events";
import { setupAnalytics } from "@iq24vents/server";
import { getUser } from "@iq24upabase/cached-queries";
import { deleteUser } from "@iq24upabase/mutations";
import { createClient } from "@iq24upabase/server";
import { redirect } from "next/navigation";

export const deleteUserAction = async () => {
  const supabase = createClient();
  const user = await getUser();

  const { data: membersData } = await supabase
    .from("users_on_team")
    .select("team_id, team:team_id(id, name, members:users_on_team(id))")
    .eq("user_id", user?.data?.id);

  const teamIds = membersData
    ?.filter(({ team }) => team?.members.length === 1)
    .map(({ team_id }) => team_id);

  if (teamIds?.length) {
    // Delete all teams with only one member
    await supabase.from("teams").delete().in("id", teamIds);
  }

  const userId = await deleteUser(supabase);

  await resend.contacts.remove({
    email: user.data?.email!,
    audienceId: process.env.RESEND_AUDIENCE_ID!,
  });

  const analytics = await setupAnalytics({
    userId,
  });

  analytics.track({
    event: LogEvents.DeleteUser.name,
    user_id: userId,
    channel: LogEvents.DeleteUser.channel,
  });

  redirect("/");
};
