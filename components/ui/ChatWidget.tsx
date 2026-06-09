"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatWidgetProps {
  requestId: number | null;
  onClose: () => void;
}

export function ChatWidget({ requestId, onClose }: ChatWidgetProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { lang, t } = useLanguage();

  // Fetch messages and poll every 3 seconds for "Live" feel
  useEffect(() => {
    if (!requestId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/garage/requests/${requestId}/comments`);
        setComments(res.data.data);
      } catch (e) { console.error(e); }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Live Polling
    return () => clearInterval(interval);
  }, [requestId]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !requestId) return;
    setIsSending(true);
    try {
      const res = await api.post(`/garage/requests/${requestId}/comments`, { comment: newMessage });
      setComments([...comments, res.data.data]);
      setNewMessage("");
    } catch (e) { console.error(e); } finally { setIsSending(false); }
  };

  if (!requestId) return null;

  return (
    <div className={`fixed bottom-6 ${lang === 'ar' ? 'left-6' : 'right-6'} w-[350px] max-w-[calc(100vw-48px)] bg-carbon border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] flex flex-col overflow-hidden animate-[fadeInUp_0.3s_ease-out]`}>
      
      {/* Header */}
      <div className="bg-obsidian border-b border-white/10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <h3 className="font-cinzel text-white text-lg">Prestige Concierge</h3>
        </div>
        <button onClick={onClose} className="text-ash hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Message Area */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] to-transparent">
        {comments.length === 0 && (
          <p className="text-center text-ash text-xs mt-10">Start the conversation with our concierge.</p>
        )}
        {comments.map((msg, idx) => {
          const isAdmin = msg.user.role === 'admin';
          return (
            <div key={idx} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
              <span className="text-[9px] uppercase tracking-widest text-ash mb-1">{isAdmin ? 'VIP Concierge' : 'You'}</span>
              <div className={`p-3 text-sm font-light leading-relaxed max-w-[85%] ${isAdmin ? 'bg-white/5 border border-white/10 text-white rounded-tr-xl rounded-br-xl rounded-bl-xl' : 'bg-crimson/20 border border-crimson/30 text-white rounded-tl-xl rounded-bl-xl rounded-br-xl'}`}>
                {msg.comment}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-obsidian border-t border-white/10 flex gap-2 items-end">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type a message..."
          className="flex-1 bg-carbon border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-crimson transition-colors resize-none max-h-[100px]"
          rows={1}
        />
        <button onClick={sendMessage} disabled={isSending || !newMessage.trim()} className="bg-crimson text-white p-3 rounded-xl disabled:opacity-30 hover:bg-white hover:text-obsidian transition-colors shrink-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
        </button>
      </div>
    </div>
  );
}