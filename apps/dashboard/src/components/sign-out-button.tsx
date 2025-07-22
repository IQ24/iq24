"use client";

import { createClient } from "@iq24/supabase/client";
import { Button } from "@iq24/ui/button";

export function SignOutButton() {
  const supabase = createClient();

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => supabase.auth.signOut()}
    >
      Sign out
    </Button>
  );
}
