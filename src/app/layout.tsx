import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Departmental Repository",
  description: "Academic project archive",
};

import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} font-sans antialiased bg-white text-slate-900 overflow-x-hidden flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="pt-48 pb-0 flex-grow w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
