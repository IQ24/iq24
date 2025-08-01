"use server";

import { LogEvents } from "@iq24/events/events";
import { updateUserTeamRole } from "@iq24upabase/mutations";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { authActionClient } from "./safe-action";
import { changeUserRoleSchema } from "./schema";

export const changeUserRoleAction = authActionClient
  .schema(changeUserRoleSchema)
  .metadata({
    name: "change-user-role",
    track: {
      event: LogEvents.UserRoleChange.name,
      channel: LogEvents.UserRoleChange.channel,
    },
  })
  .action(
    async ({
      parsedInput: { userId, teamId, role, revalidatePath },
      ctx: { supabase },
    }) => {
      const { data } = await updateUserTeamRole(supabase, {
        userId,
        teamId,
        role,
      });

      if (revalidatePath) {
        revalidatePathFunc(revalidatePath);
      }

      return data;
    },
  );
