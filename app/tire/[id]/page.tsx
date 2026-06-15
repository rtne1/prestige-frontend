"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface TireCompound {
  id: number;
  model_name: string;
  specs: Record<string, any> | null;
  brand: { name: string; media_id: number | null };
  media: { file_path: string } | null;
  homologatedBrands: Array<{ id: number; name: string }>;
}

// Helper icons for the premium spec cards
const SpecIcons: Record<string, React.ReactNode> = {
  size: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
  traction: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v8l9-11h-7z" /></svg>,
  speed: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  load: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  default: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export default function TireDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useLanguage();
  
  const [tire, setTire] = useState<TireCompound | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const fetchTire = async () => {
      try {
        const res = await api.get(`/compounds/${params.id}`);
        setTire(res.data.data);
      } catch (error) {
        console.error("Failed to fetch tire details:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTire();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-glass border-t-crimson rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tire) return null;

  const imageUrl = tire.media?.file_path 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${tire.media.file_path}`
    : null;

  // --- SMART DATA EXTRACTION ---
  // We scan whatever you typed into Filament and highlight the most important fields.
  const specs = tire.specs || {};
  
  // Helper to find keys regardless of uppercase/lowercase/spaces
  const findSpec = (keywords: string[]) => {
    const foundKey = Object.keys(specs).find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
    return foundKey ? { key: foundKey, value: specs[foundKey] } : null;
  };

  const heroSpecs = {
    size: findSpec(['size', 'مقاس', 'dimension']),
    traction: findSpec(['traction', 'تماسك', 'grip']),
    speed: findSpec(['speed', 'سرعة', 'rating']),
    load: findSpec(['load', 'حمولة', 'index', 'weight']),
  };

  // The rest of the specs that didn't get pulled into the Hero section
  const remainingSpecs = Object.entries(specs).filter(([key]) => 
    !Object.values(heroSpecs).some(hs => hs?.key === key)
  );

  return (
    <div className="min-h-screen bg-obsidian text-white pt-[80px] md:pt-[100px] pb-32 flex flex-col relative overflow-hidden selection:bg-crimson selection:text-white">
      
      {/* Ambient Lighting */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-crimson/5 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>

      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative z-10">
        
        {/* ================= LEFT COLUMN: PRODUCT PRESENTATION ================= */}
        <div className="flex flex-col items-center justify-start lg:sticky lg:top-32 h-fit animate-[fadeInUp_0.6s_ease-out]">
          
          <div className="w-full text-center lg:text-start mb-8 lg:hidden">
            <span className="text-[10px] uppercase tracking-[0.3em] text-crimson font-bold mb-2 block">{tire.brand.name}</span>
            <h1 className={`font-cinzel text-4xl text-white leading-tight ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{tire.model_name}</h1>
          </div>

          <div className="relative w-full max-w-[500px] aspect-square bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-carbon to-obsidian border border-white/10 rounded-[2rem] md:rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center p-8 group">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={tire.model_name} 
                className="max-h-full max-w-full object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.8)] transition-transform duration-[2s] ease-luxury group-hover:scale-110 relative z-10" 
              />
            ) : (
              <span className="text-ash/30 tracking-widest uppercase text-sm font-semibold">{t("tire.no_image")}</span>
            )}
            
            {/* Interactive Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-crimson/10 group-hover:bg-crimson/20 blur-[80px] rounded-full transition-colors duration-700 pointer-events-none"></div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DATA & ACTION ================= */}
        <div className="flex flex-col justify-start animate-[fadeInUp_0.8s_ease-out]">
          
          <div className="hidden lg:block mb-10 border-b border-white/10 pb-8 text-start">
            <span className="text-[11px] uppercase tracking-[0.4em] text-crimson font-bold mb-3 block">{tire.brand.name}</span>
            <h1 className={`font-cinzel text-5xl xl:text-6xl text-white leading-tight drop-shadow-lg ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{tire.model_name}</h1>
          </div>

          {/* 1. HERO SPECS (Dynamic Extraction) */}
          <div className="mb-12">
            <h3 className={`text-[10px] uppercase tracking-[0.2em] text-ash mb-6 px-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>
              {t("tire.specifications")}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* SIZE CARD - Always highlighted if it exists */}
              {heroSpecs.size && (
                <div className="col-span-2 bg-gradient-to-br from-carbon to-obsidian border border-crimson/30 shadow-[0_0_30px_rgba(204,0,0,0.1)] rounded-2xl p-6 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-crimson/20">{SpecIcons.size}</div>
                  <span className={`text-[10px] uppercase tracking-widest text-ash/70 mb-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{heroSpecs.size.key.replace(/_/g, ' ')}</span>
                  <span className="font-cinzel text-3xl md:text-4xl text-white font-bold tracking-wider">{heroSpecs.size.value}</span>
                </div>
              )}

              {heroSpecs.traction && (
                <div className="bg-carbon/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col hover:bg-carbon transition-colors">
                  <div className="text-ash mb-3">{SpecIcons.traction}</div>
                  <span className={`text-[9px] uppercase tracking-widest text-ash/70 mb-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{heroSpecs.traction.key.replace(/_/g, ' ')}</span>
                  <span className="text-lg font-medium text-white">{heroSpecs.traction.value}</span>
                </div>
              )}

              {heroSpecs.speed && (
                <div className="bg-carbon/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col hover:bg-carbon transition-colors">
                  <div className="text-ash mb-3">{SpecIcons.speed}</div>
                  <span className={`text-[9px] uppercase tracking-widest text-ash/70 mb-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{heroSpecs.speed.key.replace(/_/g, ' ')}</span>
                  <span className="text-lg font-medium text-white">{heroSpecs.speed.value}</span>
                </div>
              )}
              
              {heroSpecs.load && (
                <div className="bg-carbon/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col hover:bg-carbon transition-colors">
                  <div className="text-ash mb-3">{SpecIcons.load}</div>
                  <span className={`text-[9px] uppercase tracking-widest text-ash/70 mb-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{heroSpecs.load.key.replace(/_/g, ' ')}</span>
                  <span className="text-lg font-medium text-white">{heroSpecs.load.value}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. REMAINING SPECS (Scrollable Grid) */}
          {remainingSpecs.length > 0 && (
            <div className="mb-12">
              <h3 className={`text-[10px] uppercase tracking-[0.2em] text-ash mb-4 px-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>Additional Details</h3>
              <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 snap-x">
                {remainingSpecs.map(([key, value]) => (
                  <div key={key} className="flex-none w-40 bg-obsidian border border-white/5 rounded-xl p-4 snap-start flex flex-col justify-between min-h-[90px]">
                    <span className={`text-[9px] uppercase tracking-wider text-ash/60 line-clamp-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-medium text-white/90 line-clamp-2 mt-2">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. OEM HOMOLOGATIONS */}
          {tire.homologatedBrands && tire.homologatedBrands.length > 0 && (
            <div className="mb-12">
              <h3 className={`text-[10px] uppercase tracking-[0.2em] text-ash mb-4 px-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("tire.homologated_for")}</h3>
              <div className="flex flex-wrap gap-2">
                {tire.homologatedBrands.map((brand) => (
                  <span key={brand.id} className="px-5 py-2.5 border border-white/10 rounded-full text-xs font-medium text-white/90 bg-white/[0.03] backdrop-blur-sm shadow-sm">
                    {brand.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ================= ACTION BUTTON ================= */}
          <div className="mt-auto pt-8 border-t border-white/10">
            <button 
              onClick={() => router.push(`/order/vehicle?tire_id=${tire.id}`)} 
              className={`w-full bg-white text-obsidian px-12 py-5 rounded-2xl uppercase tracking-[0.15em] text-xs font-bold hover:bg-crimson hover:text-white transition-all duration-500 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_40px_rgba(204,0,0,0.4)] hover:-translate-y-1 flex items-center justify-center gap-4 group ${lang === 'ar' ? 'font-cairo tracking-normal' : ''}`}
            >
              {t("tire.order_now")}
              <svg className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${lang === 'ar' ? 'rtl:-scale-x-100 group-hover:-translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
            <p className={`mt-5 text-center text-[10px] text-ash/60 tracking-[0.2em] uppercase ${lang === 'ar' ? 'font-cairo' : ''}`}>
              Secure checkout process • Step 1 of 2
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}