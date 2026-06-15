"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, Search, MoreHorizontal, ShoppingCart, Truck, Clock, XCircle, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./orders.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  id: string;
  date: string;
  customer: { name: string; email: string };
  total: number;
  status: string;
  items: any[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", processing: "#3b82f6", shipped: "#8b5cf6", 
  delivered: "#10b981", cancelled: "#ef4444", rto: "#ef4444", restocked: "#6b7280"
};

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();
  
  // Action Menu
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Orders");

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
      
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionMenuOpen(null);
    const oldOrder = orders.find(o => o.id === id);
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (e) {
      alert("Error updating status");
      if (oldOrder) setOrders(orders.map(o => o.id === id ? { ...o, status: oldOrder.status } : o));
    }
  };

  // KPIs
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ["Pending", "Processing"].includes(o.status)).length;
  const totalRevenue = orders.filter(o => !["Cancelled", "RTO", "Restocked"].includes(o.status)).reduce((sum, o) => sum + o.total, 0);

  // Filter & Search
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "All Orders" || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>Manage and track customer orders.</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
        <div className={styles.tableCard} style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: 16, borderRadius: 12 }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Total Orders</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{loading ? "..." : totalOrders}</div>
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", padding: 16, borderRadius: 12 }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Pending / Processing</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{loading ? "..." : pendingOrders}</div>
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: 16, borderRadius: 12 }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Net Revenue</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{loading || currencyLoading ? "..." : formatCurrency(totalRevenue)}</div>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search by Order ID, customer name or email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.toolbarFilters}>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All Orders">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Grid Layout */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: 900 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "110px 100px 1fr 120px 120px 90px",
              gap: 16, padding: "16px 24px",
              borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))",
              background: "rgba(0,0,0,0.02)",
              fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              <div>Order ID</div>
              <div>Date</div>
              <div>Customer</div>
              <div>Status</div>
              <div style={{ textAlign: "right" }}>Total</div>
              <div style={{ textAlign: "right" }}>Actions</div>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                No orders found matching your criteria.
              </div>
            ) : filteredOrders.map(order => {
              const statColor = STATUS_COLORS[order.status.toLowerCase()] || "#9ca3af";
              const initials = order.customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              
              return (
                <div key={order.id} style={{
                  display: "grid",
                  gridTemplateColumns: "110px 100px 1fr 120px 120px 90px",
                  gap: 16, padding: "16px 24px",
                  borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))",
                  alignItems: "center", fontSize: 13,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-blue)" }}>
                    {order.id}
                  </div>
                  
                  <div style={{ color: "var(--text-secondary)" }}>
                    {new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      width: 36, height: 36, borderRadius: "50%", 
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{order.customer.name}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{order.customer.email}</div>
                    </div>
                  </div>

                  <div>
                    <span style={{
                      background: `${statColor}20`, color: statColor, border: `1px solid ${statColor}44`,
                      padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700
                    }}>{order.status}</span>
                  </div>

                  <div style={{ fontWeight: 600, color: "var(--text-primary)", textAlign: "right" }}>
                    {!currencyLoading ? formatCurrency(order.total) : "..."}
                  </div>

                  <div className={styles.actionMenuContainer} ref={actionMenuOpen === order.id ? menuRef : null}>
                    <button 
                      className={styles.actionMenuBtn}
                      onClick={() => setActionMenuOpen(actionMenuOpen === order.id ? null : order.id)}
                    >
                      Manage <MoreHorizontal size={14} />
                    </button>
                    {actionMenuOpen === order.id && (
                      <div className={styles.dropdownMenu}>
                        <button className={styles.dropdownItem} onClick={() => router.push(`/admin/orders/${order.id}`)}>
                          <Eye size={14} /> View Details
                        </button>
                        {["Pending", "Processing"].includes(order.status) && (
                          <button className={`${styles.dropdownItem} ${styles.success}`} onClick={() => handleStatusChange(order.id, "Shipped")}>
                            <Truck size={14} /> Mark Shipped
                          </button>
                        )}
                        {["Pending", "Processing"].includes(order.status) && (
                          <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => handleStatusChange(order.id, "Cancelled")}>
                            <XCircle size={14} /> Cancel Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
