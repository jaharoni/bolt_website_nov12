import type { Metadata } from "next";
import { Public_Sans, Playfair_Display } from "next/font/google";
import { PropsWithChildren } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "@/theme";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Jamesport Civic Platform",
  description:
    "Civic engagement platform helping Jamesport residents track property development and public meetings.",
  metadataBase: new URL(
    process.env.PUBLIC_APP_BASE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "Jamesport Civic Platform",
    description:
      "Interactive timeline, meeting alerts, and volunteer coordination for Jamesport, NY.",
    url: process.env.PUBLIC_APP_BASE_URL ?? "http://localhost:3000",
    siteName: "Jamesport Civic Platform",
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={`${publicSans.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
