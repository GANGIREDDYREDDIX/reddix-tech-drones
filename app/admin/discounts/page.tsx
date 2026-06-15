"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, ChevronDown, ChevronUp, Users, Tag, Calendar, TrendingUp, Search, MoreHorizontal, Ban, Clock } from "lucide-react";
import styles from "./discounts.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Claimer {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  orderTotal: number;
  orderStatus: string;
  discountAmount: number;
}

interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  status: string;
  usageCount: number;
  expiry: string;
  claimers: Claimer[];
  realUsageCount: number;
}

const STATUS_COLORS: Record<string, string> = {
  delivered: "#10b981", pending: "#f59e0b", processing: "#3b82f6",
  shipped: "#6366f1", cancelled: "#ef4444", restocked: "#8b5cf6",
};



export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Codes");
  const [formData, setFormData] = useState({
    code: "", type: "percentage", value: 10,
    expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 16),
  });

  const closeMenu = () => setMenuOpenId(null);

  const fetchDiscounts = async () => {
    try {
      const res = await fetch("/api/discounts");
      const data = await res.json();
      setDiscounts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const handleDelete = async (id: string) => {
    setMenuOpenId(null);
    if (!confirm("Are you sure you want to delete this discount code?")) return;
    setProcessingId(id);
    await fetch(`/api/discounts/${id}`, { method: "DELETE" });
    fetchDiscounts();
    setProcessingId(null);
  };

  const handleExpire = async (id: string) => {
    setMenuOpenId(null);
    if (!confirm("Are you sure you want to instantly expire this code?")) return;
    setProcessingId(id);
    await fetch(`/api/discounts/${id}`, { 
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiry: new Date().toISOString(), status: "Expired" })
    });
    fetchDiscounts();
    setProcessingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        expiry: new Date(formData.expiry).toISOString(),
      };
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ code: "", type: "percentage", value: 10, expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 16) });
        fetchDiscounts();
      }
    } catch (e) { console.error(e); }
  };

  const isExpired = (expiry: string) => new Date(expiry) < new Date();

  const totalSavings = discounts.reduce((sum, d) =>
    sum + d.claimers.reduce((s, c) => s + (c.discountAmount || 0), 0), 0);

  const filteredDiscounts = discounts.filter(d => {
    const searchMatch = d.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    let statusMatch = true;
    const expired = isExpired(d.expiry);
    const effectiveStatus = expired ? "Expired" : d.status;
    
    if (statusFilter === "Active") statusMatch = effectiveStatus === "Active";
    else if (statusFilter === "Expired") statusMatch = effectiveStatus === "Expired";

    return searchMatch && statusMatch;
  });

  return (
    <div className={styles.container} onClick={closeMenu}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Discounts</h1>
          <p className={styles.subtitle}>Manage promotional codes and track who claimed them.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Create Code
        </button>
      </div>

      {/* Summary KPIs */}
      {!loading && discounts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Active Codes", value: discounts.filter(d => d.status === "Active" && !isExpired(d.expiry)).length, icon: <Tag size={16} color="#3b82f6" />, color: "#3b82f6" },
            { label: "Total Claims", value: discounts.reduce((s, d) => s + d.realUsageCount, 0), icon: <Users size={16} color="#10b981" />, color: "#10b981" },
            { label: "Total Savings Given", value: !currencyLoading ? formatCurrency(totalSavings) : "...", icon: <TrendingUp size={16} color="#f59e0b" />, color: "#f59e0b", isText: true },
          ].map((kpi, i) => (
            <div key={i} style={{
              background: "var(--background-primary)",
              border: "1px solid var(--border-color, rgba(0,0,0,0.08))",
              borderRadius: 12, padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {kpi.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 2 }}>{kpi.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{kpi.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discounts Table */}
      <div className={styles.tableCard} style={{ padding: 0, overflow: "visible" }}>
        
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search by discount code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.toolbarFilters}>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Codes">All Codes</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Table Header - FIXED */}
        {!loading && filteredDiscounts.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "180px 100px 130px 100px 70px 140px 1fr",
            gap: 12, padding: "16px 20px",
            borderBottom: "1px solid var(--border-color, rgba(0,0,0,0.08))",
            background: "var(--background-secondary, rgba(0,0,0,0.02))",
          }}>
            {["Discount Code", "Type", "Value", "Status", "Uses", "Expiry", ""].map((h, i) => (
              <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 6 ? "right" : "left" }}>{h}</div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)" }}>Loading discounts...</div>
        ) : filteredDiscounts.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)" }}>
            <Tag size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
            <p>No discount codes found.</p>
          </div>
        ) : (
          filteredDiscounts.map(discount => {
            const expired = isExpired(discount.expiry);
            const expanded = expandedId === discount.id;
            const effectiveStatus = expired ? "Expired" : discount.status;

            return (
              <div key={discount.id} style={{ borderBottom: "1px solid var(--border-color, rgba(0,0,0,0.08))" }}>
                {/* Main row */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "180px 100px 130px 100px 70px 140px 1fr",
                  gap: 12, padding: "16px 20px", alignItems: "center",
                  background: expanded ? "var(--background-secondary, rgba(0,0,0,0.02))" : "transparent",
                  transition: "background 0.15s",
                }}>
                  {/* Code */}
                  <div>
                    <span style={{
                      fontFamily: "monospace", fontWeight: 700, fontSize: 14,
                      letterSpacing: "0.08em",
                      background: "rgba(59,130,246,0.1)", color: "#3b82f6",
                      border: "1px solid rgba(59,130,246,0.3)",
                      padding: "3px 10px", borderRadius: 6,
                    }}>{discount.code}</span>
                  </div>

                  {/* Type */}
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>{discount.type}</div>

                  {/* Value */}
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    {discount.type === "percentage" ? `${discount.value}%` : (!currencyLoading ? formatCurrency(discount.value) : "...")}
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      background: effectiveStatus === "Active" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)",
                      color: effectiveStatus === "Active" ? "#10b981" : "#6b7280",
                      border: `1px solid ${effectiveStatus === "Active" ? "#10b98133" : "#6b728033"}`,
                      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    }}>{effectiveStatus}</span>
                  </div>

                  {/* Usage */}
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: 700, color: discount.realUsageCount > 0 ? "#3b82f6" : "var(--text-secondary)" }}>
                      {discount.realUsageCount}
                    </span>
                  </div>

                  {/* Expiry */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: expired ? "#ef4444" : "var(--text-secondary)" }}>
                    <Calendar size={12} />
                    {new Date(discount.expiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
                    {/* Removed realUsageCount > 0 condition so button is always visible */}
                    <button
                      onClick={() => setExpandedId(expanded ? null : discount.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 6,
                        background: "rgba(59,130,246,0.1)", color: "#3b82f6",
                        border: "1px solid rgba(59,130,246,0.2)",
                        cursor: "pointer", fontSize: 12, fontWeight: 600,
                      }}
                    >
                      <Users size={13} />
                      {discount.realUsageCount} claimer{discount.realUsageCount !== 1 ? "s" : ""}
                      {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    
                    {processingId === discount.id ? (
                      <span className={styles.loadingCell}>...</span>
                    ) : (
                      <div className={styles.actionMenuContainer} onClick={e => e.stopPropagation()}>
                        <button 
                          className={styles.actionMenuBtn}
                          onClick={() => setMenuOpenId(menuOpenId === discount.id ? null : discount.id)}
                        >
                          Manage <MoreHorizontal size={14} />
                        </button>
                        
                        {menuOpenId === discount.id && (
                          <div className={styles.dropdownMenu}>
                            {!expired && (
                              <button className={styles.dropdownItem} onClick={() => handleExpire(discount.id)}>
                                <Ban size={14} /> Expire Now
                              </button>
                            )}
                            <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => handleDelete(discount.id)}>
                              <Trash2 size={14} /> Delete Record
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded claimers panel */}
                {expanded && (
                  <div style={{ background: "var(--background-secondary, rgba(0,0,0,0.02))", borderTop: "1px solid var(--border-color, rgba(0,0,0,0.06))", padding: "16px 24px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={14} /> Claim History
                    </h4>
                    
                    {discount.claimers.length === 0 ? (
                      <div style={{ padding: 16, textAlign: "center", color: "var(--text-secondary)", fontSize: 13, background: "rgba(0,0,0,0.02)", borderRadius: 8, border: "1px dashed var(--border-color, rgba(0,0,0,0.1))" }}>
                        No one has claimed this discount code yet.
                      </div>
                    ) : (
                      <div style={{ background: "var(--background-primary)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color, rgba(0,0,0,0.08))" }}>
                      {/* Column headers */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 180px 110px 90px 80px",
                        gap: 12, padding: "10px 16px",
                        borderBottom: "1px solid var(--border-color, rgba(0,0,0,0.06))",
                        fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", background: "rgba(0,0,0,0.02)"
                      }}>
                        {["Customer", "Order Date", "Order Total", "Discount", "Status"].map((h, i) => (
                          <div key={i}>{h}</div>
                        ))}
                      </div>
                      
                      {/* Rows */}
                      {discount.claimers.map((c, i) => {
                        const color = STATUS_COLORS[c.orderStatus.toLowerCase()] || "#94a3b8";
                        return (
                          <div key={i} style={{
                            display: "grid", gridTemplateColumns: "1fr 180px 110px 90px 80px", gap: 12, padding: "12px 16px",
                            borderBottom: "1px solid var(--border-color, rgba(0,0,0,0.04))", fontSize: 12, alignItems: "center"
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.customerName}</div>
                              <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>{c.customerEmail}</div>
                            </div>
                            <div style={{ color: "var(--text-secondary)" }}>
                              {new Date(c.orderDate).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{!currencyLoading ? formatCurrency(c.orderTotal) : "..."}</div>
                            <div style={{ color: "#10b981", fontWeight: 700 }}>-{!currencyLoading ? formatCurrency(c.discountAmount) : "..."}</div>
                            <div>
                              <span style={{ background: `${color}20`, color, border: `1px solid ${color}44`, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{c.orderStatus}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Totals Footer */}
                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 180px 110px 90px 80px", gap: 12, padding: "10px 16px",
                        background: "rgba(0,0,0,0.02)", borderTop: "1px solid var(--border-color, rgba(0,0,0,0.08))"
                      }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-secondary)" }}>TOTAL ({discount.claimers.length} orders)</div>
                        <div />
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{!currencyLoading ? formatCurrency(discount.claimers.reduce((s, c) => s + c.orderTotal, 0)) : "..."}</div>
                        <div style={{ fontWeight: 700, color: "#10b981" }}>-{!currencyLoading ? formatCurrency(discount.claimers.reduce((s, c) => s + (c.discountAmount || 0), 0)) : "..."}</div>
                        <div />
                      </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create Discount Code</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Promo Code (e.g. SUMMER20)</label>
                <input
                  type="text" required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="CODE"
                  style={{ textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "0.08em" }}
                />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Discount Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Discount Value</label>
                  <input type="number" required min={1}
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                <div className={styles.formGroup}>
                  <label>Expiry Date</label>
                  <input type="datetime-local" required
                    value={formData.expiry}
                    onChange={e => setFormData({ ...formData, expiry: e.target.value })} />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Create Code</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
