import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harian & Simpanan",
  description: "Aplikasi penjejak kewangan peribadi untuk Duit Masuk, Duit Keluar, Harian dan Simpanan.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#6C4CF5",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms-MY" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full antialiased">
        {children}
        <PwaRegister />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
