import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row relative">
      
      {/* MOBILE BACKGROUND (Adds the luxury feel to phones) */}
      <div className="absolute inset-0 lg:hidden bg-[url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-obsidian/50 to-obsidian" />

      {/* DESKTOP LEFT PANEL */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-obsidian" />
        <div className="absolute bottom-16 left-16 max-w-md">
          <h2 className="font-cinzel text-4xl text-white mb-4">The Digital Vault.</h2>
          <p className="text-ash font-light leading-relaxed">
            Access your curated automotive portfolio and authorize bespoke compound configurations with our VIP Concierge.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL / MOBILE OVERLAY */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-24 relative z-10">
        <div className="w-full max-w-md bg-carbon/60 md:bg-transparent p-8 md:p-0 rounded-2xl md:rounded-none backdrop-blur-xl md:backdrop-blur-none border border-white/10 md:border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}