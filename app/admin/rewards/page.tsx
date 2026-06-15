"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";
import { Star, Gift, Users, TrendingUp, Coins } from "lucide-react";

interface RewardsConfig {
  purchases_multiplier: number;
  review_points: number;
  referral_points: number;
}

interface RewardsKPIs {
  total_issued: number;
  total_redeemed: number;
  active_members: number;
}

interface CustomerPoints {
  id: string;
  name: string;
  email: string;
  points_issued: number;
  points_redeemed: number;
  points_balance: number;
  status: string;
}

const avatarColors = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#6366f1",
];
const getAvatarColor = (str: string) => avatarColors[str.charCodeAt(0) % avatarColors.length];

export default function RewardsAdmin() {
  const [config, setConfig] = useState<RewardsConfig | null>(null);
  const [kpis, setKpis] = useState<RewardsKPIs | null>(null);
  const [customers, setCustomers] = useState<CustomerPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/rewards")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setConfig(data.config);
          setKpis(data.kpis);
          setCustomers(data.customers || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Rewards configuration saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Points & Rewards</h1>
        <p>Manage the Reddix Points loyalty program.</p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Points Issued</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: "rgba(245,158,11,0.1)" }}>
              <Star size={18} style={{ color: "#f59e0b" }} />
            </div>
          </div>
          <div className={styles.kpiValue}>{loading ? "..." : (kpis?.total_issued || 0).toLocaleString()}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Points Redeemed</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
              <Gift size={18} style={{ color: "#10b981" }} />
            </div>
          </div>
          <div className={styles.kpiValue}>{loading ? "..." : (kpis?.total_redeemed || 0).toLocaleString()}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Active Members</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: "rgba(59,130,246,0.1)" }}>
              <Users size={18} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <div className={styles.kpiValue}>{loading ? "..." : (kpis?.active_members || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* ── Customer Points Leaderboard ────────────────────────────── */}
      <div className={styles.activityCard} style={{ marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="#3b82f6" />
            <h2 style={{ margin: 0 }}>Customer Points Breakdown</h2>
            <span style={{
              background: "rgba(59,130,246,0.1)", color: "#3b82f6",
              padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            }}>{customers.length} members</span>
          </div>
          <input
            type="text"
            placeholder="Search customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 13,
              border: "1px solid var(--border-color, rgba(0,0,0,0.12))",
              background: "var(--background-secondary, rgba(0,0,0,0.04))",
              color: "var(--text-primary)", outline: "none", width: 220,
            }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>Loading...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color, rgba(0,0,0,0.1))" }}>
                  {["#", "Customer", "Points Earned", "Points Claimed", "Balance", "Status"].map((h, i) => (
                    <th key={i} style={{
                      padding: "10px 12px",
                      textAlign: i === 0 ? "center" : i >= 2 ? "right" : "left",
                      fontWeight: 600, fontSize: 11,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
                      No customers found
                    </td>
                  </tr>
                ) : filtered.map((c, i) => {
                  const pct = c.points_issued > 0 ? Math.round((c.points_redeemed / c.points_issued) * 100) : 0;
                  const balanceColor = c.points_balance > 0 ? "#10b981" : c.points_balance === 0 ? "var(--text-secondary)" : "#ef4444";
                  return (
                    <tr key={c.id} style={{
                      borderBottom: "1px solid var(--border-color, rgba(0,0,0,0.06))",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--background-secondary, rgba(0,0,0,0.03))")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* # */}
                      <td style={{ padding: "12px", textAlign: "center", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {i + 1}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: getAvatarColor(c.name),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
                          }}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{c.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Points Earned */}
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                          <span style={{ fontSize: 11, color: "#f59e0b" }}>★</span>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                            {c.points_issued.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Points Claimed */}
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <div>
                          <div style={{ fontWeight: 600, color: c.points_redeemed > 0 ? "#ef4444" : "var(--text-secondary)" }}>
                            {c.points_redeemed > 0 ? `-${c.points_redeemed.toLocaleString()}` : "0"}
                          </div>
                          {c.points_issued > 0 && (
                            <div style={{ marginTop: 4 }}>
                              <div style={{
                                height: 4, borderRadius: 2,
                                background: "var(--border-color, rgba(0,0,0,0.1))",
                                width: 80, marginLeft: "auto",
                              }}>
                                <div style={{
                                  height: "100%", borderRadius: 2,
                                  background: "#ef4444",
                                  width: `${pct}%`,
                                  transition: "width 0.5s",
                                }} />
                              </div>
                              <div style={{ fontSize: 10, color: "var(--text-secondary)", textAlign: "right", marginTop: 2 }}>
                                {pct}% used
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Balance */}
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <span style={{
                          fontWeight: 700, fontSize: 14,
                          color: balanceColor,
                        }}>
                          {c.points_balance.toLocaleString()} pts
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <span style={{
                          background: c.status === "Active" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                          color: c.status === "Active" ? "#10b981" : "#ef4444",
                          border: `1px solid ${c.status === "Active" ? "#10b98133" : "#ef444433"}`,
                          padding: "2px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 600,
                        }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer totals */}
              {filtered.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border-color, rgba(0,0,0,0.1))", background: "var(--background-secondary, rgba(0,0,0,0.03))" }}>
                    <td colSpan={2} style={{ padding: "12px", fontWeight: 700, color: "var(--text-primary)", fontSize: 12 }}>
                      TOTAL ({filtered.length} customers)
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: "#f59e0b" }}>
                      ★ {filtered.reduce((s, c) => s + c.points_issued, 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: "#ef4444" }}>
                      -{filtered.reduce((s, c) => s + c.points_redeemed, 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: "#10b981" }}>
                      {filtered.reduce((s, c) => s + c.points_balance, 0).toLocaleString()} pts
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* ── Reward Rules ──────────────────────────────────────────── */}
      <div className={styles.activityCard}>
        <h2 style={{ marginBottom: 16 }}>Reward Rules Configuration</h2>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center" }}>Loading config...</div>
        ) : !config ? (
          <div style={{ padding: 24, textAlign: "center" }}>Failed to load config</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Purchases", desc: "Points earned per ₹100 spent", key: "purchases_multiplier" as const },
              { label: "Product Reviews", desc: "Points awarded for leaving a review", key: "review_points" as const },
              { label: "Referrals", desc: "Points awarded for a successful referral", key: "referral_points" as const },
            ].map(row => (
              <div key={row.key} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 16px",
                background: "var(--background-secondary, rgba(0,0,0,0.03))",
                borderRadius: 8,
                border: "1px solid var(--border-color, rgba(0,0,0,0.08))",
              }}>
                <div>
                  <h4 style={{ color: "var(--text-primary)", marginBottom: 2, fontWeight: 600 }}>{row.label}</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>{row.desc}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    value={config[row.key]}
                    onChange={e => setConfig({ ...config, [row.key]: Number(e.target.value) })}
                    style={{
                      width: 70, padding: "8px", textAlign: "center",
                      background: "var(--background-primary, #fff)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color, rgba(0,0,0,0.12))",
                      borderRadius: 6, fontWeight: 700, fontSize: 15,
                    }}
                  />
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>points</span>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 28px",
                  background: "#3b82f6", color: "#fff",
                  border: "none", borderRadius: 8,
                  fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1, fontSize: 14,
                }}
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
