"use client";

import { Button } from "@iq24/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@iq24i/dialog";
import { Dialog } from "@iq24i/dialog";
import { Icons } from "@iq24i/icons";
import { useState } from "react";
import { InboxSettings } from "../inbox-settings";

type Props = {
  forwardEmail: string;
  inboxForwarding: boolean;
  inboxId: string;
};

export function InboxSettingsModal({
  forwardEmail,
  inboxForwarding,
  inboxId,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div>
        <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
          <Icons.InboxCustomize />
        </Button>
      </div>

      <DialogContent
        className="max-w-[455px]"
        onOpenAutoFocus={(evt) => evt.preventDefault()}
      >
        <div className="p-4">
          <DialogHeader className="mb-8">
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Make changes to your inbox here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <InboxSettings
            forwardEmail={forwardEmail}
            inboxForwarding={inboxForwarding}
            inboxId={inboxId}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
