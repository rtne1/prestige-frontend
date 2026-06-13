"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    document.body.style.overflow = "auto";
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = !menuOpen ? "hidden" : "auto";
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[60] transition-all duration-500 ease-luxury ${
          pathname === '/configurator'
            ? 'bg-transparent py-4 md:py-6 border-none'
            : scrolled || menuOpen
            ? 'bg-obsidian/90 backdrop-blur-md py-4 md:py-6 border-b border-glass'
            : 'bg-transparent py-6 md:py-8 border-none'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center w-full">
          
          {/* LEFT: Logo - Fixed to prevent line breaks on mobile! */}
          <Link href="/" className="font-cinzel text-lg md:text-xl tracking-[0.2em] font-semibold text-white relative z-[60] whitespace-nowrap shrink-0 flex-none">
            MR. TIRES<span className="text-crimson">.</span>
          </Link>

          {/* RIGHT: Lang Toggle, Links, and Hamburger */}
          <div className="flex items-center gap-4 md:gap-10 relative z-[60]">
            
            {/* Language Toggle Button */}
            <button 
              onClick={toggleLanguage} 
              className="text-[10px] md:text-xs font-semibold tracking-widest text-ash hover:text-white transition-colors border border-glass px-2 md:px-3 py-1 rounded-sm shrink-0"
            >
              {lang === "en" ? "العربية" : "EN"}
            </button>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-10">
              <Link href="/configurator" className="text-xs font-medium tracking-widest uppercase text-ash hover:text-white transition-colors duration-300">
                {t("nav.configure")}
              </Link>
              <Link href="/contact" className="text-xs font-medium tracking-widest uppercase text-ash hover:text-white transition-colors duration-300">
                {t("nav.concierge")}
              </Link>
              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-10">
                      <Link href="/garage" className="text-xs font-medium tracking-widest uppercase text-white hover:text-crimson transition-colors duration-300">{t("nav.garage")}</Link>
                      <Link href="/account" className="text-xs font-medium tracking-widest uppercase text-white hover:text-crimson transition-colors duration-300">{t("nav.account")}</Link>
                      <button onClick={logout} className="text-xs font-medium tracking-widest uppercase text-ash hover:text-crimson transition-colors duration-300">{t("nav.sign_out")}</button>
                    </div>
                  ) : (
                    <Link href="/auth" className="text-xs font-medium tracking-widest uppercase text-white border-b border-crimson pb-1">
                      {t("nav.client_portal")}
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button onClick={toggleMenu} className="md:hidden flex flex-col gap-[6px] p-2 outline-none shrink-0">
              <span className={`w-6 h-[1px] bg-white transition-all duration-300 origin-center ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`w-6 h-[1px] bg-white transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
            
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <div className={`fixed inset-0 bg-obsidian/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col items-center gap-10 w-full px-6">
          <Link href="/configurator" className={`font-cinzel text-3xl md:text-4xl text-white tracking-widest text-center transition-all duration-500 delay-100 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.configure")}</Link>
          <Link href="/contact" className={`font-cinzel text-3xl md:text-4xl text-white tracking-widest text-center transition-all duration-500 delay-150 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.concierge")}</Link>
          
          <div className={`w-full max-w-[200px] h-[1px] bg-glass my-2 transition-all duration-500 delay-200 ${menuOpen ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} />
          
          {!isLoading && user ? (
            <>
              <Link href="/garage" className={`font-cinzel text-2xl md:text-3xl text-crimson tracking-widest text-center transition-all duration-500 delay-200 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.garage")}</Link>
              <Link href="/account" className={`font-cinzel text-2xl md:text-3xl text-white tracking-widest text-center transition-all duration-500 delay-250 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.account")}</Link>
              <button onClick={logout} className={`text-xs uppercase tracking-widest text-ash mt-4 transition-all duration-500 delay-300 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.sign_out")}</button>
            </>
          ) : (
            <Link href="/auth" className={`w-full max-w-sm bg-white text-obsidian py-5 uppercase tracking-[0.2em] text-sm font-semibold text-center transition-all duration-500 delay-300 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              {t("nav.client_portal")}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}