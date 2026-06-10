"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-obsidian flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden animate-[fadeInUp_0.5s_forwards]">
      
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-carbon via-obsidian to-obsidian opacity-50 pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl w-full text-center">
        <h1 className={`font-cinzel text-4xl md:text-5xl text-white mb-6 ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
          {t("contact.title")}
        </h1>
        <p className="text-ash font-light text-base md:text-lg mb-12 leading-relaxed max-w-2xl mx-auto">
          {t("contact.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* 1. Live Chat Button (Triggers Global Widget) */}
          <div className="bg-carbon border border-glass p-8 hover:border-crimson/50 transition-colors duration-300 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-crimson/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className={`text-white font-cinzel text-xl mb-2 ${lang === 'ar' ? 'font-cairo font-semibold tracking-normal' : ''}`}>{t("contact.chat_title")}</h3>
            <p className="text-ash text-sm mb-6">{t("contact.chat_desc")}</p>
            <Button onClick={() => window.dispatchEvent(new Event("open-chat"))} variant="ghost" className="mt-auto px-6 py-3 text-xs border-crimson text-crimson hover:bg-crimson hover:text-white w-full">
              {t("contact.chat_btn")}
            </Button>
          </div>

          {/* 2. WhatsApp */}
          <div className="bg-carbon border border-glass p-8 hover:border-[#25D366]/50 transition-colors duration-300 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.553 4.195 1.603 6.015L.175 24l6.105-1.597c1.761.954 3.743 1.458 5.751 1.458 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.907c-1.808 0-3.582-.486-5.13-1.405l-.368-.218-3.811.996.996-3.811-.218-.368c-.919-1.548-1.405-3.322-1.405-5.13 0-5.546 4.514-10.06 10.06-10.06 5.546 0 10.06 4.514 10.06 10.06 0 5.546-4.514 10.06-10.06 10.06zm5.522-7.533c-.303-.152-1.794-.886-2.072-.987-.278-.101-.481-.152-.683.152-.202.303-.784.987-.96 1.189-.177.202-.354.227-.657.076-.303-.152-1.281-.473-2.441-1.506-.902-.803-1.509-1.794-1.686-2.097-.177-.303-.019-.467.133-.618.136-.136.303-.354.455-.53.152-.177.202-.303.303-.505.101-.202.051-.38-.025-.531-.076-.152-.683-1.646-.935-2.253-.246-.593-.496-.512-.683-.521-.177-.009-.38-.009-.582-.009-.202 0-.53.076-.808.38-.278.303-1.062 1.037-1.062 2.53s1.087 2.934 1.239 3.136c.152.202 2.137 3.262 5.176 4.571 2.222.956 3.037.91 4.148.758 1.111-.152 2.375-.987 2.704-1.921.329-.935.329-1.744.227-1.921-.102-.177-.38-.278-.684-.43z"/></svg>
            </div>
            <h3 className={`text-white font-cinzel text-xl mb-2 ${lang === 'ar' ? 'font-cairo font-semibold tracking-normal' : ''}`}>{t("contact.wa_title")}</h3>
            <p className="text-ash text-sm mb-6">{t("contact.wa_desc")}</p>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="mt-auto w-full">
              <Button variant="ghost" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-obsidian px-6 py-3 text-xs w-full">
                {t("contact.wa_btn")}
              </Button>
            </a>
          </div>

          {/* 3. Email */}
          <div className="bg-carbon border border-glass p-8 hover:border-white/50 transition-colors duration-300 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            </div>
            <h3 className={`text-white font-cinzel text-xl mb-2 ${lang === 'ar' ? 'font-cairo font-semibold tracking-normal' : ''}`}>{t("contact.email_title")}</h3>
            <p className="text-ash text-sm mb-6">{t("contact.email_desc")}</p>
            <a href="mailto:concierge@iintra.site" className="mt-auto w-full">
              <Button variant="ghost" className="px-6 py-3 text-xs w-full">
                {t("contact.email_btn")}
              </Button>
            </a>
          </div>

        </div>

        <div className="border-t border-glass pt-8 mt-8">
          <p className="text-ash text-xs tracking-widest uppercase">
            {t("contact.hours")}
          </p>
        </div>

      </div>
    </div>
  );
}