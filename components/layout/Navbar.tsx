"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-luxury ${
        scrolled
          ? "bg-obsidian/95 backdrop-blur-md py-4 border-b border-glass"
          : "bg-transparent py-8"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link
          href="/"
          className="font-cinzel text-2xl tracking-[0.15em] font-semibold text-white"
        >
          PRESTIGE<span className="text-crimson">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link
            href="/configurator"
            className="text-sm font-medium tracking-widest uppercase text-ash hover:text-white transition-colors duration-300"
          >
            Configure
          </Link>

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-10">
                  <Link
                    href="/garage"
                    className="text-sm font-medium tracking-widest uppercase text-white hover:text-crimson transition-colors duration-300"
                  >
                    My Garage
                  </Link>
                  <Link
                    href="/account"
                    className="text-sm font-medium tracking-widest uppercase text-white hover:text-crimson transition-colors duration-300"
                  >
                    Account
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium tracking-widest uppercase text-ash hover:text-crimson transition-colors duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="text-sm font-medium tracking-widest uppercase text-white border-b border-crimson pb-1"
                >
                  Client Portal
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}