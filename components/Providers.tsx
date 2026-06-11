"use client";

import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CompareProvider } from "@/context/CompareContext";
import CartSidebar from "./CartSidebar";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
      <CurrencyProvider>
        <CompareProvider>
          <CartProvider>
            {children}
            <CartSidebar />
          </CartProvider>
        </CompareProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
