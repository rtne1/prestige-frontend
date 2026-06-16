"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t, lang } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.get("/sanctum/csrf-cookie", { baseURL: process.env.NEXT_PUBLIC_BACKEND_URL });
      const response = await api.post("/auth/login", { email, password });
      
      const token = response.data.data.token;
      const user = response.data.data.user;

      // ==========================================
      // SILENT ORDER INTERCEPTOR
      // ==========================================
      const pendingConfig = localStorage.getItem("pending_config");
      if (pendingConfig) {
        try {
          const configData = JSON.parse(pendingConfig);
          
          // Force Axios to use the new token immediately to prevent race conditions
          const headers = { Authorization: `Bearer ${token}` };
          
          // 1. Save Vehicle to Vault
          const vehRes = await api.post("/garage/vehicles", { 
            vehicle_year_id: configData.selectedYear, 
            nickname: null 
          }, { headers });
          
          // 2. Submit the Tire Request
          await api.post("/garage/requests", {
            user_vehicle_id: vehRes.data.data.id,
            compound_id: configData.selectedCompound,
            ...configData.dimensions,
            client_notes: configData.notes
          }, { headers });

          // 3. Clear storage so it doesn't submit twice
          localStorage.removeItem("pending_config");
        } catch (interceptError) {
          console.error("Failed to process pending order during login:", interceptError);
        }
      }
      // ==========================================

      // Finish login (which will auto-redirect them to their garage)
      login(token, user);
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(" ")
        : err.response?.data?.message || "Invalid credentials. Authentication failed.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-[fadeInUp_0.5s_forwards]">
      <div className="mb-12">
        <h1 className={`font-cinzel text-3xl md:text-4xl mb-2 text-white ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
          {t("auth.title")}
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-ash">
          {t("auth.subtitle")}
        </p>
      </div>

      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-sm mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label={t("auth.email_label")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t("auth.pass_label")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="pt-6">
          <Button type="submit" className="w-full shadow-[0_0_20px_rgba(204,0,0,0.2)]" isLoading={isLoading}>
            {t("auth.login_btn")}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-ash">
          {t("auth.no_account")}{" "}
          <Link href="/auth/register" className={`text-white border-b border-crimson pb-0.5 hover:text-crimson transition-colors ${lang === 'ar' ? 'font-cairo font-semibold ms-1' : 'ms-1'}`}>
            {t("auth.create_profile")}
          </Link>
        </p>
      </div>
    </div>
  );
}