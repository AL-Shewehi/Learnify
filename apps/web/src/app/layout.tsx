import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { SessionSync } from "@/features/auth";
import { Fraunces, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Learnify - Learn Anything, Anywhere",
    template: "%s | Learnify",
  },
  description: "Modern learning management system",
  openGraph: {
    type: "website",
    siteName: "Learnify",
    title: "Learnify - Learn Anything, Anywhere",
    description: "Modern learning management system",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learnify - Learn Anything, Anywhere",
    description: "Modern learning management system",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} ${inter.className}`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster position="top-center" />
          <SessionSync />
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
