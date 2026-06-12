"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";

interface Brand { id: number; name: string; media: { file_path: string } | null; }
interface Model { id: number; name: string; media: { file_path: string } | null; }
interface Year { id: number; year: number; }
interface OemSpec { f_width: number; f_profile: number; f_rim: number; r_width: number; r_profile: number; r_rim: number; }
interface Compound { id: number; model_name: string; specs: any; brand: { name: string; media_id: number | null }; }

function ConfiguratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get("brand_id");

  const { user } = useAuth();
  const { t, lang } = useLanguage();
  
  const [phase, setPhase] = useState<"gallery" | "review">("gallery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [years, setYears] = useState<Year[]>([]);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  
  // --- NEW: DRAWER STATE ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const qtyRef = useRef<HTMLDivElement>(null);

  // --- SELECTION STATE ---
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [oemSpec, setOemSpec] = useState<OemSpec | null>(null);
  
  // NEW: Tire Brand Selection
  const [selectedTireBrand, setSelectedTireBrand] = useState<string | null>(null);
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);
  
  const [tireQty, setTireQty] = useState<string>("");
  const [notes, setNotes] = useState("");

  const WHATSAPP_NUMBER = "966568890653";

  const qtyOptions = [
    { id: "all", label: t("configurator.qty_all") },
    { id: "front_2", label: t("configurator.qty_front_2") },
    { id: "rear_2", label: t("configurator.qty_rear_2") },
    { id: "front_1", label: t("configurator.qty_front_1") },
    { id: "rear_1", label: t("configurator.qty_rear_1") },
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (!brandId) { router.push("/"); return; }
    
    api.get("/vehicles/brands").then(res => {
      const b = res.data.data.find((x: any) => x.id === Number(brandId));
      if (b) setBrand(b);
    });
    api.get(`/vehicles/brands/${brandId}/models`).then(res => setModels(res.data.data));
    api.get(`/compounds?brand_id=${brandId}`).then(res => setCompounds(res.data.data));
    
    return () => { document.body.style.overflow = 'auto'; };
  }, [brandId, router]);

  // Handle Model Click: Preserves data if same car, wipes if new car
  const handleModelClick = (m: Model) => {
    if (selectedModel?.id !== m.id) {
      setSelectedYear(null);
      setOemSpec(null);
      setSelectedTireBrand(null);
      setSelectedCompound(null);
      setTireQty("");
    }
    setSelectedModel(m);
    setIsDrawerOpen(true);
    api.get(`/vehicles/models/${m.id}/years`).then(res => setYears(res.data.data));
  };

  const handleYearClick = (y: Year) => {
    setSelectedYear(y); 
    setSelectedTireBrand(null);
    setSelectedCompound(null);
    setTireQty("");
    api.get(`/vehicles/years/${y.id}/oem-specs`).then(res => {
      setOemSpec(res.data.data || { f_width: 0, f_profile: 0, f_rim: 0, r_width: 0, r_profile: 0, r_rim: 0 });
    });
  };

  const handleTireBrandClick = (brandName: string) => {
    setSelectedTireBrand(brandName);
    setSelectedCompound(null);
    setTireQty("");
  };

  const handleCompoundClick = (c: Compound) => {
    setSelectedCompound(c);
    setTireQty("");
    // Auto-scroll to Quantity smoothly
    setTimeout(() => {
      qtyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleWhatsApp = () => {
    if (!selectedModel || !selectedYear || !selectedCompound || !oemSpec || !tireQty) return;
    
    const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label;
    
    // Flawless Formatting
    const text = `${t("configurator.wa_greeting")}

*${t("configurator.vehicle")}:* ${selectedYear.year} ${brand?.name} ${selectedModel.name}
*${t("configurator.wa_tire")}:* ${selectedCompound.brand.name} ${selectedCompound.model_name}
*${t("configurator.wa_front")}:* ${oemSpec.f_width}/${oemSpec.f_profile} R${oemSpec.f_rim}
*${t("configurator.wa_rear")}:* ${oemSpec.r_width}/${oemSpec.r_profile} R${oemSpec.r_rim}
*${t("configurator.qty_label")}:* ${qtyLabel}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const submitToVault = async () => {
    setIsSubmitting(true);
    try {
      const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label;
      const combinedNotes = `[${t("configurator.qty_label")}: ${qtyLabel}]\n${notes}`.trim();

      const vehRes = await api.post("/garage/vehicles", { vehicle_year_id: selectedYear?.id, nickname: null });
      await api.post("/garage/requests", {
        user_vehicle_id: vehRes.data.data.id,
        compound_id: selectedCompound?.id,
        ...oemSpec,
        client_notes: combinedNotes || null
      });
      router.push("/garage");
    } catch (error) {
      alert("Server Error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleAuthorize = () => {
    if (!user) {
      const configData = { selectedYear: selectedYear?.id, selectedCompound: selectedCompound?.id, dimensions: oemSpec, notes };
      localStorage.setItem("pending_config", JSON.stringify(configData));
      router.push("/auth");
    } else submitToVault();
  };

  const filteredModels = models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const uniqueTireBrands = Array.from(new Set(compounds.map(c => c.brand.name)));
  const filteredCompounds = compounds.filter(c => c.brand.name === selectedTireBrand);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-obsidian text-white overflow-hidden pt-[80px] md:pt-[100px]">
      
      {phase === "gallery" && (
        <div className="flex flex-col h-full animate-[fadeInUp_0.4s_ease-out]">
          
          {/* HEADER: Search Bar */}
          <div className="px-6 md:px-12 py-4 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 z-20">
            <h1 className={`font-cinzel text-3xl tracking-widest uppercase ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              {brand?.name}
            </h1>
            <div className="relative w-full md:w-96">
              <svg className={`absolute top-3 w-5 h-5 text-ash ${lang === 'ar' ? 'right-3' : 'left-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                placeholder={t("configurator.search_models")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-carbon/80 border border-white/10 rounded-full py-3 text-sm text-white outline-none focus:border-crimson transition-colors backdrop-blur-md ${lang === 'ar' ? 'pr-10 pl-4 font-cairo' : 'pl-10 pr-4'}`}
              />
            </div>
          </div>

          {/* MAIN CONTAINER: Prevents Drawer from overlapping header */}
          <div className="relative flex-1 w-full flex overflow-hidden">
            
            {/* INVISIBLE BACKDROP to close drawer by clicking outside */}
            {isDrawerOpen && (
              <div 
                className="absolute inset-0 z-30 hidden md:block cursor-pointer" 
                onClick={() => setIsDrawerOpen(false)} 
              />
            )}

            {/* GALLERY GRID */}
            <div className="flex-1 overflow-y-auto overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory md:snap-none hide-scrollbar px-6 md:px-12 py-4 md:py-8 w-full">
              {filteredModels.length === 0 ? (
                <div className="w-full text-center text-ash font-light mt-10">No models found.</div>
              ) : (
                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pb-32 snap-x snap-mandatory md:snap-none w-full hide-scrollbar">
                  {filteredModels.map(m => {
                    const isActive = selectedModel?.id === m.id;
                    const imageUrl = m.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${m.media.file_path}` : "https://images.unsplash.com/photo-1503376712351-404c0ecbd2b3?q=80&w=1000&auto=format&fit=crop";
                    return (
                      <div 
                        key={m.id}
                        onClick={() => handleModelClick(m)}
                        className={`relative w-[85vw] md:w-full h-[45vh] md:h-[300px] rounded-2xl overflow-hidden snap-center md:snap-align-none shrink-0 md:shrink cursor-pointer transition-all duration-500 ease-luxury border ${isActive && isDrawerOpen ? 'border-crimson shadow-[0_0_30px_rgba(204,0,0,0.3)] scale-100' : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'}`}
                      >
                        <img src={imageUrl} alt={m.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent"></div>
                        <div className={`absolute bottom-6 md:bottom-8 ${lang === 'ar' ? 'right-6 md:right-8 text-start' : 'left-6 md:left-8 text-start'} z-10 w-full pr-16`}>
                          <p className="text-[10px] uppercase tracking-widest text-crimson mb-1">{brand?.name}</p>
                          <h3 className={`font-cinzel text-xl md:text-2xl text-white leading-tight ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{m.name}</h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* THE DRAWER (Desktop slides in, Mobile slides up) */}
            <div className={`absolute bottom-0 start-0 md:start-auto md:end-0 w-full md:w-[450px] h-full bg-obsidian/95 md:bg-carbon/95 backdrop-blur-3xl border-t md:border-t-0 md:border-s border-white/10 transition-transform duration-700 ease-luxury z-40 flex flex-col ${isDrawerOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full rtl:md:-translate-x-full'}`}>
              
              {/* Drawer Header (Close Button) */}
              <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0 bg-carbon/50">
                <div>
                  <h3 className={`font-cinzel text-xl text-white ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{selectedModel?.name}</h3>
                  <p className="text-[10px] text-ash uppercase tracking-widest mt-1">{brand?.name}</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-ash hover:text-white hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                
                {/* 1. Year Selection */}
                <div className="mb-8">
                  <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.select_year")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {years.map(y => (
                      <button key={y.id} onClick={() => handleYearClick(y)} className={`px-6 py-2 rounded-full border text-sm transition-all ${selectedYear?.id === y.id ? 'bg-crimson border-crimson text-white shadow-[0_0_15px_rgba(204,0,0,0.3)]' : 'bg-transparent border-white/20 text-ash hover:border-white hover:text-white'}`}>
                        {y.year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Tire Brand Selection */}
                {selectedYear && oemSpec && (
                  <div className="mb-8 animate-[fadeInUp_0.4s_ease-out]">
                    <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.select_tire_brand")}</h4>
                    <div className="flex flex-wrap gap-3">
                      {uniqueTireBrands.map(tb => (
                        <button key={tb} onClick={() => handleTireBrandClick(tb)} className={`flex-1 py-4 rounded-xl border text-sm font-cinzel font-semibold tracking-widest transition-all ${selectedTireBrand === tb ? 'bg-white border-white text-obsidian shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-obsidian border-white/20 text-ash hover:border-white hover:text-white'}`}>
                          {tb.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Tire Compound Selection */}
                {selectedTireBrand && (
                  <div className="mb-8 animate-[fadeInUp_0.4s_ease-out]">
                    <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.select_tire")}</h4>
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      {filteredCompounds.map(c => (
                        <div key={c.id} onClick={() => handleCompoundClick(c)} className={`p-4 md:p-5 rounded-xl border cursor-pointer transition-all flex flex-col ${selectedCompound?.id === c.id ? 'bg-crimson/10 border-crimson shadow-[0_0_15px_rgba(204,0,0,0.2)]' : 'bg-obsidian md:bg-carbon/50 border-white/10 hover:border-white/30'}`}>
                          <div className="flex justify-between items-start">
                            <div className="text-start">
                              <span className="text-[9px] uppercase tracking-widest text-ash block">{c.brand.name}</span>
                              <h5 className={`font-cinzel text-lg text-white ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{c.model_name}</h5>
                            </div>
                            {selectedCompound?.id === c.id && <svg className="w-5 h-5 text-crimson" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-3">
                              <div className="text-start">
                                  <span className={`text-[8px] uppercase tracking-widest text-ash block mb-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.front_axle")}</span>
                                  <span className="text-xs text-white/80">{oemSpec.f_width}/{oemSpec.f_profile} R{oemSpec.f_rim}</span>
                              </div>
                              <div className="text-end">
                                  <span className={`text-[8px] uppercase tracking-widest text-ash block mb-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.rear_axle")}</span>
                                  <span className="text-xs text-white/80">{oemSpec.r_width}/{oemSpec.r_profile} R{oemSpec.r_rim}</span>
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Tire Quantity Selector (With Auto-Scroll Ref) */}
                <div ref={qtyRef} className="pt-2">
                  {selectedCompound && (
                    <div className="animate-[fadeInUp_0.3s_ease-out] mb-12">
                      <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.qty_title")}</h4>
                      <div className="flex flex-wrap gap-2">
                        {qtyOptions.map(opt => (
                          <button key={opt.id} onClick={() => setTireQty(opt.id)} className={`px-4 py-3 rounded-xl border text-xs transition-all ${tireQty === opt.id ? 'bg-white border-white text-obsidian font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-obsidian border-white/20 text-ash hover:border-white hover:text-white'} ${lang === 'ar' ? 'font-cairo' : ''}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* ACTION BUTTONS (Appears only after Quantity) */}
              <div className={`p-6 border-t border-white/5 flex flex-col gap-3 transition-all duration-500 bg-obsidian md:bg-carbon shrink-0 ${tireQty !== "" ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none hidden'}`}>
                <button onClick={handleWhatsApp} className={`w-full bg-[#25D366] text-obsidian px-6 py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,211,102,0.2)] ${lang === 'ar' ? 'font-cairo' : ''}`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.553 4.195 1.603 6.015L.175 24l6.105-1.597c1.761.954 3.743 1.458 5.751 1.458 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.907c-1.808 0-3.582-.486-5.13-1.405l-.368-.218-3.811.996.996-3.811-.218-.368c-.919-1.548-1.405-3.322-1.405-5.13 0-5.546 4.514-10.06 10.06-10.06 5.546 0 10.06 4.514 10.06 10.06 0 5.546-4.514 10.06-10.06 10.06zm5.522-7.533c-.303-.152-1.794-.886-2.072-.987-.278-.101-.481-.152-.683.152-.202.303-.784.987-.96 1.189-.177.202-.354.227-.657.076-.303-.152-1.281-.473-2.441-1.506-.902-.803-1.509-1.794-1.686-2.097-.177-.303-.019-.467.133-.618.136-.136.303-.354.455-.53.152-.177.202-.303.303-.505.101-.202.051-.38-.025-.531-.076-.152-.683-1.646-.935-2.253-.246-.593-.496-.512-.683-.521-.177-.009-.38-.009-.582-.009-.202 0-.53.076-.808.38-.278.303-1.062 1.037-1.062 2.53s1.087 2.934 1.239 3.136c.152.202 2.137 3.262 5.176 4.571 2.222.956 3.037.91 4.148.758 1.111-.152 2.375-.987 2.704-1.921.329-.935.329-1.744.227-1.921-.102-.177-.38-.278-.684-.43z"/></svg>
                  {t("configurator.contact_now")}
                </button>
                <button onClick={() => setPhase("review")} className={`w-full bg-transparent border border-white/20 text-white px-6 py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
                  {t("configurator.continue")}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: REVIEW (For saving to the Vault) */}
      {phase === "review" && (
        <div className="flex-grow overflow-y-auto px-6 py-12 lg:p-20 hide-scrollbar animate-[fadeInUp_0.4s_ease-out]">
          <div className="max-w-2xl mx-auto">
            {/* Same Review Code as Before */}
            <div className="bg-carbon border border-white/10 p-6 md:p-10 mb-8 rounded-2xl text-start">
              <h3 className={`font-cinzel text-2xl mb-8 border-b border-white/10 pb-6 ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("configurator.review")}</h3>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.vehicle")}</span>
                  <span className="font-medium text-white">{selectedYear?.year} {brand?.name} {selectedModel?.name}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6 gap-2">
                  <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.oem_fitment")}</span>
                  <span className="font-light text-white text-sm">
                    F: {oemSpec?.f_width}/{oemSpec?.f_profile} R{oemSpec?.f_rim} <br className="md:hidden"/>
                    R: {oemSpec?.r_width}/{oemSpec?.r_profile} R{oemSpec?.r_rim}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6 gap-2">
                  <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.compound")}</span>
                  <span className="font-medium text-crimson">{selectedCompound?.brand.name} {selectedCompound?.model_name}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6 gap-2">
                  <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.qty_label")}</span>
                  <span className="font-medium text-white">{qtyOptions.find(o => o.id === tireQty)?.label}</span>
                </div>
              </div>
            </div>

            <div className="relative mt-8">
              <textarea className="w-full bg-carbon border border-white/10 outline-none transition-colors text-white p-6 rounded-2xl focus:border-crimson min-h-[120px] resize-none peer" placeholder=" " value={notes} onChange={(e) => setNotes(e.target.value)} />
              <label className={`absolute ${lang === 'ar' ? 'right-6' : 'left-6'} top-6 text-sm text-ash transition-all pointer-events-none uppercase tracking-widest peer-focus:-top-3 peer-focus:text-[10px] peer-focus:bg-obsidian peer-focus:px-2 peer-focus:text-crimson peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm -top-3 text-[10px] bg-obsidian px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.special_notes")}</label>
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <button onClick={() => setPhase("gallery")} className={`w-full md:w-1/3 bg-transparent border border-white/20 text-white px-6 py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("configurator.back")}</button>
              <button onClick={handleAuthorize} disabled={isSubmitting} className={`w-full md:w-2/3 bg-crimson text-white px-6 py-4 rounded-xl uppercase tracking-widest text-[10px] font-bold hover:bg-white hover:text-obsidian transition-colors shadow-[0_0_30px_rgba(204,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
                {isSubmitting ? "..." : (user ? t("configurator.auth_req") : t("configurator.auth_to_auth"))}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-obsidian flex items-center justify-center"><div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin"></div></div>}>
      <ConfiguratorContent />
    </Suspense>
  );
}