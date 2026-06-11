"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Product } from "@/data/products";
import { createClient } from "@/utils/supabase/client";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate or reuse a stable session cart ID
function getCartSessionId(): string {
  let id = localStorage.getItem("aero_cart_session_id");
  if (!id) {
    id = `CART-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    localStorage.setItem("aero_cart_session_id", id);
  }
  return id;
}

async function syncAbandonedCart(items: CartItem[]) {
  if (items.length === 0) {
    // Cart is empty — remove any existing abandoned cart record for this session
    const sessionId = localStorage.getItem("aero_cart_session_id");
    if (!sessionId) return;
    try {
      await fetch("/api/abandoned-carts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId }),
      });
    } catch (_) {}
    return;
  }

  const sessionId = getCartSessionId();
  const cartTotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
  const itemCount = items.reduce((t, i) => t + i.quantity, 0);

  // Try to get user info from supabase auth
  let customerName = "Guest";
  let email = "Unknown";
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      customerName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Guest";
      email = user.email || "Unknown";
    }
  } catch (_) {}

  try {
    await fetch("/api/abandoned-carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sessionId,
        customer_name: customerName,
        email,
        value: cartTotal,
        items_count: itemCount,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        status: "Pending",
      }),
    });
  } catch (e) {
    console.error("Failed to sync abandoned cart:", e);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const abandonedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("aero_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
        // If there were items in the cart already, they are potentially abandoned
        if (parsed.length > 0) {
          syncAbandonedCart(parsed);
        }
      } catch (e) {
        console.error("Failed to parse cart from local storage");
      }
    }
  }, []);

  // Save cart to local storage on change & schedule abandoned cart sync
  useEffect(() => {
    localStorage.setItem("aero_cart", JSON.stringify(items));

    // Clear any existing timer
    if (abandonedTimerRef.current) {
      clearTimeout(abandonedTimerRef.current);
    }

    if (items.length > 0) {
      // Sync immediately so the admin can see it right away
      syncAbandonedCart(items);
    } else {
      // Cart emptied (e.g. after purchase) — remove from abandoned carts
      syncAbandonedCart([]);
    }
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    // Remove the session ID so a fresh cart gets a new ID next time
    localStorage.removeItem("aero_cart_session_id");
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
