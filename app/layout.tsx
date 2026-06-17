import "./globals.css";
import type { Metadata } from "next";
import { cinzel, inter } from "./fonts";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";

export const metadata: Metadata = {
  title: "Mr. Tires | Exclusive Luxury Automotive Styling",
  description: "Bespoke tire configurations for the world's most prestigious vehicles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${cinzel.variable} ${inter.variable} antialiased bg-obsidian text-white min-h-screen flex flex-col`}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-grow w-full">
                {children}
              </main>
              <Footer />
              <ChatWidget />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}