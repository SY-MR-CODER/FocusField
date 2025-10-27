import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FocusField - Grow Your Productivity",
  description: "A gamified productivity app that helps you grow beautiful plants by completing tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SimpleAuthProvider>
          {children}
        </SimpleAuthProvider>
      </body>
    </html>
  );
}
