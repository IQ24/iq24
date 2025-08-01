"use server";

import { LogEvents } from "@iq24/events/events";
import { PlainClient, ThreadFieldSchemaType } from "@team-plain/typescript-sdk";
import { authActionClient } from "./safe-action";
import { sendSupportSchema } from "./schema";

const client = new PlainClient({
  apiKey: process.env.PLAIN_API_KEY!,
});

const mapToPriorityNumber = (priority: string) => {
  switch (priority) {
    case "low":
      return 0;
    case "normal":
      return 1;
    case "high":
      return 2;
    case "urgent":
      return 3;
    default:
      return 1;
  }
};

export const sendSupportAction = authActionClient
  .schema(sendSupportSchema)
  .metadata({
    name: "send-support",
    track: {
      event: LogEvents.SupportTicket.name,
      channel: LogEvents.SupportTicket.channel,
    },
  })
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    const customer = await client.upsertCustomer({
      identifier: {
        emailAddress: user.email,
      },
      onCreate: {
        fullName: user.full_name,
        externalId: user.id,
        email: {
          email: user.email,
          isVerified: true,
        },
      },
      onUpdate: {},
    });

    const response = await client.createThread({
      title: data.subject,
      description: data.message,
      priority: mapToPriorityNumber(data.priority),
      customerIdentifier: {
        customerId: customer.data?.customer.id,
      },
      // Support
      labelTypeIds: ["lt_01HV93FQT6NSC1EN2HHA6BG9WK"],
      components: [
        {
          componentText: {
            text: data.message,
          },
        },
      ],
      threadFields: data.url
        ? [
            {
              type: ThreadFieldSchemaType.String,
              key: "url",
              stringValue: data.url,
            },
          ]
        : undefined,
    });

    return response;
  });
