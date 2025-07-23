"use client";

import { createClient } from "@iq24/supabase/client";
import { Button } from "@iq24/ui/button";
import { Icons } from "@iq24/ui/icons";
import { isDesktopApp } from "@todesktop/client-core/platform/todesktop";
import { Spinner } from "@iq24/ui/spinner";
import { useState } from "react";

export function SlackSignIn() {
  const [isLoading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignIn = async () => {
    setLoading(true);

    if (isDesktopApp()) {
      const redirectTo = new URL("/api/auth/callback", window.location.origin);

      redirectTo.searchParams.append("provider", "slack");
      redirectTo.searchParams.append("client", "desktop");

      await supabase.auth.signInWithOAuth({
        provider: "slack",
        options: {
          redirectTo: redirectTo.toString(),
          queryParams: {
            client: "desktop",
          },
        },
      });
    } else {
      await supabase.auth.signInWithOAuth({
        provider: "slack",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?provider=slack`,
        },
      });
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      className="active:scale-[0.98] bg-primary px-6 py-4 text-secondary font-medium flex space-x-2 h-[40px] w-full"
    >
      {isLoading ? (
        <Spinner size={16} />
      ) : (
        <>
          <Icons.Slack />
          <span>Continue with Slack</span>
        </>
      )}
    </Button>
  );
}
