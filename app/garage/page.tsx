"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { RequestCard } from "@/components/ui/RequestCard";
import { Button } from "@/components/ui/Button";

// ... (keep your existing Vehicle and TireRequest interfaces)
interface Vehicle { id: number; nickname: string | null; vehicle_year: { year: number; model: { name: string; brand: { name: string; }; }; }; }
interface TireRequest { id: number; created_at: string; status: string; f_width: number; f_profile: number; f_rim: number; r_width: number; r_profile: number; r_rim: number; client_notes: string | null; user_vehicle: Vehicle; compound: { model_name: string; brand: { name: string; }; }; }

export default function GaragePage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NATIVE CHAT STATE ---
  const [chatRequestId, setChatRequestId] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchGarageData = async () => {
      try {
        const [vehiclesRes, requestsRes] = await Promise.all([
          api.get("/garage/vehicles"),
          api.get("/garage/requests"),
        ]);
        setVehicles(vehiclesRes.data.data);
        setRequests(requestsRes.data.data);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchGarageData();
  }, []);

  // --- CHAT LOGIC ---
  const openChat = async (id: number) => {
    setChatRequestId(id);
    document.body.style.overflow = "hidden"; // Lock background
    try {
      const res = await api.get(`/garage/requests/${id}/comments`);
      setComments(res.data.data);
    } catch (e) { console.error(e); }
  };

  const closeChat = () => {
    setChatRequestId(null);
    document.body.style.overflow = "auto";
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRequestId) return;
    setIsSending(true);
    try {
      const res = await api.post(`/garage/requests/${chatRequestId}/comments`, { comment: newMessage });
      setComments([...comments, res.data.data]);
      setNewMessage("");
    } catch (e) { console.error(e); } finally { setIsSending(false); }
  };

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-24 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-glass pb-8">
        <div>
          <h1 className="font-cinzel text-4xl text-white mb-2">{t("nav.garage")}</h1>
          <p className="text-ash tracking-widest uppercase text-sm">Welcome, {user?.full_name}</p>
        </div>
        <Link href="/configurator"><Button variant="prestige">New Configuration</Button></Link>
      </header>

      {/* Vehicles Section */}
      <section className="mb-20">
        <h2 className="font-cinzel text-2xl text-white mb-8 border-b border-white/5 pb-4">My Vehicles</h2>
        {vehicles.length === 0 ? (
          <div className="bg-carbon border border-glass border-dashed p-12 text-center text-ash font-light">Your garage is currently empty.</div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x hide-scrollbar">
            {vehicles.map((v) => (
              <div key={v.id} className="snap-start"><VehicleCard year={v.vehicle_year.year} brand={v.vehicle_year.model.brand.name} model={v.vehicle_year.model.name} nickname={v.nickname} /></div>
            ))}
          </div>
        )}
      </section>

      {/* Configurations Section */}
      <section>
        <h2 className="font-cinzel text-2xl text-white mb-8 border-b border-white/5 pb-4">Active Configurations</h2>
        {requests.length === 0 ? (
          <div className="bg-carbon border border-glass border-dashed p-12 text-center text-ash font-light">No active configurations found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((r) => (
              <div key={r.id} className="relative">
                <RequestCard date={r.created_at} status={r.status} vehicle={`${r.user_vehicle.vehicle_year.year} ${r.user_vehicle.vehicle_year.model.brand.name} ${r.user_vehicle.vehicle_year.model.name}`} compoundBrand={r.compound.brand.name} compoundModel={r.compound.model_name} frontSpec={`${r.f_width}/${r.f_profile} R${r.f_rim}`} rearSpec={`${r.r_width}/${r.r_profile} R${r.r_rim}`} />
                {/* NATIVE CHAT BUTTON */}
                <button onClick={() => openChat(r.id)} className="w-full mt-2 bg-white/5 border border-white/10 hover:bg-white/10 text-ash hover:text-white transition-all py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Concierge Thread
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- SECURE CONCIERGE CHAT PANEL (SLIDE-OVER) --- */}
      {chatRequestId && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={closeChat} />
          
          <div className="w-full md:w-[450px] bg-carbon border-l border-white/10 h-full flex flex-col relative z-10 animate-[slideLeft_0.3s_ease-out]">
            {/* Chat Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-obsidian/50">
              <div>
                <h3 className="font-cinzel text-xl text-white">Concierge Thread</h3>
                <p className="text-[10px] text-ash tracking-widest uppercase mt-1">Order Ref: #{chatRequestId}</p>
              </div>
              <button onClick={closeChat} className="text-ash hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] to-transparent">
              {comments.map((msg, idx) => {
                const isAdmin = msg.user.role === 'admin';
                return (
                  <div key={idx} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                    <span className="text-[9px] uppercase tracking-widest text-ash mb-1">{isAdmin ? 'VIP Concierge' : 'You'}</span>
                    <div className={`p-4 max-w-[85%] text-sm font-light leading-relaxed ${isAdmin ? 'bg-white/5 border border-white/10 text-white rounded-tr-xl rounded-br-xl rounded-bl-xl' : 'bg-crimson/20 border border-crimson/30 text-white rounded-tl-xl rounded-bl-xl rounded-br-xl'}`}>
                      {msg.comment}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-white/10 bg-obsidian/50">
              <div className="relative">
                <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="w-full bg-carbon border border-white/10 p-4 pr-16 text-sm outline-none focus:border-crimson transition-colors resize-none h-[80px]" />
                <button onClick={sendMessage} disabled={isSending || !newMessage.trim()} className="absolute bottom-4 right-4 text-crimson disabled:opacity-30 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}