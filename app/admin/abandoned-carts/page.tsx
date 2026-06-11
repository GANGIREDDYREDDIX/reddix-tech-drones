"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import styles from "./carts.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Cart {
  id: string;
  customer_name: string;
  email: string;
  value: number;
  items_count: number;
  time_abandoned: string;
  status: "Pending" | "Email Sent" | "Recovered";
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    fetch("/api/abandoned-carts")
      .then(res => res.json())
      .then(data => {
        setCarts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSendEmail = (id: string) => {
    setCarts(carts.map(c => c.id === id ? { ...c, status: "Email Sent" } : c));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Abandoned Carts</h1>
          <p className={styles.subtitle}>Recover lost sales by sending targeted discount emails.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cart ID</th>
              <th>Customer</th>
              <th>Abandoned On</th>
              <th>Items Left Behind</th>
              <th className={styles.textRight}>Value</th>
              <th>Status</th>
              <th className={styles.textRight}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>Loading abandoned carts...</td></tr>
            ) : carts.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>No abandoned carts found</td></tr>
            ) : carts.map(cart => (
              <tr key={cart.id}>
                <td style={{ fontWeight: 600 }}>{cart.id}</td>
                <td>
                  <div className={styles.customerName}>{cart.customer_name}</div>
                  <div className={styles.customerEmail}>{cart.email}</div>
                </td>
                <td>{cart.time_abandoned}</td>
                <td>{cart.items_count} items</td>
                <td className={styles.textRight}>{formatCurrency(cart.value)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${
                    cart.status === "Recovered" ? styles.badgeRecovered :
                    cart.status === "Email Sent" ? styles.badgeSent : styles.badgePending
                  }`}>
                    {cart.status}
                  </span>
                </td>
                <td className={styles.textRight}>
                  <button 
                    className={styles.processBtn}
                    onClick={() => handleSendEmail(cart.id)}
                    disabled={cart.status !== "Pending"}
                  >
                    {cart.status === "Pending" ? (
                      <><Mail size={16} /> Send Email</>
                    ) : (
                      <><CheckCircle2 size={16} /> {cart.status}</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
