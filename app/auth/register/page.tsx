"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t, lang } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError(t("register.pass_mismatch"));
      setIsLoading(false);
      return;
    }

    try {
      await api.get("/sanctum/csrf-cookie", { baseURL: process.env.NEXT_PUBLIC_BACKEND_URL });
      const response = await api.post("/auth/register", formData);
      login(response.data.data.token, response.data.data.user);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(" ")
        : err.response?.data?.message || "Registration failed.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-[fadeInUp_0.5s_forwards]">
      <div className="mb-10">
        <h1 className={`font-cinzel text-3xl md:text-4xl mb-2 text-white ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
          {t("register.title")}
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-ash">
          {t("register.subtitle")}
        </p>
      </div>

      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-sm mb-6 text-xs md:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <Input label={t("register.name_label")} name="full_name" value={formData.full_name} onChange={handleChange} required />
        <Input label={t("register.email_label")} type="email" name="email" value={formData.email} onChange={handleChange} required />
        <Input label={t("register.phone_label")} type="tel" name="phone" value={formData.phone} onChange={handleChange} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t("register.pass_label")} type="password" name="password" value={formData.password} onChange={handleChange} required />
          <Input label={t("register.confirm_pass_label")} type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required />
        </div>
        
        <div className="pt-4">
          <Button type="submit" className="w-full shadow-[0_0_20px_rgba(204,0,0,0.2)]" isLoading={isLoading}>
            {t("register.register_btn")}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-ash">
          {t("register.has_account")}{" "}
          <Link href="/auth" className={`text-white border-b border-crimson pb-0.5 hover:text-crimson transition-colors ${lang === 'ar' ? 'font-cairo font-semibold ms-1' : 'ms-1'}`}>
            {t("register.login_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}