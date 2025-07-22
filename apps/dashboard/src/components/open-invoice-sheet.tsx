"use client";

import { useInvoiceParams } from "@/hooks/use-invoice-params";
import { Button } from "@iq24/ui/button";
import { Icons } from "@iq24/ui/icons";

export function OpenInvoiceSheet() {
  const { setParams } = useInvoiceParams();

  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setParams({ type: "create" })}
      >
        <Icons.Add />
      </Button>
    </div>
  );
}
