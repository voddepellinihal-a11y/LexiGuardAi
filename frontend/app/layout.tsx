import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LexiGuard AI - Legal Document Intelligence",
  description: "AI-powered legal document analysis and contract intelligence platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
