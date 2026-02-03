import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import "./globals.css";

const google_sans = Google_Sans({
  subsets: ["latin"],
  variable: "--font-google-sans",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Google Sans", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Railway Protection Force Court Cell",
  description:
    "A web application for managing court cell operations of the Railway Protection Force.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${google_sans.className} antialiased`}>{children}</body>
    </html>
  );
}
