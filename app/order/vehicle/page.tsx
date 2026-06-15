"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";

interface Tire { id: number; model_name: string; specs: any; brand: { name: string }; media: { file_path: string } | null; }
interface VehicleResult { id: number; year: number; model: { name: string; brand: { name: string } }; oemSpec: any; }

function OrderVehicleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tireId = searchParams.get("tire_id");
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const [tire, setTire] = useState<Tire | null>(null);
  const [tab, setTab] = useState<"search" | "manual">("search");
  const [step, setStep] = useState<1 | 2 | 3>(1); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VehicleResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [selBrand, setSelBrand] = useState<number | null>(null);
  const [selModel, setSelModel] = useState<number | null>(null);

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResult | null>(null);
  const [tireQty, setTireQty] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const WHATSAPP_NUMBER = "966568890653";

  const qtyOptions = [
    { id: "all", label: t("configurator.qty_all") },
    { id: "front_2", label: t("configurator.qty_front_2") },
    { id: "rear_2", label: t("configurator.qty_rear_2") },
    { id: "front_1", label: t("configurator.qty_front_1") },
    { id: "rear_1", label: t("configurator.qty_rear_1") },
  ];

  useEffect(() => {
    if (!tireId) { router.push("/"); return; }
    api.get(`/compounds/${tireId}`).then(res => setTire(res.data.data)).catch(() => router.push("/"));
    api.get("/vehicles/brands").then(res => setBrands(res.data.data));
  }, [tireId, router]);

  useEffect(() => {
    if (tab !== "search") return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      api.get(`/vehicles/search?query=${encodeURIComponent(searchQuery)}`)
        .then(res => setSearchResults(res.data.data))
        .finally(() => setIsSearching(false));
    }, 400);
  }, [searchQuery, tab]);

  const handleBrandChange = (id: number) => {
    setSelBrand(id); setSelModel(null); setYears([]); setSelectedVehicle(null);
    api.get(`/vehicles/brands/${id}/models`).then(res => setModels(res.data.data));
  };
  
  const handleModelChange = (id: number) => {
    setSelModel(id); setSelectedVehicle(null);
    const brandName = brands.find(b => b.id === id)?.name || "";
    api.get(`/vehicles/models/${id}/years`).then(res => {
      const mappedYears = res.data.data.map((y: any) => ({
        ...y, model: { name: models.find(m => m.id === id)?.name, brand: { name: brandName } }
      }));
      setYears(mappedYears);
    });
  };

  const selectVehicle = (v: VehicleResult) => {
    setSelectedVehicle(v);
    setStep(2); 
    // Auto-scroll slightly to Step 2 on mobile
    window.scrollTo({ top: window.scrollY + 200, behavior: "smooth" });
  };

  const handleWhatsApp = () => {
    if (!tire || !selectedVehicle || !tireQty) return;
    const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label;
    const text = `${t("configurator.wa_greeting")}\n\n${t("configurator.wa_tire")} ${tire.brand.name} ${tire.model_name}\n*${t("order.selected_vehicle")}:* ${selectedVehicle.year} ${selectedVehicle.model.brand.name} ${selectedVehicle.model.name}\n*${t("configurator.qty_label")}:* ${qtyLabel}\n\n*${t("order.special_notes")}:* ${notes}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleContinueToVault = async () => {
    setIsSubmitting(true);
    try {
      const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label;
      const combinedNotes = `[${t("configurator.qty_label")}: ${qtyLabel}]\n${notes}`.trim();

      if (user) {
        const vehRes = await api.post("/garage/vehicles", { vehicle_year_id: selectedVehicle?.id, nickname: null });
        await api.post("/garage/requests", {
          user_vehicle_id: vehRes.data.data.id,
          compound_id: tire?.id,
          ...selectedVehicle?.oemSpec,
          client_notes: combinedNotes || null
        });
        router.push("/garage");
      } else {
        const configData = { selectedYear: selectedVehicle?.id, selectedCompound: tire?.id, dimensions: selectedVehicle?.oemSpec, notes: combinedNotes };
        localStorage.setItem("pending_config", JSON.stringify(configData));
        router.push("/auth");
      }
    } catch (error) {
      alert("Server Error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const tireImg = tire?.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${tire.media.file_path}` : null;

  return (
    <div className="min-h-screen bg-obsidian text-white pt-[100px] pb-32">
      <div className="max-w-[1200px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
        
        {/* LEFT COLUMN: Tire Summary */}
        <div className="bg-carbon/50 border border-white/5 p-8 rounded-3xl lg:sticky lg:top-32 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
          {tireImg ? (
            <img src={tireImg} alt={tire?.model_name} className="w-48 h-auto drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] mb-6" />
          ) : (
             <div className="w-48 h-48 bg-white/5 rounded-full mb-6 flex items-center justify-center text-ash/30 text-xs font-semibold">{t("order.no_image")}</div>
          )}
          <span className="text-[10px] uppercase tracking-[0.2em] text-ash mb-2 block">{tire?.brand.name}</span>
          <h3 className={`font-cinzel text-2xl text-white ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{tire?.model_name}</h3>
          
          {selectedVehicle && (
            <div className="mt-8 pt-8 border-t border-white/10 w-full text-start animate-[fadeInUp_0.4s_ease-out]">
              <span className={`text-[10px] uppercase tracking-widest text-ash mb-1 block ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.selected_vehicle")}</span>
              <p className="text-sm font-medium text-white">{selectedVehicle.year} {selectedVehicle.model.brand.name} {selectedVehicle.model.name}</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: The Journey Steps */}
        <div className="space-y-6 text-start">
          
          {/* STEP 1 */}
          <div className={`bg-carbon border rounded-3xl p-6 md:p-10 transition-all duration-500 ${step === 1 ? 'border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'border-white/5 opacity-60'}`}>
            <div className="flex justify-between items-center mb-8 gap-4">
              <h2 className={`font-cinzel text-xl md:text-2xl ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("order.step_1_title")}</h2>
              {step > 1 && <button onClick={() => setStep(1)} className={`text-[10px] uppercase tracking-widest text-crimson hover:text-white ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.edit")}</button>}
            </div>

            {step === 1 && (
              <div className="animate-[fadeInUp_0.3s_ease-out]">
                <div className="flex p-1 bg-obsidian rounded-xl mb-8 border border-white/5">
                  <button onClick={() => setTab("search")} className={`flex-1 py-3 text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-all ${lang === 'ar' ? 'font-cairo font-bold' : ''} ${tab === "search" ? 'bg-carbon text-white shadow-sm border border-white/10' : 'text-ash hover:text-white'}`}>{t("order.smart_search")}</button>
                  <button onClick={() => setTab("manual")} className={`flex-1 py-3 text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-all ${lang === 'ar' ? 'font-cairo font-bold' : ''} ${tab === "manual" ? 'bg-carbon text-white shadow-sm border border-white/10' : 'text-ash hover:text-white'}`}>{t("order.manual_select")}</button>
                </div>

                {tab === "search" && (
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder={t("order.search_placeholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full bg-obsidian border border-white/10 rounded-xl py-4 text-sm text-white outline-none focus:border-crimson transition-all ${lang === 'ar' ? 'pr-6 pl-12 font-cairo' : 'pl-6 pr-12'}`}
                    />
                    {isSearching && <div className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'left-6' : 'right-6'} w-4 h-4 border-2 border-glass border-t-crimson rounded-full animate-spin`}></div>}
                    
                    {searchResults.length > 0 && (
                      <div className="mt-4 bg-obsidian border border-white/5 rounded-xl overflow-hidden max-h-60 overflow-y-auto hide-scrollbar shadow-xl">
                        {searchResults.map(v => (
                          <button key={v.id} onClick={() => selectVehicle(v)} className="w-full text-start px-6 py-4 text-sm border-b border-white/5 hover:bg-carbon hover:text-crimson transition-colors last:border-0 flex justify-between items-center group">
                            <span>{v.year} {v.model.brand.name} {v.model.name}</span>
                            <svg className={`w-4 h-4 text-ash group-hover:text-crimson opacity-0 group-hover:opacity-100 transition-all ${lang === 'ar' ? 'rtl:-scale-x-100' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === "manual" && (
                  <div className="space-y-4">
                    <select onChange={(e) => handleBrandChange(Number(e.target.value))} className={`w-full bg-obsidian border border-white/10 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-crimson appearance-none ${lang === 'ar' ? 'font-cairo' : ''}`}>
                      <option value="">{t("order.select_brand")}</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    {selBrand && (
                      <select onChange={(e) => handleModelChange(Number(e.target.value))} className={`w-full bg-obsidian border border-white/10 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-crimson appearance-none animate-[fadeInUp_0.3s_ease-out] ${lang === 'ar' ? 'font-cairo' : ''}`}>
                        <option value="">{t("order.select_model")}</option>
                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    )}
                    {selModel && years.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 pt-2 animate-[fadeInUp_0.3s_ease-out]">
                        {years.map(y => (
                          <button key={y.id} onClick={() => selectVehicle(y)} className="bg-obsidian border border-white/10 rounded-xl py-3 text-sm hover:border-crimson hover:bg-crimson/10 transition-colors">
                            {y.year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: WITH SPECS & SIZES ADDED BACK */}
          <div className={`bg-carbon border rounded-3xl p-6 md:p-10 transition-all duration-500 ${step === 2 ? 'border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'border-white/5 opacity-60 pointer-events-none'}`}>
            <div className="flex justify-between items-center mb-8 gap-4">
              <h2 className={`font-cinzel text-xl md:text-2xl ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("order.step_2_title")}</h2>
              {step > 2 && <button onClick={() => setStep(2)} className={`text-[10px] uppercase tracking-widest text-crimson hover:text-white pointer-events-auto ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.edit")}</button>}
            </div>

            {step === 2 && (
              <div className="animate-[fadeInUp_0.3s_ease-out]">
                
                {/* --- NEW: VEHICLE SIZES --- */}
                {selectedVehicle?.oemSpec && (
                  <div className="mb-10">
                    <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 px-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.oem_fitment")}</h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 bg-obsidian border border-white/5 p-5 rounded-2xl">
                        <span className={`text-[10px] uppercase tracking-widest text-ash block mb-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.front_axle")}</span>
                        <span className="text-sm md:text-base text-white font-medium">{selectedVehicle.oemSpec.f_width}/{selectedVehicle.oemSpec.f_profile} <span className="text-ash text-xs">R{selectedVehicle.oemSpec.f_rim}</span></span>
                      </div>
                      <div className="flex-1 bg-obsidian border border-white/5 p-5 rounded-2xl">
                        <span className={`text-[10px] uppercase tracking-widest text-ash block mb-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.rear_axle")}</span>
                        <span className="text-sm md:text-base text-white font-medium">{selectedVehicle.oemSpec.r_width}/{selectedVehicle.oemSpec.r_profile} <span className="text-ash text-xs">R{selectedVehicle.oemSpec.r_rim}</span></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- NEW: TIRE SPECS --- */}
                {tire?.specs && Object.keys(tire.specs).length > 0 && (
                  <div className="mb-10">
                    <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 px-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.specs")}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(tire.specs).map(([key, value]) => {
                        const translatedKey = t(`specs.${key.toLowerCase()}`);
                        const displayKey = translatedKey.includes("specs.") ? key.replace(/_/g, ' ') : translatedKey;
                        return (
                          <div key={key} className="bg-obsidian border border-white/5 p-4 rounded-xl text-start">
                            <span className={`block text-[9px] uppercase tracking-wider text-ash mb-1 ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{displayKey}</span>
                            <span className="block text-xs font-medium text-white">{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="h-[1px] w-full bg-white/10 my-8"></div>

                {/* QUANTITY */}
                <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 px-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.qty_title")}</h4>
                <div className="flex flex-wrap gap-3 mb-8">
                  {qtyOptions.map(opt => (
                    <button key={opt.id} onClick={() => setTireQty(opt.id)} className={`px-5 py-3 rounded-xl border text-xs transition-all ${lang === 'ar' ? 'font-cairo' : ''} ${tireQty === opt.id ? 'bg-white border-white text-obsidian font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-obsidian border-white/10 text-ash hover:border-white hover:text-white'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mb-8">
                  <label className={`text-[10px] uppercase tracking-widest text-ash mb-3 block px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.special_notes")}</label>
                  <textarea 
                    className={`w-full bg-obsidian border border-white/10 outline-none transition-all text-white p-5 rounded-xl focus:border-crimson min-h-[120px] resize-none text-sm placeholder:text-ash/30 ${lang === 'ar' ? 'font-cairo' : ''}`} 
                    placeholder={t("order.notes_placeholder")}
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                  />
                </div>

                <button 
                  onClick={() => { setStep(3); window.scrollTo({ top: window.scrollY + 200, behavior: "smooth" }); }} 
                  disabled={!tireQty}
                  className={`w-full bg-white text-obsidian px-6 py-5 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-crimson hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}
                >
                  {t("order.continue_review")}
                </button>
              </div>
            )}
          </div>

          {/* STEP 3 */}
          <div className={`bg-carbon border rounded-3xl p-6 md:p-10 transition-all duration-500 ${step === 3 ? 'border-crimson/50 shadow-[0_0_40px_rgba(204,0,0,0.15)]' : 'border-white/5 opacity-60 pointer-events-none hidden md:block'}`}>
            <h2 className={`font-cinzel text-xl md:text-2xl mb-8 ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("order.step_3_title")}</h2>

            {step === 3 && (
              <div className="animate-[fadeInUp_0.3s_ease-out]">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleWhatsApp} className="flex-1 bg-[#25D366] text-obsidian px-6 py-5 rounded-xl uppercase tracking-widest text-[10px] md:text-xs font-bold hover:bg-[#20bd5a] transition-all flex flex-col items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.2)]">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.553 4.195 1.603 6.015L.175 24l6.105-1.597c1.761.954 3.743 1.458 5.751 1.458 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.907c-1.808 0-3.582-.486-5.13-1.405l-.368-.218-3.811.996.996-3.811-.218-.368c-.919-1.548-1.405-3.322-1.405-5.13 0-5.546 4.514-10.06 10.06-10.06 5.546 0 10.06 4.514 10.06 10.06 0 5.546-4.514 10.06-10.06 10.06zm5.522-7.533c-.303-.152-1.794-.886-2.072-.987-.278-.101-.481-.152-.683.152-.202.303-.784.987-.96 1.189-.177.202-.354.227-.657.076-.303-.152-1.281-.473-2.441-1.506-.902-.803-1.509-1.794-1.686-2.097-.177-.303-.019-.467.133-.618.136-.136.303-.354.455-.53.152-.177.202-.303.303-.505.101-.202.051-.38-.025-.531-.076-.152-.683-1.646-.935-2.253-.246-.593-.496-.512-.683-.521-.177-.009-.38-.009-.582-.009-.202 0-.53.076-.808.38-.278.303-1.062 1.037-1.062 2.53s1.087 2.934 1.239 3.136c.152.202 2.137 3.262 5.176 4.571 2.222.956 3.037.91 4.148.758 1.111-.152 2.375-.987 2.704-1.921.329-.935.329-1.744.227-1.921-.102-.177-.38-.278-.684-.43z"/></svg>
                    <span className={lang === 'ar' ? 'font-cairo' : ''}>{t("order.wa_btn")}</span>
                  </button>

                  <button onClick={handleContinueToVault} disabled={isSubmitting} className="flex-1 bg-crimson text-white px-6 py-5 rounded-xl uppercase tracking-widest text-[10px] md:text-xs font-bold hover:bg-white hover:text-obsidian transition-all shadow-[0_0_30px_rgba(204,0,0,0.3)] disabled:opacity-50 flex flex-col items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    <span className={lang === 'ar' ? 'font-cairo' : ''}>
                      {isSubmitting ? t("order.processing") : (user ? t("order.submit_dashboard") : t("order.login_submit"))}
                    </span>
                  </button>
                </div>
                <p className={`text-center text-ash text-[10px] tracking-widest uppercase mt-6 ${lang === 'ar' ? 'font-cairo' : ''}`}>
                  {t("order.concierge_notice")}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-obsidian flex items-center justify-center"><div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin"></div></div>}>
      <OrderVehicleContent />
    </Suspense>
  );
}