"use client";

import { CartProvider } from "@/context/CartContext";
import CartSidebar from "./CartSidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartSidebar />
    </CartProvider>
  );
}
