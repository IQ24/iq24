"use client";

import { CreateTransactionForm } from "@/components/forms/create-transaction-form";
import { Drawer, DrawerContent } from "@iq24/ui/drawer";
import { useMediaQuery } from "@iq24i/hooks";
import { ScrollArea } from "@iq24i/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@iq24i/sheet";
import { useQueryState } from "nuqs";
import React from "react";

export function CreateTransactionSheet({
  categories,
  userId,
  accountId,
  currency,
}: {
  categories: any;
  userId: string;
  accountId: string;
  currency: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useQueryState("create-transaction");

  const isOpen = Boolean(open);

  const handleOpenChange = (open: boolean) => {
    setOpen(open ? "true" : null);
  };

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent>
          <SheetHeader className="mb-8">
            <SheetTitle>Create Transaction</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-[100px]" hideScrollbar>
            <CreateTransactionForm
              categories={categories}
              userId={userId}
              accountId={accountId}
              currency={currency}
              onCreate={() => setOpen(null)}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="p-6">
        <CreateTransactionForm
          categories={categories}
          userId={userId}
          accountId={accountId}
          currency={currency}
          onCreate={() => setOpen(null)}
        />
      </DrawerContent>
    </Drawer>
  );
}
