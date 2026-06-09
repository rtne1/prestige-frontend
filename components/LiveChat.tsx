"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LiveChat() {
  const { lang } = useLanguage();

  useEffect(() => {
    // 1. Initialize Crisp securely for Next.js
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = "b8bbbfea-0658-4d81-a98a-0f780a5b1f14"; // <--- PASTE YOUR ID HERE

    // 2. Inject the script
    (function () {
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
  }, []);

  useEffect(() => {
    // 3. Automatically flip chat layout to RTL for Arabic!
    if ((window as any).$crisp) {
      if (lang === "ar") {
        (window as any).$crisp.push(["set", "session:data", [[["rtl", true]]]]);
      } else {
        (window as any).$crisp.push(["set", "session:data", [[["rtl", false]]]]);
      }
    }
  }, [lang]);

  return null; // This component is invisible, it just runs the chat engine
}