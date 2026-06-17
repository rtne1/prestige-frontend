"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import api from "@/lib/api";

// --- TYPES ---
interface Tire { id: number; model_name: string; specs: any; brand: { name: string }; media: { file_path: string } | null; }
interface VehicleResult { id: number; year: number; model: { name: string; brand: { name: string } }; oemSpec: any; }
interface Brand { id: number; name: string; }
interface Model { id: number; name: string; }
interface Year { id: number; year: number; model: { name: string; brand: { name: string } }; oemSpec: any; }

// --- THE LUXURY FOCUS FILTER ---
const LUXURY_BRANDS = [
  "porsche", "mercedes-benz", "bmw", "lamborghini", "ferrari", 
  "aston martin", "bentley", "rolls-royce", "land rover", "range rover"
];

// --- MASSIVE LUXURY AUTO-TRANSLATOR ---
const translateDB = (text: string, lang: string) => {
  if (lang === "en" || !text) return text;
  
  const map: Record<string, string> = {
    // Brands
    'porsche': 'بورش', 'mercedes-benz': 'مرسيدس-بنز', 'bmw': 'بي ام دبليو', 
    'lamborghini': 'لامبورجيني', 'ferrari': 'فيراري', 'aston martin': 'أستون مارتن', 
    'bentley': 'بنتلي', 'rolls-royce': 'رولز رويس', 'range rover': 'رنج روفر', 'land rover': 'لاند روفر',
    // Porsche Models
    '911': '911', 'cayenne': 'كايين', 'macan': 'ماكان', 'panamera': 'باناميرا', 'taycan': 'تايكان', 'carrera': 'كاريرا',
    // Mercedes Models
    'g-class': 'جي كلاس', 's-class': 'اس كلاس', 'c-class': 'سي كلاس', 'e-class': 'اي كلاس', 'maybach': 'مايباخ', 'amg': 'اي ام جي',
    // Lamborghini Models
    'urus': 'اوروس', 'huracan': 'هوراكان', 'aventador': 'افينتادور', 'revuelto': 'ريفولتو',
    // Rolls Royce & Bentley Models
    'phantom': 'فانتوم', 'ghost': 'جوست', 'cullinan': 'كولينان', 'bentayga': 'بنتايجا', 'continental': 'كونتيننتال',
    // Aston Martin Models
    'vantage': 'فانتاج', 'dbx': 'دي بي اكس', 'valkyrie': 'فالكيري',
    // Range Rover Models
    'defender': 'ديفندر', 'evoque': 'ايفوك', 'velar': 'فيلار', 'sport': 'سبورت',
    // Tire Brands
    'michelin': 'ميشلان', 'pirelli': 'بيريلي', 'continental tire': 'كونتيننتال', 'bridgestone': 'بريدجستون',
  };

  const lowerText = text.toLowerCase().trim();
  if (map[lowerText]) return map[lowerText];
  
  let translatedText = text;
  // Deep replacement for complex strings (e.g. "Porsche Cayenne Turbo")
  for (const [eng, ar] of Object.entries(map)) {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translatedText = translatedText.replace(regex, ar);
  }
  return translatedText;
};

function OrderVehicleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tireId = searchParams.get("tire_id");
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { addToCart } = useCart(); 

  // Core States
  const [tire, setTire] = useState<Tire | null>(null);
  const [tab, setTab] = useState<"search" | "manual">("search");
  const [step, setStep] = useState<1 | 2 | 3>(1); 
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VehicleResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Manual Selection States
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  
  const [selBrand, setSelBrand] = useState<number | null>(null);
  const [selModel, setSelModel] = useState<number | null>(null);
  const [isFetchingDropdown, setIsFetchingDropdown] = useState(false);

  // Order Details States
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResult | null>(null);
  const [tireQty, setTireQty] = useState<string>("");
  const [selectedOem, setSelectedOem] = useState<string>(""); 
  const [notes, setNotes] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Configuration Options
  const qtyOptions = [
    { id: "all", label: t("configurator.qty_all") || "All 4 Tires" },
    { id: "front_2", label: t("configurator.qty_front_2") || "2 Front" },
    { id: "rear_2", label: t("configurator.qty_rear_2") || "2 Rear" },
    { id: "front_1", label: t("configurator.qty_front_1") || "1 Front" },
    { id: "rear_1", label: t("configurator.qty_rear_1") || "1 Rear" },
  ];

  const oemOptions = [
    { id: "N", label: "N0/N1/N2 (Porsche)", desc: "Porsche Approved" },
    { id: "MO", label: "MO / MO1 (Mercedes)", desc: "Mercedes-Benz / AMG" },
    { id: "BMW", label: "★ (BMW)", desc: "BMW Star Marked" },
    { id: "L", label: "L (Lamborghini)", desc: "Lamborghini Approved" },
    { id: "K", label: "K1 / K2 (Ferrari)", desc: "Ferrari Approved" },
    { id: "AM", label: "AM (Aston Martin)", desc: "Aston Martin" },
    { id: "B", label: "B (Bentley)", desc: "Bentley Approved" },
    { id: "LR", label: "LR (Land Rover)", desc: "Range Rover Approved" },
  ];

  // Fetch initial data
  useEffect(() => {
    if (!tireId) { router.push("/"); return; }
    
    api.get(`/compounds/${tireId}`).then(res => setTire(res.data.data)).catch(() => router.push("/"));
    
    api.get("/vehicles/brands").then(res => {
      // STRICT FILTER: Only allow the 9 requested luxury brands
      const filteredBrands = res.data.data.filter((b: Brand) => 
        LUXURY_BRANDS.includes(b.name.toLowerCase())
      );
      setBrands(filteredBrands);
    });
  }, [tireId, router]);

  // Smart Search Trigger
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

  // Dropdown Handlers
  const handleBrandChange = (id: number) => {
    setSelBrand(id); setSelModel(null); setYears([]); setSelectedVehicle(null);
    if(!id) return;
    setIsFetchingDropdown(true);
    api.get(`/vehicles/brands/${id}/models`).then(res => {
        setModels(res.data.data);
        setIsFetchingDropdown(false);
    });
  };
  
  const handleModelChange = (id: number) => {
    setSelModel(id); setSelectedVehicle(null);
    if(!id) return;
    setIsFetchingDropdown(true);
    const brandName = brands.find(b => b.id === id)?.name || "";
    
    api.get(`/vehicles/models/${id}/years`).then(res => {
      const mappedYears = res.data.data.map((y: any) => ({
        ...y, model: { name: models.find(m => m.id === id)?.name, brand: { name: brandName } }
      }));
      setYears(mappedYears);
      setIsFetchingDropdown(false);
    });
  };

  const selectVehicle = (v: VehicleResult) => {
    setSelectedVehicle(v);
    setStep(2); 
    setSearchQuery(""); // clear search
    window.scrollTo({ top: window.innerHeight / 3, behavior: "smooth" });
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    const qtyLabel = qtyOptions.find(o => o.id === tireQty)?.label || "";
    
    setTimeout(() => {
        addToCart({
            id: Date.now().toString(),
            compound: tire,
            quantity: tireQty,
            qtyLabel,
            oemMark: selectedOem,
            vehicle: selectedVehicle,
            notes
        });
        
        setStep(3); // Success Step
        setIsAddingToCart(false);
        
        setTimeout(() => {
            window.dispatchEvent(new Event('open-cart-drawer'));
            // Reset for next potential order
            setStep(1); setSelectedVehicle(null); setTireQty(""); setSelectedOem(""); setNotes("");
        }, 1500);
    }, 800); // Artificial delay for premium feel
  };

  const tireImg = tire?.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${tire.media.file_path}` : null;
  let parsedSpecs: Record<string, any> = {};
  if (typeof tire?.specs === 'string') { try { parsedSpecs = JSON.parse(tire.specs); } catch (e) {} } 
  else if (typeof tire?.specs === 'object' && tire?.specs !== null) { parsedSpecs = tire.specs; }

  return (
    <div className="min-h-screen bg-obsidian text-white pt-[100px] pb-32 relative overflow-hidden selection:bg-crimson selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-crimson/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-carbon/50 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] gap-8 lg:gap-16 relative z-10 items-start">
        
        {/* ======================= */}
        {/* LEFT COLUMN: DOSSIER    */}
        {/* ======================= */}
        <div className="bg-gradient-to-b from-carbon/80 to-obsidian/90 backdrop-blur-3xl border border-white/10 p-8 lg:p-10 rounded-[2rem] lg:sticky lg:top-32 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden relative group">
          {/* Glass glare effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col items-center border-b border-white/10 pb-8 mb-8">
            {tireImg ? (
              <div className="relative w-56 lg:w-64 h-56 lg:h-64 flex items-center justify-center mb-6">
                 <div className="absolute inset-0 bg-crimson/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                 <img src={tireImg} alt={tire?.model_name} className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] transition-transform duration-700 group-hover:scale-110 z-10" />
              </div>
            ) : (
               <div className="w-56 h-56 bg-white/5 rounded-full mb-6 flex items-center justify-center text-ash/30 text-xs font-semibold uppercase tracking-widest border border-white/10">{t("order.no_image") || "No Image"}</div>
            )}
            <span className="text-[10px] uppercase tracking-[0.4em] text-crimson mb-3 block font-bold">{translateDB(tire?.brand.name || "", lang)}</span>
            <h3 className={`font-cinzel text-3xl md:text-4xl text-white text-center drop-shadow-md ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              {translateDB(tire?.model_name || "", lang)}
            </h3>
          </div>

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-white/20"></div>
                <h4 className={`text-[10px] uppercase tracking-widest text-ash ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.specs") || "Technical Data"}</h4>
                <div className="flex-1 h-px bg-white/20"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(parsedSpecs).length > 0 ? (
                Object.entries(parsedSpecs).map(([key, value]) => {
                  const normalizedKey = key.toLowerCase().replace(/ /g, '_');
                  const translatedKey = t(`specs.${normalizedKey}`);
                  const displayKey = translatedKey.includes("specs.") ? key : translatedKey;
                  return (
                    <div key={key} className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-center hover:border-white/20 transition-colors">
                      <span className={`text-[9px] uppercase tracking-widest text-ash/60 mb-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{displayKey}</span>
                      <span className="text-sm font-semibold text-white/90">{String(value)}</span>
                    </div>
                  );
                })
              ) : (
                <div className={`col-span-2 text-xs text-ash/50 font-light text-center py-4 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.specs_verification")}</div>
              )}
            </div>
          </div>
        </div>

        {/* ======================= */}
        {/* RIGHT COLUMN: WORKFLOW  */}
        {/* ======================= */}
        <div className="space-y-6 text-start flex flex-col">
          
          {/* STEPPER PROGRESS */}
          <div className="flex items-center justify-between mb-4 px-2">
            {[1, 2].map((num) => (
                <div key={num} className={`flex flex-col gap-2 w-1/2 ${num === 2 ? (lang === 'ar' ? 'items-end' : 'items-end') : (lang === 'ar' ? 'items-start' : 'items-start')}`}>
                    <div className={`h-1 rounded-full w-full transition-all duration-700 ${step >= num ? 'bg-crimson shadow-[0_0_10px_rgba(204,0,0,0.8)]' : 'bg-white/10'}`}></div>
                    <span className={`text-[10px] uppercase tracking-widest ${step >= num ? 'text-white' : 'text-ash/50'} ${lang === 'ar' ? 'font-cairo' : ''}`}>
                        {num === 1 ? (t("order.step_1_title") || "Select Vehicle") : (t("order.step_2_title") || "Fitment Details")}
                    </span>
                </div>
            ))}
          </div>

          {/* STEP 1: VEHICLE SELECTION */}
          <div className={`bg-carbon/60 backdrop-blur-xl border rounded-[2rem] p-6 md:p-10 transition-all duration-700 ${step === 1 ? 'border-white/20 shadow-[0_10px_50px_rgba(0,0,0,0.5)]' : 'border-white/5 opacity-50 hover:opacity-80 cursor-pointer'}`} onClick={() => step > 1 && setStep(1)}>
            <div className="flex justify-between items-center mb-8 gap-4">
              <h2 className={`font-cinzel text-2xl md:text-3xl text-white flex items-center gap-4 ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
                <span className="w-8 h-8 rounded-full bg-crimson/20 text-crimson flex items-center justify-center text-sm font-bold font-sans">1</span>
                {t("order.step_1_title") || "Select Vehicle"}
              </h2>
              {step > 1 && <button className={`text-[10px] uppercase tracking-widest text-crimson hover:text-white ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.edit") || "Edit"}</button>}
            </div>

            {step === 1 && (
              <div className="animate-[fadeInUp_0.4s_ease-out]">
                {/* Search/Manual Toggle */}
                <div className="flex p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
                  <button onClick={() => {setTab("search"); setSearchQuery("");}} className={`flex-1 py-3.5 text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all duration-300 ${lang === 'ar' ? 'font-cairo font-bold' : ''} ${tab === "search" ? 'bg-white/10 text-white shadow-md border border-white/10' : 'text-ash hover:text-white hover:bg-white/5'}`}>{t("order.smart_search") || "Smart Search"}</button>
                  <button onClick={() => setTab("manual")} className={`flex-1 py-3.5 text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all duration-300 ${lang === 'ar' ? 'font-cairo font-bold' : ''} ${tab === "manual" ? 'bg-white/10 text-white shadow-md border border-white/10' : 'text-ash hover:text-white hover:bg-white/5'}`}>{t("order.manual_select") || "Manual Selection"}</button>
                </div>

                {/* SMART SEARCH */}
                {tab === "search" && (
                  <div className="relative">
                    <div className="relative flex items-center">
                        <svg className={`absolute ${lang === 'ar' ? 'right-6' : 'left-6'} w-5 h-5 text-ash/50`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder={t("order.search_placeholder") || "e.g. Porsche 911 2023"} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full bg-black/40 border border-white/10 rounded-2xl py-5 text-base text-white outline-none focus:border-crimson focus:bg-black/60 transition-all shadow-inner ${lang === 'ar' ? 'pr-14 pl-12 font-cairo' : 'pl-14 pr-12'}`} />
                        {isSearching && <div className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'left-6' : 'right-6'} w-5 h-5 border-2 border-white/20 border-t-crimson rounded-full animate-spin`}></div>}
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="mt-4 bg-obsidian border border-white/10 rounded-2xl overflow-hidden max-h-72 overflow-y-auto shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-20 relative scrollbar-thin scrollbar-thumb-crimson scrollbar-track-black">
                        {searchResults.map((v, i) => (
                          <button key={v.id} onClick={() => selectVehicle(v)} className={`w-full text-start px-6 py-4 text-sm border-b border-white/5 hover:bg-crimson/10 hover:text-white text-ash transition-colors flex justify-between items-center group ${i === 0 ? 'bg-white/5' : ''}`}>
                            <span className={`group-hover:translate-x-2 transition-transform duration-300 ${lang === 'ar' ? 'font-cairo font-bold group-hover:-translate-x-2' : ''}`}>
                              <span className="text-crimson font-bold mr-2">{v.year}</span> 
                              {translateDB(v.model.brand.name, lang)} {translateDB(v.model.name, lang)}
                            </span>
                            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchQuery.trim().length > 2 && !isSearching && searchResults.length === 0 && (
                        <div className="mt-4 p-6 bg-black/40 rounded-2xl border border-dashed border-white/20 text-center text-ash text-sm">
                            No vehicles found matching "{searchQuery}". Try manual selection.
                        </div>
                    )}
                  </div>
                )}

                {/* MANUAL SELECTION */}
                {tab === "manual" && (
                  <div className="space-y-4">
                    {/* Brand Select */}
                    <div className="relative">
                        <select value={selBrand || ""} onChange={(e) => handleBrandChange(Number(e.target.value))} className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-crimson appearance-none cursor-pointer transition-colors ${lang === 'ar' ? 'font-cairo' : ''}`}>
                            <option value="" disabled>{t("order.select_brand") || "Select Premium Brand"}</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{translateDB(b.name, lang)}</option>)}
                        </select>
                        <div className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'left-6' : 'right-6'} pointer-events-none`}>
                            <svg className="w-4 h-4 text-ash" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* Model Select */}
                    {selBrand && (
                      <div className="relative animate-[fadeIn_0.3s_ease-out]">
                        <select value={selModel || ""} onChange={(e) => handleModelChange(Number(e.target.value))} disabled={isFetchingDropdown} className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-crimson appearance-none cursor-pointer transition-colors disabled:opacity-50 ${lang === 'ar' ? 'font-cairo' : ''}`}>
                            <option value="" disabled>{isFetchingDropdown ? "Loading..." : (t("order.select_model") || "Select Model")}</option>
                            {models.map(m => <option key={m.id} value={m.id}>{translateDB(m.name, lang)}</option>)}
                        </select>
                        <div className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'left-6' : 'right-6'} pointer-events-none`}>
                            {isFetchingDropdown ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <svg className="w-4 h-4 text-ash" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                        </div>
                      </div>
                    )}

                    {/* Year Select */}
                    {selModel && years.length > 0 && !isFetchingDropdown && (
                      <div className="pt-4 animate-[fadeInUp_0.4s_ease-out]">
                        <span className={`text-[10px] uppercase tracking-widest text-ash mb-4 block px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>Select Production Year</span>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {years.map(y => (
                            <button key={y.id} onClick={() => selectVehicle(y)} className="bg-black/40 border border-white/10 rounded-xl py-4 text-sm font-bold text-ash hover:text-white hover:border-crimson hover:bg-crimson/10 transition-all duration-300 hover:-translate-y-1">
                                {y.year}
                            </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: FITMENT & DETAILS */}
          <div className={`bg-carbon/60 backdrop-blur-xl border rounded-[2rem] p-6 md:p-10 transition-all duration-700 ${step === 2 ? 'border-white/20 shadow-[0_10px_50px_rgba(0,0,0,0.5)]' : 'border-white/5 opacity-50 pointer-events-none'}`}>
            <div className="flex justify-between items-center mb-8 gap-4">
              <h2 className={`font-cinzel text-2xl md:text-3xl text-white flex items-center gap-4 ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-sans transition-colors duration-500 ${step === 2 ? 'bg-crimson text-white shadow-[0_0_15px_rgba(204,0,0,0.6)]' : 'bg-white/10 text-ash'}`}>2</span>
                {t("order.step_2_title") || "Fitment Details"}
              </h2>
            </div>

            {step === 2 && selectedVehicle && (
              <div className="animate-[fadeInUp_0.5s_ease-out]">
                
                {/* Selected Vehicle Badge */}
                <div className="flex items-center justify-between bg-crimson/10 border border-crimson/30 rounded-2xl p-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black/50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </div>
                        <div>
                            <span className="text-[10px] text-crimson uppercase tracking-widest block font-bold mb-1">Confirmed Vehicle</span>
                            <span className={`text-white font-semibold text-sm md:text-base ${lang === 'ar' ? 'font-cairo' : ''}`}>
                                {selectedVehicle.year} {translateDB(selectedVehicle.model.brand.name, lang)} {translateDB(selectedVehicle.model.name, lang)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* OEM Specifications Display */}
                {selectedVehicle.oemSpec && (
                  <div className="bg-gradient-to-br from-black/80 to-carbon border border-white/10 rounded-2xl p-6 md:p-8 mb-10 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-crimson/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex-1 w-full text-center md:text-start">
                      <span className={`text-[10px] uppercase tracking-[0.2em] text-ash/60 mb-3 block ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.front_axle") || "Front Axle Fitment"}</span>
                      <div className="font-cinzel text-3xl md:text-4xl text-white font-bold tracking-wider">
                        {selectedVehicle.oemSpec.f_width}/{selectedVehicle.oemSpec.f_profile}<span className="text-crimson ml-1">R{selectedVehicle.oemSpec.f_rim}</span>
                      </div>
                    </div>
                    <div className="w-full h-px md:w-px md:h-16 bg-white/10 shrink-0"></div>
                    <div className="flex-1 w-full text-center md:text-start">
                      <span className={`text-[10px] uppercase tracking-[0.2em] text-ash/60 mb-3 block ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.rear_axle") || "Rear Axle Fitment"}</span>
                      <div className="font-cinzel text-3xl md:text-4xl text-white font-bold tracking-wider">
                        {selectedVehicle.oemSpec.r_width}/{selectedVehicle.oemSpec.r_profile}<span className="text-crimson ml-1">R{selectedVehicle.oemSpec.r_rim}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* OEM Mark Selection */}
                <h3 className={`text-[10px] uppercase tracking-widest text-ash mb-4 px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>Required Homologation (Optional)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                  {oemOptions.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedOem(opt.id === selectedOem ? "" : opt.id)} className={`p-4 rounded-xl border text-start transition-all duration-300 flex flex-col justify-center gap-1 ${selectedOem === opt.id ? 'bg-crimson border-crimson text-white shadow-[0_10px_20px_rgba(204,0,0,0.3)] -translate-y-1' : 'bg-black/40 border-white/5 text-ash hover:border-white/20 hover:bg-white/5'}`}>
                      <span className="font-bold text-sm">{opt.label.split(' ')[0]}</span>
                      <span className="text-[9px] opacity-70 uppercase tracking-wider">{opt.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Quantity Selection */}
                <h3 className={`text-[10px] uppercase tracking-widest text-ash mb-4 px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.qty_title") || "Select Quantity"}</h3>
                <div className="flex flex-wrap gap-3 mb-10">
                  {qtyOptions.map(opt => (
                    <button key={opt.id} onClick={() => setTireQty(opt.id)} className={`px-6 py-4 rounded-xl border text-xs transition-all duration-300 ${lang === 'ar' ? 'font-cairo' : ''} ${tireQty === opt.id ? 'bg-white border-white text-obsidian font-bold shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' : 'bg-black/40 border-white/10 text-ash hover:border-white/50 hover:text-white hover:bg-white/5'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <div className="mb-10 relative">
                  <label className={`text-[10px] uppercase tracking-widest text-ash mb-3 block px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("order.special_notes") || "Additional Instructions"}</label>
                  <textarea 
                    className={`w-full bg-black/40 border border-white/10 outline-none transition-all text-white p-6 rounded-2xl focus:border-crimson min-h-[120px] resize-none text-sm placeholder:text-ash/30 shadow-inner ${lang === 'ar' ? 'font-cairo' : ''}`} 
                    placeholder={t("order.notes_placeholder") || "Any specific delivery or fitting requirements..."}
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                  />
                </div>

                {/* Submit Action */}
                <button 
                  onClick={handleAddToCart} 
                  disabled={!tireQty || isAddingToCart} 
                  className={`w-full relative overflow-hidden group bg-white text-obsidian px-6 py-5 md:py-6 rounded-2xl uppercase tracking-[0.2em] text-sm md:text-base font-bold transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}
                >
                  <div className={`absolute inset-0 bg-crimson transition-transform duration-500 origin-left ${isAddingToCart ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                  <span className={`relative z-10 flex items-center justify-center gap-3 transition-colors duration-500 ${isAddingToCart || tireQty ? 'group-hover:text-white' : ''}`}>
                    {isAddingToCart ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            {t("cart.add_to_cart") || "Add to Cart"}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: SUCCESS ANIMATION */}
          {step === 3 && (
              <div className="bg-carbon/60 backdrop-blur-xl border border-green-500/30 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center animate-[fadeIn_0.5s_ease-out] shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 text-green-500 animate-[scaleIn_0.4s_ease-out]">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-cinzel text-white mb-2">Configuration Added</h3>
                  <p className="text-ash text-sm">Your premium tire setup has been added to your cart.</p>
              </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
        <div className="min-h-screen w-full bg-obsidian flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-2 border-white/10 border-t-crimson rounded-full animate-spin"></div>
            <span className="text-ash uppercase tracking-widest text-xs">Initializing Configurator...</span>
        </div>
    }>
      <OrderVehicleContent />
    </Suspense>
  );
}