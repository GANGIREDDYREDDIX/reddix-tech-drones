"use client";

import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./CartSidebar.module.css";
import clsx from "clsx";
import Link from "next/link";

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal } = useCart();

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
                  <div className={styles.itemPrice}>${item.price.toLocaleString()}</div>
                  
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
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            
            <button 
              className={styles.checkoutBtn}
              onClick={() => {
                alert("Thank you for your interest! A Reddix Tech representative will contact you shortly.");
                setIsCartOpen(false);
              }}
            >
              Request Quote
            </button>
          </div>
        )}
      </div>
    </>
  );
}
