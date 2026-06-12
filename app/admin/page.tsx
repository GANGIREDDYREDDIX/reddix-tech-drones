"use client";

import { useState, useEffect, useRef } from "react";
import {
  DollarSign, ShoppingCart, Package,
  ArrowUpRight, TrendingUp, AlertTriangle
} from "lucide-react";
import styles from "./dashboard.module.css";
import { useCurrency } from "@/context/CurrencyContext";

// ─── Helpers ────────────────────────────────────────────────────────────────
const compact = (val: number) => {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)}L`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
};

// ─── Custom SVG Bar Chart ─────────────────────────────────────────────────────
function BarChart({ data }: { data: { name: string; revenue: number }[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const { formatCurrency } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)" }}>
        No data for this period
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.revenue), 1);
  const W = 700, H = 260, PAD_L = 64, PAD_R = 16, PAD_T = 16, PAD_B = 48;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const barW = Math.max(8, Math.min(36, (chartW / data.length) * 0.55));
  const gap = chartW / data.length;

  // Y-axis ticks: 5 nice levels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => maxVal * f);

  // Only show every Nth label on X to avoid crowding
  const labelStep = data.length <= 8 ? 1 : data.length <= 16 ? 2 : data.length <= 31 ? 4 : 1;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "100%", overflow: "visible" }}
      onMouseLeave={() => setTooltip(null)}
    >
      {/* Y-axis grid lines & labels */}
      {yTicks.map((tick, i) => {
        const cy = PAD_T + chartH - (tick / maxVal) * chartH;
        return (
          <g key={i}>
            <line
              x1={PAD_L} y1={cy} x2={PAD_L + chartW} y2={cy}
              stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4"
            />
            <text x={PAD_L - 8} y={cy + 4} textAnchor="end"
              fill="rgba(255,255,255,0.4)" fontSize={10}>
              {compact(tick)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = Math.max(2, (d.revenue / maxVal) * chartH);
        const bx = PAD_L + i * gap + gap / 2 - barW / 2;
        const by = PAD_T + chartH - barH;

        return (
          <g key={i}
            onMouseEnter={(e) => {
              const rect = svgRef.current?.getBoundingClientRect();
              if (!rect) return;
              setTooltip({ x: bx + barW / 2, y: by, label: d.name, value: d.revenue });
            }}
            style={{ cursor: "pointer" }}
          >
            {/* Hover hit area */}
            <rect
              x={PAD_L + i * gap} y={PAD_T}
              width={gap} height={chartH}
              fill="transparent"
            />
            {/* Bar */}
            <rect
              x={bx} y={by}
              width={barW} height={barH}
              rx={4} ry={4}
              fill={d.revenue > 0 ? "url(#barGrad)" : "rgba(255,255,255,0.08)"}
            />
            {/* X label */}
            {i % labelStep === 0 && (
              <text
                x={bx + barW / 2} y={H - 6}
                textAnchor="middle"
                fill="rgba(255,255,255,0.45)" fontSize={9}
              >
                {d.name}
              </text>
            )}
          </g>
        );
      })}

      {/* Gradient def */}
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
        </linearGradient>
      </defs>

      {/* Tooltip */}
      {tooltip && (() => {
        const TW = 140, TH = 48;
        const tx = Math.min(tooltip.x - TW / 2, W - TW - PAD_R);
        const ty = Math.max(PAD_T, tooltip.y - TH - 8);
        return (
          <g>
            <rect x={tx} y={ty} width={TW} height={TH} rx={8} fill="#1e293b" stroke="rgba(255,255,255,0.15)" />
            <text x={tx + 8} y={ty + 16} fill="rgba(255,255,255,0.6)" fontSize={10}>{tooltip.label}</text>
            <text x={tx + 8} y={ty + 34} fill="#60a5fa" fontSize={13} fontWeight="bold">
              {formatCurrency(tooltip.value)}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ─── Status color map ────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  delivered: "#10b981",
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#6366f1",
  cancelled: "#ef4444",
  restocked: "#8b5cf6",
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
    setAnalytics(null); // show loading state when range changes
    fetch(`/api/analytics?range=${timeRange}`)
      .then(r => r.json())
      .then(setAnalytics)
      .catch(console.error);
  }, [timeRange]);

  const compactFmt = (v: number) => (loading ? "..." : compact(v));
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
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--text-primary)",
                padding: "6px 14px",
                borderRadius: 8,
                outline: "none",
                cursor: "pointer",
                fontSize: 13
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">This Year</option>
            </select>
          </div>

          <div style={{ flex: 1, minHeight: 280, position: "relative" }}>
            {!analytics ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%", color: "var(--text-secondary)", gap: 10
              }}>
                <span style={{
                  width: 18, height: 18, border: "2px solid #3b82f6",
                  borderTopColor: "transparent", borderRadius: "50%",
                  display: "inline-block", animation: "spin 0.8s linear infinite"
                }} />
                Loading chart...
              </div>
            ) : (
              <BarChart data={analytics.chartData} />
            )}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
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
                          fontWeight: 600
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

          {/* Low Stock Alerts */}
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
                      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600
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
