"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  DollarSign, ShoppingCart, Package,
  ArrowUpRight, TrendingUp, AlertTriangle
} from "lucide-react";
import styles from "./dashboard.module.css";
import { useCurrency } from "@/context/CurrencyContext";

// ─── Y-axis number compactor ──────────────────────────────────────────────────
function compactNum(val: number): string {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000)    return `₹${(val / 100_000).toFixed(1)}L`;
  if (val >= 1_000)      return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${Math.round(val)}`;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, formatCurrency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--background-primary, #fff)",
      border: "1px solid var(--border-color, rgba(0,0,0,0.1))",
      borderRadius: 8, padding: "8px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      fontSize: 12,
    }}>
      <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 14 }}>
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

// ─── Status color map ─────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  delivered:  "#10b981",
  pending:    "#f59e0b",
  processing: "#3b82f6",
  shipped:    "#6366f1",
  cancelled:  "#ef4444",
  restocked:  "#8b5cf6",
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<{
    kpis: { totalRevenue: number; totalOrders: number; activeOrders: number };
    chartData: { name: string; revenue: number }[];
    recentOrders: { id: string; customer: string; status: string; amount: number }[];
    lowStock: { name: string; qty: number }[];
  } | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const { formatCurrency, loading } = useCurrency();

  useEffect(() => {
    setAnalytics(null);
    fetch(`/api/analytics?range=${timeRange}`)
      .then(r => r.json())
      .then(setAnalytics)
      .catch(console.error);
  }, [timeRange]);

  const fmt = (v: number) => loading ? "..." : formatCurrency(v);

  const kpiCards = [
    {
      title: "Total Revenue",
      value: analytics ? fmt(analytics.kpis.totalRevenue) : "...",
      icon: <DollarSign size={18} className={styles.kpiIcon} />,
      iconBg: "rgba(59,130,246,0.12)",
      change: "+12.5%",
    },
    {
      title: "Total Orders",
      value: analytics ? String(analytics.kpis.totalOrders) : "...",
      icon: <ShoppingCart size={18} style={{ color: "#10b981" }} />,
      iconBg: "rgba(16,185,129,0.12)",
      change: "+8.2%",
    },
    {
      title: "Active Orders",
      value: analytics ? String(analytics.kpis.activeOrders) : "...",
      icon: <Package size={18} style={{ color: "#f5a623" }} />,
      iconBg: "rgba(245,166,35,0.12)",
      change: "+4.3%",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* KPI cards */}
      <div className={styles.kpiGrid}>
        {kpiCards.map((card, i) => (
          <div key={i} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>{card.title}</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: card.iconBg }}>
                {card.icon}
              </div>
            </div>
            <div className={styles.kpiValue}>{card.value}</div>
            <div className={`${styles.kpiChange} ${styles.trendUp}`}>
              <ArrowUpRight size={14} />
              {card.change} this month
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart — full width */}
      <div className={styles.chartCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="#3b82f6" />
            <h2 style={{ margin: 0 }}>Revenue Overview</h2>
          </div>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            style={{
              background: "var(--background-secondary, rgba(0,0,0,0.04))",
              border: "1px solid var(--border-color, rgba(0,0,0,0.12))",
              color: "var(--text-primary)",
              padding: "6px 14px",
              borderRadius: 8,
              outline: "none",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="1y">This Year</option>
          </select>
        </div>

        {!analytics ? (
          <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-secondary)", fontSize: 14 }}>
            <span style={{
              width: 18, height: 18, border: "2px solid #3b82f6",
              borderTopColor: "transparent", borderRadius: "50%",
              display: "inline-block", animation: "spin 0.7s linear infinite",
            }} />
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analytics.chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--border-color, rgba(0,0,0,0.08))"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--text-secondary, #6b7280)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-color, rgba(0,0,0,0.12))" }}
                interval={
                  analytics.chartData.length <= 8 ? 0
                  : analytics.chartData.length <= 15 ? 1
                  : Math.ceil(analytics.chartData.length / 7) - 1
                }
              />
              <YAxis
                tickFormatter={compactNum}
                tick={{ fontSize: 11, fill: "var(--text-secondary, #6b7280)" }}
                tickLine={false}
                axisLine={false}
                width={56}
              />
              <Tooltip
                content={<ChartTooltip formatCurrency={formatCurrency} />}
                cursor={{ fill: "rgba(59,130,246,0.06)" }}
              />
              <Bar
                dataKey="revenue"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#3b82f6" }} />
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Revenue (non-cancelled orders)</span>
        </div>
      </div>

      {/* Bottom row: Recent Orders + Low Stock side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Orders */}
        <div className={styles.activityCard}>
          <h2 style={{ marginBottom: 12 }}>Recent Orders</h2>
          {analytics?.recentOrders?.length ? (
            analytics.recentOrders.map((o, i, arr) => {
              const color = STATUS_COLORS[o.status.toLowerCase()] || "#94a3b8";
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border-color, rgba(0,0,0,0.07))" : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{o.id}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{o.customer}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <span style={{
                      background: `${color}20`, color,
                      border: `1px solid ${color}44`,
                      padding: "2px 10px", borderRadius: 20,
                      fontSize: 10, fontWeight: 600,
                    }}>{o.status}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{fmt(o.amount)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
              {analytics ? "No recent orders" : "Loading..."}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className={styles.activityCard}>
          <h2 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <AlertTriangle size={16} /> Low Stock Alerts
          </h2>
          {analytics?.lowStock?.length ? (
            analytics.lowStock.map((item, i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-color, rgba(0,0,0,0.07))" : "none",
              }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.name}</span>
                <span style={{
                  background: "rgba(239,68,68,0.1)", color: "#ef4444",
                  padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                }}>
                  {item.qty} left
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
              {analytics ? "✓ Inventory looking good!" : "Loading..."}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
