"use client";

import { useState, useEffect } from "react";
import { PackageOpen, CheckCircle } from "lucide-react";
import Link from "next/link";
import styles from "./rto.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  id: string;
  date: string;
  customer: { name: string; email: string };
  total: number;
  status: string;
}

export default function AdminRTO() {
  const [rtoOrders, setRtoOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRTOs = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      // Filter for orders that are RTO or previously processed as Restocked
      const returned = data.filter((o: Order) => o.status === "RTO" || o.status === "Restocked");
      setRtoOrders(returned);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRTOs();
  }, []);

  const handleProcessReturn = async (id: string) => {
    setProcessingId(id);
    try {
      // In a real app, this would also trigger an inventory increment API call.
      // For now, we update the order status to signify the return is fully processed.
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Restocked" })
      });
      
      if (res.ok) {
        fetchRTOs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Returns (RTO)</h1>
          <p className={styles.subtitle}>Manage failed deliveries and process returned stock.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Return Date</th>
              <th className={styles.textRight}>Value</th>
              <th>Status</th>
              <th className={styles.textRight}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.loadingCell}>Loading returns...</td></tr>
            ) : rtoOrders.map(order => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/orders/${order.id}`} className={styles.orderId}>
                    {order.id}
                  </Link>
                </td>
                <td>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{order.customer.name}</span>
                    <span className={styles.customerEmail}>{order.customer.email}</span>
                  </div>
                </td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td className={styles.textRight}>{!currencyLoading ? formatCurrency(order.total) : "..."}</td>
                <td>
                  {order.status === "Restocked" ? (
                    <span className={`${styles.statusBadge} ${styles.badgeRestocked}`}>
                      Processed
                    </span>
                  ) : (
                    <span className={`${styles.statusBadge} ${styles.badgeReturned}`}>
                      Pending Return
                    </span>
                  )}
                </td>
                <td className={styles.textRight}>
                  <button 
                    className={styles.processBtn}
                    onClick={() => handleProcessReturn(order.id)}
                    disabled={order.status === "Restocked" || processingId === order.id}
                  >
                    {order.status === "Restocked" ? (
                      <><CheckCircle size={16} /> Restocked</>
                    ) : (
                      <><PackageOpen size={16} /> Process Return</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && rtoOrders.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.loadingCell}>
                  No RTO orders at this time.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
