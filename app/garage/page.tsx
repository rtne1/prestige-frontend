"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { RequestCard } from "@/components/ui/RequestCard";
import { Button } from "@/components/ui/Button";

interface Vehicle { id: number; nickname: string | null; vehicle_year: { year: number; model: { name: string; brand: { name: string; }; }; }; }
interface TireRequest { id: number; created_at: string; status: string; f_width: number; f_profile: number; f_rim: number; r_width: number; r_profile: number; r_rim: number; client_notes: string | null; user_vehicle: Vehicle; compound: { model_name: string; brand: { name: string; }; }; }

export default function GaragePage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<TireRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-24 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-glass pb-8">
        <div>
          <h1 className="font-cinzel text-4xl text-white mb-2">{t("nav.garage")}</h1>
          <p className="text-ash tracking-widest uppercase text-sm">Welcome, {user?.full_name}</p>
        </div>
        <Link href="/configurator">
          <Button variant="prestige">New Configuration</Button>
        </Link>
      </header>

      <section className="mb-20">
        <h2 className="font-cinzel text-2xl text-white mb-8 border-b border-white/5 pb-4">My Vehicles</h2>
        {vehicles.length === 0 ? (
          <div className="bg-carbon border border-glass border-dashed p-12 text-center text-ash font-light">Your garage is currently empty.</div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x hide-scrollbar">
            {vehicles.map((v) => (
              <div key={v.id} className="snap-start">
                <VehicleCard year={v.vehicle_year.year} brand={v.vehicle_year.model.brand.name} model={v.vehicle_year.model.name} nickname={v.nickname} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-cinzel text-2xl text-white mb-8 border-b border-white/5 pb-4">Active Configurations</h2>
        {requests.length === 0 ? (
          <div className="bg-carbon border border-glass border-dashed p-12 text-center text-ash font-light">No active configurations found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((r) => (
              <div key={r.id} className="relative">
                <RequestCard date={r.created_at} status={r.status} vehicle={`${r.user_vehicle.vehicle_year.year} ${r.user_vehicle.vehicle_year.model.brand.name} ${r.user_vehicle.vehicle_year.model.name}`} compoundBrand={r.compound.brand.name} compoundModel={r.compound.model_name} frontSpec={`${r.f_width}/${r.f_profile} R${r.f_rim}`} rearSpec={`${r.r_width}/${r.r_profile} R${r.r_rim}`} />
                
                {/* THE FIX: We tell the button to trigger the new Global Chat! */}
                <button 
                  onClick={() => window.dispatchEvent(new Event("open-chat"))} 
                  className="w-full mt-2 bg-white/5 border border-white/10 hover:bg-white/10 text-ash hover:text-white transition-all py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Contact Concierge
                </button>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}