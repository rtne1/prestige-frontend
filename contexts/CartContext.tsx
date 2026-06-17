"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  compound: any;
  quantity: string;
  qtyLabel: string;
  oemMark: string;
  vehicle: any;
  notes: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotalItems: number;
  isCartOpen: boolean; // NEW: Global Drawer State
  openCart: () => void; // NEW
  closeCart: () => void; // NEW
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("prestige_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("prestige_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => setCart((prev) => [...prev, item]);
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);
  
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotalItems: cart.length, isCartOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};