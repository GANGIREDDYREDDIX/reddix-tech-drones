"use client";

import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import styles from "./cart.module.css";
import Link from "next/link";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import clsx from "clsx";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { formatCurrency } = useCurrency();
  const [shippingMethod, setShippingMethod] = useState("bluedart");
  
  // Dummy values based on Quadkart screenshot
  const shippingCost = shippingMethod === "bluedart" ? 237 : 0;
  const finalTotal = cartTotal + shippingCost;

  return (
    <main>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <span className={styles.activeStep}>SHOPPING CART</span>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.inactiveStep}>CHECKOUT DETAILS</span>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.inactiveStep}>ORDER COMPLETE</span>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <h2>Your cart is currently empty.</h2>
            <div style={{ marginTop: "24px" }}>
              <Link href="/shop" className={styles.btnPrimary} style={{ display: "inline-block", width: "auto" }}>
                Return to shop
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.leftCol}>
              <table className={styles.cartTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className={styles.cartRow}>
                      <td className={styles.cartCell}>
                        <div className={styles.productCell}>
                          <button 
                            className={styles.removeBtn} 
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                          <img 
                            src={item.image || "/sequence/ezgif-frame-001.jpg"} 
                            alt={item.name} 
                            className={styles.productImg} 
                          />
                          <Link href={`/shop/${item.id}`} className={styles.productName}>
                            {item.name}
                          </Link>
                        </div>
                      </td>
                      <td className={styles.cartCell}>
                        <span className={styles.price}>{formatCurrency(item.price)}</span>
                      </td>
                      <td className={styles.cartCell}>
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
                      </td>
                      <td className={styles.cartCell}>
                        <span className={styles.price}>{formatCurrency(item.price * item.quantity)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.actions}>
                <Link href="/shop" className={styles.btnOutline}>
                  &larr; Continue shopping
                </Link>
              </div>
            </div>

            <div className={styles.rightCol}>
              <div className={styles.totalsCard}>
                <div className={styles.totalsHeader}>Cart Totals</div>
                
                <div className={styles.totalsRow}>
                  <span>Subtotal</span>
                  <strong>{formatCurrency(cartTotal)}</strong>
                </div>

                <div className={styles.totalsRow} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "16px" }}>
                  <span>Shipment</span>
                  <div className={styles.shippingOptions}>
                    <label>
                      <input 
                        type="radio" 
                        name="shipping" 
                        value="bluedart"
                        checked={shippingMethod === "bluedart"}
                        onChange={() => setShippingMethod("bluedart")}
                      />
                      <span>
                        Bluedart (Full Refund or Replacement if shipment lost in transit): 
                        <strong> ₹237</strong>
                      </span>
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="shipping" 
                        value="pickup"
                        checked={shippingMethod === "pickup"}
                        onChange={() => setShippingMethod("pickup")}
                      />
                      <span>Store Pickup - Contact Customer Care for Appointment</span>
                    </label>
                    <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Shipping to <strong>India</strong>.
                    </div>
                  </div>
                </div>

                <div className={styles.totalsTotal}>
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>

                <Link href="/checkout" className={styles.btnPrimary}>
                  Proceed to checkout
                </Link>

                <div className={styles.couponBox}>
                  <h4>Coupon</h4>
                  <div className={styles.couponInput}>
                    <input type="text" placeholder="Coupon code" />
                    <button className={styles.btnSecondary}>Apply coupon</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
