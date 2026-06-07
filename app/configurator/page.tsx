"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// --- Types ---
interface Brand { id: number; name: string; media_id: number | null; }
interface Model { id: number; name: string; }
interface Year { id: number; year: number; }
interface OemSpec { f_width: number; f_profile: number; f_rim: number; r_width: number; r_profile: number; r_rim: number; }
interface Compound { id: number; model_name: string; specs: any; brand: { name: string; media_id: number | null }; }

const STEPS = ["Vehicle Spec", "Dimensions", "Compound", "Authorize"];

export default function ConfiguratorPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // --- UI & Data State ---
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  
  // --- Selection State ---
  const [selectedBrand, setSelectedBrand] = useState<number | "">("");
  const [selectedModel, setSelectedModel] = useState<number | "">("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [oemSpec, setOemSpec] = useState<OemSpec | null>(null);
  const [isCustomSpec, setIsCustomSpec] = useState(false);
  const [dimensions, setDimensions] = useState<OemSpec>({ f_width: 0, f_profile: 0, f_rim: 0, r_width: 0, r_profile: 0, r_rim: 0 });
  const [selectedCompound, setSelectedCompound] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  // --- Data Fetching ---
  useEffect(() => {
    api.get("/vehicles/brands").then((res) => setBrands(res.data.data));
    const pending = localStorage.getItem("pending_config");
    if (pending && user) {
      const data = JSON.parse(pending);
      submitConfiguration(data);
      localStorage.removeItem("pending_config");
    }
  }, [user]);

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

  // --- Handlers ---
  const handleDimensionChange = (field: keyof OemSpec, value: string) => {
    setDimensions(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const validateStep = () => {
    if (step === 1 && (!selectedBrand || !selectedModel || !selectedYear)) return false;
    if (step === 2 && (!dimensions.f_width || !dimensions.f_profile || !dimensions.f_rim || !dimensions.r_width || !dimensions.r_profile || !dimensions.r_rim)) return false;
    if (step === 3 && !selectedCompound) return false;
    return true;
  };

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
      alert("Failed to submit request. Please try again.");
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

  // --- Summary Variables ---
  const brandObj = brands.find(b => b.id === Number(selectedBrand));
  const modelObj = models.find(m => m.id === Number(selectedModel));
  const yearObj = years.find(y => y.id === Number(selectedYear));
  const compoundObj = compounds.find(c => c.id === Number(selectedCompound));

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] relative bg-obsidian text-white">
      
      {/* MOBILE PROGRESS BAR (Visible only on phones) */}
      <div className="lg:hidden w-full bg-carbon border-b border-glass px-6 py-4 sticky top-0 z-40">
        <div className="flex justify-between text-xs uppercase tracking-widest text-ash mb-2">
          <span>{STEPS[step - 1]}</span>
          <span>{step} / 4</span>
        </div>
        <div className="w-full h-1 bg-glass rounded-full overflow-hidden">
          <div className="h-full bg-crimson transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {/* DESKTOP LEFT PANEL */}
      <div className="hidden lg:flex w-[35%] bg-carbon border-r border-glass p-16 flex-col justify-between relative z-10">
        <div>
          <h1 className="font-cinzel text-3xl tracking-[0.15em] font-semibold mb-16">THE STUDIO<span className="text-crimson">.</span></h1>
          <h2 className="font-cinzel text-5xl mb-6">
            {step.toString().padStart(2, '0')}. <br/>
            <span className="text-ash/60">{STEPS[step - 1]}</span>
          </h2>
        </div>
        
        <div className="flex flex-col gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-6 transition-all duration-500 ${step === i + 1 ? "opacity-100 translate-x-2" : "opacity-30"}`}>
              <div className={`w-12 h-[1px] ${step === i + 1 ? "bg-crimson" : "bg-white"}`} />
              <span className="text-sm uppercase tracking-widest">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE RIGHT PANEL */}
      <div className="w-full lg:w-[65%] flex flex-col relative overflow-y-auto pb-32">
        <div className="flex-grow p-6 lg:p-16 max-w-4xl w-full mx-auto">
          
          {/* STEP 1: LUXURY SELECTION UX */}
          {step === 1 && (
            <div className="animate-[fadeInUp_0.4s_forwards] space-y-12">
              
              {/* Marques */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-ash mb-4">1. Select Marque</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {brands.map(b => (
                    <button 
                      key={b.id} 
                      onClick={() => setSelectedBrand(b.id)}
                      className={`py-5 px-4 border text-center transition-all duration-300 font-cinzel tracking-widest text-sm
                        ${selectedBrand === b.id 
                          ? 'border-crimson bg-crimson/10 text-white shadow-[0_0_20px_rgba(204,0,0,0.15)]' 
                          : 'border-glass text-ash hover:border-white/50 hover:text-white'}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Models */}
              {selectedBrand !== "" && (
                <div className="animate-[fadeInUp_0.4s_forwards]">
                  <h3 className="text-xs uppercase tracking-widest text-ash mb-4">2. Select Model</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {models.map(m => (
                      <button 
                        key={m.id} 
                        onClick={() => setSelectedModel(m.id)}
                        className={`py-4 px-6 border text-left transition-all duration-300 font-inter font-light
                          ${selectedModel === m.id 
                            ? 'border-crimson bg-crimson/5 text-white' 
                            : 'border-glass text-ash hover:border-white/50 hover:text-white bg-carbon/50'}`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Years */}
              {selectedModel !== "" && (
                <div className="animate-[fadeInUp_0.4s_forwards]">
                  <h3 className="text-xs uppercase tracking-widest text-ash mb-4">3. Production Year</h3>
                  <div className="flex flex-wrap gap-3">
                    {years.map(y => (
                      <button 
                        key={y.id} 
                        onClick={() => setSelectedYear(y.id)}
                        className={`py-3 px-8 rounded-full border text-sm transition-all duration-300
                          ${selectedYear === y.id 
                            ? 'border-crimson bg-crimson text-white' 
                            : 'border-glass text-ash hover:border-white hover:text-white'}`}
                      >
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
            <div className="animate-[fadeInUp_0.4s_forwards]">
              {oemSpec && (
                <div className="mb-10 p-6 md:p-8 border border-glass bg-carbon/50 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-crimson" />
                  <h4 className="text-xs text-crimson uppercase tracking-widest mb-6">OEM Recommended Fitment</h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className="text-[10px] text-ash uppercase tracking-widest block mb-2">Front Axle</span>
                      <p className="text-xl md:text-2xl font-light">{oemSpec.f_width} / {oemSpec.f_profile} R{oemSpec.f_rim}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-ash uppercase tracking-widest block mb-2">Rear Axle</span>
                      <p className="text-xl md:text-2xl font-light">{oemSpec.r_width} / {oemSpec.r_profile} R{oemSpec.r_rim}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Switch */}
              <div 
                className="flex items-center gap-4 mb-10 cursor-pointer w-max"
                onClick={() => {
                  setIsCustomSpec(!isCustomSpec);
                  if (!isCustomSpec) setDimensions({ f_width: 0, f_profile: 0, f_rim: 0, r_width: 0, r_profile: 0, r_rim: 0 });
                  else if (oemSpec) setDimensions(oemSpec);
                }}
              >
                <div className={`w-12 h-6 rounded-full transition-colors relative ${isCustomSpec ? "bg-crimson" : "bg-glass"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isCustomSpec ? "translate-x-7" : "translate-x-1"}`} />
                </div>
                <span className="text-sm text-ash uppercase tracking-widest">Specify Custom Aftermarket Fitment</span>
              </div>

              {isCustomSpec && (
                <div className="space-y-10 animate-[fadeInUp_0.3s_forwards] bg-carbon p-6 md:p-8 border border-glass">
                  <div>
                    <span className="text-xs text-crimson uppercase tracking-widest block mb-6">Front Dimensions</span>
                    <div className="grid grid-cols-3 gap-3 md:gap-6">
                      <Input label="Width" type="number" value={dimensions.f_width || ""} onChange={(e) => handleDimensionChange('f_width', e.target.value)} required />
                      <Input label="Profile" type="number" value={dimensions.f_profile || ""} onChange={(e) => handleDimensionChange('f_profile', e.target.value)} required />
                      <Input label="Rim" type="number" value={dimensions.f_rim || ""} onChange={(e) => handleDimensionChange('f_rim', e.target.value)} required />
                    </div>
                  </div>
                  <div className="border-t border-glass/30 pt-8">
                    <span className="text-xs text-crimson uppercase tracking-widest block mb-6">Rear Dimensions</span>
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

          {/* STEP 3: COMPOUND CARDS */}
          {step === 3 && (
            <div className="animate-[fadeInUp_0.4s_forwards]">
              <p className="text-ash font-light mb-8 text-sm md:text-base">
                Engineered compounds strictly homologated for {brandObj?.name}.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {compounds.map(compound => (
                  <div 
                    key={compound.id}
                    onClick={() => setSelectedCompound(compound.id)}
                    className={`bg-carbon border p-6 md:p-8 cursor-pointer transition-all duration-300 relative group
                      ${selectedCompound === compound.id 
                        ? "border-crimson shadow-[0_0_30px_rgba(204,0,0,0.1)] -translate-y-1" 
                        : "border-glass hover:border-white/30"}`}
                  >
                    {/* Checkmark Icon */}
                    <div className={`absolute top-6 right-6 transition-opacity duration-300 ${selectedCompound === compound.id ? 'opacity-100 text-crimson' : 'opacity-0'}`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>

                    <span className="text-[10px] text-ash uppercase tracking-widest block mb-2">{compound.brand.name}</span>
                    <h3 className="font-cinzel text-xl md:text-2xl text-white mb-6">{compound.model_name}</h3>
                    
                    {compound.specs && (
                      <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-glass/30">
                        {Object.entries(compound.specs).map(([key, val]) => (
                          <span key={key} className="text-[10px] text-ash bg-obsidian border border-glass px-2 py-1 uppercase tracking-widest rounded-sm">
                            {key}: {val as React.ReactNode}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: SUMMARY RECEIPT */}
          {step === 4 && (
            <div className="animate-[fadeInUp_0.4s_forwards]">
              <div className="bg-carbon border border-glass p-6 md:p-10 mb-8 relative">
                <h3 className="font-cinzel text-2xl mb-8 border-b border-glass pb-6">Specification Review</h3>
                
                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <span className="text-xs text-ash uppercase tracking-widest">Vehicle</span>
                    <span className="font-medium text-lg md:text-base">{yearObj?.year} {brandObj?.name} {modelObj?.name}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-glass/30 pt-6 gap-2">
                    <span className="text-xs text-ash uppercase tracking-widest">Front Axle</span>
                    <span className="font-light text-lg md:text-base">{dimensions.f_width}/{dimensions.f_profile} R{dimensions.f_rim}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-glass/30 pt-6 gap-2">
                    <span className="text-xs text-ash uppercase tracking-widest">Rear Axle</span>
                    <span className="font-light text-lg md:text-base">{dimensions.r_width}/{dimensions.r_profile} R{dimensions.r_rim}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-glass/30 pt-6 gap-2">
                    <span className="text-xs text-ash uppercase tracking-widest">Compound</span>
                    <span className="font-medium text-crimson text-lg md:text-base">{compoundObj?.brand.name} {compoundObj?.model_name}</span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="relative mt-10">
                <textarea
                  className="w-full bg-carbon border border-glass outline-none transition-colors duration-300 ease-luxury text-white text-base p-6 focus:border-crimson min-h-[120px] resize-none peer"
                  placeholder=" "
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <label className="absolute left-6 top-6 text-sm text-ash transition-all duration-300 ease-luxury pointer-events-none uppercase tracking-widest peer-focus:-top-3 peer-focus:text-[10px] peer-focus:bg-obsidian peer-focus:px-2 peer-focus:text-crimson peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm -top-3 text-[10px] bg-obsidian px-2">
                  Special Instructions / Concierge Notes
                </label>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM STICKY ACTION BAR */}
        <div className="fixed bottom-0 lg:absolute lg:bottom-0 left-0 lg:left-auto right-0 w-full bg-obsidian/95 backdrop-blur-xl border-t border-glass p-4 md:p-6 flex justify-between items-center z-50">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className={step === 1 ? "invisible" : ""}
            disabled={isSubmitting}
          >
            Back
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext} disabled={!validateStep()} className="w-full md:w-auto ml-4 md:ml-0">
              Continue
            </Button>
          ) : (
            <Button onClick={handleAuthorize} isLoading={isSubmitting} className="w-full md:w-auto ml-4 md:ml-0 shadow-[0_0_20px_rgba(204,0,0,0.3)]">
              {user ? "Authorize Request" : "Authenticate to Authorize"}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}