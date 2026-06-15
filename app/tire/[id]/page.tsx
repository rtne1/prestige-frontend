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
        router.push("/"); // Redirect to home if tire not found
      } finally {
        setIsLoading(false);
      }
    };

    fetchTire();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-2 border-glass border-t-crimson rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tire) return null;

  const imageUrl = tire.media?.file_path 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${tire.media.file_path}`
    : null;

  return (
    <div className="min-h-screen bg-obsidian text-white pt-[100px] pb-32 flex flex-col relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-crimson/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10">
        
        {/* LEFT COLUMN: Image Presentation */}
        <div className="flex flex-col items-center justify-center relative animate-[fadeInUp_0.6s_ease-out]">
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-carbon/80 to-obsidian border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center p-8 group">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={tire.model_name} 
                className="max-h-full max-w-full object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.8)] transition-transform duration-[2s] ease-luxury group-hover:scale-110 relative z-10" 
              />
            ) : (
              <span className="text-ash/30 tracking-widest uppercase">No Image Available</span>
            )}
            
            {/* Interactive Glow behind tire */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-crimson/20 group-hover:bg-crimson/30 blur-3xl rounded-full transition-colors duration-700 pointer-events-none"></div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Actions */}
        <div className="flex flex-col justify-center animate-[fadeInUp_0.8s_ease-out]">
          
          <div className="mb-8 border-b border-white/10 pb-8 text-start">
            <span className="text-xs uppercase tracking-[0.3em] text-crimson font-semibold mb-3 block">
              {tire.brand.name}
            </span>
            <h1 className={`font-cinzel text-4xl md:text-5xl lg:text-6xl text-white leading-tight ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              {tire.model_name}
            </h1>
          </div>

          {/* Specifications Grid */}
          <div className="mb-12">
            <h3 className={`text-[10px] uppercase tracking-widest text-ash mb-6 ${lang === 'ar' ? 'font-cairo' : ''}`}>
              {t("tire.specifications") !== "tire.specifications" ? t("tire.specifications") : "Technical Specifications"}
            </h3>
            
            {tire.specs && Object.keys(tire.specs).length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(tire.specs).map(([key, value]) => (
                  <div key={key} className="bg-carbon/50 border border-white/5 p-4 rounded-xl text-start">
                    <span className="block text-[9px] uppercase tracking-wider text-ash mb-1">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="block text-sm font-medium text-white">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-ash font-light text-sm">
                Specific dimensions and compound details will be matched to your vehicle in the next step.
              </div>
            )}
          </div>

          {/* OEM Homologations (Optional, if it exists in DB) */}
          {tire.homologatedBrands && tire.homologatedBrands.length > 0 && (
            <div className="mb-12">
              <h3 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>
                {t("tire.homologated_for") !== "tire.homologated_for" ? t("tire.homologated_for") : "OEM Approved For"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tire.homologatedBrands.map((brand) => (
                  <span key={brand.id} className="px-4 py-2 border border-white/10 rounded-full text-xs text-white/80 bg-white/5">
                    {brand.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTON */}
          <div className="mt-auto pt-8">
            {/* 
              This button pushes the user to Phase 3. 
              We are passing the tire_id in the URL so the next page knows what product they chose.
            */}
            <button 
              onClick={() => router.push(`/order/vehicle?tire_id=${tire.id}`)}
              className="w-full md:w-auto bg-crimson text-white px-12 py-5 rounded-xl uppercase tracking-[0.2em] text-xs font-bold hover:bg-white hover:text-obsidian transition-all duration-500 shadow-[0_0_30px_rgba(204,0,0,0.3)] flex items-center justify-center gap-4"
            >
              {t("tire.order_now") !== "tire.order_now" ? t("tire.order_now") : "Continue to Vehicle Selection"}
              <svg className={`w-4 h-4 ${lang === 'ar' ? 'rtl:-scale-x-100' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <p className="mt-4 text-center md:text-start text-[10px] text-ash tracking-widest uppercase">
              Step 1 of 2
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}