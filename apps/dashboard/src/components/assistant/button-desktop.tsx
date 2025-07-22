"use client";

import { useAssistantStore } from "@/store/assistant";
import { Button } from "@iq24/ui/button";
import { Icons } from "@iq24i/icons";

export function DesktopAssistantButton() {
  const { setOpen } = useAssistantStore();

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full w-8 h-8 flex items-center invisible todesktop:visible"
      onClick={() => setOpen()}
    >
      <Icons.Search size={18} />
    </Button>
  );
}
