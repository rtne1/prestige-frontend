"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

// --- Types ---
interface Brand { id: number; name: string; media_id: number | null; }
interface Model { id: number; name: string; }
interface Year { id: number; year: number; }
interface OemSpec { f_width: number; f_profile: number; f_rim: number; r_width: number; r_profile: number; r_rim: number; }
interface Compound { id: number; model_name: string; specs: any; brand: { name: string; media_id: number | null }; }

const STEPS = ["Vehicle Specification", "Dimensions", "Compound", "Review & Authorize"];

export default function ConfiguratorPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // --- UI State ---
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- Data State ---
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
    
    // Check for pending config from pre-auth
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

  const handleNext = () => {
    if (validateStep() && step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitConfiguration = async (configData: any) => {
    setIsSubmitting(true);
    try {
      // 1. Add vehicle to garage
      const vehRes = await api.post("/garage/vehicles", {
        vehicle_year_id: configData.selectedYear,
        nickname: null
      });
      const vehicleId = vehRes.data.data.id;

      // 2. Submit request
      await api.post("/garage/requests", {
        user_vehicle_id: vehicleId,
        compound_id: configData.selectedCompound,
        ...configData.dimensions,
        client_notes: configData.notes || null
      });

      router.push("/garage");
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit request. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleAuthorize = () => {
    const configData = { selectedYear, selectedCompound, dimensions, notes };
    
    if (!user) {
      localStorage.setItem("pending_config", JSON.stringify(configData));
      router.push("/auth");
    } else {
      submitConfiguration(configData);
    }
  };

  // --- Helper variables for Summary ---
  const brandObj = brands.find(b => b.id === Number(selectedBrand));
  const modelObj = models.find(m => m.id === Number(selectedModel));
  const yearObj = years.find(y => y.id === Number(selectedYear));
  const compoundObj = compounds.find(c => c.id === Number(selectedCompound));

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] relative bg-obsidian">
      
      {/* Left Panel (Fixed Progress Tracker) */}
      <div className="w-full lg:w-[40%] bg-carbon border-r border-glass p-8 lg:p-16 flex flex-col relative z-10">
        <div className="mb-16 hidden lg:block">
          <h1 className="font-cinzel text-3xl tracking-[0.15em] font-semibold text-white">THE STUDIO<span className="text-crimson">.</span></h1>
        </div>
        
        <h2 className="font-cinzel text-4xl text-white mb-12">
          {step.toString().padStart(2, '0')}. <br/>
          <span className="text-ash">{STEPS[step - 1]}</span>
        </h2>

        <div className="flex flex-row lg:flex-col gap-4 mt-auto overflow-x-auto hide-scrollbar pb-4 lg:pb-0">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${step === i + 1 ? "opacity-100" : "opacity-30"}`}>
              <div className={`w-8 h-[2px] ${step === i + 1 ? "bg-crimson" : "bg-white"}`} />
              <span className="text-xs uppercase tracking-widest whitespace-nowrap">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel (Interactive Content) */}
      <div className="w-full lg:w-[60%] flex flex-col relative overflow-y-auto pb-32">
        <div className="flex-grow p-8 lg:p-16 max-w-3xl w-full mx-auto">
          
          {/* STEP 1: VEHICLE */}
          {step === 1 && (
            <div className="animate-[fadeInUp_0.4s_forwards]">
              <p className="text-ash font-light mb-10 leading-relaxed">
                Select your exact manufacturer designation. This ensures precision homologation matching for your chassis.
              </p>
              
              <Select
                label="Manufacturer"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(Number(e.target.value))}
                options={brands.map(b => ({ value: b.id, label: b.name }))}
              />
              
              <Select
                label="Model Designation"
                value={selectedModel}
                onChange={(e) => setSelectedModel(Number(e.target.value))}
                options={models.map(m => ({ value: m.id, label: m.name }))}
                disabled={!selectedBrand}
              />
              
              <Select
                label="Production Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                options={years.map(y => ({ value: y.id, label: y.year.toString() }))}
                disabled={!selectedModel}
              />
            </div>
          )}

          {/* STEP 2: DIMENSIONS */}
          {step === 2 && (
            <div className="animate-[fadeInUp_0.4s_forwards]">
              {oemSpec && (
                <div className="mb-10 p-6 border border-glass bg-carbon/50">
                  <h4 className="text-xs text-crimson uppercase tracking-widest mb-4">OEM Recommended Fitment</h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className="text-[10px] text-ash uppercase tracking-widest block mb-1">Front Axle</span>
                      <p className="text-xl font-light">{oemSpec.f_width} / {oemSpec.f_profile} R{oemSpec.f_rim}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-ash uppercase tracking-widest block mb-1">Rear Axle</span>
                      <p className="text-xl font-light">{oemSpec.r_width} / {oemSpec.r_profile} R{oemSpec.r_rim}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => {
                    setIsCustomSpec(!isCustomSpec);
                    if (!isCustomSpec) setDimensions({ f_width: 0, f_profile: 0, f_rim: 0, r_width: 0, r_profile: 0, r_rim: 0 });
                    else if (oemSpec) setDimensions(oemSpec);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isCustomSpec ? "bg-crimson" : "bg-glass"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isCustomSpec ? "translate-x-7" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-ash uppercase tracking-widest">Specify Custom Aftermarket Fitment</span>
              </div>

              {isCustomSpec && (
                <div className="space-y-8 animate-[fadeInUp_0.3s_forwards]">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3"><span className="text-xs text-ash uppercase tracking-widest">Front Dimensions</span></div>
                    <Input label="Width" type="number" value={dimensions.f_width || ""} onChange={(e) => handleDimensionChange('f_width', e.target.value)} required />
                    <Input label="Profile" type="number" value={dimensions.f_profile || ""} onChange={(e) => handleDimensionChange('f_profile', e.target.value)} required />
                    <Input label="Rim (in)" type="number" value={dimensions.f_rim || ""} onChange={(e) => handleDimensionChange('f_rim', e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-glass pt-8">
                    <div className="col-span-3"><span className="text-xs text-ash uppercase tracking-widest">Rear Dimensions</span></div>
                    <Input label="Width" type="number" value={dimensions.r_width || ""} onChange={(e) => handleDimensionChange('r_width', e.target.value)} required />
                    <Input label="Profile" type="number" value={dimensions.r_profile || ""} onChange={(e) => handleDimensionChange('r_profile', e.target.value)} required />
                    <Input label="Rim (in)" type="number" value={dimensions.r_rim || ""} onChange={(e) => handleDimensionChange('r_rim', e.target.value)} required />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: COMPOUND */}
          {step === 3 && (
            <div className="animate-[fadeInUp_0.4s_forwards]">
              <p className="text-ash font-light mb-8 leading-relaxed">
                Select the engineered compound approved for {brandObj?.name}.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {compounds.map(compound => (
                  <div 
                    key={compound.id}
                    onClick={() => setSelectedCompound(compound.id)}
                    className={`bg-carbon border p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 relative group ${selectedCompound === compound.id ? "border-crimson" : "border-glass hover:border-glass/50"}`}
                  >
                    {selectedCompound === compound.id && (
                      <div className="absolute top-4 right-4 text-crimson">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                    <span className="text-xs text-ash uppercase tracking-widest block mb-1">{compound.brand.name}</span>
                    <h3 className="font-cinzel text-xl text-white mb-4">{compound.model_name}</h3>
                    {compound.specs && (
                      <div className="flex flex-wrap gap-2">
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

          {/* STEP 4: SUMMARY */}
          {step === 4 && (
            <div className="animate-[fadeInUp_0.4s_forwards]">
              <div className="bg-carbon border border-glass p-8 mb-8">
                <h3 className="font-cinzel text-2xl mb-6 border-b border-glass pb-4">Specification Review</h3>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ash uppercase tracking-widest">Vehicle</span>
                    <span className="font-medium text-right">{yearObj?.year} {brandObj?.name} {modelObj?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-glass/30 pt-6">
                    <span className="text-xs text-ash uppercase tracking-widest">Front Axle</span>
                    <span className="font-light text-right">{dimensions.f_width}/{dimensions.f_profile} R{dimensions.f_rim}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-glass/30 pt-6">
                    <span className="text-xs text-ash uppercase tracking-widest">Rear Axle</span>
                    <span className="font-light text-right">{dimensions.r_width}/{dimensions.r_profile} R{dimensions.r_rim}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-glass/30 pt-6">
                    <span className="text-xs text-ash uppercase tracking-widest">Compound</span>
                    <span className="font-medium text-crimson text-right">{compoundObj?.brand.name} {compoundObj?.model_name}</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <textarea
                  className="w-full bg-transparent border-b border-[#333] outline-none transition-colors duration-300 ease-luxury text-white text-base px-0 py-4 focus:border-crimson min-h-[100px] resize-none peer"
                  placeholder=" "
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <label className="absolute left-0 top-4 text-sm text-ash transition-all duration-300 ease-luxury pointer-events-none uppercase tracking-widest peer-focus:-top-3 peer-focus:text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm -top-3 text-xs">
                  Special Instructions / Concierge Notes
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 lg:absolute lg:bottom-0 left-0 lg:left-auto right-0 w-full bg-obsidian/90 backdrop-blur-md border-t border-glass p-6 px-8 lg:px-16 flex justify-between items-center z-50">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className={step === 1 ? "invisible" : ""}
            disabled={isSubmitting}
          >
            Back
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext} disabled={!validateStep()}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleAuthorize} isLoading={isSubmitting}>
              {user ? "Authorize Request" : "Authenticate to Authorize"}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}