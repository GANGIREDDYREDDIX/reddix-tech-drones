"use client";

import { useState, useEffect } from "react";
import { Eye, Search, Filter } from "lucide-react";
import Link from "next/link";
import styles from "./orders.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  id: string;
  date: string;
  customer: { name: string; email: string };
  total: number;
  status: string;
  items: any[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>Manage and track customer orders.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Status</th>
              <th className={styles.textRight}>Total</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{textAlign: "center", padding: "40px"}}>Loading orders...</td></tr>
            ) : orders.map(order => (
              <tr key={order.id}>
                <td><span className={styles.orderId}>{order.id}</span></td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{order.customer.name}</span>
                    <span className={styles.customerEmail}>{order.customer.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                    {order.status}
                  </span>
                </td>
                <td className={styles.textRight} style={{fontWeight: 600}}>
                  {!currencyLoading ? formatCurrency(order.total) : "..."}
                </td>
                <td className={styles.actionsCell}>
                  <Link href={`/admin/orders/${order.id}`}>
                    <button className={styles.iconBtn} title="View Details">
                      <Eye size={16} />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
