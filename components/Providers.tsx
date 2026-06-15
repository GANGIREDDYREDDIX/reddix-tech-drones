"use client";

import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CompareProvider } from "@/context/CompareContext";
import CartSidebar from "./CartSidebar";
import { ThemeProvider } from "next-themes";

// Suppress the React 19 "Encountered a script tag" warning from next-themes
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    orig.apply(console, args);
  };
}

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
