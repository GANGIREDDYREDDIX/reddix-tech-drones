"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, ChevronRight, ChevronLeft, Download, ExternalLink } from "lucide-react";
import styles from "./orders.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  id: string;
  date: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];
  total: number;
  status: string;
  paymentMethod: string;
}

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/login";
        return;
      }
      
      try {
        // Fetch products to map images
        const productsRes = await fetch("/api/products");
        const products = productsRes.ok ? await productsRes.json() : [];
        const productMap = new Map(products.map((p: any) => [p.id, p.imageUrl]));

        // Fetch orders
        const ordersRes = await fetch("/api/orders");
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          let userOrders = data.filter((o: Order) => o.customer.email === user.email);

          // Map product images to order items
          const enrichedOrders = userOrders.map((order: Order) => ({
            ...order,
            items: order.items.map(item => ({
              ...item,
              imageUrl: productMap.get(item.productId) || "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=400&auto=format&fit=crop"
            }))
          }));

          setOrders(enrichedOrders);
        }
      } catch (e) {
        console.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getStatusStep = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("deliver")) return 3;
    if (s.includes("ship")) return 2;
    return 1;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', fontWeight: 500, marginBottom: '24px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
          <ChevronLeft size={20} /> Back
        </button>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.title}
        >
          Order History
        </motion.h1>
        <p className={styles.subtitle}>Check the status of recent orders, manage returns, and download invoices.</p>
      </div>

      {loading ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={64} className={styles.emptyIcon} />
          <h2>No orders found</h2>
          <p>We couldn't find any recent orders associated with your account.</p>
          <Link href="/shop" className={styles.shopBtn}>Browse Products</Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order, i) => {
            const step = getStatusStep(order.status);
            
            return (
              <motion.div 
                key={order.id}
                className={styles.orderCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Premium Order Header */}
                <div className={styles.orderHeader}>
                  <div className={styles.headerGrid}>
                    <div className={styles.headerItem}>
                      <span className={styles.label}>Order Placed</span>
                      <span className={styles.value}>{new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className={styles.headerItem}>
                      <span className={styles.label}>Total</span>
                      <span className={styles.value}>{!currencyLoading ? formatCurrency(order.total) : "..."}</span>
                    </div>
                    <div className={styles.headerItem}>
                      <span className={styles.label}>Ship To</span>
                      <span className={styles.valueLink}>{order.customer.name} <ChevronRight size={14} /></span>
                    </div>
                  </div>
                  <div className={styles.headerRight}>
                    <span className={styles.label}>Order # {order.id.split('-')[1]}</span>
                    <div className={styles.headerActions}>
                      <button className={styles.textBtn}>View Invoice</button>
                    </div>
                  </div>
                </div>

                {/* Status Progress Bar */}
                <div className={styles.statusSection}>
                  <h3 className={styles.statusTitle}>
                    {step === 3 ? "Delivered" : step === 2 ? "Shipped" : "Preparing for Shipment"}
                  </h3>
                  <div className={styles.progressBar}>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
                    </div>
                    <div className={styles.progressSteps}>
                      <span className={step >= 1 ? styles.stepActive : ''}>Processing</span>
                      <span className={step >= 2 ? styles.stepActive : ''}>Shipped</span>
                      <span className={step >= 3 ? styles.stepActive : ''}>Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className={styles.itemsSection}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemImageWrapper}>
                        <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
                      </div>
                      <div className={styles.itemDetails}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        <p className={styles.itemPrice}>{!currencyLoading ? formatCurrency(item.price) : "..."}</p>
                        <p className={styles.itemMeta}>Qty: {item.quantity}</p>
                        <div className={styles.itemActions}>
                          <button className={styles.actionBtn}><Package size={14} /> Track Package</button>
                          <button className={styles.actionBtn}><ExternalLink size={14} /> Buy it again</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
