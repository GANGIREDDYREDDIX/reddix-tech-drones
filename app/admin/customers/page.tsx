"use client";

import { Mail, Edit2, Ban } from "lucide-react";
import styles from "./customers.module.css";
import { useCurrency } from "@/context/CurrencyContext";

const MOCK_CUSTOMERS = [
  { id: "CUS-102", name: "John Doe", email: "john@example.com", totalOrders: 4, spent: 9996, status: "Active", joined: "Jan 12, 2024", color: "linear-gradient(135deg, #FF6B6B, #EE5D5D)" },
  { id: "CUS-103", name: "Tech Corp", email: "procurement@techcorp.io", totalOrders: 12, spent: 32994, status: "Active", joined: "Feb 04, 2024", color: "linear-gradient(135deg, #4D96FF, #2B7FFF)" },
  { id: "CUS-104", name: "Sarah Smith", email: "sarah.s@gmail.com", totalOrders: 1, spent: 449, status: "Active", joined: "Mar 18, 2024", color: "linear-gradient(135deg, #6BCB77, #4FB95B)" },
  { id: "CUS-105", name: "Global Media", email: "billing@globalmedia.net", totalOrders: 8, spent: 1192, status: "Active", joined: "May 22, 2024", color: "linear-gradient(135deg, #FFD93D, #F4C71B)" },
  { id: "CUS-106", name: "Alex Mercer", email: "alex.m@outlook.com", totalOrders: 0, spent: 0, status: "Inactive", joined: "Oct 15, 2024", color: "linear-gradient(135deg, #9D9D9D, #7A7A7A)" },
];

export default function AdminCustomers() {
  const { formatCurrency, loading } = useCurrency();
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>View and manage your customer base.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Status</th>
              <th className={styles.textRight}>Total Orders</th>
              <th className={styles.textRight}>Total Spent</th>
              <th>Joined Date</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CUSTOMERS.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className={styles.customerCell}>
                    <div className={styles.customerAvatar} style={{ background: customer.color }}>
                      {customer.name.charAt(0)}
                    </div>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerName}>{customer.name}</span>
                      <span className={styles.customerEmail}>{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[customer.status.toLowerCase()]}`}>
                    {customer.status}
                  </span>
                </td>
                <td className={styles.textRight}>{customer.totalOrders}</td>
                <td className={styles.textRight} style={{fontWeight: 600}}>{!loading ? formatCurrency(customer.spent) : "..."}</td>
                <td>{customer.joined}</td>
                <td className={styles.actionsCell}>
                  <button className={styles.iconBtn} title="Email Customer">
                    <Mail size={16} />
                  </button>
                  <button className={styles.iconBtn} title="Edit Customer">
                    <Edit2 size={16} />
                  </button>
                  <button className={styles.iconBtn} title="Suspend Account" style={{ color: '#ef4444' }}>
                    <Ban size={16} />
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
