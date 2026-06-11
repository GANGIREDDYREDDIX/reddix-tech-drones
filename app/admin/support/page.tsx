"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import styles from "./support.module.css";

interface Ticket {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  message?: string;
  admin_reply?: string;
  status: "Open" | "In Progress" | "Closed";
  priority: "High" | "Medium" | "Low";
  date: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");

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

  const handleTicketUpdate = (id: string, updates: Partial<Ticket>) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    handleTicketUpdate(id, { status: newStatus as Ticket["status"] });
  };

  const handleReplySubmit = async () => {
    if (!selectedTicket) return;
    
    const originalStatus = selectedTicket.status;
    const originalReply = selectedTicket.admin_reply;
    
    // Optimistically update
    handleTicketUpdate(selectedTicket.id, { status: "In Progress", admin_reply: replyText });
    setSelectedTicket(null);
    setReplyText("");

    try {
      const res = await fetch("/api/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedTicket.id, 
          admin_reply: replyText, 
          status: "In Progress" 
        })
      });

      if (!res.ok) {
        throw new Error("Failed to send reply");
      }
    } catch (e) {
      console.error(e);
      alert("Error sending reply");
      handleTicketUpdate(selectedTicket.id, { status: originalStatus, admin_reply: originalReply }); // revert
    }
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
                  <button 
                    className={styles.actionBtn} 
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setReplyText(ticket.admin_reply || "");
                    }}
                  >
                    <MessageSquare size={16} /> Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTicket(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reply to {selectedTicket.id}</h2>
              <button className={styles.actionBtn} onClick={() => setSelectedTicket(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Customer Message:</p>
                <div className={styles.messageBox}>
                  {selectedTicket.message || "No description provided by customer."}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Your Reply:</p>
                <textarea 
                  className={styles.replyTextarea} 
                  placeholder="Type your response here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setSelectedTicket(null)}>Cancel</button>
              <button className={styles.sendBtn} onClick={handleReplySubmit}>Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
