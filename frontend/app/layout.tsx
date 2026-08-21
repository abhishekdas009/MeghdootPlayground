import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { Shell } from "@/components/layout/shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Meghdoot Playground",
    template: "%s | Meghdoot Playground",
  },
  description:
    "Enterprise CRM productivity workspace for SOQL generation, ticket formatting, Excel automation, templates, history, and analytics.",
  applicationName: "Meghdoot Playground",
  openGraph: {
    title: "Meghdoot Playground",
    description:
      "Enterprise CRM productivity workspace for Salesforce-focused workflows.",
    type: "website",
    siteName: "Meghdoot Playground",
  },
  twitter: {
    card: "summary",
    title: "Meghdoot Playground",
    description:
      "Enterprise CRM productivity workspace for Salesforce-focused workflows.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#030712",
};


export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background font-sans text-foreground antialiased`}>
        <AppProviders>
          <Shell>{children}</Shell>
        </AppProviders>
      </body>
    </html>
  );
}
