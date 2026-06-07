"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

interface Brand {
  id: number;
  name: string;
  media_id: number | null;
}

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    // Fetch the brands from your Laravel API
    api.get("/vehicles/brands")
      .then((res) => setBrands(res.data.data))
      .catch((err) => console.error("Failed to load brands", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 animate-[slowZoom_20s_infinite_alternate_linear]" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-transparent to-obsidian opacity-90" />
        
        <div className="relative z-10 max-w-4xl mt-16">
          <h1 className="font-cinzel text-5xl md:text-7xl font-normal tracking-[0.02em] leading-tight mb-6 animate-[fadeInUp_1s_forwards]">
            Precision <br />
            <span className="text-crimson">Engineered.</span>
          </h1>
          
          <p className="font-inter text-lg md:text-xl font-light text-ash leading-relaxed mb-12 max-w-2xl mx-auto opacity-0 animate-[fadeInUp_1s_0.2s_forwards]">
            The ultimate tire configurator for the world's most demanding exotic and luxury vehicles. Authorize your specifications with our VIP Concierge.
          </p>

          {/* CLICKABLE BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 opacity-0 animate-[fadeInUp_1s_0.4s_forwards]">
            <Link href="/configurator">
              <Button variant="prestige">Enter Configurator</Button>
            </Link>
            <Link href="/auth">
              <Button variant="ghost">Client Portal</Button>
            </Link>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 animate-[fadeInUp_1s_0.8s_forwards] flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-ash">Explore Marques</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-ash to-transparent" />
        </div>
      </section>

      {/* 2. BRANDS GRID SECTION */}
      <section className="py-32 px-6 md:px-12 max-w-[1440px] mx-auto w-full border-t border-glass/30 relative z-10 bg-obsidian">
        <div className="text-center mb-16">
          <h2 className="font-cinzel text-3xl md:text-4xl text-white mb-4">Select Your Marque</h2>
          <p className="text-ash font-light">Choose your manufacturer to configure homologated tire compounds.</p>
        </div>

        {brands.length === 0 ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 bg-glass border border-glass">
            {brands.map((brand) => (
              <Link 
                href={`/configurator?brand_id=${brand.id}`} 
                key={brand.id}
                className="bg-carbon py-20 px-10 flex flex-col items-center justify-center text-center transition-all duration-500 hover:bg-[#151515] hover:z-10 hover:shadow-[0_0_40px_rgba(0,0,0,0.8)] group"
              >
                {/* Brand Logo or Placeholder */}
                <div className="w-16 h-16 mb-6 opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                
                <span className="font-cinzel text-lg tracking-[0.2em] text-ash group-hover:text-white transition-colors duration-500 transform translate-y-2 group-hover:translate-y-0">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}