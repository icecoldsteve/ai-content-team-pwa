import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Volta — Seven specialists. One loop.",
  description:
    "Volta is an AI content company in your pocket. Claude writes. Grok Imagine designs. You approve.",
  applicationName: "Volta",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Volta",
    statusBarStyle: "default",
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#3B6FF5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
