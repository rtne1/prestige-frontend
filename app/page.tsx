"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Brand { id: number; name: string; media_id: number | null; }

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    api.get("/vehicles/brands").then((res) => setBrands(res.data.data)).catch(console.error);

    // Scroll reveal animation logic
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [brands.length]); // Re-bind observer when brands load

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Cinematic Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2000&auto=format&fit=crop" alt="Luxury Car Background" className="w-full h-full object-cover opacity-40 animate-[slowZoom_20s_infinite_alternate_linear]" />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 w-full max-w-5xl mt-20">
          <h1 className="font-cinzel text-5xl md:text-8xl tracking-[0.05em] leading-tight mb-8 animate-[fadeInUp_1s_forwards]">
            PRECISION<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson to-red-900">ENGINEERED.</span>
          </h1>
          <p className="text-ash font-light text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 opacity-0 animate-[fadeInUp_1s_0.2s_forwards]">
            The ultimate homologation studio for the world's most demanding exotic vehicles. Authorize your specifications with our VIP Concierge.
          </p>
          <div className="opacity-0 animate-[fadeInUp_1s_0.4s_forwards]">
            <Link href="/configurator" className="block w-full md:inline-block md:w-auto bg-crimson text-white px-10 py-5 uppercase tracking-[0.2em] text-sm font-medium hover:bg-white hover:text-obsidian transition-all duration-500 hover:shadow-[0_0_30px_rgba(204,0,0,0.4)]">
              Enter The Studio
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-0 animate-[fadeInUp_1s_0.8s_forwards]">
          <span className="text-[10px] uppercase tracking-widest text-ash">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent"></div>
        </div>
      </section>

      {/* Interactive Marque Grid */}
      <section id="studio" className="py-24 md:py-32 px-6 md:px-12 max-w-[1600px] mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-20 reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-luxury">
          <div>
            <h2 className="font-cinzel text-3xl md:text-4xl mb-4">Select Marque</h2>
            <p className="text-ash font-light text-base md:text-lg">Choose your manufacturer to configure homologated compounds.</p>
          </div>
        </div>

        {brands.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-white/5 border border-white/5 reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-luxury">
            {brands.map((brand) => (
              <Link 
                href={`/configurator?brand_id=${brand.id}`} 
                key={brand.id}
                className="group relative h-[300px] md:h-[400px] bg-carbon flex flex-col items-center justify-center overflow-hidden transition-all duration-500 hover:z-10"
              >
                {/* Fallback pattern for cars until you upload real images to Media Library */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-[1s]"></div>
                
                <div className="relative z-10 text-center transform group-hover:-translate-y-4 transition-transform duration-500 ease-luxury">
                  <div className="w-16 h-16 mx-auto mb-6 border border-white/20 rounded-full flex items-center justify-center group-hover:border-crimson transition-colors duration-500">
                    <span className="font-cinzel text-2xl">{brand.name.charAt(0)}</span>
                  </div>
                  <span className="font-cinzel text-xl tracking-[0.3em] text-ash group-hover:text-white transition-colors duration-500">
                    {brand.name.toUpperCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}