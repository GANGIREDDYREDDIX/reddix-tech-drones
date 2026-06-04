"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import styles from "./carts.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Cart {
  id: string;
  customerName: string;
  email: string;
  total: number;
  date: string;
  items: string[];
  status: "Pending" | "Email Sent" | "Recovered";
}

const mockCarts: Cart[] = [
  { id: "CART-892", customerName: "Elena R.", email: "elena@example.com", total: 1500, date: "2024-06-04T14:30:00Z", items: ["Reddix X1 Pro", "Pro Battery Pack"], status: "Pending" },
  { id: "CART-891", customerName: "Marcus T.", email: "marcus.t@outlook.com", total: 550, date: "2024-06-03T09:15:00Z", items: ["Reddix Air Lite"], status: "Email Sent" },
  { id: "CART-885", customerName: "Sarah J.", email: "sarah.j@gmail.com", total: 1750, date: "2024-06-01T18:45:00Z", items: ["Reddix X1 Pro", "ND Filters Set", "Hard Case"], status: "Recovered" }
];

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<Cart[]>(mockCarts);
  const { formatCurrency, loading } = useCurrency();

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
            {carts.map(cart => (
              <tr key={cart.id}>
                <td style={{ fontWeight: 600 }}>{cart.id}</td>
                <td>
                  <div className={styles.customerName}>{cart.customerName}</div>
                  <div className={styles.customerEmail}>{cart.email}</div>
                </td>
                <td>{new Date(cart.date).toLocaleString()}</td>
                <td>
                  <div className={styles.itemsList}>
                    {cart.items.map((item, i) => (
                      <span key={i}>• {item}</span>
                    ))}
                  </div>
                </td>
                <td className={styles.textRight}>{!loading ? formatCurrency(cart.total) : "..."}</td>
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
