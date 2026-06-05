import React from "react";
import { StatusBadge } from "./StatusBadge";

interface RequestCardProps {
  date: string;
  status: string;
  vehicle: string;
  compoundBrand: string;
  compoundModel: string;
  frontSpec: string;
  rearSpec: string;
  notes?: string | null;
}

export function RequestCard({
  date,
  status,
  vehicle,
  compoundBrand,
  compoundModel,
  frontSpec,
  rearSpec,
  notes,
}: RequestCardProps) {
  return (
    <div className="bg-carbon border border-glass p-6 relative transition-all duration-500 hover:-translate-y-1 hover:border-crimson/50 group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs text-ash tracking-widest uppercase block mb-2">
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <h3 className="font-cinzel text-xl text-white">{vehicle}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="border-t border-glass/50 pt-4 mb-4">
        <span className="text-xs text-ash uppercase tracking-widest block mb-1">
          Compound
        </span>
        <p className="text-white font-medium">
          <span className="text-crimson">{compoundBrand}</span> {compoundModel}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-glass/50 pt-4">
        <div>
          <span className="text-[10px] text-ash uppercase tracking-widest block mb-1">
            Front Spec
          </span>
          <p className="text-sm text-white font-light">{frontSpec}</p>
        </div>
        <div>
          <span className="text-[10px] text-ash uppercase tracking-widest block mb-1">
            Rear Spec
          </span>
          <p className="text-sm text-white font-light">{rearSpec}</p>
        </div>
      </div>

      {notes && (
        <div className="mt-4 bg-obsidian p-3 border border-glass/30">
          <span className="text-[10px] text-ash uppercase tracking-widest block mb-1">
            Client Notes
          </span>
          <p className="text-xs text-white/70 italic leading-relaxed">"{notes}"</p>
        </div>
      )}
    </div>
  );
}