import { getTeamUser } from "@iq24/supabase/cached-queries";
import { getTeamMembersQuery } from "@iq24upabase/queries";
import { createClient } from "@iq24upabase/server";
import { DataTable } from "./table";

export async function MembersTable() {
  const supabase = createClient();
  const user = await getTeamUser();
  const teamMembers = await getTeamMembersQuery(supabase, user.data.team_id);

  return <DataTable data={teamMembers?.data} currentUser={user?.data} />;
}
