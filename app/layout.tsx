import type { Metadata } from "next";
import { cinzel, inter } from "./fonts";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";

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
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="font-inter bg-obsidian text-white min-h-screen flex flex-col cursor-none">
        <CustomCursor />
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}