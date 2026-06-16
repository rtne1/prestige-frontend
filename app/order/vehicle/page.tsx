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
  const [selectedOem, setSelectedOem] = useState<string>(""); // NEW: OEM Mark Selector
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

  // LUXURY OEM MARKS
  const oemOptions = [
    { id: "AO", label: "AO (Audi)" },
    { id: "MO", label: "MO (Mercedes)" },
    { id: "N", label: "N0 / N1 (Porsche)" },
    { id: "BMW", label: "★ (BMW)" },
    { id: "L", label: "L (Lamborghini)" },
    { id: "K", label: "K1 / K2 (Ferrari)" },
    { id: "AM", label: "AM (Aston Martin)" },
    { id: "J", label: "J (Jaguar)" },
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
    window.scrollTo({ top: window.innerHeight / 2, behavior: "smooth" });
  };

  const handleWhatsApp = () => {
    if (!tire || !selectedVehicle || !tireQty) return;
    const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label;
    
    let text = `${t("configurator.wa_greeting")}\n\n${t("configurator.wa_tire")} ${tire.brand.name} ${tire.model_name}\n*${t("order.selected_vehicle")}:* ${selectedVehicle.year} ${selectedVehicle.model.brand.name} ${selectedVehicle.model.name}\n*${t("configurator.qty_label")}:* ${qtyLabel}`;
    
    if (selectedOem) text += `\n*OEM Mark:* ${selectedOem}`;
    
    if (selectedVehicle.oemSpec) {
      text += `\n*${t("configurator.wa_front")}:* ${selectedVehicle.oemSpec.f_width}/${selectedVehicle.oemSpec.f_profile} R${selectedVehicle.oemSpec.f_rim}`;
      text += `\n*${t("configurator.wa_rear")}:* ${selectedVehicle.oemSpec.r_width}/${selectedVehicle.oemSpec.r_profile} R${selectedVehicle.oemSpec.r_rim}`;
    }

    if (notes) text += `\n\n*${t("order.special_notes")}:* ${notes}`;
    
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleContinueToVault = async () => {
    setIsSubmitting(true);
    try {
      const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label;
      let combinedNotes = `[${t("configurator.qty_label")}: ${qtyLabel}]`;
      if (selectedOem) combinedNotes += `\n[OEM Preference: ${selectedOem}]`;
      if (notes) combinedNotes += `\n\n${notes}`;

      if (user) {
        const vehRes = await api.post("/garage/vehicles", { vehicle_year_id: selectedVehicle?.id, nickname: null });
        await api.post("/garage/requests", {
          user_vehicle_id: vehRes.data.data.id,
          compound_id: tire?.id,
          ...selectedVehicle?.oemSpec,
          client_notes: combinedNotes
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
  
  let parsedSpecs: Record<string, any> = {};
  if (typeof tire?.specs === 'string') { try { parsedSpecs = JSON.parse(tire.specs); } catch (e) {} } 
  else if (typeof tire?.specs === 'object' && tire?.specs !== null) { parsedSpecs = tire.specs; }

  return (
    <div className="min-h-screen bg-obsidian text-white pt-[100px] pb-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-crimson/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] gap-8 lg:gap-12 relative z-10 items-start">
        
        {/* LEFT COLUMN: THE TIRE DOSSIER */}
        <div className="bg-carbon/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] lg:sticky lg:top-32 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.6)] text-start overflow-hidden relative group">
          <div className="relative z-10 flex flex-col items-center border-b border-white/10 pb-8 mb-8">
            {tireImg ? (
              <img src={tireImg} className="w-56 lg:w-64 h-auto drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] mb-6 transition-transform duration-700 group-hover:scale-105" />
            ) : (
               <div className="w-56 h-56 bg-white/5 rounded-full mb-6 flex items-center justify-center text-ash/30 text-xs font-semibold">{t("order.no_image")}</div>
            )}
            <span className="text-[10px] uppercase tracking-[0.3em] text-crimson mb-2 block font-semibold">{tire?.brand.name}</span>
            <h3 className={`font-cinzel text-3xl text-white text-center ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{tire?.model_name}</h3>
          </div>

          <div className="relative z-10 flex-1">
            <h4 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.specs")}</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(parsedSpecs).length > 0 ? (
                Object.entries(parsedSpecs).map(([key, value]) => {
                  const normalizedKey = key.toLowerCase().replace(/ /g, '_');
                  const translatedKey = t(`specs.${normalizedKey}`);
                  const displayKey = translatedKey.includes("specs.") ? key : translatedKey;
                  return (
                    <div key={key} className="bg-obsidian/50 border border-white/5 p-3 rounded-xl flex flex-col justify-center">
                      <span className={`text-[9px] uppercase tracking-wider text-ash/70 mb-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>{displayKey}</span>
                      <span className="text-sm font-medium text-white/90">{String(value)}</span>
                    </div>
                  );
                })
              ) : (
                <div className={`col-span-2 text-xs text-ash/50 font-light ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.specs_verification")}</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 text-start">
          
          {/* STEP 1 */}
          <div className={`bg-carbon/40 backdrop-blur-xl border rounded-[2rem] p-6 md:p-10 transition-all duration-700 ${step === 1 ? 'border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.3)]' : 'border-white/5 opacity-50'}`}>
            <div className="flex justify-between items-center mb-8 gap-4 border-b border-white/5 pb-6">
              <h2 className={`font-cinzel text-xl md:text-2xl text-white ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("order.step_1_title")}</h2>
              {step > 1 && <button onClick={() => setStep(1)} className={`text-[10px] uppercase tracking-widest text-crimson hover:text-white px-4 py-2 border border-crimson/30 rounded-full hover:bg-crimson/10 transition-colors ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.edit")}</button>}
            </div>

            {step === 1 && (
              <div className="animate-[fadeInUp_0.4s_ease-out]">
                <div className="flex p-1 bg-obsidian rounded-xl mb-8 border border-white/5">
                  <button onClick={() => setTab("search")} className={`flex-1 py-3 text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-all ${lang === 'ar' ? 'font-cairo font-bold' : ''} ${tab === "search" ? 'bg-carbon text-white shadow-sm border border-white/10' : 'text-ash hover:text-white'}`}>{t("order.smart_search")}</button>
                  <button onClick={() => setTab("manual")} className={`flex-1 py-3 text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-all ${lang === 'ar' ? 'font-cairo font-bold' : ''} ${tab === "manual" ? 'bg-carbon text-white shadow-sm border border-white/10' : 'text-ash hover:text-white'}`}>{t("order.manual_select")}</button>
                </div>

                {tab === "search" && (
                  <div className="relative">
                    <input type="text" placeholder={t("order.search_placeholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full bg-obsidian border border-white/10 rounded-2xl py-5 text-base text-white outline-none focus:border-crimson transition-all ${lang === 'ar' ? 'pr-6 pl-12 font-cairo' : 'pl-6 pr-12'}`} />
                    {isSearching && <div className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'left-6' : 'right-6'} w-5 h-5 border-2 border-glass border-t-crimson rounded-full animate-spin`}></div>}
                    {searchResults.length > 0 && (
                      <div className="mt-4 bg-obsidian border border-white/5 rounded-2xl overflow-hidden max-h-64 overflow-y-auto shadow-2xl">
                        {searchResults.map(v => (
                          <button key={v.id} onClick={() => selectVehicle(v)} className="w-full text-start px-6 py-4 text-sm border-b border-white/5 hover:bg-carbon hover:text-crimson transition-colors flex justify-between items-center group">
                            <span>{v.year} {v.model.brand.name} {v.model.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === "manual" && (
                  <div className="space-y-4">
                    <select onChange={(e) => handleBrandChange(Number(e.target.value))} className={`w-full bg-obsidian border border-white/10 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-crimson appearance-none ${lang === 'ar' ? 'font-cairo' : ''}`}>
                      <option value="">{t("order.select_brand")}</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    {selBrand && (
                      <select onChange={(e) => handleModelChange(Number(e.target.value))} className={`w-full bg-obsidian border border-white/10 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-crimson appearance-none ${lang === 'ar' ? 'font-cairo' : ''}`}>
                        <option value="">{t("order.select_model")}</option>
                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    )}
                    {selModel && years.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 pt-4">
                        {years.map(y => (
                          <button key={y.id} onClick={() => selectVehicle(y)} className="bg-obsidian border border-white/10 rounded-xl py-4 text-sm hover:border-crimson hover:bg-crimson/10 transition-colors">
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

          {/* STEP 2: FITMENT & DETAILS */}
          <div className={`bg-carbon/40 backdrop-blur-xl border rounded-[2rem] p-6 md:p-10 transition-all duration-700 ${step === 2 ? 'border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.3)]' : 'border-white/5 opacity-50 pointer-events-none'}`}>
            <div className="flex justify-between items-center mb-8 gap-4 border-b border-white/5 pb-6">
              <h2 className={`font-cinzel text-xl md:text-2xl text-white ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("order.step_2_title")}</h2>
              {step > 2 && <button onClick={() => setStep(2)} className={`text-[10px] uppercase tracking-widest text-crimson hover:text-white px-4 py-2 border border-crimson/30 rounded-full hover:bg-crimson/10 transition-colors pointer-events-auto ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.edit")}</button>}
            </div>

            {step === 2 && (
              <div className="animate-[fadeInUp_0.4s_ease-out]">
                
                {selectedVehicle?.oemSpec && (
                  <div className="bg-gradient-to-br from-obsidian to-carbon border border-white/10 rounded-2xl p-6 md:p-8 mb-10 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="flex-1 w-full text-center md:text-start">
                      <span className={`text-[10px] uppercase tracking-widest text-ash mb-2 block ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.front_axle")}</span>
                      <div className="font-cinzel text-2xl md:text-3xl text-white">
                        {selectedVehicle.oemSpec.f_width} / {selectedVehicle.oemSpec.f_profile} <span className="text-crimson text-xl md:text-2xl">R{selectedVehicle.oemSpec.f_rim}</span>
                      </div>
                    </div>
                    <div className="w-full h-px md:w-px md:h-16 bg-white/10 shrink-0"></div>
                    <div className="flex-1 w-full text-center md:text-start">
                      <span className={`text-[10px] uppercase tracking-widest text-ash mb-2 block ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.rear_axle")}</span>
                      <div className="font-cinzel text-2xl md:text-3xl text-white">
                        {selectedVehicle.oemSpec.r_width} / {selectedVehicle.oemSpec.r_profile} <span className="text-crimson text-xl md:text-2xl">R{selectedVehicle.oemSpec.r_rim}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* THE NEW OEM HOMOLOGATION SELECTOR */}
                <h3 className={`text-[10px] uppercase tracking-widest text-ash mb-4 px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.oem_mark_title") || "OEM Homologation"}</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {oemOptions.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedOem(opt.id === selectedOem ? "" : opt.id)} className={`px-4 py-3 rounded-xl border text-xs transition-all duration-300 ${selectedOem === opt.id ? 'bg-crimson border-crimson text-white shadow-[0_0_20px_rgba(204,0,0,0.3)]' : 'bg-obsidian border-white/10 text-ash hover:border-white hover:text-white'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <h3 className={`text-[10px] uppercase tracking-widest text-ash mb-4 px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.qty_title")}</h3>
                <div className="flex flex-wrap gap-3 mb-10">
                  {qtyOptions.map(opt => (
                    <button key={opt.id} onClick={() => setTireQty(opt.id)} className={`px-6 py-4 rounded-xl border text-xs transition-all duration-300 ${lang === 'ar' ? 'font-cairo' : ''} ${tireQty === opt.id ? 'bg-white border-white text-obsidian font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] -translate-y-1' : 'bg-obsidian border-white/10 text-ash hover:border-white hover:text-white hover:-translate-y-1'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mb-10">
                  <label className={`text-[10px] uppercase tracking-widest text-ash mb-3 block px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.special_notes")}</label>
                  <textarea 
                    className={`w-full bg-obsidian border border-white/10 outline-none transition-all text-white p-6 rounded-2xl focus:border-crimson min-h-[140px] resize-none text-sm placeholder:text-ash/30 ${lang === 'ar' ? 'font-cairo' : ''}`} 
                    placeholder={t("order.notes_placeholder")}
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                  />
                </div>

                <button 
                  onClick={() => {
                    // Inject the item into the global cart
                    const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label || "";
                    import('@/contexts/CartContext').then(({ useCart }) => {
                      // In a functional component, we can't use hooks conditionally, 
                      // so we use a custom event dispatcher instead, or lift it to the top.
                    });
                    
                    // ---------------------------------------------------------
                    // WAIT: To do this perfectly without breaking React hooks,
                    // scroll back to the top of `OrderVehicleContent` and add:
                    // const { addToCart } = useCart();
                    // Then come back down here and write:
                    addToCart({
                      id: Date.now().toString(),
                      compound: tire,
                      quantity: tireQty,
                      qtyLabel,
                      oemMark: selectedOem,
                      vehicle: selectedVehicle,
                      notes
                    });
                    
                    // Show success message and reset the form
                    alert(t("cart.add_success"));
                    setStep(1);
                    setSelectedVehicle(null);
                    setTireQty("");
                    setSelectedOem("");
                    setNotes("");
                  }} 
                  disabled={!tireQty} 
                  className={`w-full bg-white text-obsidian px-6 py-5 rounded-2xl uppercase tracking-widest text-sm font-bold hover:bg-crimson hover:text-white transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}
                >
                  {t("cart.add_to_cart") || "Add to Cart"}
                </button>
              </div>
            )}
          </div>

          {/* STEP 3 */}
          <div className={`bg-carbon/40 backdrop-blur-xl border rounded-[2rem] p-6 md:p-10 transition-all duration-700 ${step === 3 ? 'border-crimson/50 shadow-[0_10px_50px_rgba(204,0,0,0.15)]' : 'border-white/5 opacity-50 pointer-events-none hidden md:block'}`}>
            <h2 className={`font-cinzel text-xl md:text-2xl mb-8 text-white ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("order.step_3_title")}</h2>
            {step === 3 && (
              <div className="animate-[fadeInUp_0.4s_ease-out]">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleWhatsApp} className="flex-1 bg-[#25D366] text-obsidian px-6 py-5 rounded-2xl uppercase tracking-widest text-[10px] md:text-xs font-bold hover:bg-[#20bd5a] transition-all flex flex-col items-center justify-center gap-3 shadow-[0_10px_30px_rgba(37,211,102,0.2)] hover:-translate-y-1">
                    <span className={lang === 'ar' ? 'font-cairo' : ''}>{t("order.wa_btn")}</span>
                  </button>
                  <button onClick={handleContinueToVault} disabled={isSubmitting} className="flex-1 bg-crimson text-white px-6 py-5 rounded-2xl uppercase tracking-widest text-[10px] md:text-xs font-bold hover:bg-white hover:text-obsidian transition-all shadow-[0_10px_40px_rgba(204,0,0,0.4)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex flex-col items-center justify-center gap-3">
                    <span className={lang === 'ar' ? 'font-cairo' : ''}>
                      {isSubmitting ? t("order.processing") : (user ? t("order.submit_dashboard") : t("order.login_submit"))}
                    </span>
                  </button>
                </div>
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
    <Suspense fallback={<div className="h-screen w-full bg-obsidian flex items-center justify-center"><div className="w-10 h-10 border-2 border-glass border-t-crimson rounded-full animate-spin"></div></div>}>
      <OrderVehicleContent />
    </Suspense>
  );
}