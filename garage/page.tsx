"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { RequestCard } from "@/components/ui/RequestCard";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: number;
  nickname: string | null;
  vehicle_year: {
    year: number;
    model: {
      name: string;
      brand: {
        name: string;
      };
    };
  };
}

interface TireRequest {
  id: number;
  created_at: string;
  status: string;
  f_width: number;
  f_profile: number;
  f_rim: number;
  r_width: number;
  r_profile: number;
  r_rim: number;
  client_notes: string | null;
  user_vehicle: Vehicle;
  compound: {
    model_name: string;
    brand: {
      name: string;
    };
  };
}

export default function GaragePage() {
  const { user } = useAuth();
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
      } catch (error) {
        console.error("Failed to fetch garage data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGarageData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-glass pb-8">
        <div>
          <h1 className="font-cinzel text-4xl text-white mb-2">My Garage</h1>
          <p className="text-ash tracking-widest uppercase text-sm">
            Welcome, {user?.full_name}
          </p>
        </div>
        <Link href="/configurator">
          <Button variant="prestige">New Configuration</Button>
        </Link>
      </header>

      {/* Vehicles Section */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-cinzel text-2xl text-white">My Vehicles</h2>
        </div>
        
        {vehicles.length === 0 ? (
          <div className="bg-carbon border border-glass border-dashed p-12 text-center">
            <p className="text-ash font-light mb-4">Your garage is currently empty.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x hide-scrollbar">
            {vehicles.map((v) => (
              <div key={v.id} className="snap-start">
                <VehicleCard
                  year={v.vehicle_year.year}
                  brand={v.vehicle_year.model.brand.name}
                  model={v.vehicle_year.model.name}
                  nickname={v.nickname}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Configurations Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-cinzel text-2xl text-white">Active Configurations</h2>
        </div>

        {requests.length === 0 ? (
          <div className="bg-carbon border border-glass border-dashed p-12 text-center">
            <p className="text-ash font-light mb-4">No active configurations found.</p>
            <Link href="/configurator" className="text-crimson uppercase tracking-widest text-xs hover:text-white transition-colors">
              Start Configuration &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                date={r.created_at}
                status={r.status}
                vehicle={`${r.user_vehicle.vehicle_year.year} ${r.user_vehicle.vehicle_year.model.brand.name} ${r.user_vehicle.vehicle_year.model.name}`}
                compoundBrand={r.compound.brand.name}
                compoundModel={r.compound.model_name}
                frontSpec={`${r.f_width}/${r.f_profile} R${r.f_rim}`}
                rearSpec={`${r.r_width}/${r.r_profile} R${r.r_rim}`}
                notes={r.client_notes}
              />
            ))}
          </div>
        )}
      </section>

      {/* VIP Concierge Widget */}
      <div className="mt-24 bg-gradient-to-r from-carbon to-obsidian border border-glass p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 rounded-sm">
        <div>
          <h3 className="font-cinzel text-2xl text-white mb-2">Concierge Support</h3>
          <p className="text-ash font-light">Require modifications to your specification or installation scheduling?</p>
        </div>
        <a 
          href="https://wa.me/1234567890" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button variant="ghost" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-obsidian">
            Priority WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}