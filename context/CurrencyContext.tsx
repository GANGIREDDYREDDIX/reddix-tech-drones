"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AUD" | "CAD";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (amountInUSD: number) => string;
  rates: Record<string, number> | null;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "C$"
};

const LOCALES: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  AUD: "en-AU",
  CAD: "en-CA"
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("INR");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live exchange rates base USD
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then(res => res.json())
      .then(data => {
        setRates(data.rates);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch exchange rates:", err);
        // Fallback static rates just in case API fails
        setRates({
          USD: 1,
          INR: 83.5,
          EUR: 0.92,
          GBP: 0.79,
          AUD: 1.5,
          CAD: 1.36
        });
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amountInUSD: number) => {
    if (!rates) return `...`;
    const rate = rates[currency] || 1;
    const converted = amountInUSD * rate;
    const symbol = CURRENCY_SYMBOLS[currency];
    const locale = LOCALES[currency];
    
    return `${symbol}${converted.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, rates, loading }}>
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
