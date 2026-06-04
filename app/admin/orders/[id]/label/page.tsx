"use client";

import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { useParams } from "next/navigation";
import styles from "./label.module.css";

export default function ShippingLabel() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We could fetch the specific order from an API, or find it from orders.json via the API
    // Since we don't have a specific GET /api/orders/[id] yet, we can fetch all and filter
    const fetchOrder = async () => {
      try {
        const res = await fetch("/api/orders");
        const orders = await res.json();
        const found = orders.find((o: any) => o.id === id);
        setOrder(found);
        
        if (found) {
          // Auto-trigger print dialog after a slight delay to allow rendering
          setTimeout(() => {
            window.print();
          }, 500);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: 'black' }}>Generating Label...</div>;
  if (!order) return <div style={{ padding: 40, color: 'black' }}>Order not found.</div>;

  // Generate a mock tracking number
  const trackingNumber = `1Z${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return (
    <div className={styles.page}>
      <button className={styles.printBtn} onClick={() => window.print()}>
        <Printer size={18} /> Print Label
      </button>

      <div className={styles.labelContainer}>
        <div className={styles.header}>
          <h1>Reddix Tech Enterprises</h1>
          <p>123 Drone Innovation Park, Tech Valley</p>
          <p>Bangalore, KA 560001, India</p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Ship To</div>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>{order.customerName}</h2>
          <p className={styles.address}>
            {order.shippingAddress || "456 Customer Ave, Suite 100\nCityville, ST 12345"}
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.shippingMethod}>
            PRIORITY EXPRESS
          </div>
          <div className={styles.footer}>
            <span>Order: {order.id}</span>
            <span>Weight: 2.4 kg</span>
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className={styles.barcodeSection}>
          <div className={styles.barcode}></div>
          <div className={styles.trackingId}>{trackingNumber}</div>
        </div>
      </div>
    </div>
  );
}
