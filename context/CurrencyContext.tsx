"use client";

import React, { createContext, useContext } from "react";

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  formatCurrency: (amount: number) => string;
  rates: null;
  loading: false;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // INR is the only currency — prices in DB are already in INR
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const setCurrency = (_c: string) => {
    // No-op: currency is fixed to INR
  };

  return (
    <CurrencyContext.Provider
      value={{ currency: "INR", setCurrency, formatCurrency, rates: null, loading: false }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
