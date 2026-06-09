"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [dict, setDict] = useState<Record<string, {en: string, ar: string}>>({});

  useEffect(() => {
    const saved = localStorage.getItem("prestige_lang") as Language;
    if (saved) setLang(saved);
    
    // Fetch live translations from your new CMS
    api.get("/translations").then(res => {
      const formatted: any = {};
      res.data.data.forEach((item: any) => { formatted[item.key] = { en: item.en, ar: item.ar }; });
      setDict(formatted);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    // True RTL Flipping
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

  const t = (key: string) => {
    if (dict[key]) return dict[key][lang];
    return key; // Fallback
  };

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