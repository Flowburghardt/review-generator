import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { MotionConfig } from "framer-motion";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-inter",
});

const ceraPro = localFont({
  src: [
    { path: "./fonts/CeraPRO-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/CeraPRO-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-cera-pro",
});

export const metadata: Metadata = {
  title: "Bewertung abgeben",
  description: "Teile deine Erfahrung — schnell und unkompliziert.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body
        className={`${inter.variable} ${ceraPro.variable} antialiased`}
      >
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
