"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";

export default function AccountPage() {
  const { user, isLoading, checkAuth } = useAuth();
  const { t, lang } = useLanguage();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || "",
      }));
    }
  }, [user, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/auth/profile", formData);
      await checkAuth(); 
      
      setMessage({ type: "success", text: t("account.success_msg") });
      
      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      }));

      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : err.response?.data?.message || t("account.error_msg");
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="w-10 h-10 border-2 border-glass border-t-crimson rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-white pt-[100px] pb-32 relative overflow-hidden text-start">
      
      {/* Premium Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-crimson/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-[1000px] mx-auto px-6 md:px-12 relative z-10 animate-[fadeInUp_0.5s_ease-out]">
        
        {/* Header */}
        <header className="mb-12 border-b border-white/10 pb-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-carbon to-obsidian border border-white/10 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <svg className="w-6 h-6 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div>
            <h1 className={`font-cinzel text-3xl md:text-4xl text-white mb-2 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              {t("account.title")}
            </h1>
            <p className={`text-ash tracking-widest uppercase text-[10px] md:text-xs ${lang === 'ar' ? 'font-cairo' : ''}`}>
              {t("account.subtitle")}
            </p>
          </div>
        </header>

        {/* Message Alert */}
        {message.text && (
          <div className={`px-6 py-4 rounded-2xl mb-8 text-sm font-medium border shadow-lg backdrop-blur-md transition-all ${
            message.type === "success"
              ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] shadow-[#10B981]/10"
              : "bg-crimson/10 border-crimson/30 text-crimson shadow-crimson/10"
            } ${lang === 'ar' ? 'font-cairo' : ''}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-10">
          
          {/* PERSONAL IDENTIFICATION CARD */}
          <div className="bg-carbon/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-crimson/5 blur-3xl rounded-full pointer-events-none group-hover:bg-crimson/10 transition-colors duration-700"></div>
            
            <h3 className={`font-cinzel text-xl md:text-2xl text-white mb-8 border-b border-white/5 pb-4 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              {t("account.personal_title")}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <Input
                  label={t("account.name_label")}
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                label={t("account.email_label")}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label={t("account.phone_label")}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* SECURITY CREDENTIALS CARD */}
          <div className="bg-carbon/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-crimson/5 blur-3xl rounded-full pointer-events-none group-hover:bg-crimson/10 transition-colors duration-700"></div>
            
            <h3 className={`font-cinzel text-xl md:text-2xl text-white mb-2 border-b border-white/5 pb-4 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
              {t("account.security_title")}
            </h3>
            <p className={`text-[10px] text-ash tracking-widest uppercase mb-8 ${lang === 'ar' ? 'font-cairo' : ''}`}>
              {t("account.security_desc")}
            </p>
            
            <div className="space-y-6">
              <Input
                label={t("account.current_pass")}
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-t border-white/5 pt-8 mt-2">
                <Input
                  label={t("account.new_pass")}
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                />
                <Input
                  label={t("account.confirm_pass")}
                  type="password"
                  name="new_password_confirmation"
                  value={formData.new_password_confirmation}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className={`w-full md:w-auto bg-crimson text-white px-12 py-5 rounded-2xl uppercase tracking-[0.15em] text-xs font-bold hover:bg-white hover:text-obsidian transition-all duration-500 shadow-[0_10px_30px_rgba(204,0,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-3 ${lang === 'ar' ? 'font-cairo tracking-normal font-bold' : ''}`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              )}
              {t("account.save_btn")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}