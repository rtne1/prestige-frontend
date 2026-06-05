import React from "react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-6rem)] bg-obsidian flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden animate-[fadeInUp_0.5s_forwards]">
      
      {/* Background styling */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-carbon via-obsidian to-obsidian opacity-50 pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl w-full text-center">
        <h1 className="font-cinzel text-4xl md:text-5xl text-white mb-6">
          VIP Concierge
        </h1>
        <p className="text-ash font-light text-lg mb-12 leading-relaxed">
          Our specialists are available to assist with bespoke homologation queries, installation scheduling, and comprehensive automotive portfolio management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* WhatsApp Card */}
          <div className="bg-carbon border border-glass p-8 hover:border-[#25D366]/50 transition-colors duration-300 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.553 4.195 1.603 6.015L.175 24l6.105-1.597c1.761.954 3.743 1.458 5.751 1.458 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.907c-1.808 0-3.582-.486-5.13-1.405l-.368-.218-3.811.996.996-3.811-.218-.368c-.919-1.548-1.405-3.322-1.405-5.13 0-5.546 4.514-10.06 10.06-10.06 5.546 0 10.06 4.514 10.06 10.06 0 5.546-4.514 10.06-10.06 10.06zm5.522-7.533c-.303-.152-1.794-.886-2.072-.987-.278-.101-.481-.152-.683.152-.202.303-.784.987-.96 1.189-.177.202-.354.227-.657.076-.303-.152-1.281-.473-2.441-1.506-.902-.803-1.509-1.794-1.686-2.097-.177-.303-.019-.467.133-.618.136-.136.303-.354.455-.53.152-.177.202-.303.303-.505.101-.202.051-.38-.025-.531-.076-.152-.683-1.646-.935-2.253-.246-.593-.496-.512-.683-.521-.177-.009-.38-.009-.582-.009-.202 0-.53.076-.808.38-.278.303-1.062 1.037-1.062 2.53s1.087 2.934 1.239 3.136c.152.202 2.137 3.262 5.176 4.571 2.222.956 3.037.91 4.148.758 1.111-.152 2.375-.987 2.704-1.921.329-.935.329-1.744.227-1.921-.102-.177-.38-.278-.684-.43z"/>
              </svg>
            </div>
            <h3 className="text-white font-cinzel text-xl mb-2">Priority Chat</h3>
            <p className="text-ash text-sm mb-6">Instant response via WhatsApp</p>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="mt-auto">
              <Button variant="ghost" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-obsidian px-6 py-3 text-xs">
                Initiate Chat
              </Button>
            </a>
          </div>

          {/* Email Card */}
          <div className="bg-carbon border border-glass p-8 hover:border-white/50 transition-colors duration-300 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="text-white font-cinzel text-xl mb-2">Direct Inquiry</h3>
            <p className="text-ash text-sm mb-6">Formal requests and documentation</p>
            <a href="mailto:concierge@prestigeauto.com" className="mt-auto">
              <Button variant="ghost" className="px-6 py-3 text-xs">
                Compose Email
              </Button>
            </a>
          </div>

        </div>

        <div className="border-t border-glass pt-8 mt-8">
          <p className="text-ash text-xs tracking-widest uppercase">
            Operating Hours: Monday – Saturday, 09:00 – 19:00 (GMT)
          </p>
        </div>

      </div>
    </div>
  );
}