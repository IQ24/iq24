"use client";

import { Button } from "@iq24/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FooterCTA() {
  const pathname = usePathname();

  if (pathname.includes("pitch")) {
    return null;
  }

  return (
    <div className="border border-border md:container text-center px-10 py-14 mx-4 md:mx-auto md:px-24 md:py-20 mb-32 mt-24 flex items-center flex-col bg-[#F2F1EF] dark:bg-[#121212]">
      <span className="text-6xl	md:text-8xl font-medium text-primary dark:text-white">
        Stress free by iq24.
      </span>
      <p className="text-[#878787] mt-6">
        Invoicing, Time tracking, File reconciliation, Storage, Financial
        Overview & your own <br /> Assistant.
      </p>

      <div className="mt-10 md:mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="https://cal.com/pontus-iq24/15min"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="border border-primary h-12 px-6 dark:border-white border-black text-primary hidden md:block"
            >
              Talk to founders
            </Button>
          </Link>

          <a href="https://app.iq24.ai">
            <Button className="h-12 px-5 bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80">
              Try it for free
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
