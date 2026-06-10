import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      
      {/* MOBILE BACKGROUND */}
      <div className="absolute inset-0 lg:hidden bg-[url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-obsidian/40 to-obsidian" />

      {/* DESKTOP LEFT PANEL */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-obsidian" />
        <div className="absolute bottom-16 start-16 max-w-md">
          <h2 className="font-cinzel text-4xl text-white mb-4">The Digital Vault.</h2>
          <p className="text-ash font-light leading-relaxed">
            Access your curated automotive portfolio and authorize bespoke compound configurations with our VIP Concierge.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL / MOBILE OVERLAY */}
      {/* THE FIX: Added pt-32 on mobile to guarantee it pushes safely below the Navbar! */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 pt-32 pb-20 lg:p-24 relative z-10 min-h-screen lg:min-h-0">
        
        <div className="w-full max-w-md bg-carbon/80 lg:bg-transparent p-8 lg:p-0 rounded-2xl lg:rounded-none backdrop-blur-2xl lg:backdrop-blur-none border border-white/10 lg:border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] lg:shadow-none">
          {children}
        </div>

      </div>
    </div>
  );
}