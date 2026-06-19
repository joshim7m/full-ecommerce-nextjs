import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Baby Planet BD Clone — Phase 1 Foundation",
  description:
    "Production-ready foundation for the Baby Planet BD e-commerce clone. Next.js 16 + Express + PostgreSQL + Prisma + Redis. Phase 1 covers project init, Prisma schema, and 25-product seeder.",
  keywords: [
    "Baby Planet BD",
    "e-commerce",
    "Next.js",
    "Express",
    "Prisma",
    "PostgreSQL",
    "Redis",
    "Bangladesh",
  ],
  authors: [{ name: "Baby Planet BD Clone" }],
  openGraph: {
    title: "Baby Planet BD Clone — Phase 1",
    description: "Production-ready foundation: Next.js + Express + PostgreSQL + Redis",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
