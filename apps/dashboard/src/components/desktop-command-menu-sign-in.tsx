"use client";

import { Button } from "@iq24/ui/button";
import { Icons } from "@iq24/ui/icons";

export function DesktopCommandMenuSignIn() {
  return (
    <div className="flex h-full flex-col">
      <Icons.Logo className="absolute top-8 left-8" />

      <div className="flex items-center w-full justify-center h-full">
        <a href="iq24://">
          <Button variant="outline">Login to iq24</Button>
        </a>
      </div>
    </div>
  );
}
