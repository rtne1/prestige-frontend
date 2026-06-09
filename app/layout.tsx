import type { Metadata } from "next";
import { cinzel, inter, cairo } from "./fonts";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { LiveChat } from "@/components/LiveChat";

export const metadata: Metadata = {
  title: "Prestige Auto Care | Elite Performance",
  description: "The ultimate tire configurator for exotic and luxury vehicles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} ${cairo.variable}`}>
      <body className="bg-obsidian text-white min-h-screen flex flex-col cursor-none transition-all duration-300">
        <CustomCursor />
        
        {/* The Language Provider MUST wrap the LiveChat so it can read the Arabic translation! */}
        <LanguageProvider>
          <LiveChat />
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>

      </body>
    </html>
  );
}