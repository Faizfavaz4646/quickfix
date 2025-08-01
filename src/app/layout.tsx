import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Toaster } from 'sonner';



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
  title: "QuickFix - Find Trusted Local Professionals",
  description: "QuickFix connects clients with verified local service experts like plumbers, electricians, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-white text-gray-900 antialiased">
        <Navbar />
        {children}
    <Toaster richColors position="top-right" />

        <Footer />
        </body>
    </html>
  );
}
