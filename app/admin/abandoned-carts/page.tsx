"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle2, Search, MoreHorizontal, Trash2 } from "lucide-react";
import styles from "./carts.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Cart {
  id: string;
  customer_name: string;
  email: string;
  value: number;
  items_count: number;
  time_abandoned: string;
  status: "Pending" | "Email Sent" | "Recovered";
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Carts");

  const fetchCarts = () => {
    fetch(`/api/abandoned-carts?t=${Date.now()}`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error("API returned error:", data.error);
          setCarts([]);
        } else {
          setCarts(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  // Filter and Sort Logic
  const filteredCarts = [...carts]
    .filter(c => {
      const searchMatch = 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
        
      let statusMatch = true;
      if (statusFilter !== "All Carts") statusMatch = c.status === statusFilter;
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => new Date(b.time_abandoned).getTime() - new Date(a.time_abandoned).getTime());

  const handleAction = async (id: string, action: string) => {
    setMenuOpenId(null);
    setProcessingId(id);
    try {
      if (action === "Delete") {
        if (!confirm("Are you sure you want to permanently delete this cart record?")) return;
        const res = await fetch(`/api/abandoned-carts/${id}`, { method: "DELETE" });
        if (res.ok) fetchCarts();
        return;
      }

      let payload: any = {};
      if (action === "Send Email") payload = { status: "Email Sent" };
      else if (action === "Recovered") payload = { status: "Recovered" };

      const res = await fetch(`/api/abandoned-carts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchCarts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const closeMenu = () => setMenuOpenId(null);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className={styles.container} onClick={closeMenu}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Abandoned Carts</h1>
          <p className={styles.subtitle}>Recover lost sales by sending targeted discount emails.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search carts by ID, name, or email..." 
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
              <option value="All Carts">All Carts</option>
              <option value="Pending">Pending</option>
              <option value="Email Sent">Email Sent</option>
              <option value="Recovered">Recovered</option>
            </select>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cart ID</th>
              <th>Customer</th>
              <th>Abandoned On</th>
              <th>Items Left Behind</th>
              <th className={styles.textRight}>Value</th>
              <th>Status</th>
              <th className={styles.textRight}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>Loading abandoned carts...</td></tr>
            ) : filteredCarts.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>No abandoned carts found</td></tr>
            ) : filteredCarts.map(cart => (
              <tr key={cart.id}>
                <td style={{ fontWeight: 600 }}>{cart.id}</td>
                <td>
                  <div className={styles.customerName}>{cart.customer_name}</div>
                  <div className={styles.customerEmail}>{cart.email}</div>
                </td>
                <td>{formatDate(cart.time_abandoned)}</td>
                <td>{cart.items_count} items</td>
                <td className={styles.textRight}>{formatCurrency(cart.value)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${
                    cart.status === "Recovered" ? styles.badgeRecovered :
                    cart.status === "Email Sent" ? styles.badgeSent : styles.badgePending
                  }`}>
                    {cart.status}
                  </span>
                </td>
                <td className={styles.textRight}>
                  {processingId === cart.id ? (
                    <span className={styles.loadingCell}>Processing...</span>
                  ) : (
                    <div className={styles.actionMenuContainer} onClick={e => e.stopPropagation()}>
                      <button 
                        className={styles.actionMenuBtn}
                        onClick={() => setMenuOpenId(menuOpenId === cart.id ? null : cart.id)}
                      >
                        Manage <MoreHorizontal size={14} />
                      </button>
                      
                      {menuOpenId === cart.id && (
                        <div className={styles.dropdownMenu}>
                          {cart.status === "Pending" && (
                            <button className={styles.dropdownItem} onClick={() => handleAction(cart.id, "Send Email")}>
                              <Mail size={14} /> Send Email
                            </button>
                          )}
                          
                          {cart.status !== "Recovered" && (
                            <button className={styles.dropdownItem} onClick={() => handleAction(cart.id, "Recovered")}>
                              <CheckCircle2 size={14} /> Mark as Recovered
                            </button>
                          )}
                          
                          <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => handleAction(cart.id, "Delete")}>
                            <Trash2 size={14} /> Delete Record
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
