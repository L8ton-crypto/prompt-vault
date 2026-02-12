import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptVault - Curated AI Prompts",
  description: "50+ high-value AI prompts for coding, writing, analysis, and productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-gray-100">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
