import { Inbox } from "@/components/inbox";
import { InboxViewSkeleton } from "@/components/inbox-skeleton";
import { Cookies } from "@/utils/constants";
import { uniqueCurrencies } from "@iq24/location/currencies";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Inbox | iq24",
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function InboxPage({ searchParams }: Props) {
  const ascending =
    cookies().get(Cookies.InboxOrder)?.value === "true" ?? false;

  return (
    <Suspense
      key={ascending.toString()}
      fallback={<InboxViewSkeleton ascending />}
    >
      <Inbox
        ascending={ascending}
        query={searchParams?.q}
        currencies={uniqueCurrencies}
      />
    </Suspense>
  );
}
