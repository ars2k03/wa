import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "WA Gateway | Modern WhatsApp API for Developers",
  description:
    "Connect in seconds, generate API keys, and automate WhatsApp OTPs & alerts via simple REST endpoints.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-[#fbf8f1] text-[#1a1a1a] selection:bg-[#7a2020] selection:text-[#fbf8f1]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
