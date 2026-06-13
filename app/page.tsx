"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface Brand { id: number; name: string; media: { file_path: string } | null; }

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    api.get("/vehicles/brands").then((res) => setBrands(res.data.data)).catch(console.error);

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [brands.length]);

  return (
    <div className="flex flex-col min-h-screen bg-obsidian">
      
      {/* CINEMATIC HERO SECTION */}
      <section className="relative h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2000&auto=format&fit=crop" alt="Luxury Car Background" className="w-full h-full object-cover opacity-50 animate-[slowZoom_20s_infinite_alternate_linear]" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/80"></div>
        </div>
        
        <div className="relative z-10 px-6 md:px-16 lg:px-24 w-full max-w-[1600px] mx-auto mt-20 pointer-events-none">
          <span className={`block text-crimson tracking-[0.3em] text-[10px] md:text-xs font-semibold uppercase mb-6 opacity-0 animate-[fadeInUp_1s_forwards] ${lang === 'ar' ? 'font-cairo' : ''}`}>
            {t("home.subtitle")}
          </span>
          <h1 className={`font-cinzel text-5xl md:text-7xl lg:text-[7rem] leading-[1.1] mb-12 opacity-0 animate-[fadeInUp_1s_0.2s_forwards] text-white ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : 'tracking-wide'}`}>
            {t("home.title_1")}<br/>
            {t("home.title_2")}
          </h1>
          
          {/* THE FIX: pointer-events-auto ensures the button is strictly clickable above the background! */}
          <div className="opacity-0 animate-[fadeInUp_1s_0.4s_forwards] pointer-events-auto">
            <Link href="/configurator" className="inline-block bg-white text-obsidian px-10 py-5 uppercase tracking-[0.2em] text-xs font-semibold hover:bg-crimson hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {t("home.enter_studio")}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-6 md:left-16 lg:left-24 flex items-center gap-4 opacity-0 animate-[fadeInUp_1s_0.8s_forwards]">
          <div className="w-12 h-[1px] bg-white/50"></div>
          <span className="text-[10px] uppercase tracking-widest text-ash">{t("home.scroll")}</span>
        </div>
      </section>

      {/* EDITORIAL MARQUE GRID */}
      <section id="studio" className="py-24 md:py-40 px-6 md:px-12 max-w-[1600px] mx-auto w-full relative z-10">
        <div className="flex flex-col justify-start items-start mb-12 md:mb-20 reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-luxury text-start w-full">
          <div className="w-full text-start">
            <h2 className={`font-cinzel text-3xl md:text-5xl mb-4 text-white ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("home.select_marque")}</h2>
            <p className={`text-ash font-light text-sm md:text-base tracking-wide ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("home.choose_mfg")}</p>
          </div>
        </div>

        {brands.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-luxury">
            {brands.map((brand) => {
              const imageUrl = brand.media?.file_path 
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${brand.media.file_path}`
                : "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000&auto=format&fit=crop";

              return (
                <Link 
                  href={`/configurator?brand_id=${brand.id}`} 
                  key={brand.id}
                  className="group relative h-[250px] md:h-[400px] w-full bg-carbon overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 block"
                >
                  <img src={imageUrl} alt={brand.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-[1.5s] ease-luxury" />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent"></div>
                  
                  <div className="absolute bottom-6 md:bottom-8 left-0 w-full text-center z-10 px-4">
                    <span className={`font-cinzel text-2xl md:text-3xl tracking-[0.2em] text-white group-hover:text-crimson transition-colors duration-500 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
                      {brand.name.toUpperCase()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}