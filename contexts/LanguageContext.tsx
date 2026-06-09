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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [dbDict, setDbDict] = useState<Record<string, {en: string, ar: string}>>({});

  useEffect(() => {
    const saved = localStorage.getItem("prestige_lang") as Language;
    if (saved) setLang(saved);
    
    // Fetch overrides from the dashboard
    api.get("/translations").then(res => {
      const formatted: any = {};
      res.data.data.forEach((item: any) => { formatted[item.key] = { en: item.en, ar: item.ar }; });
      setDbDict(formatted);
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
    // 1. Check if you customized it in the Dashboard
    if (dbDict[path] && dbDict[path][lang]) {
      return dbDict[path][lang];
    }

    // 2. Otherwise, automatically pull from the local JSON files
    const keys = path.split(".");
    let value: any = localDictionaries[lang];
    for (const key of keys) {
      if (value && value[key]) {
        value = value[key];
      } else {
        return path; // Fallback so it never breaks
      }
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