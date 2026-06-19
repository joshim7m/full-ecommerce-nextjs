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
  title: "Baby Planet BD Clone — Phase 2 Express API + Auth + Redis",
  description:
    "Production-ready Phase 2 backend for the Baby Planet BD e-commerce clone. Express 4 + JWT + Google OAuth + Prisma + Redis cache layer with invalidation. 38 endpoints across Auth, Categories, Products, Orders.",
  keywords: [
    "Baby Planet BD",
    "e-commerce",
    "Next.js",
    "Express",
    "Prisma",
    "PostgreSQL",
    "Redis",
    "JWT",
    "Google OAuth",
    "Bangladesh",
  ],
  authors: [{ name: "Baby Planet BD Clone" }],
  openGraph: {
    title: "Baby Planet BD Clone — Phase 2",
    description: "Express API + JWT Auth + Redis cache — 38 endpoints ready",
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
