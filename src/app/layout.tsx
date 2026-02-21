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
  title: "Infinity Algo by Jeremy | Professional Trading Tools & Calculators",
  description: "Professional trading calculators, AI-powered indicators, and expert strategies. Free pivot, Fibonacci, position size calculators and premium trading products.",
  keywords: ["Trading Calculators", "Pivot Points", "Fibonacci", "Position Size", "Risk Management", "Trading Tools", "Forex", "AI Trading", "Indicators"],
  authors: [{ name: "Jeremy - Infinity Algo" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Infinity Algo by Jeremy",
    description: "Professional trading calculators and premium trading tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinity Algo by Jeremy",
    description: "Professional trading calculators and premium trading tools",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
