"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, ShoppingCart, Package,
  ArrowUpRight, TrendingUp, AlertTriangle
} from "lucide-react";
import styles from "./dashboard.module.css";
import { useCurrency } from "@/context/CurrencyContext";

// ─── Compact Y-axis formatter ────────────────────────────────────────────────
const compact = (val: number) => {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000)   return `₹${(val / 100_000).toFixed(1)}L`;
  if (val >= 1_000)     return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${Math.round(val)}`;
};

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { name: string; revenue: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const { formatCurrency } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
        No data for this period
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.revenue), 1);
  // 4 grid lines: 100%, 66%, 33%, 0%
  const gridLines = [1, 0.67, 0.33, 0];

  // For 30d show every 5th label, for 7d show all, for 12 months show all
  const labelStep = data.length <= 8 ? 1 : data.length <= 15 ? 2 : Math.ceil(data.length / 6);

  return (
    <div style={{ display: "flex", gap: 8, height: 240 }}>
      {/* Y-Axis labels */}
      <div style={{ width: 52, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 28 }}>
        {gridLines.map((f, i) => (
          <span key={i} style={{ fontSize: 10, color: "var(--text-secondary)", textAlign: "right", display: "block", lineHeight: 1 }}>
            {compact(maxVal * f)}
          </span>
        ))}
      </div>

      {/* Chart body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Plot area */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* Grid lines */}
          {gridLines.map((f, i) => (
            <div key={i} style={{
              position: "absolute",
              top: `${(1 - f) * 100}%`,
              left: 0, right: 0,
              borderTop: `1px ${f === 0 ? "solid" : "dashed"} var(--border-color, rgba(0,0,0,0.1))`,
            }} />
          ))}

          {/* Bars */}
          <div style={{
            position: "absolute", inset: "0 0 0 0",
            display: "flex", alignItems: "flex-end",
            padding: "0 2px",
            gap: data.length > 20 ? 1 : data.length > 12 ? 3 : 5,
          }}>
            {data.map((d, i) => {
              const pct = (d.revenue / maxVal) * 100;
              const isHov = hovered === i;
              return (
                <div
                  key={i}
                  title={`${d.name}: ${formatCurrency(d.revenue)}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", position: "relative", cursor: "pointer" }}
                >
                  {/* Tooltip on hover */}
                  {isHov && (
                    <div style={{
                      position: "absolute", bottom: "100%", left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--background-primary, #fff)",
                      border: "1px solid var(--border-color, rgba(0,0,0,0.1))",
                      borderRadius: 6, padding: "5px 10px",
                      whiteSpace: "nowrap", zIndex: 20, marginBottom: 5,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: 11,
                    }}>
                      <div style={{ color: "var(--text-secondary)", marginBottom: 1 }}>{d.name}</div>
                      <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 13 }}>{formatCurrency(d.revenue)}</div>
                    </div>
                  )}
                  {/* Bar itself */}
                  <div style={{
                    width: "80%", minWidth: 3,
                    height: pct > 0 ? `${pct}%` : "2px",
                    background: pct === 0
                      ? "var(--border-color, rgba(0,0,0,0.06))"
                      : isHov
                        ? "linear-gradient(to top, #1d4ed8, #93c5fd)"
                        : "linear-gradient(to top, #2563eb, #60a5fa)",
                    borderRadius: "3px 3px 0 0",
                    transition: "background 0.15s, height 0.4s ease",
                  }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div style={{ height: 24, display: "flex", padding: "4px 2px 0", gap: data.length > 20 ? 1 : data.length > 12 ? 3 : 5 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
              {i % labelStep === 0 && (
                <span style={{ fontSize: 10, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {d.name}
                </span>
              )}
            </div>
          ))}
        </div>
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

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* KPI row */}
      <div className={styles.kpiGrid}>
        {[
          { title: "Total Revenue", value: analytics ? fmt(analytics.kpis.totalRevenue) : "...", icon: <DollarSign size={18} className={styles.kpiIcon} />, iconBg: "rgba(59,130,246,0.12)", change: "+12.5%" },
          { title: "Total Orders",  value: analytics ? String(analytics.kpis.totalOrders) : "...", icon: <ShoppingCart size={18} style={{ color: "#10b981" }} />, iconBg: "rgba(16,185,129,0.12)", change: "+8.2%" },
          { title: "Active Orders", value: analytics ? String(analytics.kpis.activeOrders) : "...", icon: <Package size={18} style={{ color: "#f5a623" }} />, iconBg: "rgba(245,166,35,0.12)", change: "+4.3%" },
        ].map((card, i) => (
          <div key={i} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>{card.title}</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: card.iconBg }}>{card.icon}</div>
            </div>
            <div className={styles.kpiValue}>{card.value}</div>
            <div className={`${styles.kpiChange} ${styles.trendUp}`}>
              <ArrowUpRight size={14} />{card.change} this month
            </div>
          </div>
        ))}
      </div>

      {/* Main content: chart left, sidebar right — both self-sized */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>

        {/* Chart card */}
        <div className={styles.chartCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} color="#3b82f6" />
              <h2 style={{ margin: 0, fontSize: "1rem" }}>Revenue Overview</h2>
            </div>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              style={{
                background: "var(--background-secondary, rgba(0,0,0,0.04))",
                border: "1px solid var(--border-color, rgba(0,0,0,0.1))",
                color: "var(--text-primary)",
                padding: "5px 12px",
                borderRadius: 7,
                outline: "none",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">This Year</option>
            </select>
          </div>

          {!analytics ? (
            <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-secondary)", fontSize: 13 }}>
              <span style={{ width: 16, height: 16, border: "2px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              Loading...
            </div>
          ) : (
            <BarChart data={analytics.chartData} />
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#3b82f6" }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Revenue (excl. cancelled)</span>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Recent Orders */}
          <div className={styles.activityCard}>
            <h2 style={{ marginBottom: 12 }}>Recent Orders</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {analytics?.recentOrders?.length ? analytics.recentOrders.map((o, i, arr) => {
                const color = STATUS_COLORS[o.status.toLowerCase()] || "#94a3b8";
                return (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border-color, rgba(0,0,0,0.07))" : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{o.id}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1 }}>{o.customer}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                      <span style={{ background: `${color}20`, color, border: `1px solid ${color}44`, padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                        {o.status}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{fmt(o.amount)}</span>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
                  {analytics ? "No orders yet" : "Loading..."}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock */}
          <div className={styles.activityCard}>
            <h2 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: "0.95rem" }}>
              <AlertTriangle size={15} /> Low Stock Alerts
            </h2>
            {analytics?.lowStock?.length ? analytics.lowStock.map((item, i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-color, rgba(0,0,0,0.07))" : "none",
              }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.name}</span>
                <span style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                  {item.qty} left
                </span>
              </div>
            )) : (
              <div style={{ padding: "12px 0", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
                {analytics ? "✓ All good!" : "Loading..."}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
