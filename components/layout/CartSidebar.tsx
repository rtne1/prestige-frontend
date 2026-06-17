"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const WHATSAPP_NUMBER = "966568890653";

  const handleWhatsApp = async () => {
    // 1. Silent Sync to Database if Logged In!
    if (user) {
      try {
        setIsSubmitting(true);
        for (const item of cart) {
          let vehId = null;
          if (item.vehicle) {
            const vehRes = await api.post("/garage/vehicles", { vehicle_year_id: item.vehicle.id, nickname: null });
            vehId = vehRes.data.data.id;
          }
          let combinedNotes = `[Checkout: WhatsApp]\n[Qty: ${item.qtyLabel}]`;
          if (item.oemMark) combinedNotes += `\n[OEM: ${item.oemMark}]`;
          if (item.notes) combinedNotes += `\n\n${item.notes}`;

          await api.post("/garage/requests", {
            user_vehicle_id: vehId,
            compound_id: item.compound.id,
            ...item.vehicle?.oemSpec,
            client_notes: combinedNotes
          });
        }
      } catch (e) {
        console.error("Silent Sync Failed", e);
      } finally {
        setIsSubmitting(false);
      }
    }

    // 2. Format and open WhatsApp
    let text = `${t("configurator.wa_greeting") || "Hello Mr. Tires, I would like to order the following items:"}\n\n`;
    cart.forEach((item, index) => {
      text += `*--- Item ${index + 1} ---*\n`;
      if (item.vehicle) text += `*Vehicle:* ${item.vehicle.year} ${item.vehicle.model.brand.name} ${item.vehicle.model.name}\n`;
      text += `*Tire:* ${item.compound.brand.name} ${item.compound.model_name}\n`;
      text += `*Qty:* ${item.qtyLabel}\n`;
      if (item.oemMark) text += `*OEM Mark:* ${item.oemMark}\n`;
      if (item.notes) text += `*Notes:* ${item.notes}\n`;
      text += `\n`;
    });

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
    clearCart();
    onClose();
    if (user) router.push("/garage"); // Take them to the garage so they see it saved!
  };
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-obsidian/60 backdrop-blur-sm z-[70] transition-opacity" onClick={onClose} />
      )}

      <div className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} h-full w-full sm:w-[400px] bg-carbon/95 backdrop-blur-3xl border-${lang === 'ar' ? 'r' : 'l'} border-white/10 shadow-2xl z-[80] transform transition-transform duration-500 ease-luxury flex flex-col ${isOpen ? 'translate-x-0' : (lang === 'ar' ? '-translate-x-full' : 'translate-x-full')}`}>
        
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-obsidian">
          <h2 className={`font-cinzel text-2xl text-white ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{t("cart.title")}</h2>
          <button onClick={onClose} className="p-2 text-ash hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-start">
          {cart.length === 0 ? (
            <div className={`text-center text-ash mt-10 ${lang === 'ar' ? 'font-cairo' : ''}`}>
              {t("cart.empty")}
            </div>
          ) : (
            cart.map((item) => {
              const tireImg = item.compound.media?.file_path ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${item.compound.media.file_path}` : null;
              return (
                <div key={item.id} className="bg-obsidian border border-white/5 rounded-2xl p-4 flex gap-4 relative group">
                  <div className="w-20 h-20 bg-carbon rounded-xl flex items-center justify-center shrink-0 p-2">
                    {tireImg ? <img src={tireImg} className="max-h-full object-contain" /> : <span className="text-[8px] text-ash">NO IMG</span>}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[9px] uppercase tracking-widest text-crimson font-bold mb-1 block">{item.compound.brand.name}</span>
                    <h4 className={`text-sm text-white font-cinzel mb-2 ${lang === 'ar' ? 'font-cairo font-bold tracking-normal' : ''}`}>{item.compound.model_name}</h4>
                    <div className={`text-[10px] text-ash/80 flex flex-wrap gap-x-3 gap-y-1 ${lang === 'ar' ? 'font-cairo' : ''}`}>
                      <span>{t("cart.qty")}: <strong className="text-white">{item.qtyLabel}</strong></span>
                      {item.oemMark && <span>{t("cart.oem")}: <strong className="text-white">{item.oemMark}</strong></span>}
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="absolute top-3 end-3 text-ash hover:text-crimson opacity-50 group-hover:opacity-100 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-obsidian flex flex-col gap-3">
            <button onClick={handleWhatsApp} className={`w-full bg-[#25D366] text-obsidian py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-3 ${lang === 'ar' ? 'font-cairo' : ''}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.553 4.195 1.603 6.015L.175 24l6.105-1.597c1.761.954 3.743 1.458 5.751 1.458 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.907c-1.808 0-3.582-.486-5.13-1.405l-.368-.218-3.811.996.996-3.811-.218-.368c-.919-1.548-1.405-3.322-1.405-5.13 0-5.546 4.514-10.06 10.06-10.06 5.546 0 10.06 4.514 10.06 10.06 0 5.546-4.514 10.06-10.06 10.06z"/></svg>
              {t("cart.checkout_wa")}
            </button>
            <button onClick={handleCheckout} disabled={isSubmitting} className={`w-full bg-crimson text-white py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-obsidian transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${lang === 'ar' ? 'font-cairo' : ''}`}>
              {isSubmitting ? "..." : (user ? t("cart.checkout_vault") : t("cart.auth_req"))}
            </button>
          </div>
        )}
      </div>
    </>
  );
}