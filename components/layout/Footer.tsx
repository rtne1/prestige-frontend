import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-glass py-10 bg-obsidian">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link
          href="/"
          className="font-cinzel text-lg tracking-[0.1em] text-white"
        >
          PRESTIGE<span className="text-crimson">.</span>
        </Link>
        <div className="text-xs tracking-widest uppercase text-ash">
          &copy; {new Date().getFullYear()} All Rights Reserved. Excellence in Motion.
        </div>
      </div>
    </footer>
  );
}