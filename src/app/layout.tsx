import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AIThemeProvider } from "@/context/AIThemeContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ClientLayout from "@/components/ClientLayout";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Departmental Repository",
  description: "Academic project archive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${playfair.variable} font-sans antialiased`}>
        <AIThemeProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
              <ClientLayout>
                {children}
              </ClientLayout>
            </Suspense>
          </ThemeProvider>
        </AIThemeProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}