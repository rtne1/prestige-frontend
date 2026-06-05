import React from "react";

interface VehicleCardProps {
  year: number;
  brand: string;
  model: string;
  nickname?: string | null;
}

export function VehicleCard({ year, brand, model, nickname }: VehicleCardProps) {
  return (
    <div className="bg-carbon border border-glass p-6 min-w-[280px] flex-shrink-0 relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:border-glass/30">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-glass to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {nickname && (
        <span className="text-xs text-crimson uppercase tracking-widest font-medium mb-2 block">
          {nickname}
        </span>
      )}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-ash text-sm">{year}</span>
        <h3 className="font-cinzel text-xl text-white">{brand}</h3>
      </div>
      <p className="text-white/90 font-light">{model}</p>
    </div>
  );
}