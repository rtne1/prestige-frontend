"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface TireCompound {
  id: number;
  model_name: string;
  specs: any;
  brand: { name: string };
  media: { file_path: string } | null;
}

export default function Home() {
  const { t, lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [tires, setTires] = useState<TireCompound[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTires("");
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(() => {
      fetchTires(searchQuery);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const fetchTires = async (query: string) => {
    try {
      const res = await api.get(`/compounds?search=${encodeURIComponent(query)}`);
      setTires(res.data.data);
    } catch (error) {
      console.error("Failed to search tires:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-obsidian text-white selection:bg-crimson selection:text-white">
      
      {/* CINEMATIC HERO & SMART SEARCH SECTION */}
      <section className="relative min-h-[80vh] flex flex-col justify-center items-center overflow-hidden pt-24 pb-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2000&auto=format&fit=crop" 
            alt="Luxury Car Background" 
            className="w-full h-full object-cover opacity-30 animate-[slowZoom_20s_infinite_alternate_linear]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/60 to-obsidian"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center animate-[fadeInUp_0.8s_forwards]">
          <h1 className={`font-cinzel text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight text-white drop-shadow-2xl ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : 'tracking-wide'}`}>
            {t("home.search_title")}
          </h1>
          <p className={`text-ash text-sm md:text-base font-light mb-12 max-w-2xl mx-auto ${lang === 'ar' ? 'font-cairo' : ''}`}>
            {t("home.search_subtitle")}
          </p>

          {/* SMART SEARCH BAR */}
          <div className="relative w-full max-w-3xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <svg className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 text-ash transition-colors duration-300 ${lang === 'ar' ? 'right-6' : 'left-6'} ${searchQuery ? 'text-crimson' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder={t("home.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-carbon/80 backdrop-blur-xl border border-white/10 rounded-full py-5 md:py-6 text-base md:text-lg text-white outline-none focus:border-crimson focus:bg-carbon transition-all duration-500 ${lang === 'ar' ? 'pr-16 pl-6 font-cairo' : 'pl-16 pr-6'}`}
            />
            {isLoading && (
              <div className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'left-6' : 'right-6'}`}>
                <div className="w-5 h-5 border-2 border-glass border-t-crimson rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* THE VIP CONFIGURATOR BANNER */}
      <section className="relative z-20 w-full max-w-[1600px] mx-auto px-6 md:px-12 -mt-10 mb-20">
        <div className="bg-gradient-to-r from-carbon to-obsidian border border-crimson/30 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_50px_rgba(204,0,0,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-crimson/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-crimson/20 transition-all duration-700"></div>
          
          <div className={`relative z-10 max-w-2xl text-center ${lang === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
            <span className="text-[10px] uppercase tracking-[0.3em] text-crimson font-bold mb-3 block">Premium Experience</span>
            <h2 className={`font-cinzel text-2xl md:text-3xl text-white mb-3 ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("home.vip_title")}</h2>
            <p className={`text-sm text-ash/80 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("home.vip_desc")}</p>
          </div>

          <Link href="/configurator" className="relative z-10 shrink-0">
            <button className={`bg-crimson text-white px-8 py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-obsidian transition-all shadow-[0_0_30px_rgba(204,0,0,0.4)] flex items-center gap-3 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              {t("home.vip_title")}
            </button>
          </Link>
        </div>
      </section>

      {/* SEARCH RESULTS GRID */}
      <section className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 pb-32 min-h-[50vh]">
        {tires.length === 0 && !isLoading ? (
          <div className="text-center py-20 text-ash">
            <p className={`text-lg ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("home.no_results")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeInUp_0.8s_ease-out]">
            {tires.map((tire) => {
              const imageUrl = tire.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${tire.media.file_path}` : null;
              return (
                <Link href={`/tire/${tire.id}`} key={tire.id} className="group relative flex flex-col bg-carbon/40 border border-white/5 hover:border-crimson/50 rounded-2xl overflow-hidden transition-all duration-500 ease-luxury hover:shadow-[0_10px_40px_rgba(204,0,0,0.15)] hover:-translate-y-2">
                  <div className="relative h-[250px] w-full p-8 flex items-center justify-center bg-gradient-to-b from-white/[0.02] to-transparent">
                    {imageUrl ? (
                      <img src={imageUrl} alt={tire.model_name} className="max-h-full max-w-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="text-ash/30 text-xs tracking-widest uppercase">{t("tire.no_image") || "No Image"}</div>
                    )}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-crimson/0 group-hover:bg-crimson/20 blur-3xl rounded-full transition-all duration-700 z-0 pointer-events-none"></div>
                  </div>
                  
                  <div className="p-6 border-t border-white/5 flex flex-col flex-1 bg-obsidian z-10">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-crimson mb-2 font-bold">{tire.brand.name}</span>
                    <h3 className={`font-cinzel text-xl text-white leading-tight mb-4 group-hover:text-crimson transition-colors ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
                      {tire.model_name}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/5">
                      <span className={`text-xs text-white/50 group-hover:text-white transition-colors ${lang === 'ar' ? 'font-cairo' : ''}`}>
                        {t("home.view_details")}
                      </span>
                      <svg className={`w-4 h-4 text-ash group-hover:text-crimson transition-all group-hover:translate-x-1 ${lang === 'ar' ? 'rtl:-scale-x-100 group-hover:-translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
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