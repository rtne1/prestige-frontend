"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function ChatWidget() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"topic" | "chat">("topic");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [guestId, setGuestId] = useState<string>("");
  
  const [comments, setComments] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide the floating bubble on the Contact page!
  const isContactPage = pathname === "/contact";

  useEffect(() => {
    let savedGuestId = localStorage.getItem("prestige_guest_id");
    if (!savedGuestId) {
      savedGuestId = "GUEST-" + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem("prestige_guest_id", savedGuestId);
    }
    setGuestId(savedGuestId);

    const activeSession = localStorage.getItem("prestige_chat_session");
    if (activeSession) {
      setSessionId(parseInt(activeSession));
      setStep("chat");
    }

    // Listener to open chat from anywhere (e.g., Contact Page or Garage)
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    if (!sessionId || !isOpen) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${sessionId}`);
        setComments(res.data.data.messages);
      } catch (e) { console.error(e); }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [sessionId, isOpen]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments, isOpen]);

  const startSession = async (topic: string) => {
    try {
      const res = await api.post("/chat/start", { topic, guest_identifier: guestId });
      setSessionId(res.data.data.id);
      localStorage.setItem("prestige_chat_session", res.data.data.id.toString());
      setStep("chat");
    } catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;
    setIsSending(true);
    try {
      const res = await api.post(`/chat/${sessionId}/message`, { message: newMessage });
      setComments([...comments, res.data.data]);
      setNewMessage("");
    } catch (e) { console.error(e); } finally { setIsSending(false); }
  };

  return (
    <div className={`fixed bottom-6 z-[100] flex flex-col items-end transition-all duration-500 ease-luxury ${lang === 'ar' ? 'left-0' : 'right-0'}`}>
      
      {/* PEeking Floating Toggle Button */}
      {!isContactPage && (
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`w-14 h-14 rounded-full bg-crimson text-white shadow-[0_10px_30px_rgba(204,0,0,0.4)] flex items-center justify-center transition-all duration-500
            ${isOpen 
              ? (lang === 'ar' ? 'translate-x-6 mx-6 opacity-100' : '-translate-x-6 mx-6 opacity-100') 
              : (lang === 'ar' 
                  ? '-translate-x-7 opacity-40 hover:-translate-x-4 hover:opacity-100' 
                  : 'translate-x-7 opacity-40 hover:translate-x-4 hover:opacity-100')
            }
          `}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          )}
        </button>
      )}

      {/* Chat Window */}
      <div className={`absolute bottom-20 ${lang === 'ar' ? 'left-6 origin-bottom-left' : 'right-6 origin-bottom-right'} w-[350px] max-w-[calc(100vw-48px)] bg-carbon border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-300 ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"}`}>
        
        <div className="bg-obsidian border-b border-white/10 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <div>
              <h3 className="font-cinzel text-white text-sm font-semibold">{t("chat.title")}</h3>
              <p className="text-[9px] uppercase tracking-widest text-ash">{t("chat.subtitle")}</p>
            </div>
          </div>
          {isContactPage && (
            <button onClick={() => setIsOpen(false)} className="text-ash hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          )}
        </div>

        <div className="h-[400px] flex flex-col bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] to-transparent relative">
          
          {/* STEP 1: Topic & Guest Logic */}
          {step === "topic" && (
            <div className="p-6 flex flex-col h-full text-start overflow-y-auto">
              <p className="text-sm font-light text-white mb-6 leading-relaxed">{t("chat.welcome")}</p>
              
              {!user && (
                <div className="bg-obsidian/50 p-4 rounded-xl border border-white/5 mb-6 text-center shrink-0">
                  <p className="text-xs text-ash mb-3">{t("chat.auth_prompt")}</p>
                  <Link href="/auth" onClick={() => setIsOpen(false)} className="block w-full bg-white text-carbon py-3 text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-crimson hover:text-white transition-colors">{t("chat.sign_in")}</Link>
                  <div className="flex items-center gap-4 my-4"><div className="flex-1 border-t border-white/10"></div><span className="text-[10px] text-ash uppercase">{t("chat.or")}</span><div className="flex-1 border-t border-white/10"></div></div>
                  <span className="text-[10px] uppercase tracking-widest text-crimson font-semibold">{t("chat.guest_prompt")}</span>
                </div>
              )}

              <div className="space-y-3 mt-2 pb-4 relative z-10">
                <button onClick={() => startSession(t("chat.sales"))} className="w-full text-start p-4 text-sm text-ash hover:text-white border border-white/10 rounded-xl hover:border-crimson hover:bg-crimson/10 transition-colors shadow-sm">{t("chat.sales")}</button>
                <button onClick={() => startSession(t("chat.support"))} className="w-full text-start p-4 text-sm text-ash hover:text-white border border-white/10 rounded-xl hover:border-crimson hover:bg-crimson/10 transition-colors shadow-sm">{t("chat.support")}</button>
                <button onClick={() => startSession(t("chat.order"))} className="w-full text-start p-4 text-sm text-ash hover:text-white border border-white/10 rounded-xl hover:border-crimson hover:bg-crimson/10 transition-colors shadow-sm">{t("chat.order")}</button>
              </div>
            </div>
          )}

          {step === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <p className="text-center text-ash text-[10px] uppercase tracking-widest mt-2 mb-6 border-b border-white/5 pb-4">{t("chat.secure_conn")}</p>
                {comments.length === 0 && <p className="text-center text-ash text-xs mt-10">{t("chat.empty")}</p>}
                
                {comments.map((msg, idx) => {
                  const isAdmin = msg.is_admin === 1;
                  // In RTL, "items-start" puts text on the Right! We use logical props so it flips perfectly.
                  return (
                    <div key={idx} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                      <span className="text-[9px] uppercase tracking-widest text-ash mb-1">{isAdmin ? t("chat.admin") : t("chat.you")}</span>
                      <div className={`p-3 text-sm font-light leading-relaxed max-w-[85%] text-start ${isAdmin ? 'bg-white/5 border border-white/10 text-white rounded-2xl rounded-ts-none' : 'bg-crimson/20 border border-crimson/30 text-white rounded-2xl rounded-te-none'}`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-3 bg-obsidian border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
                  placeholder={t("chat.placeholder")}
                  className="flex-1 bg-carbon border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-crimson transition-colors"
                />
                <button onClick={sendMessage} disabled={isSending || !newMessage.trim()} className="bg-crimson text-white w-10 rounded-xl disabled:opacity-30 flex items-center justify-center hover:bg-white hover:text-obsidian transition-colors shrink-0">
                  <svg className="w-4 h-4 rtl:-scale-x-100" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}