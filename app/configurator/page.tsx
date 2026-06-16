"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";

interface Brand { id: number; name: string; media: { file_path: string } | null; }
interface Model { id: number; name: string; media: { file_path: string } | null; }
interface Year { id: number; year: number; }
interface OemSpec { f_width: number; f_profile: number; f_rim: number; r_width: number; r_profile: number; r_rim: number; }
interface Compound { id: number; model_name: string; specs: any; brand: { name: string; media_id: number | null }; media: { file_path: string } | null; }

function ConfiguratorContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  
  const [phase, setPhase] = useState<"gallery" | "review">("gallery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [years, setYears] = useState<Year[]>([]);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const qtyRef = useRef<HTMLDivElement>(null);

  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [oemSpec, setOemSpec] = useState<OemSpec | null>(null);
  
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
    api.get("/vehicles/brands").then(res => setBrands(res.data.data));
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleBrandClick = (b: Brand) => {
    setSelectedBrand(b);
    api.get(`/vehicles/brands/${b.id}/models`).then(res => setModels(res.data.data));
    api.get(`/compounds?brand_id=${b.id}`).then(res => setCompounds(res.data.data));
  };

  const handleModelClick = (m: Model) => {
    if (selectedModel?.id !== m.id) {
      setSelectedYear(null); setOemSpec(null); setSelectedTireBrand(null); setSelectedCompound(null); setTireQty("");
    }
    setSelectedModel(m);
    setIsDrawerOpen(true);
    api.get(`/vehicles/models/${m.id}/years`).then(res => setYears(res.data.data));
  };

  const handleYearClick = (y: Year) => {
    setSelectedYear(y); setSelectedTireBrand(null); setSelectedCompound(null); setTireQty("");
    api.get(`/vehicles/years/${y.id}/oem-specs`).then(res => {
      setOemSpec(res.data.data || { f_width: 0, f_profile: 0, f_rim: 0, r_width: 0, r_profile: 0, r_rim: 0 });
    });
  };

  const handleTireBrandClick = (brandName: string) => {
    setSelectedTireBrand(brandName); setSelectedCompound(null); setTireQty("");
  };

  const handleCompoundClick = (c: Compound) => {
    setSelectedCompound(c); setTireQty("");
    setTimeout(() => { qtyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const handleWhatsApp = () => {
    if (!selectedModel || !selectedYear || !selectedCompound || !oemSpec || !tireQty) return;
    const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label;
    const text = `${t("configurator.wa_greeting")}\n\n*${t("configurator.vehicle")}:* ${selectedYear.year} ${selectedBrand?.name} ${selectedModel.name}\n*${t("configurator.wa_tire")}:* ${selectedCompound.brand.name} ${selectedCompound.model_name}\n*${t("configurator.wa_front")}:* ${oemSpec.f_width}/${oemSpec.f_profile} R${oemSpec.f_rim}\n*${t("configurator.wa_rear")}:* ${oemSpec.r_width}/${oemSpec.r_profile} R${oemSpec.r_rim}\n*${t("configurator.qty_label")}:* ${qtyLabel}`;
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
      alert("Server Error."); setIsSubmitting(false);
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
    <div className="flex flex-col h-[100dvh] w-full bg-obsidian text-white overflow-hidden pt-[80px] md:pt-[100px] selection:bg-crimson selection:text-white">
      
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-crimson/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* ========================================================================= */}
      {/* PHASE 1: BRAND SELECTION (Clean, high-end grid) */}
      {/* ========================================================================= */}
      {phase === "gallery" && !selectedBrand && (
        <div className="flex-1 w-full flex flex-col items-center justify-center p-6 md:p-12 relative z-10 animate-[fadeInUp_0.6s_ease-out]">
          <div className="text-center mb-16">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-crimson font-bold mb-4 block">Bespoke Configurator</span>
            <h1 className={`font-cinzel text-4xl md:text-6xl text-white ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>Select Manufacturer</h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-full max-w-7xl mx-auto">
            {brands.map(b => (
              <button 
                key={b.id} 
                onClick={() => handleBrandClick(b)} 
                className="group relative bg-carbon/30 backdrop-blur-md border border-white/5 hover:border-crimson hover:bg-carbon/80 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-500 hover:shadow-[0_20px_40px_rgba(204,0,0,0.15)] hover:-translate-y-2"
              >
                {/* REMOVED THE INVERT CLASS! Images will now look exactly as you uploaded them */}
                {b.media?.file_path ? (
                  <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${b.media.file_path}`} alt={b.name} className="h-16 md:h-20 object-contain mb-6 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="h-16 w-16 bg-white/5 rounded-full mb-6"></div>
                )}
                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-white/70 group-hover:text-white transition-colors">{b.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* PHASE 2: MODEL SELECTION & CONFIGURATION PANEL */}
      {/* ========================================================================= */}
      {phase === "gallery" && selectedBrand && (
        <div className="flex flex-col h-full animate-[fadeInUp_0.4s_ease-out] relative z-10">
          
          {/* HEADER ROW */}
          <div className="px-6 md:px-12 py-6 shrink-0 flex flex-col md:flex-row justify-between items-center gap-6 z-20 border-b border-white/5">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <button onClick={() => { setSelectedBrand(null); setIsDrawerOpen(false); }} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-ash hover:bg-crimson hover:text-white hover:border-crimson transition-all shrink-0 group">
                 <svg className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${lang === 'ar' ? 'rotate-180 group-hover:translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-crimson font-bold block mb-1">Manufacturer</span>
                <h1 className={`font-cinzel text-2xl md:text-3xl tracking-widest uppercase text-white ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{selectedBrand.name}</h1>
              </div>
            </div>
            
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder={t("configurator.search_models")} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className={`w-full bg-carbon border border-white/10 rounded-full py-4 text-sm text-white outline-none focus:border-crimson transition-all shadow-inner ${lang === 'ar' ? 'pr-12 pl-6 font-cairo' : 'pl-12 pr-6'}`} 
              />
              <svg className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-ash ${lang === 'ar' ? 'right-5' : 'left-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="relative flex-1 w-full flex overflow-hidden">
            
            {/* CLICK-AWAY OVERLAY FOR DESKTOP PANEL */}
            {isDrawerOpen && (
              <div className="absolute inset-0 z-30 hidden md:block cursor-pointer bg-obsidian/40 backdrop-blur-sm transition-all" onClick={closeDrawer} />
            )}

            {/* HORIZONTAL CAROUSEL OF MODELS */}
            <div className={`flex-1 overflow-y-hidden overflow-x-auto snap-x snap-mandatory hide-scrollbar py-8 w-full touch-pan-x transition-all duration-700 ${isDrawerOpen ? 'md:pr-[500px]' : ''}`}>
              <div className="flex gap-6 px-6 md:px-12 pb-32 h-full items-center w-max">
                {filteredModels.map(m => {
                  const isActive = selectedModel?.id === m.id;
                  const imageUrl = m.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${m.media.file_path}` : "https://images.unsplash.com/photo-1503376712351-404c0ecbd2b3?q=80&w=1000";
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => handleModelClick(m)} 
                      className={`relative w-[85vw] md:w-[600px] h-[50vh] md:h-[65vh] rounded-[2rem] overflow-hidden snap-center shrink-0 cursor-pointer transition-all duration-700 ease-luxury border group ${isActive && isDrawerOpen ? 'border-crimson shadow-[0_20px_50px_rgba(204,0,0,0.3)] scale-100' : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20 hover:scale-[1.02]'}`}
                    >
                      <img src={imageUrl} alt={m.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent pointer-events-none"></div>
                      
                      <div className={`absolute bottom-8 md:bottom-10 ${lang === 'ar' ? 'right-8 text-start' : 'left-8 text-start'} z-10 w-full pr-16`}>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-crimson mb-2 font-bold">{selectedBrand.name}</p>
                        <h3 className={`font-cinzel text-3xl md:text-5xl text-white leading-tight drop-shadow-lg ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{m.name}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* THE BESPOKE CONFIGURATION PANEL (Right Side Desktop / Bottom Mobile) */}
            {/* ========================================================================= */}
            <div className={`fixed lg:absolute top-auto bottom-0 lg:top-0 lg:bottom-auto start-0 lg:start-auto lg:end-0 w-full lg:w-[500px] h-auto lg:h-full bg-carbon/95 lg:bg-obsidian/95 backdrop-blur-3xl border-t lg:border-t-0 lg:border-l border-white/10 rounded-t-[2rem] lg:rounded-none shadow-[0_-20px_50px_rgba(0,0,0,0.5)] lg:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-luxury z-40 flex flex-col ${isDrawerOpen ? 'translate-y-0 lg:translate-x-0 max-h-[85vh] lg:max-h-full' : 'translate-y-full lg:translate-y-0 lg:translate-x-full rtl:lg:-translate-x-full max-h-[85vh] lg:max-h-full'}`}>
              
              <div className="w-full flex justify-center pt-5 pb-3 lg:hidden cursor-pointer shrink-0" onClick={closeDrawer}>
                <div className="w-16 h-1.5 bg-white/20 rounded-full"></div>
              </div>

              <div className="flex justify-between items-start px-8 pb-6 lg:p-10 lg:border-b border-white/5 shrink-0 text-start">
                <div>
                  <h3 className={`font-cinzel text-3xl text-white mb-2 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{selectedModel?.name}</h3>
                  <p className="text-[10px] text-crimson uppercase tracking-[0.2em] font-bold">{selectedBrand?.name}</p>
                </div>
                <button onClick={closeDrawer} className="w-10 h-10 rounded-full bg-white/5 hidden lg:flex items-center justify-center text-ash hover:text-white hover:bg-crimson hover:rotate-90 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-10 hide-scrollbar text-start">
                
                {/* YEAR SELECTION */}
                <div className="mb-12">
                  <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.select_year")}</h4>
                  <div className="flex flex-wrap gap-3">
                    {years.map(y => (
                      <button key={y.id} onClick={() => handleYearClick(y)} className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${selectedYear?.id === y.id ? 'bg-crimson border-crimson text-white shadow-[0_0_20px_rgba(204,0,0,0.4)] -translate-y-1' : 'bg-transparent border-white/10 text-ash hover:border-white/30 hover:text-white hover:-translate-y-1'}`}>
                        {y.year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TIRE BRAND SELECTION */}
                {selectedYear && oemSpec && (
                  <div className="mb-12 animate-[fadeInUp_0.4s_ease-out]">
                    <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.select_tire_brand")}</h4>
                    <div className="flex flex-wrap gap-3">
                      {uniqueTireBrands.map(tb => (
                        <button key={tb} onClick={() => handleTireBrandClick(tb)} className={`px-6 py-3 rounded-xl border text-xs font-cinzel font-semibold tracking-wider transition-all duration-300 ${selectedTireBrand === tb ? 'bg-white border-white text-obsidian shadow-[0_0_20px_rgba(255,255,255,0.3)] -translate-y-1' : 'bg-carbon border-white/10 text-ash hover:border-white hover:text-white hover:-translate-y-1'}`}>
                          {tb.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* COMPOUND SELECTION */}
                {selectedTireBrand && (
                  <div className="mb-12 animate-[fadeInUp_0.4s_ease-out]">
                    <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.select_tire")}</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredCompounds.map(c => {
                        const tireImg = c.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${c.media.file_path}` : null;
                        return (
                          <div key={c.id} onClick={() => handleCompoundClick(c)} className={`relative p-6 rounded-[2rem] border cursor-pointer transition-all duration-500 overflow-hidden group flex items-center justify-between min-h-[160px] ${selectedCompound?.id === c.id ? 'bg-crimson/10 border-crimson shadow-[0_0_30px_rgba(204,0,0,0.2)]' : 'bg-carbon/50 border-white/5 hover:border-white/30 hover:bg-carbon'}`}>
                            <div className="relative z-10 w-[60%] flex flex-col h-full text-start">
                              <div className="mb-4">
                                <span className="text-[9px] uppercase tracking-[0.2em] text-crimson font-bold block mb-1">{c.brand.name}</span>
                                <h5 className={`font-cinzel text-xl text-white leading-tight ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{c.model_name}</h5>
                              </div>
                              <div className="flex flex-col gap-2 mt-auto border-t border-white/10 pt-4">
                                  <div className="flex justify-between items-center text-start">
                                      <span className={`text-[9px] uppercase tracking-widest text-ash/60 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.front_axle")}</span>
                                      <span className="text-xs text-white font-medium">{oemSpec?.f_width}/{oemSpec?.f_profile} <span className="text-crimson">R{oemSpec?.f_rim}</span></span>
                                  </div>
                                  <div className="flex justify-between items-center text-start">
                                      <span className={`text-[9px] uppercase tracking-widest text-ash/60 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.rear_axle")}</span>
                                      <span className="text-xs text-white font-medium">{oemSpec?.r_width}/{oemSpec?.r_profile} <span className="text-crimson">R{oemSpec?.r_rim}</span></span>
                                  </div>
                              </div>
                            </div>
                            <div className="absolute top-0 bottom-0 end-0 w-[40%] flex items-center justify-center p-4 transition-transform duration-700 ease-luxury group-hover:scale-110 pointer-events-none">
                                {tireImg && <img src={tireImg} alt={c.model_name} className="max-h-[130px] w-auto object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] relative z-10" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QUANTITY */}
                <div ref={qtyRef} className="pt-2">
                  {selectedCompound && (
                    <div className="animate-[fadeInUp_0.4s_ease-out] mb-12">
                      <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.qty_title")}</h4>
                      <div className="flex flex-wrap gap-3">
                        {qtyOptions.map(opt => (
                          <button key={opt.id} onClick={() => setTireQty(opt.id)} className={`px-6 py-4 rounded-xl border text-xs font-semibold transition-all duration-300 ${tireQty === opt.id ? 'bg-white border-white text-obsidian shadow-[0_0_20px_rgba(255,255,255,0.3)] -translate-y-1' : 'bg-carbon border-white/10 text-ash hover:border-white hover:text-white hover:-translate-y-1'} ${lang === 'ar' ? 'font-cairo' : ''}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className={`p-8 lg:p-10 border-t border-white/5 flex flex-col gap-4 transition-all duration-500 bg-obsidian/50 backdrop-blur-md shrink-0 ${tireQty !== "" ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none hidden'}`}>
                <button onClick={handleWhatsApp} className={`w-full bg-[#25D366] text-obsidian px-6 py-5 rounded-2xl uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(37,211,102,0.2)] hover:-translate-y-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>
                  {t("configurator.contact_now")}
                </button>
                <button onClick={() => setPhase("review")} className={`w-full bg-transparent border border-white/20 text-white px-6 py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-white/10 transition-colors ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
                  {t("configurator.continue")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 3: FINAL REVIEW */}
      {/* ========================================================================= */}
      {phase === "review" && (
        <div className="absolute inset-0 z-50 bg-obsidian overflow-y-auto px-6 py-12 md:py-32 hide-scrollbar animate-[fadeInUp_0.4s_ease-out]">
          <div className="max-w-3xl mx-auto pb-20 text-start">
            
            <div className="text-center mb-16">
              <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-crimson font-bold mb-4 block">Final Step</span>
              <h1 className={`font-cinzel text-4xl md:text-5xl text-white ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("configurator.review")}</h1>
            </div>

            <div className="bg-gradient-to-b from-carbon to-obsidian border border-white/10 p-8 md:p-12 mb-8 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-crimson/5 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="space-y-8 relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 pb-8 border-b border-white/5">
                  <span className={`text-[10px] text-ash uppercase tracking-[0.2em] ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.vehicle")}</span>
                  <span className="font-cinzel text-xl text-white">{selectedYear?.year} {selectedBrand?.name} {selectedModel?.name}</span>
                </div>
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-8 border-b border-white/5 gap-4">
                  <span className={`text-[10px] text-ash uppercase tracking-[0.2em] ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.oem_fitment")}</span>
                  <div className="flex flex-col text-start md:text-end gap-2">
                    <span className="text-sm font-medium text-white bg-white/5 px-4 py-2 rounded-lg">F: {oemSpec?.f_width}/{oemSpec?.f_profile} <span className="text-crimson">R{oemSpec?.f_rim}</span></span>
                    <span className="text-sm font-medium text-white bg-white/5 px-4 py-2 rounded-lg">R: {oemSpec?.r_width}/{oemSpec?.r_profile} <span className="text-crimson">R{oemSpec?.r_rim}</span></span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-8 border-b border-white/5 gap-2">
                  <span className={`text-[10px] text-ash uppercase tracking-[0.2em] ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.compound")}</span>
                  <span className="font-cinzel text-xl text-crimson font-bold">{selectedCompound?.brand.name} {selectedCompound?.model_name}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row gap-6 mb-20 lg:mb-8">
              <button onClick={() => setPhase("gallery")} className={`w-full md:w-1/3 bg-carbon border border-white/10 text-white px-8 py-5 rounded-2xl uppercase tracking-widest text-xs hover:border-white/30 transition-colors ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("configurator.back")}</button>
              <button onClick={handleAuthorize} disabled={isSubmitting} className={`w-full md:w-2/3 bg-crimson text-white px-8 py-5 rounded-2xl uppercase tracking-[0.15em] text-xs font-bold hover:bg-white hover:text-obsidian transition-all shadow-[0_10px_30px_rgba(204,0,0,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
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
    <Suspense fallback={<div className="h-screen w-full bg-obsidian flex items-center justify-center"><div className="w-12 h-12 border-2 border-glass border-t-crimson rounded-full animate-spin"></div></div>}>
      <ConfiguratorContent />
    </Suspense>
  );
}