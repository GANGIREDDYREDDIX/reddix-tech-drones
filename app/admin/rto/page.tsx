"use client";

import { useState, useEffect } from "react";
import { PackageOpen, CheckCircle, Search, MoreHorizontal, RotateCcw, FileText, Trash2, Ban, CreditCard } from "lucide-react";
import Link from "next/link";
import styles from "./rto.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  id: string;
  date: string;
  customer: { name: string; email: string };
  total: number;
  status: string;
}

export default function AdminRTO() {
  const [rtoOrders, setRtoOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Pending, Processed

  const fetchRTOs = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      // Filter for orders that are RTO or previously processed returns
      const returned = data.filter((o: Order) => 
        o.status === "RTO" || 
        o.status === "Restocked" || 
        o.status === "Refunded" || 
        o.status === "Damaged"
      );
      setRtoOrders(returned);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRTOs();
  }, []);

  // Filter and Sort Logic
  const processedRTOs = [...rtoOrders]
    .filter(o => {
      const searchMatch = 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
        
      let statusMatch = true;
      if (statusFilter === "Pending") statusMatch = o.status === "RTO";
      if (statusFilter === "Processed") statusMatch = ["Restocked", "Refunded", "Damaged"].includes(o.status);
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAction = async (id: string, action: string) => {
    setMenuOpenId(null);
    if (action !== "Notes" && action !== "Delete") setProcessingId(id);
    
    try {
      if (action === "Delete") {
        if (!confirm("Are you sure you want to permanently delete this return record?")) return;
        setProcessingId(id);
        const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
        if (res.ok) fetchRTOs();
        return;
      }

      let payload: any = {};
      
      if (action === "Restocked") payload = { status: "Restocked" };
      else if (action === "Refunded") payload = { status: "Refunded" };
      else if (action === "Damaged") payload = { status: "Damaged" };
      else if (action === "Undo") payload = { status: "RTO", undoRestock: true };
      else if (action === "Notes") {
        const note = prompt("Enter notes for this return:");
        if (note === null) return; // User cancelled
        setProcessingId(id);
        payload = { notes: note };
      }

      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchRTOs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  // Close menu if clicked outside (simple hack: close on container click)
  const closeMenu = () => setMenuOpenId(null);

  return (
    <div className={styles.container} onClick={closeMenu}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Returns (RTO)</h1>
          <p className={styles.subtitle}>Manage failed deliveries and process returned stock.</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search by order ID or customer..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.toolbarFilters}>
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Returns</option>
            <option value="Pending">Pending Return</option>
            <option value="Processed">Processed (Restocked)</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Return Date</th>
              <th className={styles.textRight}>Value</th>
              <th>Status</th>
              <th className={styles.textRight}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.loadingCell}>Loading returns...</td></tr>
            ) : processedRTOs.length === 0 ? (
              <tr><td colSpan={6} className={styles.loadingCell}>No returns found matching criteria.</td></tr>
            ) : processedRTOs.map(order => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/orders/${order.id}`} className={styles.orderId}>
                    {order.id}
                  </Link>
                </td>
                <td>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{order.customer.name}</span>
                    <span className={styles.customerEmail}>{order.customer.email}</span>
                  </div>
                </td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td className={styles.textRight}>{!currencyLoading ? formatCurrency(order.total) : "..."}</td>
                <td>
                  {order.status === "RTO" ? (
                    <span className={`${styles.statusBadge} ${styles.badgeReturned}`}>
                      Pending Return
                    </span>
                  ) : order.status === "Damaged" ? (
                    <span className={`${styles.statusBadge} ${styles.dangerBadge || styles.badgeReturned}`}>
                      Damaged
                    </span>
                  ) : order.status === "Refunded" ? (
                    <span className={`${styles.statusBadge} ${styles.badgeRestocked}`}>
                      Refunded
                    </span>
                  ) : (
                    <span className={`${styles.statusBadge} ${styles.badgeRestocked}`}>
                      Processed
                    </span>
                  )}
                </td>
                <td className={styles.textRight}>
                  {processingId === order.id ? (
                    <span className={styles.loadingCell}>Processing...</span>
                  ) : (
                    <div className={styles.actionMenuContainer} onClick={e => e.stopPropagation()}>
                      <button 
                        className={styles.actionMenuBtn}
                        onClick={() => setMenuOpenId(menuOpenId === order.id ? null : order.id)}
                      >
                        Manage <MoreHorizontal size={14} />
                      </button>
                      
                      {menuOpenId === order.id && (
                        <div className={styles.dropdownMenu}>
                          {order.status !== "Restocked" && order.status !== "Damaged" && order.status !== "Refunded" && (
                            <>
                              <button className={styles.dropdownItem} onClick={() => handleAction(order.id, "Restocked")}>
                                <PackageOpen size={14} /> Restock Inventory
                              </button>
                              <button className={styles.dropdownItem} onClick={() => handleAction(order.id, "Refunded")}>
                                <CreditCard size={14} /> Issue Refund
                              </button>
                              <button className={styles.dropdownItem} onClick={() => handleAction(order.id, "Damaged")}>
                                <Ban size={14} /> Mark as Damaged (No Restock)
                              </button>
                            </>
                          )}
                          
                          {(order.status === "Restocked" || order.status === "Damaged" || order.status === "Refunded") && (
                            <button className={styles.dropdownItem} onClick={() => handleAction(order.id, "Undo")}>
                              <RotateCcw size={14} /> Undo Processed Status
                            </button>
                          )}

                          <button className={styles.dropdownItem} onClick={() => handleAction(order.id, "Notes")}>
                            <FileText size={14} /> Add Notes
                          </button>
                          
                          <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => handleAction(order.id, "Delete")}>
                            <Trash2 size={14} /> Delete Record
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!loading && rtoOrders.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.loadingCell}>
                  No RTO orders at this time.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
