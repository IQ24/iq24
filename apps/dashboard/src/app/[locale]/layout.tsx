import "@/styles/globals.css";
import { cn } from "@iq24/ui/cn";
import "@iq24/ui/globals.css";
import { Provider as Analytics } from "@iq24/events/client";
import { Toaster } from "@iq24/ui/toaster";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { IBM_Plex_Mono } from "next/font/google";
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Providers } from "./providers";

// Configure IBM Plex Mono for Numora design system
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.iq24.ai"),
  title: "iq24 | Run your business smarter",
  description:
    "Automate financial tasks, stay organized, and make informed decisions effortlessly.",
  twitter: {
    title: "iq24 | Run your business smarter",
    description:
      "Automate financial tasks, stay organized, and make informed decisions effortlessly.",
    images: [
      {
        url: "https://cdn.iq24.ai/opengraph-image.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.iq24.ai/opengraph-image.jpg",
        width: 1800,
        height: 1600,
      },
    ],
  },
  openGraph: {
    title: "iq24 | Run your business smarter",
    description:
      "Automate financial tasks, stay organized, and make informed decisions effortlessly.",
    url: "https://app.iq24.ai",
    siteName: "iq24",
    images: [
      {
        url: "https://cdn.iq24.ai/opengraph-image.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.iq24.ai/opengraph-image.jpg",
        width: 1800,
        height: 1600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export const preferredRegion = ["fra1", "sfo1", "iad1"];
export const maxDuration = 60;

export default function Layout({
  children,
  params: { locale },
}: {
  children: ReactElement;
  params: { locale: string };
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          `${GeistSans.variable} ${GeistMono.variable} ${ibmPlexMono.variable}`,
          "whitespace-pre-line overscroll-none antialiased",
        )}
      >
        <Providers locale={locale}>{children}</Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
