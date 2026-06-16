"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VerifyEmailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!params.id || !params.hash) return;

    const verifyIdentity = async () => {
      try {
        // We must pass the expires and signature parameters exactly as Laravel generated them
        const expires = searchParams.get("expires");
        const signature = searchParams.get("signature");

        await api.get(`/auth/verify/${params.id}/${params.hash}?expires=${expires}&signature=${signature}`);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.response?.data?.message || t("auth.verify_failed"));
      }
    };

    verifyIdentity();
  }, [params, searchParams, t]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-[fadeInUp_0.5s_forwards] px-6">
      
      {/* GLOWING AURA */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-[100px] rounded-full pointer-events-none z-0 ${status === 'success' ? 'bg-[#10B981]/10' : status === 'error' ? 'bg-crimson/10' : 'bg-white/5'}`}></div>

      <div className="bg-carbon/60 backdrop-blur-xl border border-white/10 p-10 md:p-16 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-lg w-full relative z-10">
        <h1 className={`font-cinzel text-3xl mb-8 text-white ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>
          {t("auth.verify_title")}
        </h1>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-2 border-white/10 border-t-crimson rounded-full animate-spin"></div>
            <p className={`text-ash tracking-widest uppercase text-xs ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("auth.verifying")}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-8 animate-[fadeInUp_0.4s_ease-out]">
            <div className="w-20 h-20 bg-[#10B981]/10 rounded-full flex items-center justify-center border border-[#10B981]/30 text-[#10B981] shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className={`text-white text-sm md:text-base ${lang === 'ar' ? 'font-cairo' : ''}`}>{t("auth.verify_success")}</p>
            <Link href="/" className={`w-full bg-white text-obsidian px-8 py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-crimson hover:text-white transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] ${lang === 'ar' ? 'font-cairo font-bold' : ''}`}>
              {t("auth.go_home")}
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-8 animate-[fadeInUp_0.4s_ease-out]">
            <div className="w-20 h-20 bg-crimson/10 rounded-full flex items-center justify-center border border-crimson/30 text-crimson shadow-[0_0_30px_rgba(204,0,0,0.2)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <p className={`text-crimson text-sm font-medium ${lang === 'ar' ? 'font-cairo' : ''}`}>{errorMessage}</p>
            <Link href="/auth" className={`w-full bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-white/10 transition-colors ${lang === 'ar' ? 'font-cairo' : ''}`}>
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}