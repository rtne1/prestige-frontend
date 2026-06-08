"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  // Close menu on route change
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
          scrolled || menuOpen
            ? "bg-obsidian/90 backdrop-blur-md py-4 md:py-6 border-b border-glass"
            : "bg-transparent py-6 md:py-8"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link href="/" className="font-cinzel text-xl md:text-2xl tracking-[0.2em] font-semibold text-white relative z-[60]">
            PRESTIGE<span className="text-crimson">.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            <Link href="/configurator" className="text-xs font-medium tracking-widest uppercase text-ash hover:text-white transition-colors duration-300">
              Configure
            </Link>
            <Link href="/contact" className="text-xs font-medium tracking-widest uppercase text-ash hover:text-white transition-colors duration-300">
              Concierge
            </Link>
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-10">
                    <Link href="/garage" className="text-xs font-medium tracking-widest uppercase text-white hover:text-crimson transition-colors duration-300">
                      Garage
                    </Link>
                    <Link href="/account" className="text-xs font-medium tracking-widest uppercase text-white hover:text-crimson transition-colors duration-300">
                      Account
                    </Link>
                    <button onClick={logout} className="text-xs font-medium tracking-widest uppercase text-ash hover:text-crimson transition-colors duration-300">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link href="/auth" className="text-xs font-medium tracking-widest uppercase text-white border-b border-crimson pb-1">
                    Client Portal
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button onClick={toggleMenu} className="md:hidden flex flex-col gap-[6px] relative z-[60] p-2 outline-none">
            <span className={`w-8 h-[1px] bg-white transition-all duration-300 origin-center ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`w-8 h-[1px] bg-white transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <div className={`fixed inset-0 bg-obsidian/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col items-center gap-10 w-full px-6">
          <Link href="/configurator" className={`font-cinzel text-4xl text-white tracking-widest text-center transition-all duration-500 delay-100 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>Configure</Link>
          <Link href="/contact" className={`font-cinzel text-4xl text-white tracking-widest text-center transition-all duration-500 delay-150 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>Concierge</Link>
          
          <div className={`w-full max-w-[200px] h-[1px] bg-glass my-2 transition-all duration-500 delay-200 ${menuOpen ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} />
          
          {!isLoading && user ? (
            <>
              <Link href="/garage" className={`font-cinzel text-3xl text-crimson tracking-widest text-center transition-all duration-500 delay-200 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>My Garage</Link>
              <Link href="/account" className={`font-cinzel text-3xl text-white tracking-widest text-center transition-all duration-500 delay-250 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>Account</Link>
              <button onClick={logout} className={`text-xs uppercase tracking-widest text-ash mt-4 transition-all duration-500 delay-300 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>Sign Out</button>
            </>
          ) : (
            <Link href="/auth" className={`w-full max-w-sm bg-white text-obsidian py-5 uppercase tracking-[0.2em] text-sm font-semibold text-center transition-all duration-500 delay-300 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}