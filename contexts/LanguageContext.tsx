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

// Magic function to convert HEX to RGB for Tailwind opacity support
const hexToRgb = (hex: string) => {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const num = parseInt(clean, 16);
  return `${(num >> 16) & 255} ${(num >> 8) & 255} ${num & 255}`;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [dbDict, setDbDict] = useState<Record<string, {en: string, ar: string}>>({});

  useEffect(() => {
    const saved = localStorage.getItem("prestige_lang") as Language;
    if (saved) setLang(saved);
    
    // Fetch Overrides
    api.get("/translations").then(res => {
      const formatted: any = {};
      res.data.data.forEach((item: any) => { formatted[item.key] = { en: item.en, ar: item.ar }; });
      setDbDict(formatted);
    }).catch(console.error);

    // ==========================================
    // THEME ENGINE INJECTION
    // ==========================================
    api.get("/theme").then(res => {
      res.data.data.forEach((theme: any) => {
        document.documentElement.style.setProperty(`--color-${theme.key}`, hexToRgb(theme.value));
      });
    }).catch(console.error);

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