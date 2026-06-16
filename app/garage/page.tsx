"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { RequestCard } from "@/components/ui/RequestCard";
import { Button } from "@/components/ui/Button";

interface Vehicle { id: number; nickname: string | null; vehicle_year: { id: number; year: number; model: { id: number; name: string; brand: { id: number; name: string; }; }; }; }
interface TireRequest { id: number; created_at: string; status: string; f_width: number; f_profile: number; f_rim: number; r_width: number; r_profile: number; r_rim: number; client_notes: string | null; user_vehicle: Vehicle; compound: { model_name: string; brand: { name: string; }; }; }

export default function GaragePage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const router = useRouter();
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

  const handleOrderForVehicle = (v: Vehicle) => {
    // Pass the IDs to the configurator so it can auto-select them!
    const params = new URLSearchParams({
      auto_brand: v.vehicle_year.model.brand.id.toString(),
      auto_model: v.vehicle_year.model.id.toString(),
      auto_year: v.vehicle_year.id.toString()
    });
    router.push(`/configurator?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-32 relative text-start">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8 animate-[fadeInUp_0.4s_ease-out]">
        <div>
          <h1 className={`font-cinzel text-4xl text-white mb-2 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{t("nav.garage")}</h1>
          <p className={`text-ash tracking-[0.2em] uppercase text-xs ${lang === 'ar' ? 'font-cairo tracking-normal' : ''}`}>{t("garage.welcome")}, {user?.full_name}</p>
        </div>
        <Link href="/configurator">
          <Button variant="prestige" className={`${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>{t("garage.new_config")}</Button>
        </Link>
      </header>

      <section className="mb-20 animate-[fadeInUp_0.6s_ease-out]">
        <h2 className={`font-cinzel text-2xl text-white mb-8 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{t("garage.my_vehicles")}</h2>
        {vehicles.length === 0 ? (
          <div className={`bg-carbon border border-white/10 rounded-3xl p-12 text-center text-ash font-light ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("garage.empty_garage")}</div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar">
            {vehicles.map((v) => (
              <div key={v.id} className="snap-start">
                <VehicleCard 
                  year={v.vehicle_year.year} 
                  brand={v.vehicle_year.model.brand.name} 
                  model={v.vehicle_year.model.name} 
                  nickname={v.nickname} 
                  onClick={() => handleOrderForVehicle(v)} // THE FAST-TRACK TRIGGER
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="animate-[fadeInUp_0.8s_ease-out]">
        <h2 className={`font-cinzel text-2xl text-white mb-8 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{t("garage.active_configs")}</h2>
        {requests.length === 0 ? (
          <div className={`bg-carbon border border-white/10 rounded-3xl p-12 text-center text-ash font-light ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("garage.no_active")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((r) => (
              <div key={r.id} className="relative group">
                <RequestCard 
                  date={r.created_at} 
                  status={r.status} 
                  vehicle={`${r.user_vehicle.vehicle_year.year} ${r.user_vehicle.vehicle_year.model.brand.name} ${r.user_vehicle.vehicle_year.model.name}`} 
                  compoundBrand={r.compound.brand.name} 
                  compoundModel={r.compound.model_name} 
                  frontSpec={`${r.f_width}/${r.f_profile} R${r.f_rim}`} 
                  rearSpec={`${r.r_width}/${r.r_profile} R${r.r_rim}`} 
                />
                <button 
                  onClick={() => window.dispatchEvent(new Event("open-chat"))} 
                  className={`w-full mt-2 bg-obsidian border border-white/10 rounded-xl hover:border-crimson/50 hover:bg-crimson/10 text-ash hover:text-white transition-all py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-2 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  {t("garage.contact_concierge")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}