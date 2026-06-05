import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-obsidian">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}