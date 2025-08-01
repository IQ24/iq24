"use client";

import { createClient } from "@iq24/supabase/client";
import { Button } from "@iq24/ui/button";
import { Icons } from "@iq24/ui/icons";
import { isDesktopApp } from "@todesktop/client-core/platform/todesktop";
import { Spinner } from "@iq24/ui/spinner";
import { useState } from "react";

export function AppleSignIn() {
  const [isLoading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignIn = async () => {
    setLoading(true);

    if (isDesktopApp()) {
      const redirectTo = new URL("/api/auth/callback", window.location.origin);

      redirectTo.searchParams.append("provider", "apple");
      redirectTo.searchParams.append("client", "desktop");

      await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: redirectTo.toString(),
          queryParams: {
            client: "desktop",
          },
        },
      });
    } else {
      await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?provider=apple`,
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
          <Icons.Apple />
          <span>Continue with Apple</span>
        </>
      )}
    </Button>
  );
}
