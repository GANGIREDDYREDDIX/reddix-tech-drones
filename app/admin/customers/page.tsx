"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Mail, Edit2, Ban, Search, ChevronUp, ChevronDown, Check } from "lucide-react";
import styles from "./customers.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Customer {
  id: string;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
  status: string;
  joined_date: string;
}

const colors = [
  "linear-gradient(135deg, #FF6B6B, #EE5D5D)",
  "linear-gradient(135deg, #4D96FF, #2B7FFF)",
  "linear-gradient(135deg, #6BCB77, #4FB95B)",
  "linear-gradient(135deg, #FFD93D, #F4C71B)",
  "linear-gradient(135deg, #9D9D9D, #7A7A7A)"
];
const getColor = (str: string) => colors[str.length % colors.length];

export default function AdminCustomers() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const { formatCurrency, loading } = useCurrency();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoadingCustomers(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingCustomers(false);
      });
  }, []);

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleEdit = async (id: string, currentName: string) => {
    const newName = prompt("Enter new name for customer:", currentName);
    if (!newName || newName === currentName) return;

    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: newName })
      });
      if (res.ok) {
        setCustomers(customers.map(c => c.id === id ? { ...c, name: newName } : c));
      } else {
        alert("Failed to update customer");
      }
    } catch (e) {
      alert("Error updating customer");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setCustomers(customers.map(c => c.id === id ? { ...c, status: newStatus } : c));
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'descending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let sortableItems = [...customers];

    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(item => 
        item.name.toLowerCase().includes(lowercasedSearch) || 
        item.email.toLowerCase().includes(lowercasedSearch)
      );
    }

    if (statusFilter !== "All") {
      sortableItems = sortableItems.filter(item => item.status === statusFilter);
    }

    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableItems;
  }, [customers, searchTerm, statusFilter, sortConfig]);

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>View and manage your customer base.</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 48, textAlign: "center" }}>#</th>
              <th>Customer</th>
              <th>Status</th>
              <th className={styles.textRight}>
                <div className={styles.sortableHeader} style={{ justifyContent: 'flex-end' }} onClick={() => requestSort('total_orders')}>
                  Total Orders {getSortIcon('total_orders')}
                </div>
              </th>
              <th className={styles.textRight}>
                <div className={styles.sortableHeader} style={{ justifyContent: 'flex-end' }} onClick={() => requestSort('total_spent')}>
                  Total Spent {getSortIcon('total_spent')}
                </div>
              </th>
              <th>
                <div className={styles.sortableHeader} onClick={() => requestSort('joined_date')}>
                  Joined Date {getSortIcon('joined_date')}
                </div>
              </th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingCustomers ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>Loading customers...</td></tr>
            ) : filteredAndSortedCustomers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>No customers found matching your criteria.</td></tr>
            ) : filteredAndSortedCustomers.map((customer, index) => (
              <tr key={customer.id} onClick={() => router.push(`/admin/customers/${customer.id}`)} style={{ cursor: 'pointer' }}>
                <td style={{ textAlign: "center", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary)", width: 48 }}>
                  {index + 1}
                </td>
                <td>
                  <div className={styles.customerCell}>
                    <div className={styles.customerAvatar} style={{ background: getColor(customer.name) }}>
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerName}>
                        {customer.name}
                        {customer.total_spent >= 10000 && (
                          <span className={styles.vipBadge}>VIP</span>
                        )}
                      </span>
                      <span className={styles.customerEmail}>{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[customer.status.toLowerCase()] || styles.inactive}`}>
                    {customer.status}
                  </span>
                </td>
                <td className={styles.textRight}>{customer.total_orders}</td>
                <td className={styles.textRight} style={{fontWeight: 600, color: customer.total_spent > 0 ? '#10b981' : 'var(--text-primary)'}}>
                  {!loading ? formatCurrency(customer.total_spent) : "..."}
                </td>
                <td>{new Date(customer.joined_date).toLocaleDateString()}</td>
                <td className={styles.actionsCell}>
                  <button className={styles.iconBtn} title="Email Customer" onClick={(e) => { e.stopPropagation(); handleEmail(customer.email); }}>
                    <Mail size={16} />
                  </button>
                  <button className={styles.iconBtn} title="Edit Customer" onClick={(e) => { e.stopPropagation(); handleEdit(customer.id, customer.name); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className={styles.iconBtn} title={customer.status === "Active" ? "Suspend Account" : "Activate Account"} style={{ color: customer.status === "Active" ? '#ef4444' : '#10b981' }} onClick={(e) => { e.stopPropagation(); handleToggleStatus(customer.id, customer.status); }}>
                    {customer.status === "Active" ? <Ban size={16} /> : <Check size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
