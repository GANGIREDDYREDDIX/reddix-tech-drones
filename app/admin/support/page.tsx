"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import styles from "./support.module.css";

interface Ticket {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  status: "Open" | "In Progress" | "Closed";
  priority: "High" | "Medium" | "Low";
  date: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/support")
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus as Ticket["status"] } : t));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Support Tickets</h1>
          <p className={styles.subtitle}>Manage customer inquiries and support requests.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th className={styles.textRight}>Date</th>
              <th className={styles.textRight}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>Loading support tickets...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>No support tickets found</td></tr>
            ) : tickets.map(ticket => (
              <tr key={ticket.id}>
                <td>
                  <span className={styles.ticketId}>{ticket.id}</span>
                </td>
                <td>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{ticket.customer_name}</span>
                    <span className={styles.customerEmail}>{ticket.customer_email}</span>
                  </div>
                </td>
                <td>{ticket.subject}</td>
                <td>
                  <span className={`${styles.priorityBadge} ${styles[`priority${ticket.priority}`]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>
                  <select 
                    className={`${styles.statusSelect} ${styles[`status${ticket.status.replace(" ", "")}`]}`}
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
                <td className={styles.textRight}>
                  {new Date(ticket.date).toLocaleDateString()}
                </td>
                <td className={styles.actionsCell}>
                  <button className={styles.actionBtn}>
                    <MessageSquare size={16} /> Reply
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
