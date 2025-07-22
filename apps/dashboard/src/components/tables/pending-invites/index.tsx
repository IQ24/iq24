import { getTeamUser } from "@iq24/supabase/cached-queries";
import { getTeamInvitesQuery } from "@iq24upabase/queries";
import { createClient } from "@iq24upabase/server";
import { DataTable } from "./table";

export async function PendingInvitesTable() {
  const supabase = createClient();
  const user = await getTeamUser();
  const teamInvites = await getTeamInvitesQuery(supabase, user.data.team_id);

  return <DataTable data={teamInvites?.data} currentUser={user?.data} />;
}
