import type { Metadata } from "next";
import { cinzel, inter, cairo } from "./fonts";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ChatWidget } from "@/components/ui/ChatWidget";

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
        
        {/* Layer 1: Language Engine */}
        <LanguageProvider>
          {/* Layer 2: Authentication Engine */}
          <AuthProvider>
            
            {/* All UI Components must sit INSIDE the engines so they can read the data! */}
            <CustomCursor />
            <Navbar />
            
            <main className="flex-grow">{children}</main>
            
            <Footer />
            <ChatWidget />

          </AuthProvider>
        </LanguageProvider>

      </body>
    </html>
  );
}