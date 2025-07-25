"use server";

import { LogEvents } from "@iq24/events/events";
import { deleteTeamMember } from "@iq24upabase/mutations";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { authActionClient } from "./safe-action";
import { deleteTeamMemberSchema } from "./schema";

export const deleteTeamMemberAction = authActionClient
  .schema(deleteTeamMemberSchema)
  .metadata({
    name: "delete-team-member",
    track: {
      event: LogEvents.DeleteTeamMember.name,
      channel: LogEvents.DeleteTeamMember.channel,
    },
  })
  .action(
    async ({
      parsedInput: { revalidatePath, teamId, userId },
      ctx: { supabase },
    }) => {
      const { data } = await deleteTeamMember(supabase, { teamId, userId });

      if (revalidatePath) {
        revalidatePathFunc(revalidatePath);
      }

      return data;
    },
  );
