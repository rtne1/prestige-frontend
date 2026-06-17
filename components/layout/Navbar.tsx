"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "./CartSidebar";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  
  // USING THE NEW GLOBAL CART STATE
  const { cartTotalItems, isCartOpen, openCart, closeCart } = useCart(); 
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    closeCart();
    document.body.style.overflow = "auto";
  const handleOpenDrawer = () => openCart();
    window.addEventListener('open-cart-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-cart-drawer', handleOpenDrawer);
  }, [pathname, openCart, closeCart]);

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
      <nav className={`fixed top-0 w-full z-[60] transition-all duration-500 ease-luxury ${pathname === '/configurator' ? 'bg-transparent py-4 md:py-6 border-none' : scrolled || menuOpen ? 'bg-obsidian/90 backdrop-blur-md py-4 md:py-6 border-b border-glass' : 'bg-transparent py-6 md:py-8 border-none'}`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center w-full">
          <Link href="/" className="font-cinzel text-lg md:text-xl tracking-[0.2em] font-semibold text-white relative z-[60] whitespace-nowrap shrink-0 flex-none">
            MR. TIRES<span className="text-crimson">.</span>
          </Link>

          <div className="flex items-center gap-4 md:gap-8 relative z-[60]">
            <button onClick={toggleLanguage} className="text-[10px] md:text-xs font-semibold tracking-widest text-ash hover:text-white transition-colors border border-glass px-3 py-1.5 rounded-md shrink-0 bg-white/[0.02] backdrop-blur-sm">
              {lang === "en" ? "العربية" : "EN"}
            </button>

            {/* OPEN CART BUTTON */}
            <button onClick={openCart} className="relative text-ash hover:text-white transition-colors p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartTotalItems > 0 && (
                <span className="absolute top-0 right-0 bg-crimson text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartTotalItems}
                </span>
              )}
            </button>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/configurator" className={`group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-crimson to-crimson/80 text-white text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase rounded-full shadow-[0_0_20px_rgba(204,0,0,0.3)] hover:shadow-[0_0_30px_rgba(204,0,0,0.6)] hover:scale-105 transition-all duration-300 ${lang === 'ar' ? 'font-cairo tracking-normal' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                {t("home.vip_title")}
              </Link>
              <Link href="/contact" className="text-xs font-medium tracking-widest uppercase text-ash hover:text-white transition-colors duration-300">{t("nav.concierge")}</Link>
              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-8 border-l border-white/10 pl-8 ml-2">
                      <Link href="/garage" className="text-xs font-medium tracking-widest uppercase text-white hover:text-crimson transition-colors duration-300">{t("nav.garage")}</Link>
                      <Link href="/account" className="text-xs font-medium tracking-widest uppercase text-white hover:text-crimson transition-colors duration-300">{t("nav.account")}</Link>
                      <button onClick={logout} className="text-xs font-medium tracking-widest uppercase text-ash hover:text-crimson transition-colors duration-300">{t("nav.sign_out")}</button>
                    </div>
                  ) : (
                    <Link href="/auth" className="text-xs font-medium tracking-widest uppercase text-white border-b border-crimson pb-1 ml-4 hover:text-crimson transition-colors">{t("nav.client_portal")}</Link>
                  )}
                </>
              )}
            </div>

            <button onClick={toggleMenu} className="md:hidden flex flex-col gap-[6px] p-2 outline-none shrink-0">
              <span className={`w-6 h-[1px] bg-white transition-all duration-300 origin-center ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`w-6 h-[1px] bg-white transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* RENDER THE SIDEBAR COMPONENT USING CONTEXT STATE */}
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />

      <div className={`fixed inset-0 bg-obsidian/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col items-center gap-8 w-full px-6">
          <Link href="/configurator" onClick={toggleMenu} className={`relative flex flex-col items-center justify-center w-full max-w-xs bg-gradient-to-r from-carbon to-obsidian border border-crimson/50 text-white py-6 px-4 rounded-[2rem] shadow-[0_10px_40px_rgba(204,0,0,0.2)] transition-all duration-500 delay-100 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-crimson/10 blur-[40px] rounded-full pointer-events-none"></div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-crimson mb-2 font-bold z-10">Premium Experience</span>
            <span className={`font-cinzel text-xl md:text-2xl text-center z-10 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : 'tracking-widest'}`}>{t("home.vip_title")}</span>
          </Link>
          <Link href="/contact" className={`font-cinzel text-2xl md:text-3xl text-white tracking-widest text-center mt-4 transition-all duration-500 delay-150 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.concierge")}</Link>
          <div className={`w-full max-w-[150px] h-[1px] bg-glass my-4 transition-all duration-500 delay-200 ${menuOpen ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} />
          {!isLoading && user ? (
            <>
              <Link href="/garage" className={`font-cinzel text-2xl md:text-3xl text-crimson tracking-widest text-center transition-all duration-500 delay-200 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.garage")}</Link>
              <Link href="/account" className={`font-cinzel text-xl md:text-2xl text-white tracking-widest text-center transition-all duration-500 delay-250 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.account")}</Link>
              <button onClick={() => { logout(); toggleMenu(); }} className={`text-[10px] uppercase tracking-widest text-ash mt-4 transition-all duration-500 delay-300 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.sign_out")}</button>
            </>
          ) : (
            <Link href="/auth" onClick={toggleMenu} className={`w-full max-w-xs bg-white text-obsidian py-4 rounded-xl uppercase tracking-[0.2em] text-xs font-bold text-center transition-all duration-500 delay-300 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>{t("nav.client_portal")}</Link>
          )}
        </div>
      </div>
    </>
  );
}