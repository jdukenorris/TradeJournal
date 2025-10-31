import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion Trade Journal Bridge",
  description: "Voice-first trading journal that syncs to Notion and provides AI reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
