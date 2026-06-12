"use client";

import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./CartSidebar.module.css";
import clsx from "clsx";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import { useState, useEffect } from "react";

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { formatCurrency } = useCurrency();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);

  useEffect(() => {
    if (isCartOpen) {
      fetch("/api/customers/points")
        .then(r => r.json())
        .then(data => setAvailablePoints(data.points || 0))
        .catch(() => setAvailablePoints(0));
    }
  }, [isCartOpen]);

  // Conversion: 1 point = ₹1
  const maxPointsToRedeem = Math.min(availablePoints, Math.floor(cartTotal));
  
  // Ensure redeemPoints doesn't exceed the new max
  useEffect(() => {
    if (redeemPoints > maxPointsToRedeem) {
      setRedeemPoints(maxPointsToRedeem);
    }
  }, [cartTotal, availablePoints, maxPointsToRedeem]);

  const discount = redeemPoints;
  const finalTotal = Math.max(0, cartTotal - discount);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total: finalTotal, redeemedPoints: redeemPoints })
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
                <img src={item.image || "/sequence/ezgif-frame-001.jpg"} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <div className={styles.itemPrice}>{formatCurrency(item.price)}</div>
                  
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
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            
            {availablePoints > 0 && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reddix Points ({availablePoints} available)</span>
                  <span style={{ fontSize: '0.8rem', color: '#10b981' }}>- {formatCurrency(discount)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="range" 
                    min="0" 
                    max={maxPointsToRedeem} 
                    step="1"
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent-blue)' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '60px', textAlign: 'right' }}>{redeemPoints} pts</span>
                </div>
              </div>
            )}

            <div className={styles.summaryTotal} style={{ marginTop: '16px' }}>
              <span>Total</span>
              <span>{formatCurrency(finalTotal)}</span>
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
