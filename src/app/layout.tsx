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
  title: "Baby Planet BD — Premium Baby Products in Bangladesh",
  description:
    "Shop premium baby bottles, breast pumps, clothing, and more at Baby Planet BD. Cash on Delivery available across Bangladesh. Fast delivery inside Dhaka.",
  keywords: [
    "Baby Planet BD",
    "baby products Bangladesh",
    "Philips Avent",
    "breast pump",
    "baby bottles",
    "baby clothing",
    "mom care",
    "e-commerce Bangladesh",
  ],
  authors: [{ name: "Baby Planet BD" }],
  openGraph: {
    title: "Baby Planet BD — Premium Baby Products in Bangladesh",
    description: "Everything your baby needs, delivered with love. COD available.",
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
