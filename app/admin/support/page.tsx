"use client";

import { useState } from "react";
import styles from "./support.module.css";

interface Ticket {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  message: string;
  priority: "High" | "Normal" | "Low";
  status: "Open" | "In Progress" | "Closed";
  date: string;
}

const mockTickets: Ticket[] = [
  { id: "TKT-1042", customerName: "Diana W.", email: "diana.w@gmail.com", subject: "Drone battery not holding charge", message: "Hi, I just received my order yesterday but the battery drains completely after 5 minutes of flight. Is this defective?", priority: "High", status: "Open", date: "2024-06-05T08:30:00Z" },
  { id: "TKT-1041", customerName: "John D.", email: "john@example.com", subject: "Where is my order?", message: "Tracking says delivered but I haven't received it yet.", priority: "High", status: "In Progress", date: "2024-06-04T16:15:00Z" },
  { id: "TKT-1038", customerName: "Global Media", email: "billing@globalmedia.net", subject: "Invoice request for Order ORD-004", message: "Could you please send the B2B invoice with our GST number attached?", priority: "Normal", status: "Open", date: "2024-06-03T11:20:00Z" },
  { id: "TKT-1020", customerName: "Sarah Smith", email: "sarah.s@gmail.com", subject: "Thanks for the quick replacement!", message: "Just wanted to say thanks for sending the replacement props so fast.", priority: "Low", status: "Closed", date: "2024-05-28T14:00:00Z" }
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  const handleStatusChange = (id: string, newStatus: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus as Ticket["status"] } : t));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Support Tickets</h1>
          <p className={styles.subtitle}>Manage customer inquiries, returns, and support requests.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Subject & Message</th>
              <th>Date</th>
              <th>Priority</th>
              <th className={styles.textRight}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td style={{ fontWeight: 600 }}>{ticket.id}</td>
                <td>
                  <div className={styles.customerName}>{ticket.customerName}</div>
                  <div className={styles.customerEmail}>{ticket.email}</div>
                </td>
                <td>
                  <div className={styles.subject}>{ticket.subject}</div>
                  <div className={styles.messagePreview}>{ticket.message}</div>
                </td>
                <td>{new Date(ticket.date).toLocaleDateString()}</td>
                <td>
                  <span className={`${styles.priorityBadge} ${styles[`priority${ticket.priority}`]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className={styles.textRight}>
                  <select 
                    className={styles.statusSelect}
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
