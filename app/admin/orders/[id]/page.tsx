"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, Printer, CreditCard, User, MapPin } from "lucide-react";
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

const ORDER_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

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

  const currentStepIndex = ORDER_STEPS.indexOf(order.status) !== -1 ? ORDER_STEPS.indexOf(order.status) : 0;
  const isCancelledOrRto = ["Cancelled", "RTO", "Restocked"].includes(order.status);

  return (
    <div className={styles.container}>
      <Link href="/admin/orders" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>
            Order <span style={{ color: "var(--accent-blue)" }}>{order.id}</span>
          </h1>
          <p className={styles.subtitle}>Placed on {new Date(order.date).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href={`/admin/orders/${id}/label`} target="_blank" className={styles.printBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--background-secondary)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' }}>
            <Printer size={16} /> Print Label
          </Link>
          <select 
            className={styles.statusSelect}
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', background: 'var(--background-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="RTO">RTO (Pending Return)</option>
            <option value="Restocked">RTO (Restocked)</option>
          </select>
        </div>
      </div>

      {/* Visual Tracking Timeline */}
      {!isCancelledOrRto && (
        <div className={styles.card} style={{ marginBottom: 24, padding: "32px 24px" }}>
          <div className={styles.timeline}>
            <div className={styles.timelineLine}></div>
            <div className={styles.timelineProgress} style={{ width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` }}></div>
            
            {ORDER_STEPS.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              let Icon = Package;
              if (step === "Processing") Icon = Clock;
              if (step === "Shipped") Icon = Truck;
              if (step === "Delivered") Icon = CheckCircle;

              return (
                <div key={step} className={`${styles.timelineStep} ${isActive ? styles.active : ''}`}>
                  <div className={styles.timelineIcon}>
                    <Icon size={18} />
                  </div>
                  <div className={styles.timelineLabel}>{step}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelledOrRto && (
        <div className={styles.card} style={{ marginBottom: 24, padding: "24px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#ef4444", fontWeight: 700, fontSize: "1.1rem" }}>
            <CheckCircle size={24} />
            Order {order.status}
          </div>
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Order Items</h2>
          <table className={styles.table} style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))" }}>
                <th style={{ textAlign: "left", padding: "16px", color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>Product</th>
                <th style={{ textAlign: "right", padding: "16px", color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>Price</th>
                <th style={{ textAlign: "right", padding: "16px", color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "16px", color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>ID: {item.productId || item.id || "N/A"}</div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right", fontWeight: 500, color: "var(--text-primary)" }}>{!currencyLoading ? formatCurrency(item.price) : "..."}</td>
                  <td style={{ padding: "16px", textAlign: "right", fontWeight: 500, color: "var(--text-primary)" }}>{item.quantity}</td>
                  <td style={{ padding: "16px", textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{!currencyLoading ? formatCurrency(item.price * item.quantity) : "..."}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td colSpan={3} style={{ padding: "20px 16px", textAlign: "right", fontSize: "1.1rem" }}>Total Amount</td>
                <td style={{ padding: "20px 16px", textAlign: "right", fontSize: "1.2rem", color: "var(--accent-blue)" }}>{!currencyLoading ? formatCurrency(order.total) : "..."}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}><User size={18} /> Customer Information</h2>
            <div className={styles.infoRow} style={{ gap: 20 }}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.infoValue} style={{ fontWeight: 600 }}>{order.customer?.name || "Unknown Customer"}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{order.customer?.email || "No email"}</span>
              </div>
              <div className={styles.infoBlock} style={{ marginTop: 8 }}>
                <span className={styles.infoLabel} style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> Shipping Address</span>
                <span className={styles.infoValue} style={{ lineHeight: 1.5 }}>{order.customer?.address || "No shipping address provided."}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}><CreditCard size={18} /> Payment Details</h2>
            <div className={styles.infoRow} style={{ gap: 20 }}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Method</span>
                <span className={styles.infoValue}>
                  {order.paymentMethod ? (
                    <span style={{ display: "inline-block", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "4px 10px", borderRadius: 6, fontSize: "0.85rem", fontWeight: 700 }}>
                      {order.paymentMethod}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>Not specified</span>
                  )}
                </span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Customer Notes</span>
                <span className={styles.infoValue} style={{ fontStyle: order.notes ? "normal" : "italic", color: order.notes ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  {order.notes || "No notes provided."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
