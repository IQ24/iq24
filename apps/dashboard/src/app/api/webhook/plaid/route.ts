import { logger } from "@/utils/logger";
import { createClient } from "@iq24/supabase/server";
import { isAfter, subDays } from "date-fns";
import { syncConnection } from "jobs/tasks/bank/sync/connection";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// https://plaid.com/docs/api/webhooks/#configuring-webhooks
const ALLOWED_IPS = [
  "52.21.26.131",
  "52.21.47.157",
  "52.41.247.19",
  "52.88.82.239",
];

const webhookSchema = z.object({
  webhook_type: z.enum([
    "TRANSACTIONS",
    "HISTORICAL_UPDATE",
    "INITIAL_UPDATE",
    "TRANSACTIONS_REMOVED",
  ]),
  webhook_code: z.enum(["SYNC_UPDATES_AVAILABLE", "HISTORICAL_UPDATE"]),
  item_id: z.string(),
  error: z
    .object({
      error_type: z.string(),
      error_code: z.string(),
      error_code_reason: z.string(),
      error_message: z.string(),
      display_message: z.string(),
      request_id: z.string(),
      causes: z.array(z.string()),
      status: z.number(),
    })
    .nullable(),
  new_transactions: z.number().optional(),
  environment: z.enum(["sandbox", "production"]),
});

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for") || "";

  if (!ALLOWED_IPS.includes(clientIp)) {
    return NextResponse.json(
      { error: "Unauthorized IP address" },
      { status: 403 },
    );
  }

  const body = await req.json();

  const result = webhookSchema.safeParse(body);

  if (!result.success) {
    logger("Invalid plaid webhook payload", {
      details: result.error.issues,
    });

    return NextResponse.json(
      { error: "Invalid webhook payload", details: result.error.issues },
      { status: 400 },
    );
  }

  const supabase = createClient({ admin: true });

  const { data: connectionData } = await supabase
    .from("bank_connections")
    .select("id, created_at")
    .eq("reference_id", result.data.item_id)
    .single();

  if (!connectionData) {
    return NextResponse.json(
      { error: "Connection not found" },
      { status: 404 },
    );
  }

  switch (result.data.webhook_type) {
    case "TRANSACTIONS": {
      // Only run manual sync if the historical update is complete and the connection was created in the last 24 hours
      const manualSync =
        result.data.webhook_code === "HISTORICAL_UPDATE" &&
        isAfter(new Date(connectionData.created_at), subDays(new Date(), 1));

      logger("Triggering manual sync", {
        connectionId: connectionData.id,
        manualSync,
      });

      await syncConnection.trigger({
        connectionId: connectionData.id,
        manualSync,
      });

      break;
    }
  }

  return NextResponse.json({ success: true });
}
