import React from "react";
import { cn } from "./Button";

type Status = "pending" | "accepted" | "completed" | "rejected";

interface StatusBadgeProps {
  status: Status | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<string, string> = {
    pending: "text-[#F5A623] bg-[#F5A623]/10 border-[#F5A623]/20",
    accepted: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20",
    completed: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20",
    rejected: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20",
  };

  const normalizedStatus = status.toLowerCase();
  const config = statusConfig[normalizedStatus] || statusConfig.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest border",
        config,
        className
      )}
    >
      {status}
    </span>
  );
}