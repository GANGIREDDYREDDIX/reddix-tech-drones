"use client";

import { useState, useEffect, useRef } from "react";
import {
  DollarSign, ShoppingCart, Package,
  ArrowUpRight, TrendingUp, AlertTriangle
} from "lucide-react";
import styles from "./dashboard.module.css";
import { useCurrency } from "@/context/CurrencyContext";

// ─── Compact formatter ───────────────────────────────────────────────────────
const compact = (val: number) => {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000)   return `₹${(val / 100_000).toFixed(1)}L`;
  if (val >= 1_000)     return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
};

// ─── Pure CSS/HTML Bar Chart (theme-aware) ───────────────────────────────────
function BarChart({ data }: { data: { name: string; revenue: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { formatCurrency } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)" }}>
        No data for this period
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.revenue), 1);
  const yTicks = [1, 0.75, 0.5, 0.25, 0];

  // Show every Nth x-label to avoid crowding
  const labelStep = data.length <= 8 ? 1 : data.length <= 16 ? 2 : Math.ceil(data.length / 6);

  return (
    <div style={{ display: "flex", height: 300, gap: 0 }}>
      {/* Y-Axis */}
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        paddingBottom: 24, width: 48, flexShrink: 0, textAlign: "right",
      }}>
        {yTicks.map((f, i) => (
          <span key={i} style={{
            fontSize: 11, color: "var(--text-secondary)",
            lineHeight: 1, paddingRight: 10,
          }}>
            {compact(maxVal * f)}
          </span>
        ))}
      </div>

      {/* Chart area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Grid + bars */}
        <div style={{ flex: 1, position: "relative", borderLeft: "1px solid var(--border-color, rgba(128,128,128,0.2))" }}>
          {/* Horizontal grid lines */}
          {yTicks.map((f, i) => (
            <div key={i} style={{
              position: "absolute", top: `${(1 - f) * 100}%`, left: 0, right: 0,
              borderTop: i === yTicks.length - 1
                ? "1px solid var(--border-color, rgba(128,128,128,0.3))"
                : "1px dashed var(--border-color, rgba(128,128,128,0.15))",
            }} />
          ))}

          {/* Bars row */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "flex-end",
            paddingBottom: 0, gap: data.length > 20 ? 2 : 4, padding: "0 4px",
          }}>
            {data.map((d, i) => {
              const pct = maxVal > 0 ? (d.revenue / maxVal) * 100 : 0;
              const isHovered = hoveredIndex === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "flex-end",
                    height: "100%", position: "relative", cursor: "pointer",
                  }}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div style={{
                      position: "absolute",
                      bottom: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--background-secondary, #1e293b)",
                      border: "1px solid rgba(128,128,128,0.2)",
                      borderRadius: 8,
                      padding: "6px 10px",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      marginBottom: 6,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}>
                      <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 2 }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6" }}>
                        {formatCurrency(d.revenue)}
                      </div>
                    </div>
                  )}

                  {/* Bar */}
                  <div style={{
                    width: "85%",
                    minWidth: 4,
                    height: `${Math.max(pct > 0 ? pct : 0, pct > 0 ? 1 : 0)}%`,
                    minHeight: pct > 0 ? 4 : 0,
                    background: pct > 0
                      ? isHovered
                        ? "linear-gradient(to top, #1d4ed8, #60a5fa)"
                        : "linear-gradient(to top, #2563eb, #3b82f6)"
                      : "var(--border-color, rgba(128,128,128,0.1))",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.5s cubic-bezier(0.4,0,0.2,1), background 0.15s",
                  }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis labels */}
        <div style={{
          display: "flex", height: 24, paddingLeft: 4, paddingRight: 4, gap: data.length > 20 ? 2 : 4,
          marginTop: 8
        }}>
          {data.map((d, i) => (
            <div key={i} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: "var(--text-secondary)",
              whiteSpace: "nowrap",
            }}>
              {i % labelStep === 0 ? d.name : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Status colors ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  delivered:  "#10b981",
  pending:    "#f59e0b",
  processing: "#3b82f6",
  shipped:    "#6366f1",
  cancelled:  "#ef4444",
  restocked:  "#8b5cf6",
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
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

  const currFmt = (v: number) => (loading ? "..." : formatCurrency(v));

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {[
          {
            title: "Total Revenue",
            value: analytics ? currFmt(analytics.kpis.totalRevenue) : "...",
            icon: <DollarSign size={18} className={styles.kpiIcon} />,
            iconBg: "rgba(59,130,246,0.15)",
            change: "+12.5%",
          },
          {
            title: "Total Orders",
            value: analytics ? String(analytics.kpis.totalOrders) : "...",
            icon: <ShoppingCart size={18} style={{ color: "#10b981" }} />,
            iconBg: "rgba(16,185,129,0.1)",
            change: "+8.2%",
          },
          {
            title: "Active Orders",
            value: analytics ? String(analytics.kpis.activeOrders) : "...",
            icon: <Package size={18} style={{ color: "#f5a623" }} />,
            iconBg: "rgba(245,166,35,0.1)",
            change: "+4.3%",
          },
        ].map((card, i) => (
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

      {/* Chart + Sidebar */}
      <div className={styles.dashboardContent}>
        {/* Revenue Chart */}
        <div className={styles.chartCard} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TrendingUp size={18} color="#3b82f6" />
              <h2 style={{ margin: 0 }}>Revenue Overview</h2>
            </div>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              style={{
                background: "var(--background-secondary, rgba(128,128,128,0.1))",
                border: "1px solid var(--border-color, rgba(128,128,128,0.2))",
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
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 300, color: "var(--text-secondary)", gap: 10, fontSize: 14,
            }}>
              <span style={{
                width: 18, height: 18, border: "2px solid #3b82f6",
                borderTopColor: "transparent", borderRadius: "50%",
                display: "inline-block", animation: "spin 0.8s linear infinite",
              }} />
              Loading chart...
            </div>
          ) : (
            <BarChart data={analytics.chartData} />
          )}

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "linear-gradient(#3b82f6,#1d4ed8)" }} />
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Revenue (non-cancelled orders)</span>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Recent Orders */}
          <div className={styles.activityCard}>
            <h2>Recent Orders</h2>
            <div className={styles.activityList}>
              {analytics?.recentOrders?.length ? (
                analytics.recentOrders.map((order, i) => {
                  const statusKey = order.status.toLowerCase();
                  const statusColor = STATUS_COLORS[statusKey] || "#94a3b8";
                  return (
                    <div key={i} className={styles.activityItem}>
                      <div className={styles.activityInfo}>
                        <span className={styles.orderId}>{order.id}</span>
                        <span className={styles.orderCustomer}>{order.customer}</span>
                      </div>
                      <div className={styles.activityMeta}>
                        <span style={{
                          background: `${statusColor}22`,
                          color: statusColor,
                          border: `1px solid ${statusColor}44`,
                          padding: "2px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                        }}>{order.status}</span>
                        <span className={styles.orderAmount}>{currFmt(order.amount)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)" }}>
                  {analytics ? "No recent orders" : "Loading..."}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock */}
          <div className={styles.activityCard}>
            <h2 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={18} /> Low Stock Alerts
            </h2>
            <div className={styles.activityList}>
              {analytics?.lowStock?.length ? (
                analytics.lowStock.map((item, i, arr) => (
                  <div key={i} className={styles.activityItem}
                    style={{ padding: "12px 0", borderBottom: i === arr.length - 1 ? "none" : "" }}>
                    <div className={styles.activityInfo}>
                      <span className={styles.orderCustomer}>{item.name}</span>
                    </div>
                    <span style={{
                      background: "rgba(239,68,68,0.1)", color: "#ef4444",
                      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    }}>
                      {item.qty} left
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)" }}>
                  {analytics ? "✓ Inventory looking good!" : "Loading..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
