import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | V2G Fleet",
    default: "V2G Fleet Dashboard",
  },
  description:
    "Vehicle-to-Grid platform for fleet operators — Team 07, LAUNCH Build Days 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "only light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased min-h-dvh", fontVariables)}>
        {children}
      </body>
    </html>
  );
}
