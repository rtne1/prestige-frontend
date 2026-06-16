import React from "react";

interface VehicleCardProps {
  year: number;
  brand: string;
  model: string;
  nickname?: string | null;
  onClick?: () => void;
}

export function VehicleCard({ year, brand, model, nickname, onClick }: VehicleCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-carbon border border-white/10 p-6 min-w-[280px] rounded-2xl flex-shrink-0 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_10px_30px_rgba(204,0,0,0.15)] hover:border-crimson/50 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-crimson/0 blur-2xl rounded-full transition-colors duration-500 group-hover:bg-crimson/20 z-0"></div>
      
      <div className="relative z-10">
        {nickname && (
          <span className="text-[10px] text-crimson uppercase tracking-widest font-bold mb-2 block">
            {nickname}
          </span>
        )}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-ash text-sm font-medium">{year}</span>
          <h3 className="font-cinzel text-xl text-white drop-shadow-sm">{brand}</h3>
        </div>
        <p className="text-white/80 font-light tracking-wide">{model}</p>

        {onClick && (
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 opacity-70 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] uppercase tracking-widest text-ash group-hover:text-white transition-colors">Order Tires</span>
            <svg className="w-4 h-4 text-ash group-hover:text-crimson transition-transform group-hover:translate-x-1 rtl:-scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </div>
        )}
      </div>
    </div>
  );
}