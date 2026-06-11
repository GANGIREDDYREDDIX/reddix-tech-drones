"use client";

import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./CartSidebar.module.css";
import clsx from "clsx";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import { useState } from "react";

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { formatCurrency, loading: currencyLoading } = useCurrency();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total: cartTotal })
      });
      
      if (res.ok) {
        alert("Order placed successfully! A Reddix Tech representative will contact you shortly.");
        clearCart();
        setIsCartOpen(false);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to place order.");
      }
    } catch (e) {
      alert("Error placing order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <div 
        className={clsx(styles.overlay, isCartOpen && styles.open)} 
        onClick={() => setIsCartOpen(false)}
      />
      
      <div className={clsx(styles.sidebar, isCartOpen && styles.open)}>
        <div className={styles.header}>
          <h2>Your Cart</h2>
          <button className={styles.closeButton} onClick={() => setIsCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={48} />
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added any gear yet.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <img src={item.image} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <div className={styles.itemPrice}>{!currencyLoading ? formatCurrency(item.price) : "..."}</div>
                  
                  <div className={styles.itemControls}>
                    <div className={styles.quantityControl}>
                      <button 
                        className={styles.quantityBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        className={styles.quantityBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button 
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{!currencyLoading ? formatCurrency(cartTotal) : "..."}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>{!currencyLoading ? formatCurrency(cartTotal) : "..."}</span>
            </div>
            
            <button 
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? "Processing..." : "Place Order"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
