import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    VERCEL_URL: z
      .string()
      .optional()
      .transform((v) => (v ? `https://${v}` : undefined)),
    PORT: z.coerce.number().default(3000),
  },
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: {
    PLAIN_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    SUPABASE_SERVICE_KEY: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    GOCARDLESS_SECRET_ID: z.string().optional(),
    GOCARDLESS_SECRET_KEY: z.string().optional(),
    NOVU_API_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_AUDIENCE_ID: z.string().optional(),
    OPENPANEL_SECRET_KEY: z.string().optional(),
    iq24_ENGINE_API_KEY: z.string().optional(),
    iq24_CACHE_API_SECRET: z.string().optional(),
    WEBHOOK_SECRET_KEY: z.string().optional(),
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: z.string().optional(),
    AZURE_DOCUMENT_INTELLIGENCE_KEY: z.string().optional(),
    TELLER_SIGNING_SECRET: z.string().optional(),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ID: z.string().optional(),
    NEXT_PUBLIC_TELLER_APPLICATION_ID: z.string().optional(),
    NEXT_PUBLIC_TELLER_ENVIRONMENT: z.string().optional(),
    NEXT_PUBLIC_PLAID_ENVIRONMENT: z.string().optional(),
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID: z.string().optional(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ID: process.env.NEXT_PUBLIC_SUPABASE_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_TELLER_APPLICATION_ID:
      process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID,
    NEXT_PUBLIC_TELLER_ENVIRONMENT: process.env.NEXT_PUBLIC_TELLER_ENVIRONMENT,
    NEXT_PUBLIC_PLAID_ENVIRONMENT: process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID,
    PORT: process.env.PORT,
    GOCARDLESS_SECRET_ID: process.env.GOCARDLESS_SECRET_ID,
    GOCARDLESS_SECRET_KEY: process.env.GOCARDLESS_SECRET_KEY,
    NOVU_API_KEY: process.env.NOVU_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER:
      process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PLAIN_API_KEY: process.env.PLAIN_API_KEY,
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID:
      process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID,
    OPENPANEL_SECRET_KEY: process.env.OPENPANEL_SECRET_KEY,
    iq24_ENGINE_API_KEY: process.env.iq24_ENGINE_API_KEY,
    iq24_CACHE_API_SECRET: process.env.iq24_CACHE_API_SECRET,
    WEBHOOK_SECRET_KEY: process.env.WEBHOOK_SECRET_KEY,
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT:
      process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
    AZURE_DOCUMENT_INTELLIGENCE_KEY:
      process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
    TELLER_SIGNING_SECRET: process.env.TELLER_SIGNING_SECRET,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
