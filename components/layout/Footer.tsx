import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-glass py-12 bg-obsidian z-10 relative">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="font-cinzel text-xl tracking-[0.2em] text-white">
          PRESTIGE<span className="text-crimson">.</span>
        </Link>
        <div className="text-[10px] md:text-xs tracking-widest uppercase text-ash text-center md:text-start leading-relaxed">
          &copy; {new Date().getFullYear()} Prestige Auto Care. Excellence in Motion.<br className="md:hidden" />
          <span className="block mt-2 md:inline md:mt-0 md:ms-2">Commercial Registration KSA.</span>
        </div>
      </div>
    </footer>
  );
}