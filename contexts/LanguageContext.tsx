"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

type Language = "en" | "ar";
const localDictionaries: Record<Language, any> = { en, ar };

interface LanguageContextType {
  lang: Language;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const hexToRgb = (hex: string) => {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const num = parseInt(clean, 16);
  return `${(num >> 16) & 255} ${(num >> 8) & 255} ${num & 255}`;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [dbDict, setDbDict] = useState<Record<string, {en: string, ar: string}>>({});
  
  // NEW: Maintenance Mode State
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem("prestige_lang") as Language;
    if (saved) setLang(saved);
    
    // Fetch Translations
    api.get("/translations").then(res => {
      const formatted: any = {};
      res.data.data.forEach((item: any) => { formatted[item.key] = { en: item.en, ar: item.ar }; });
      setDbDict(formatted);
    }).catch(console.error);

    // Fetch Theme & Maintenance Status
    api.get(`/theme?fresh=${new Date().getTime()}`).then(res => {
      res.data.data.forEach((theme: any) => {
        if (theme.key === 'maintenance_mode') {
          setIsMaintenanceMode(theme.value === 'true');
        } else {
          document.documentElement.style.setProperty(`--color-${theme.key}`, hexToRgb(theme.value));
        }
      });
      setIsChecking(false);
    }).catch(err => {
      console.error("Failed to load theme:", err);
      setIsChecking(false);
    });

  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    
    if (lang === "ar") {
      document.body.classList.add("font-janna");
      document.body.classList.remove("font-inter");
    } else {
      document.body.classList.add("font-inter");
      document.body.classList.remove("font-janna");
    }
  }, [lang]);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "ar" : "en";
    setLang(newLang);
    localStorage.setItem("prestige_lang", newLang);
  };

  const t = (path: string) => {
    if (dbDict[path] && dbDict[path][lang]) return dbDict[path][lang];
    const keys = path.split(".");
    let value: any = localDictionaries[lang];
    for (const key of keys) {
      if (value && value[key]) value = value[key];
      else return path;
    }
    return value;
  };

  // ==========================================
  // THE LUXURY MAINTENANCE SCREEN
  // ==========================================
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-obsidian z-[9999] flex items-center justify-center">
         <div className="w-10 h-10 border-2 border-white/10 border-t-crimson rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isMaintenanceMode) {
    return (
      <div className="fixed inset-0 bg-obsidian z-[9999] flex flex-col items-center justify-center text-white overflow-hidden text-center px-6 selection:bg-crimson">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-crimson/5 blur-[120px] rounded-full pointer-events-none z-0 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
          <div className="w-20 h-20 border border-white/10 bg-carbon rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(204,0,0,0.2)]">
            <svg className="w-8 h-8 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          
          <h1 className="font-cinzel text-3xl md:text-5xl mb-4 tracking-widest uppercase">System Upgrade</h1>
          <p className="text-ash font-light text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto">
            Mr. Tires is currently undergoing scheduled maintenance to enhance our platform's performance and concierge capabilities.
          </p>
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-10"></div>
          
          <div className="flex flex-col items-center gap-3">
             <span className="text-[10px] uppercase tracking-[0.3em] text-ash/50">Expected Return</span>
             <span className="font-cinzel text-xl text-white tracking-widest">Shortly</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};