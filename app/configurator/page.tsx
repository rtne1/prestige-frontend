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
interface Compound { id: number; model_name: string; specs: any; brand: { name: string; media_id: number | null }; media: { file_path: string } | null; }

const translateDB = (text: string, lang: string) => {
  if (lang === "en" || !text) return text;
  const map: Record<string, string> = {
    'porsche': 'بورش', 'mercedes-benz': 'مرسيدس-بنز', 'bmw': 'بي ام دبليو', 
    'lamborghini': 'لامبورجيني', 'ferrari': 'فيراري', 'aston martin': 'أستون مارتن', 
    'bentley': 'بنتلي', 'rolls-royce': 'رولز رويس', 'range rover': 'رنج روفر', 'land rover': 'لاند روفر',
    'audi': 'أودي', 'lexus': 'لكزس',
    'michelin': 'ميشلان', 'pirelli': 'بيريلي', 'continental': 'كونتيننتال', 'bridgestone': 'بريدجستون',
  };
  const lowerText = text.toLowerCase().trim();
  if (map[lowerText]) return map[lowerText];
  let translatedText = text;
  for (const [eng, ar] of Object.entries(map)) {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translatedText = translatedText.replace(regex, ar);
  }
  return translatedText;
};

const getPrice = (specs: any) => {
  let parsed: any = {};
  if (typeof specs === 'string') { try { parsed = JSON.parse(specs); } catch (e) {} } 
  else if (typeof specs === 'object' && specs !== null) { parsed = specs; }
  const priceKey = Object.keys(parsed).find(k => k.toLowerCase().includes('price'));
  return priceKey ? parsed[priceKey] : null;
};

function ConfiguratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  
  const [phase, setPhase] = useState<"gallery" | "review">("gallery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [years, setYears] = useState<Year[]>([]);
  
  const [oemCompounds, setOemCompounds] = useState<Compound[]>([]);
  const [allCompounds, setAllCompounds] = useState<Compound[]>([]);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const qtyRef = useRef<HTMLDivElement>(null);

  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [oemSpec, setOemSpec] = useState<OemSpec | null>(null);
  
  const [selectedTireBrand, setSelectedTireBrand] = useState<string | null>(null);
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);
  const [selectedOem, setSelectedOem] = useState<string>(""); 
  const [tireQty, setTireQty] = useState<string>("");
  const [notes, setNotes] = useState("");

  const WHATSAPP_NUMBER = "966568890653";

  const qtyOptions = [
    { id: "all", label: t("configurator.qty_all") || "All 4 Tires" },
    { id: "front_2", label: t("configurator.qty_front_2") || "2 Front" },
    { id: "rear_2", label: t("configurator.qty_rear_2") || "2 Rear" },
    { id: "front_1", label: t("configurator.qty_front_1") || "1 Front" },
    { id: "rear_1", label: t("configurator.qty_rear_1") || "1 Rear" },
  ];

  const oemOptions = [
    { id: "AO", label: "AO (Audi)" }, { id: "MO", label: "MO (Mercedes)" },
    { id: "N", label: "N0 / N1 (Porsche)" }, { id: "BMW", label: "★ (BMW)" },
    { id: "L", label: "L (Lamborghini)" }, { id: "K", label: "K1 / K2 (Ferrari)" },
    { id: "AM", label: "AM (Aston Martin)" }, { id: "J", label: "J (Jaguar)" },
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    api.get("/vehicles/brands").then(res => {
      setBrands(res.data.data);
    });
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const processTires = (brandName: string, oemData: Compound[], allData: Compound[]) => {
    const isRollsRoyce = brandName.toLowerCase().includes('rolls');
    const filterContinental = (tires: Compound[]) => tires.filter(t => {
      if (t.brand.name.toLowerCase() === 'continental' && !isRollsRoyce) return false;
      return true;
    });

    setOemCompounds(filterContinental(oemData));
    setAllCompounds(filterContinental(allData));
  };

  const handleBrandClick = (b: Brand) => {
    setSelectedBrand(b);
    api.get(`/vehicles/brands/${b.id}/models`).then(res => setModels(res.data.data));
    
    Promise.all([
      api.get(`/compounds?brand_id=${b.id}`),
      api.get(`/compounds`)
    ]).then(([oemRes, allRes]) => {
      processTires(b.name, oemRes.data.data, allRes.data.data);
    });
  };

  const handleModelClick = (m: Model) => {
    if (selectedModel?.id !== m.id) {
      setSelectedYear(null); setOemSpec(null); setSelectedTireBrand(null); setSelectedCompound(null); setSelectedOem(""); setTireQty("");
    }
    setSelectedModel(m);
    setIsDrawerOpen(true);
    api.get(`/vehicles/models/${m.id}/years`).then(res => setYears(res.data.data));
  };

  const handleYearClick = (y: Year) => {
    setSelectedYear(y); setSelectedTireBrand(null); setSelectedCompound(null); setSelectedOem(""); setTireQty("");
    api.get(`/vehicles/years/${y.id}/oem-specs`).then(res => {
      setOemSpec(res.data.data || { f_width: 0, f_profile: 0, f_rim: 0, r_width: 0, r_profile: 0, r_rim: 0 });
    });
  };

  const handleTireBrandClick = (brandName: string) => {
    setSelectedTireBrand(brandName); setSelectedCompound(null); setSelectedOem(""); setTireQty("");
  };

  const handleCompoundClick = (c: Compound) => {
    setSelectedCompound(c); setTireQty("");
    setTimeout(() => { qtyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const handleWhatsApp = () => {
    if (!selectedModel || !selectedYear || !selectedCompound || !oemSpec || !tireQty) return;
    const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label;
    
    let text = `${t("configurator.wa_greeting") || "Hello"}\n\n*${t("configurator.vehicle") || "Vehicle"}:* ${selectedYear.year} ${translateDB(selectedBrand?.name || "", lang)} ${translateDB(selectedModel.name, lang)}\n*${t("configurator.wa_tire") || "Tire"}:* ${translateDB(selectedCompound.brand.name, lang)} ${translateDB(selectedCompound.model_name, lang)}\n*${t("configurator.wa_front") || "Front"}:* ${oemSpec.f_width}/${oemSpec.f_profile} R${oemSpec.f_rim}\n*${t("configurator.wa_rear") || "Rear"}:* ${oemSpec.r_width}/${oemSpec.r_profile} R${oemSpec.r_rim}\n*${t("configurator.qty_label") || "Qty"}:* ${qtyLabel}`;
    
    if (selectedOem) text += `\n*OEM Mark:* ${selectedOem}`;
    if (notes) text += `\n\n*Notes:* ${notes}`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const submitToVault = async () => {
    setIsSubmitting(true);
    try {
      const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label;
      let combinedNotes = `[${t("configurator.qty_label")}: ${qtyLabel}]`;
      if (selectedOem) combinedNotes += `\n[OEM Preference: ${selectedOem}]`;
      if (notes) combinedNotes += `\n\n${notes}`;

      const vehRes = await api.post("/garage/vehicles", { vehicle_year_id: selectedYear?.id, nickname: null });
      await api.post("/garage/requests", {
        user_vehicle_id: vehRes.data.data.id,
        compound_id: selectedCompound?.id,
        ...oemSpec,
        client_notes: combinedNotes
      });
      router.push("/garage");
    } catch (error) {
      alert("Server Error."); setIsSubmitting(false);
    }
  };

  // MISSING FUNCTION RESTORED HERE:
  const handleAuthorize = () => {
    if (!user) {
      let combinedNotes = `[${t("configurator.qty_label")}: ${qtyOptions.find(o => o.id === tireQty)?.label}]`;
      if (selectedOem) combinedNotes += `\n[OEM Preference: ${selectedOem}]`;
      if (notes) combinedNotes += `\n\n${notes}`;

      const configData = { selectedYear: selectedYear?.id, selectedCompound: selectedCompound?.id, dimensions: oemSpec, notes: combinedNotes };
      localStorage.setItem("pending_config", JSON.stringify(configData));
      router.push("/auth");
    } else {
      submitToVault();
    }
  };

  const filteredModels = models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const uniqueTireBrands = Array.from(new Set(allCompounds.map(c => c.brand.name)));
  const filteredAllCompounds = allCompounds.filter(c => c.brand.name === selectedTireBrand);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-obsidian text-white overflow-hidden pt-[80px] md:pt-[100px] relative">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-crimson/5 blur-[120px] rounded-[100%] pointer-events-none z-0"></div>

      {phase === "gallery" && !selectedBrand && (
        <div className="flex-1 w-full flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto hide-scrollbar animate-[fadeInUp_0.4s_ease-out] z-10 relative">
          <div className="text-center max-w-2xl mx-auto mb-16 mt-8 shrink-0">
            <h1 className={`font-cinzel text-4xl md:text-5xl lg:text-6xl text-white mb-6 uppercase tracking-widest drop-shadow-xl ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              {t("configurator.select_manufacturer") || "Select Manufacturer"}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 w-full pb-32">
            {brands.map(b => {
              const imageUrl = b.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${b.media.file_path}` : "https://images.unsplash.com/photo-1503376712351-404c0ecbd2b3?q=80&w=1000";
              return (
                <div key={b.id} onClick={() => handleBrandClick(b)} className="relative w-full h-[300px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-luxury border border-white/10 hover:border-crimson hover:shadow-[0_0_40px_rgba(204,0,0,0.4)] group">
                  <img src={imageUrl} alt={b.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent pointer-events-none"></div>
                  <div className={`absolute bottom-6 md:bottom-8 ${lang === 'ar' ? 'right-6 md:right-8 text-start' : 'left-6 md:left-8 text-start'} z-10 w-full pr-16`}>
                    <h3 className={`font-cinzel text-2xl text-white leading-tight drop-shadow-lg ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{translateDB(b.name, lang)}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "gallery" && selectedBrand && (
        <div className="flex flex-col h-full animate-[fadeInUp_0.4s_ease-out] relative z-10">
          <div className="px-6 md:px-12 py-4 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 z-20">
            <div className="flex items-center gap-4">
              <button onClick={() => { setSelectedBrand(null); setIsDrawerOpen(false); }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-ash hover:bg-crimson hover:text-white transition-all shadow-lg shrink-0">
                 <svg className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h1 className={`font-cinzel text-2xl md:text-3xl tracking-widest uppercase text-white drop-shadow-md ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{translateDB(selectedBrand.name, lang)}</h1>
            </div>
            <div className="relative w-full md:w-96 shadow-lg">
              <input type="text" placeholder={t("configurator.search_models") || "Search models"} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full bg-carbon/80 border border-white/10 rounded-full py-3 text-base md:text-sm text-white outline-none focus:border-crimson transition-colors backdrop-blur-md ${lang === 'ar' ? 'pr-10 pl-4 font-cairo' : 'pl-10 pr-4'}`} />
            </div>
          </div>

          <div className="relative flex-1 w-full flex overflow-hidden">
            {isDrawerOpen && <div className="absolute inset-0 z-30 hidden md:block cursor-pointer bg-obsidian/60 backdrop-blur-md transition-all" onClick={closeDrawer} />}

            <div className="flex-1 overflow-y-hidden overflow-x-auto md:overflow-y-auto md:overflow-x-hidden snap-x snap-mandatory md:snap-none hide-scrollbar px-6 md:px-12 py-4 md:py-8 w-full touch-pan-x md:touch-auto overscroll-none">
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pb-32 snap-x snap-mandatory md:snap-none w-full hide-scrollbar">
                {filteredModels.map(m => {
                  const isActive = selectedModel?.id === m.id;
                  const imageUrl = m.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${m.media.file_path}` : "https://images.unsplash.com/photo-1503376712351-404c0ecbd2b3?q=80&w=1000";
                  return (
                    <div key={m.id} onClick={() => handleModelClick(m)} className={`relative w-[85vw] md:w-full h-[45vh] md:h-[300px] rounded-3xl overflow-hidden snap-center md:snap-align-none shrink-0 md:shrink cursor-pointer transition-all duration-500 ease-luxury border ${isActive && isDrawerOpen ? 'border-crimson shadow-[0_0_40px_rgba(204,0,0,0.4)] scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'}`}>
                      <img src={imageUrl} alt={m.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] hover:scale-110 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent pointer-events-none"></div>
                      <div className={`absolute bottom-6 md:bottom-8 ${lang === 'ar' ? 'right-6 md:right-8 text-start' : 'left-6 md:left-8 text-start'} z-10 w-full pr-16`}>
                        <h3 className={`font-cinzel text-2xl text-white leading-tight drop-shadow-lg ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{translateDB(m.name, lang)}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* THE DRAWER */}
            <div className={`fixed lg:absolute bottom-0 start-0 lg:start-auto lg:end-0 w-full lg:w-[450px] bg-obsidian/95 lg:bg-carbon/95 backdrop-blur-3xl border-t border-white/10 lg:border-t-0 lg:border-s rounded-t-[2rem] lg:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:shadow-none transition-transform duration-700 ease-luxury z-40 flex flex-col ${isDrawerOpen ? 'translate-y-0 lg:translate-x-0 max-h-[85vh] lg:max-h-full' : 'translate-y-full lg:translate-y-0 lg:translate-x-full rtl:lg:-translate-x-full max-h-[85vh] lg:max-h-full'}`}>
              <div className="w-full flex justify-center pt-4 pb-2 lg:hidden cursor-pointer shrink-0" onClick={closeDrawer}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
              </div>

              <div className="flex justify-between items-center px-6 pb-4 lg:p-6 lg:border-b border-white/5 shrink-0 text-start">
                <div>
                  <h3 className={`font-cinzel text-xl text-white ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{translateDB(selectedModel?.name || "", lang)}</h3>
                  <p className={`text-[10px] text-ash uppercase tracking-[0.2em] mt-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{translateDB(selectedBrand?.name || "", lang)}</p>
                </div>
                <button onClick={closeDrawer} className="w-10 h-10 rounded-full bg-white/5 hidden lg:flex items-center justify-center text-ash hover:bg-crimson hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-10 hide-scrollbar text-start">
                
                <div className="mb-8">
                  <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.select_year")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {years.map(y => (
                      <button key={y.id} onClick={() => handleYearClick(y)} className={`px-6 py-2.5 rounded-full border text-sm transition-all duration-300 ${selectedYear?.id === y.id ? 'bg-crimson border-crimson text-white shadow-[0_0_15px_rgba(204,0,0,0.3)]' : 'bg-transparent border-white/20 text-ash hover:border-white hover:text-white'}`}>
                        {y.year}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedYear && oemSpec && (
                  <div className="animate-[fadeInUp_0.4s_ease-out]">
                    
                    {oemCompounds.length > 0 && (
                      <div className="mb-8 bg-carbon border border-white/10 rounded-2xl p-5 shadow-inner">
                        <h4 className={`text-[10px] uppercase tracking-[0.2em] text-crimson mb-4 font-bold ${lang === 'ar' ? 'font-cairo' : ''}`}>
                          {t("configurator.oem_approved_for")} {translateDB(selectedBrand?.name || "", lang)}
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {oemCompounds.map(c => {
                            const tireImg = c.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${c.media.file_path}` : null;
                            const price = getPrice(c.specs);
                            return (
                              <div key={c.id} onClick={() => handleCompoundClick(c)} className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-500 group flex items-center justify-between min-h-[100px] ${selectedCompound?.id === c.id ? 'bg-crimson/10 border-crimson shadow-[0_0_20px_rgba(204,0,0,0.2)]' : 'bg-obsidian border-white/5 hover:border-white/30'}`}>
                                <div className="relative z-10 w-[65%] flex flex-col h-full text-start">
                                  <span className={`text-[9px] uppercase tracking-widest text-ash block mb-0.5 font-bold ${lang === 'ar' ? 'font-cairo' : ''}`}>{translateDB(c.brand.name, lang)}</span>
                                  <h5 className={`font-cinzel text-base text-white leading-tight ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{translateDB(c.model_name, lang)}</h5>
                                  {price && (
                                    <div className="mt-3 inline-block bg-white/5 border border-white/10 rounded-md px-3 py-1 w-fit">
                                      <span className={`text-[9px] text-ash tracking-widest uppercase mr-2 ${lang === 'ar' ? 'font-cairo ml-2' : ''}`}>{t("configurator.starting_at")}</span>
                                      <span className="text-crimson font-bold text-sm">{price}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="absolute top-0 bottom-0 end-0 w-[35%] flex items-center justify-center p-2 pointer-events-none">
                                    {tireImg && <img src={tireImg} alt={c.model_name} className="max-h-[80px] w-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mb-8 border-t border-white/10 pt-6">
                      <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>
                        {t("configurator.explore_all")}
                      </h4>
                      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 snap-x">
                        {uniqueTireBrands.map(tb => (
                          <button key={tb} onClick={() => handleTireBrandClick(tb)} className={`flex-none px-6 py-3 rounded-xl border text-xs md:text-sm font-cinzel font-semibold tracking-wider transition-all duration-300 snap-start ${selectedTireBrand === tb ? 'bg-white border-white text-obsidian shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-obsidian border-white/20 text-ash hover:border-white hover:text-white'}`}>
                            {translateDB(tb, lang)}
                          </button>
                        ))}
                      </div>

                      {selectedTireBrand && (
                        <div className="grid grid-cols-1 gap-3 animate-[fadeInUp_0.3s_ease-out]">
                          {filteredAllCompounds.map(c => {
                            const tireImg = c.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${c.media.file_path}` : null;
                            const price = getPrice(c.specs);
                            return (
                              <div key={c.id} onClick={() => handleCompoundClick(c)} className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-500 group flex items-center justify-between min-h-[100px] ${selectedCompound?.id === c.id ? 'bg-crimson/10 border-crimson shadow-[0_0_20px_rgba(204,0,0,0.2)]' : 'bg-carbon/40 border-white/5 hover:border-white/30'}`}>
                                <div className="relative z-10 w-[65%] flex flex-col h-full text-start">
                                  <span className={`text-[9px] uppercase tracking-widest text-ash block mb-0.5 font-bold ${lang === 'ar' ? 'font-cairo' : ''}`}>{translateDB(c.brand.name, lang)}</span>
                                  <h5 className={`font-cinzel text-base text-white leading-tight ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{translateDB(c.model_name, lang)}</h5>
                                  {price && (
                                    <div className="mt-3 inline-block bg-white/5 border border-white/10 rounded-md px-3 py-1 w-fit">
                                      <span className={`text-[9px] text-ash tracking-widest uppercase mr-2 ${lang === 'ar' ? 'font-cairo ml-2' : ''}`}>{t("configurator.starting_at")}</span>
                                      <span className="text-white font-bold text-sm">{price}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="absolute top-0 bottom-0 end-0 w-[35%] flex items-center justify-center p-2 pointer-events-none">
                                    {tireImg && <img src={tireImg} alt={c.model_name} className="max-h-[80px] w-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div ref={qtyRef} className="pt-2">
                  {selectedCompound && (
                    <div className="animate-[fadeInUp_0.3s_ease-out] mb-12">
                      <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.oem_mark_title")}</h4>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {oemOptions.map(opt => (
                          <button key={opt.id} onClick={() => setSelectedOem(opt.id === selectedOem ? "" : opt.id)} className={`px-4 py-3 rounded-xl border text-xs transition-all duration-300 ${selectedOem === opt.id ? 'bg-crimson border-crimson text-white shadow-[0_0_20px_rgba(204,0,0,0.3)]' : 'bg-obsidian border-white/10 text-ash hover:border-white hover:text-white'}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.qty_title")}</h4>
                      <div className="flex flex-wrap gap-2">
                        {qtyOptions.map(opt => (
                          <button key={opt.id} onClick={() => setTireQty(opt.id)} className={`px-5 py-3.5 rounded-xl border text-xs transition-all duration-300 ${tireQty === opt.id ? 'bg-white border-white text-obsidian font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-obsidian md:bg-transparent border-white/20 text-ash hover:border-white hover:text-white'} ${lang === 'ar' ? 'font-cairo' : ''}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-6 pb-12 lg:pb-8 border-t border-white/5 flex flex-col gap-3 transition-all duration-500 bg-obsidian shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] ${tireQty !== "" ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none hidden'}`}>
                <button onClick={handleWhatsApp} className={`w-full bg-[#25D366] text-obsidian px-6 py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(37,211,102,0.2)] hover:-translate-y-0.5 ${lang === 'ar' ? 'font-cairo' : ''}`}>
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

      {/* ===================== REVIEW SUMMARY SCREEN ===================== */}
      {phase === "review" && (
        <div className="absolute inset-0 z-50 bg-obsidian overflow-y-auto px-6 py-12 md:py-24 hide-scrollbar animate-[fadeInUp_0.4s_ease-out]">
          <div className="max-w-2xl mx-auto pb-20 text-start">
            <div className="bg-gradient-to-br from-carbon to-obsidian border border-white/10 p-6 md:p-10 mb-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
              <h3 className={`font-cinzel text-2xl mb-8 border-b border-white/10 pb-6 relative z-10 ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("configurator.review")}</h3>
              <div className="space-y-6 relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.vehicle")}</span>
                  <span className="font-medium text-white">{selectedYear?.year} {translateDB(selectedBrand?.name || "", lang)} {translateDB(selectedModel?.name || "", lang)}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6 gap-2">
                  <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.oem_fitment")}</span>
                  <span className="font-light text-white text-sm text-start md:text-end">
                    F: {oemSpec?.f_width}/{oemSpec?.f_profile} R{oemSpec?.f_rim} <br/>
                    R: {oemSpec?.r_width}/{oemSpec?.r_profile} R{oemSpec?.r_rim}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6 gap-2">
                  <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.compound")}</span>
                  <span className="font-medium text-crimson">{translateDB(selectedCompound?.brand.name || "", lang)} {translateDB(selectedCompound?.model_name || "", lang)}</span>
                </div>
                {selectedOem && (
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6 gap-2">
                    <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.oem_mark_title") || "OEM Mark"}</span>
                    <span className="font-medium text-white">{selectedOem}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4 mb-20 lg:mb-8">
              <button onClick={() => setPhase("gallery")} className={`w-full md:w-1/3 bg-transparent border border-white/20 text-white px-6 py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("configurator.back")}</button>
              <button onClick={handleAuthorize} disabled={isSubmitting} className={`w-full md:w-2/3 bg-crimson text-white px-6 py-4 rounded-xl uppercase tracking-widest text-[10px] font-bold hover:bg-white hover:text-obsidian transition-all shadow-[0_10px_30px_rgba(204,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
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
    <Suspense fallback={<div className="h-screen w-full bg-obsidian flex items-center justify-center"><div className="w-10 h-10 border-2 border-glass border-t-crimson rounded-full animate-spin"></div></div>}>
      <ConfiguratorContent />
    </Suspense>
  );
}