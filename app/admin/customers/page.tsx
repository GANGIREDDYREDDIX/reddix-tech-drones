"use client";

import { useState, useEffect } from "react";
import { Mail, Edit2, Ban } from "lucide-react";
import styles from "./customers.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Customer {
  id: string;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
  status: string;
  joined_date: string;
}

const colors = [
  "linear-gradient(135deg, #FF6B6B, #EE5D5D)",
  "linear-gradient(135deg, #4D96FF, #2B7FFF)",
  "linear-gradient(135deg, #6BCB77, #4FB95B)",
  "linear-gradient(135deg, #FFD93D, #F4C71B)",
  "linear-gradient(135deg, #9D9D9D, #7A7A7A)"
];
const getColor = (str: string) => colors[str.length % colors.length];

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const { formatCurrency, loading } = useCurrency();

  useEffect(() => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoadingCustomers(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingCustomers(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>View and manage your customer base.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Status</th>
              <th className={styles.textRight}>Total Orders</th>
              <th className={styles.textRight}>Total Spent</th>
              <th>Joined Date</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingCustomers ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>Loading customers...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>No customers found</td></tr>
            ) : customers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className={styles.customerCell}>
                    <div className={styles.customerAvatar} style={{ background: getColor(customer.name) }}>
                      {customer.name.charAt(0)}
                    </div>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerName}>{customer.name}</span>
                      <span className={styles.customerEmail}>{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[customer.status.toLowerCase()]}`}>
                    {customer.status}
                  </span>
                </td>
                <td className={styles.textRight}>{customer.total_orders}</td>
                <td className={styles.textRight} style={{fontWeight: 600}}>{!loading ? formatCurrency(customer.total_spent) : "..."}</td>
                <td>{new Date(customer.joined_date).toLocaleDateString()}</td>
                <td className={styles.actionsCell}>
                  <button className={styles.iconBtn} title="Email Customer">
                    <Mail size={16} />
                  </button>
                  <button className={styles.iconBtn} title="Edit Customer">
                    <Edit2 size={16} />
                  </button>
                  <button className={styles.iconBtn} title="Suspend Account" style={{ color: '#ef4444' }}>
                    <Ban size={16} />
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
