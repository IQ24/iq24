import { DevMessage } from "@/components/dev-message";
import { Footer } from "@/components/footer";
import { FooterCTA } from "@/components/footer-cta";
import { Header } from "@/components/header";
import "@/styles/globals.css";
import { cn } from "@iq24/ui/cn";
import "@iq24/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Provider as Analytics } from "@iq24/events/client";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { baseUrl } from "./sitemap";

export const preferredRegion = ["fra1", "sfo1", "iad1"];

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "IQ24.ai | The AI-Native B2B Growth Engine",
    template: "%s | IQ24.ai",
  },
  description:
    "IQ24.ai deploys a multi-agent AI system to automate prospecting, deliver hyper-personalized outreach, and dynamically optimize your entire sales funnel.",
  openGraph: {
    title: "IQ24.ai | The AI-Native B2B Growth Engine",
    description:
      "IQ24.ai deploys a multi-agent AI system to automate prospecting, deliver hyper-personalized outreach, and dynamically optimize your entire sales funnel.",
    url: baseUrl,
    siteName: "IQ24.ai",
    locale: "en_US",
    type: "website",
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
  twitter: {
    title: "IQ24.ai | The AI-Native B2B Growth Engine",
    description:
      "IQ24.ai deploys a multi-agent AI system to automate prospecting, deliver hyper-personalized outreach, and dynamically optimize your entire sales funnel.",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default function Layout({ children }: { children: ReactElement }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${GeistSans.variable} ${GeistMono.variable}`,
          "bg-[#fbfbfb] dark:bg-[#0C0C0C] overflow-x-hidden antialiased",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="container mx-auto px-4 overflow-hidden md:overflow-visible">
            {children}
          </main>
          <FooterCTA />
          <Footer />
          <Analytics />
          <DevMessage />
        </ThemeProvider>
      </body>
    </html>
  );
}
