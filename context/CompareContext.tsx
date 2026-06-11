"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CompareContextType {
  compareList: any[];
  addToCompare: (product: any) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<any[]>([]);

  // Load initial compare list from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("compare_list");
      if (stored) {
        setCompareList(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to parse compare list from localStorage:", error);
    }
  }, []);

  // Sync to localStorage whenever compareList changes
  useEffect(() => {
    try {
      localStorage.setItem("compare_list", JSON.stringify(compareList));
    } catch (error) {
      console.error("Failed to save compare list to localStorage:", error);
    }
  }, [compareList]);

  const addToCompare = (product: any) => {
    setCompareList((prev) => {
      // Don't add if already exists
      if (prev.some((p) => p.id === product.id)) return prev;
      
      // Limit to 4 products for comparison UI
      if (prev.length >= 4) {
        alert("You can only compare up to 4 products at a time.");
        return prev;
      }
      
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
