import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PLATFORM_NAME, TOWN_NAME } from "@/lib/config/platform";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${PLATFORM_NAME} | ${TOWN_NAME}`,
  description:
    "Jamesport Civic Platform tracks property development history and delivers rapid meeting alerts for Riverhead, NY residents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f7fbff] text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
