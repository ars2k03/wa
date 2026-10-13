import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE TELEGRAPHIC DISPATCH | Multi-Tenant WhatsApp Gateway",
  description:
    "A bespoke high-throughput WhatsApp OTP & Notification Gateway engineered with editorial precision and retro brutalist reliability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fbf8f1] text-[#1a1a1a] selection:bg-[#7a2020] selection:text-[#fbf8f1]">
        {children}
      </body>
    </html>
  );
}
