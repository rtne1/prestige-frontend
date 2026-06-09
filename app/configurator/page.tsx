"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { Input } from "@/components/ui/Input";

interface Brand { id: number; name: string; media_id: number | null; }
interface Model { id: number; name: string; }
interface Year { id: number; year: number; }
interface OemSpec { f_width: number; f_profile: number; f_rim: number; r_width: number; r_profile: number; r_rim: number; }
interface Compound { id: number; model_name: string; specs: any; brand: { name: string; media_id: number | null }; }

export default function ConfiguratorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  
  const STEPS = [t("configurator.step_1"), t("configurator.step_2"), t("configurator.step_3"), t("configurator.step_4")];

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<number | "">("");
  const [selectedModel, setSelectedModel] = useState<number | "">("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [oemSpec, setOemSpec] = useState<OemSpec | null>(null);
  const [isCustomSpec, setIsCustomSpec] = useState(false);
  const [dimensions, setDimensions] = useState<OemSpec>({ f_width: 0, f_profile: 0, f_rim: 0, r_width: 0, r_profile: 0, r_rim: 0 });
  const [selectedCompound, setSelectedCompound] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    api.get("/vehicles/brands").then((res) => setBrands(res.data.data)).catch(console.error);
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      api.get(`/vehicles/brands/${selectedBrand}/models`).then((res) => setModels(res.data.data));
      api.get(`/compounds?brand_id=${selectedBrand}`).then((res) => setCompounds(res.data.data));
      setSelectedModel(""); setSelectedYear(""); setOemSpec(null);
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedModel) {
      api.get(`/vehicles/models/${selectedModel}/years`).then((res) => setYears(res.data.data));
      setSelectedYear(""); setOemSpec(null);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (selectedYear) {
      api.get(`/vehicles/years/${selectedYear}/oem-specs`).then((res) => {
        if (res.data.data) {
          setOemSpec(res.data.data);
          setDimensions(res.data.data);
          setIsCustomSpec(false);
        } else {
          setOemSpec(null);
          setIsCustomSpec(true);
        }
      });
    }
  }, [selectedYear]);

  const handleDimensionChange = (field: keyof OemSpec, value: string) => setDimensions(prev => ({ ...prev, [field]: parseInt(value) || 0 }));

  const validateStep = () => {
    if (step === 1 && (!selectedBrand || !selectedModel || !selectedYear)) return false;
    if (step === 2 && (!dimensions.f_width || !dimensions.f_profile || !dimensions.f_rim || !dimensions.r_width || !dimensions.r_profile || !dimensions.r_rim)) return false;
    if (step === 3 && !selectedCompound) return false;
    return true;
  };

  const handleNext = () => { if (validateStep() && step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const submitConfiguration = async (configData: any) => {
    setIsSubmitting(true);
    try {
      const vehRes = await api.post("/garage/vehicles", { vehicle_year_id: configData.selectedYear, nickname: null });
      await api.post("/garage/requests", {
        user_vehicle_id: vehRes.data.data.id,
        compound_id: configData.selectedCompound,
        ...configData.dimensions,
        client_notes: configData.notes || null
      });
      router.push("/garage");
    } catch (error) {
      alert("Server Error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleAuthorize = () => {
    const configData = { selectedYear, selectedCompound, dimensions, notes };
    if (!user) {
      localStorage.setItem("pending_config", JSON.stringify(configData));
      router.push("/auth");
    } else submitConfiguration(configData);
  };

  const brandObj = brands.find(b => b.id === Number(selectedBrand));
  const modelObj = models.find(m => m.id === Number(selectedModel));
  const yearObj = years.find(y => y.id === Number(selectedYear));
  const compoundObj = compounds.find(c => c.id === Number(selectedCompound));

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-obsidian text-white overflow-hidden pt-[70px] lg:pt-0">
      
      {/* MOBILE PROGRESS INDICATOR */}
      <div className="lg:hidden w-full px-6 py-3 shrink-0 relative z-20">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-ash mb-2">
          <span className={lang === 'ar' ? 'font-cairo font-bold' : ''}>{STEPS[step - 1]}</span>
          <span>{step} / 4</span>
        </div>
        <div className="w-full h-[2px] bg-white/10 overflow-hidden">
          <div className="h-full bg-crimson transition-all duration-700 ease-luxury" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {/* DESKTOP LEFT PANEL */}
      <div className="hidden lg:flex w-[40%] bg-carbon/20 border-l lg:border-l-0 lg:border-r border-white/5 p-16 pt-32 flex-col justify-between relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="font-cinzel text-xl text-ash tracking-[0.3em] font-semibold mb-16 uppercase">{t("configurator.the_studio")}<span className="text-crimson">.</span></h1>
          <h2 className={`font-cinzel text-4xl leading-tight mb-6 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
            {step.toString().padStart(2, '0')}. <br/>
            <span className="text-white">{STEPS[step - 1]}</span>
          </h2>
        </div>
        
        <div className="flex flex-col gap-8 relative z-10">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-6 transition-all duration-700 ease-luxury ${step === i + 1 ? "opacity-100 translate-x-2" : "opacity-30"}`}>
              <div className={`w-8 h-[1px] ${step === i + 1 ? "bg-crimson" : "bg-white"}`} />
              <span className={`text-xs uppercase tracking-widest ${lang === 'ar' ? 'font-cairo font-semibold' : ''}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE RIGHT PANEL (Internal Scroll Only) */}
      <div className="w-full lg:w-[60%] flex flex-col relative h-full">
        
        <div className="flex-grow overflow-y-auto px-6 py-6 lg:px-20 lg:py-32 pb-40 lg:pb-40 hide-scrollbar">
          
          {/* STEP 1: ULTRA-PREMIUM SELECTION TILES */}
          {step === 1 && (
            <div className="animate-[fadeInUp_0.6s_forwards] space-y-12 max-w-2xl mx-auto">
              <div>
                <h3 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo font-semibold' : ''}`}>{t("configurator.select_marque")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {brands.map(b => (
                    <button key={b.id} onClick={() => setSelectedBrand(b.id)} className={`relative py-6 px-4 text-center transition-all duration-500 font-cinzel tracking-widest text-sm overflow-hidden group ${selectedBrand === b.id ? 'border-crimson bg-gradient-to-b from-crimson/20 to-transparent text-white shadow-[0_0_20px_rgba(204,0,0,0.2)] border' : 'border-white/10 bg-gradient-to-b from-white/5 to-transparent text-ash hover:border-white/30 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] border'}`}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedBrand !== "" && (
                <div className="animate-[fadeInUp_0.4s_forwards]">
                  <h3 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo font-semibold' : ''}`}>{t("configurator.select_model")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {models.map(m => (
                      <button key={m.id} onClick={() => setSelectedModel(m.id)} className={`relative py-5 px-6 text-start transition-all duration-500 font-inter font-light text-sm ${selectedModel === m.id ? 'border-crimson bg-gradient-to-r from-crimson/10 to-transparent text-white border' : 'border-white/10 bg-carbon/30 text-ash hover:border-white/30 hover:text-white border'}`}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedModel !== "" && (
                <div className="animate-[fadeInUp_0.4s_forwards]">
                  <h3 className={`text-[10px] uppercase tracking-widest text-ash mb-4 ${lang === 'ar' ? 'font-cairo font-semibold' : ''}`}>{t("configurator.prod_year")}</h3>
                  <div className="flex flex-wrap gap-3">
                    {years.map(y => (
                      <button key={y.id} onClick={() => setSelectedYear(y.id)} className={`py-3 px-8 border text-sm transition-all duration-500 ${selectedYear === y.id ? 'border-crimson bg-crimson text-white shadow-[0_0_15px_rgba(204,0,0,0.3)]' : 'border-white/20 text-ash hover:border-white hover:text-white bg-transparent'}`}>
                        {y.year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DIMENSIONS */}
          {step === 2 && (
            <div className="animate-[fadeInUp_0.6s_forwards] max-w-2xl mx-auto">
              {oemSpec && (
                <div className="mb-10 p-8 border border-white/10 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden group">
                  <div className={`absolute top-0 w-1 h-full bg-crimson shadow-[0_0_10px_#cc0000] ${lang === 'ar' ? 'right-0' : 'left-0'}`} />
                  <h4 className="text-[10px] text-crimson uppercase tracking-widest mb-8">OEM Recommended Fitment</h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className={`text-[10px] text-ash uppercase tracking-widest block mb-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.front_axle")}</span>
                      <p className="text-2xl font-light text-white">{oemSpec.f_width} / {oemSpec.f_profile} R{oemSpec.f_rim}</p>
                    </div>
                    <div>
                      <span className={`text-[10px] text-ash uppercase tracking-widest block mb-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.rear_axle")}</span>
                      <p className="text-2xl font-light text-white">{oemSpec.r_width} / {oemSpec.r_profile} R{oemSpec.r_rim}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-10 cursor-pointer w-max group" onClick={() => { setIsCustomSpec(!isCustomSpec); if (!isCustomSpec) setDimensions({ f_width: 0, f_profile: 0, f_rim: 0, r_width: 0, r_profile: 0, r_rim: 0 }); else if (oemSpec) setDimensions(oemSpec); }}>
                <div className={`w-10 h-5 rounded-full transition-colors relative ${isCustomSpec ? "bg-crimson" : "bg-white/20"}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${isCustomSpec ? (lang === 'ar' ? "-translate-x-6" : "translate-x-6") : (lang === 'ar' ? "-translate-x-1" : "translate-x-1")}`} />
                </div>
                <span className={`text-xs text-ash uppercase tracking-widest group-hover:text-white transition-colors ${lang === 'ar' ? 'font-cairo font-semibold' : ''}`}>{t("configurator.custom_fitment")}</span>
              </div>

              {isCustomSpec && (
                <div className="space-y-10 animate-[fadeInUp_0.3s_forwards] p-6 md:p-8 border border-white/10 bg-carbon/30">
                  <div>
                    <span className={`text-[10px] text-crimson uppercase tracking-widest block mb-6 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.front_axle")}</span>
                    <div className="grid grid-cols-3 gap-3 md:gap-6">
                      <Input label="Width" type="number" value={dimensions.f_width || ""} onChange={(e) => handleDimensionChange('f_width', e.target.value)} required />
                      <Input label="Profile" type="number" value={dimensions.f_profile || ""} onChange={(e) => handleDimensionChange('f_profile', e.target.value)} required />
                      <Input label="Rim" type="number" value={dimensions.f_rim || ""} onChange={(e) => handleDimensionChange('f_rim', e.target.value)} required />
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-8">
                    <span className={`text-[10px] text-crimson uppercase tracking-widest block mb-6 ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.rear_axle")}</span>
                    <div className="grid grid-cols-3 gap-3 md:gap-6">
                      <Input label="Width" type="number" value={dimensions.r_width || ""} onChange={(e) => handleDimensionChange('r_width', e.target.value)} required />
                      <Input label="Profile" type="number" value={dimensions.r_profile || ""} onChange={(e) => handleDimensionChange('r_profile', e.target.value)} required />
                      <Input label="Rim" type="number" value={dimensions.r_rim || ""} onChange={(e) => handleDimensionChange('r_rim', e.target.value)} required />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: COMPOUNDS */}
          {step === 3 && (
            <div className="animate-[fadeInUp_0.6s_forwards] max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {compounds.map(compound => (
                  <div key={compound.id} onClick={() => setSelectedCompound(compound.id)} className={`bg-carbon/50 border p-6 md:p-8 cursor-pointer transition-all duration-300 relative group ${selectedCompound === compound.id ? "border-crimson shadow-[0_0_30px_rgba(204,0,0,0.15)] bg-gradient-to-b from-crimson/10 to-transparent" : "border-white/10 hover:border-white/30 hover:bg-carbon"}`}>
                    <div className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} transition-opacity duration-300 ${selectedCompound === compound.id ? 'opacity-100 text-crimson' : 'opacity-0'}`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-[10px] text-ash uppercase tracking-widest block mb-2">{compound.brand.name}</span>
                    <h3 className="font-cinzel text-xl md:text-2xl text-white mb-6">{compound.model_name}</h3>
                    {compound.specs && (
                      <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-white/10">
                        {Object.entries(compound.specs).map(([key, val]) => (
                          <span key={key} className="text-[9px] text-ash bg-obsidian border border-white/10 px-2 py-1 uppercase tracking-widest rounded-sm">{key}: {val as React.ReactNode}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: SUMMARY */}
          {step === 4 && (
            <div className="animate-[fadeInUp_0.6s_forwards] max-w-2xl mx-auto">
              <div className="bg-carbon/50 border border-white/10 p-6 md:p-10 mb-8 relative">
                <h3 className={`font-cinzel text-2xl mb-8 border-b border-white/10 pb-6 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{t("configurator.review")}</h3>
                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <span className="text-[10px] text-ash uppercase tracking-widest">Vehicle</span>
                    <span className="font-medium text-lg md:text-base text-white">{yearObj?.year} {brandObj?.name} {modelObj?.name}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6 gap-2">
                    <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.front_axle")}</span>
                    <span className="font-light text-lg md:text-base text-white">{dimensions.f_width}/{dimensions.f_profile} R{dimensions.f_rim}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6 gap-2">
                    <span className={`text-[10px] text-ash uppercase tracking-widest ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("configurator.rear_axle")}</span>
                    <span className="font-light text-lg md:text-base text-white">{dimensions.r_width}/{dimensions.r_profile} R{dimensions.r_rim}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6 gap-2">
                    <span className="text-[10px] text-ash uppercase tracking-widest">Compound</span>
                    <span className="font-medium text-crimson text-lg md:text-base">{compoundObj?.brand.name} {compoundObj?.model_name}</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-10">
                <textarea
                  className="w-full bg-carbon/30 border border-white/10 outline-none transition-colors duration-300 ease-luxury text-white text-base p-6 focus:border-crimson min-h-[120px] resize-none peer"
                  placeholder=" "
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <label className={`absolute ${lang === 'ar' ? 'right-6' : 'left-6'} top-6 text-sm text-ash transition-all duration-300 ease-luxury pointer-events-none uppercase tracking-widest peer-focus:-top-3 peer-focus:text-[10px] peer-focus:bg-obsidian peer-focus:px-2 peer-focus:text-crimson peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm -top-3 text-[10px] bg-obsidian px-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>
                  {t("configurator.special_notes")}
                </label>
              </div>
            </div>
          )}
        </div>

        {/* LOCKED BOTTOM ACTION BAR */}
        <div className="absolute bottom-0 left-0 w-full bg-obsidian/80 backdrop-blur-2xl border-t border-white/10 p-6 lg:p-8 flex lg:flex-row flex-col-reverse justify-between items-center gap-4 z-50">
          <button onClick={handleBack} className={`w-full lg:w-auto text-xs uppercase tracking-widest text-ash hover:text-white py-3 transition-colors ${step === 1 ? "invisible" : ""}`} disabled={isSubmitting}>
            {t("configurator.back")}
          </button>
          
          {step < 4 ? (
            <button onClick={handleNext} disabled={!validateStep()} className={`w-full lg:w-auto bg-white text-obsidian px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold hover:bg-crimson hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-obsidian ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              {t("configurator.continue")}
            </button>
          ) : (
            <button onClick={handleAuthorize} className={`w-full lg:w-auto bg-crimson text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold hover:bg-white hover:text-obsidian transition-all shadow-[0_0_30px_rgba(204,0,0,0.3)] ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              {user ? t("configurator.auth_req") : t("configurator.auth_to_auth")}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}