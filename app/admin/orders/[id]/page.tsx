"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, Printer } from "lucide-react";
import styles from "./order-details.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  id: string;
  date: string;
  customer: { name: string; email: string; address: string };
  total: number;
  status: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  paymentMethod: string;
  notes: string;
}

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrder({ ...order, status: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading order details...</div>;
  if (!order) return <div style={{ padding: "40px" }}>Order not found.</div>;

  return (
    <div className={styles.container}>
      <Link href="/admin/orders" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>
            Order {order.id}
          </h1>
          <p className={styles.subtitle}>Placed on {new Date(order.date).toLocaleString()}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href={`/admin/orders/${id}/label`} target="_blank" className={styles.printBtn} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--background-secondary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            <Printer size={16} /> Print Label
          </Link>
          <select 
            className={styles.statusSelect}
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="RTO">RTO (Returned)</option>
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Order Items</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th className={styles.textRight}>Price</th>
                <th className={styles.textRight}>Qty</th>
                <th className={styles.textRight}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{item.productId}</div>
                  </td>
                  <td className={styles.textRight}>{!currencyLoading ? formatCurrency(item.price) : "..."}</td>
                  <td className={styles.textRight}>{item.quantity}</td>
                  <td className={styles.textRight}>{!currencyLoading ? formatCurrency(item.price * item.quantity) : "..."}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td colSpan={3} className={styles.textRight}>Total Amount</td>
                <td className={styles.textRight}>{!currencyLoading ? formatCurrency(order.total) : "..."}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Customer Information</h2>
            <div className={styles.infoRow}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.infoValue}>{order.customer.name}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{order.customer.email}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Shipping Address</span>
                <span className={styles.infoValue}>{order.customer.address}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Payment Details</h2>
            <div className={styles.infoRow}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Method</span>
                <span className={styles.infoValue}>{order.paymentMethod}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Customer Notes</span>
                <span className={styles.infoValue}>{order.notes || "No notes provided."}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
