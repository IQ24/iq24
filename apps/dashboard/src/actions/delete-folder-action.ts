"use server";

import { LogEvents } from "@iq24/events/events";
import { deleteFolder } from "@iq24upabase/storage";
import { revalidatePath } from "next/cache";
import { authActionClient } from "./safe-action";
import { deleteFolderSchema } from "./schema";

export const deleteFolderAction = authActionClient
  .schema(deleteFolderSchema)
  .metadata({
    name: "delete-folder",
    track: {
      event: LogEvents.DeleteFolder.name,
      channel: LogEvents.DeleteFolder.channel,
    },
  })
  .action(async ({ parsedInput: { path }, ctx: { user, supabase } }) => {
    await deleteFolder(supabase, {
      bucket: "vault",
      path: [user.team_id, ...path],
    });

    revalidatePath("/vault");

    return;
  });
