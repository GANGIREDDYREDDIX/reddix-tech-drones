"use client";

import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./dashboard.module.css";
import { useCurrency } from "@/context/CurrencyContext";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<{ kpis: any, chartData: any[], recentOrders?: any[], lowStock?: any[] } | null>(null);
  const { formatCurrency, loading } = useCurrency();

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(console.error);
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Revenue</span>
            <div className={styles.kpiIconWrapper}>
              <DollarSign size={18} className={styles.kpiIcon} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {analytics && !loading ? formatCurrency(analytics.kpis.totalRevenue) : "..."}
          </div>
          <div className={`${styles.kpiChange} ${styles.trendUp}`}>
            <ArrowUpRight size={14} />
            +12.5% this month
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Orders</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <ShoppingCart size={18} style={{ color: '#10b981' }} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {analytics ? analytics.kpis.totalOrders : "..."}
          </div>
          <div className={`${styles.kpiChange} ${styles.trendUp}`}>
            <ArrowUpRight size={14} />
            +8.2% this month
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Active Orders</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(245, 166, 35, 0.1)' }}>
              <Package size={18} style={{ color: '#f5a623' }} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {analytics ? analytics.kpis.activeOrders : "..."}
          </div>
          <div className={`${styles.kpiChange} ${styles.trendUp}`}>
            <ArrowUpRight size={14} />
            +4.1% this month
          </div>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.chartCard} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2>Revenue Overview</h2>
            <select style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", padding: "6px 12px", borderRadius: "6px", outline: "none" }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div style={{ height: "300px", width: "100%", padding: 0 }}>
            {analytics ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrency(val)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--accent-blue)', fontWeight: 600 }}
                    formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>Loading chart...</div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className={styles.activityCard}>
            <h2>Recent Orders</h2>
            <div className={styles.activityList}>
              {analytics?.recentOrders?.map((order: any, i: number) => (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityInfo}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderCustomer}>{order.customer}</span>
                  </div>
                  <div className={styles.activityMeta}>
                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                      {order.status}
                    </span>
                    <span className={styles.orderAmount}>{!loading ? formatCurrency(order.amount) : "..."}</span>
                  </div>
                </div>
              ))}
              {(!analytics || !analytics.recentOrders || analytics.recentOrders.length === 0) && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent orders</div>
              )}
            </div>
          </div>
          
          <div className={styles.activityCard}>
            <h2 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={18} /> Low Stock Alerts
            </h2>
            <div className={styles.activityList}>
              {analytics?.lowStock?.map((item: any, i: number, arr: any[]) => (
                <div key={i} className={styles.activityItem} style={{ padding: "12px 0", borderBottom: i === arr.length - 1 ? "none" : "" }}>
                  <div className={styles.activityInfo}>
                    <span className={styles.orderCustomer}>{item.name}</span>
                  </div>
                  <div className={styles.activityMeta}>
                    <span className={`${styles.statusBadge}`} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                      {item.qty} left
                    </span>
                  </div>
                </div>
              ))}
              {(!analytics || !analytics.lowStock || analytics.lowStock.length === 0) && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Inventory looking good!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
