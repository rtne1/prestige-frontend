"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function GarageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin" />
      </div>
    );
  }

  return <div className="animate-[fadeInUp_0.5s_forwards]">{children}</div>;
}