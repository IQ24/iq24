"use client";

import { useTrackerParams } from "@/hooks/use-tracker-params";
import { Button } from "@iq24/ui/button";
import { Icons } from "@iq24/ui/icons";

export function OpenTrackerSheet() {
  const { setParams } = useTrackerParams();

  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setParams({ create: true })}
      >
        <Icons.Add />
      </Button>
    </div>
  );
}
