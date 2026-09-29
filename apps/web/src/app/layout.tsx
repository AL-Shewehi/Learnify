import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { SessionSync } from "@/features/auth";
import { Fraunces, Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Learnify - Learn Anything, Anywhere",
  description: "Modern learning management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${inter.className}`}
      >
        {" "}
        <SessionSync />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
