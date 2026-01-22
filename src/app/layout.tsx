import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AIThemeProvider } from "@/context/AIThemeContext";
import ClientLayout from "@/components/ClientLayout";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
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
    <html lang="en">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <AIThemeProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AIThemeProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}