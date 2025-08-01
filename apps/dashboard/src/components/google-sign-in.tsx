"use client";

import { createClient } from "@iq24/supabase/client";
import { Button } from "@iq24/ui/button";
import { Icons } from "@iq24/ui/icons";
import { isDesktopApp } from "@todesktop/client-core/platform/todesktop";
import { Spinner } from "@iq24/ui/spinner";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function GoogleSignIn() {
  const [isLoading, setLoading] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return_to");

  const handleSignIn = async () => {
    setLoading(true);

    if (isDesktopApp()) {
      const redirectTo = new URL("/api/auth/callback", window.location.origin);

      redirectTo.searchParams.append("provider", "google");
      redirectTo.searchParams.append("client", "desktop");

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo.toString(),
          queryParams: {
            client: "desktop",
          },
        },
      });
    } else {
      const redirectTo = new URL("/api/auth/callback", window.location.origin);

      if (returnTo) {
        redirectTo.searchParams.append("return_to", returnTo);
      }

      redirectTo.searchParams.append("provider", "google");

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo.toString(),
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
          <Icons.Google />
          <span>Continue with Google</span>
        </>
      )}
    </Button>
  );
}
