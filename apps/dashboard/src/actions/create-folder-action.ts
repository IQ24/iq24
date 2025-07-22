"use server";

import { LogEvents } from "@iq24/events/events";
import { createFolder } from "@iq24upabase/storage";
import { revalidatePath } from "next/cache";
import { authActionClient } from "./safe-action";
import { createFolderSchema } from "./schema";

export const createFolderAction = authActionClient
  .schema(createFolderSchema)
  .metadata({
    name: "create-folder",
    track: {
      event: LogEvents.CreateFolder.name,
      channel: LogEvents.CreateFolder.channel,
    },
  })
  .action(async ({ parsedInput: value, ctx: { user, supabase } }) => {
    const data = await createFolder(supabase, {
      bucket: "vault",
      path: [user.team_id, value.path],
      name: value.name,
    });

    revalidatePath("/vault");

    return data;
  });
