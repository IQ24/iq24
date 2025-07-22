"use client";

import { useInvoiceParams } from "@/hooks/use-invoice-params";
import { Button } from "@iq24/ui/button";
import { Icons } from "@iq24i/icons";
import Link from "next/link";

export function InvoiceWidgetHeader() {
  const { setParams } = useInvoiceParams();

  return (
    <div className="flex justify-between items-center">
      <Link href="/invoices" prefetch>
        <h2 className="text-lg">Invoices</h2>
      </Link>

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
