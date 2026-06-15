"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Search, MoreHorizontal, Trash2, CheckCircle, Ticket, AlertCircle, Clock } from "lucide-react";
import styles from "./support.module.css";

interface SupportTicket {
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

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444", medium: "#f59e0b", low: "#3b82f6"
};

const STATUS_COLORS: Record<string, string> = {
  open: "#f59e0b", "in progress": "#3b82f6", closed: "#10b981"
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals and Actions
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Tickets");
  
  const menuRef = useRef<HTMLDivElement>(null);

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
      
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTicketUpdate = (id: string, updates: Partial<SupportTicket>) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleStatusChange = async (id: string, newStatus: "Open" | "In Progress" | "Closed") => {
    setActionMenuOpen(null);
    const oldTicket = tickets.find(t => t.id === id);
    handleTicketUpdate(id, { status: newStatus });
    try {
      const res = await fetch("/api/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, admin_reply: oldTicket?.admin_reply })
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (e) {
      alert("Error updating status");
      if (oldTicket) handleTicketUpdate(id, { status: oldTicket.status });
    }
  };

  const handleDelete = async (id: string) => {
    setActionMenuOpen(null);
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    
    setTickets(tickets.filter(t => t.id !== id));
    try {
      const res = await fetch(`/api/support/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete ticket");
    } catch (e) {
      alert("Failed to delete ticket");
      // Could re-fetch or revert here
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedTicket) return;
    const originalTicket = { ...selectedTicket };
    
    handleTicketUpdate(selectedTicket.id, { status: "In Progress", admin_reply: replyText });
    setSelectedTicket(null);
    setReplyText("");

    try {
      const res = await fetch("/api/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: originalTicket.id, 
          admin_reply: replyText, 
          status: "In Progress" 
        })
      });
      if (!res.ok) throw new Error("Failed to send reply");
    } catch (e) {
      alert("Error sending reply");
      handleTicketUpdate(originalTicket.id, { status: originalTicket.status, admin_reply: originalTicket.admin_reply });
    }
  };

  // KPIs
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status !== "Closed").length;
  const highPriority = tickets.filter(t => t.status !== "Closed" && t.priority === "High").length;

  // Filter & Search
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "All Tickets" || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Support</h1>
          <p className={styles.subtitle}>Manage customer inquiries and support requests.</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
        <div className={styles.tableCard} style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: 16, borderRadius: 12 }}>
            <Ticket size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Total Tickets</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{loading ? "..." : totalTickets}</div>
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", padding: 16, borderRadius: 12 }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Unresolved</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{loading ? "..." : openTickets}</div>
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: 16, borderRadius: 12 }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>High Priority Open</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{loading ? "..." : highPriority}</div>
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
              placeholder="Search by ID, customer name, email or subject..." 
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
              <option value="All Tickets">All Tickets</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Grid Layout */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: 900 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 1fr 90px 110px 110px 80px",
              gap: 16, padding: "16px 24px",
              borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))",
              background: "rgba(0,0,0,0.02)",
              fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              <div>Ticket ID</div>
              <div>Customer</div>
              <div>Subject</div>
              <div>Priority</div>
              <div>Status</div>
              <div>Date</div>
              <div style={{ textAlign: "right" }}>Action</div>
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                No support tickets found matching your criteria.
              </div>
            ) : filteredTickets.map(ticket => {
              const prioColor = PRIORITY_COLORS[ticket.priority.toLowerCase()] || "#9ca3af";
              const statColor = STATUS_COLORS[ticket.status.toLowerCase()] || "#9ca3af";
              
              const initials = ticket.customer_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              
              return (
                <div key={ticket.id} style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 1fr 90px 110px 110px 80px",
                  gap: 16, padding: "16px 24px",
                  borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))",
                  alignItems: "center", fontSize: 13,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-blue)" }}>
                    {ticket.id}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      width: 36, height: 36, borderRadius: "50%", 
                      background: `linear-gradient(135deg, ${prioColor}40, ${prioColor}20)`,
                      color: prioColor, display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ticket.customer_name}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{ticket.customer_email}</div>
                    </div>
                  </div>

                  <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                    {ticket.subject}
                  </div>

                  <div>
                    <span style={{
                      background: `${prioColor}20`, color: prioColor, border: `1px solid ${prioColor}44`,
                      padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase"
                    }}>{ticket.priority}</span>
                  </div>

                  <div>
                    <span style={{
                      background: `${statColor}20`, color: statColor, border: `1px solid ${statColor}44`,
                      padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700
                    }}>{ticket.status}</span>
                  </div>

                  <div style={{ color: "var(--text-secondary)" }}>
                    {new Date(ticket.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>

                  <div className={styles.actionMenuContainer} ref={actionMenuOpen === ticket.id ? menuRef : null}>
                    <button 
                      className={styles.actionMenuBtn}
                      onClick={() => setActionMenuOpen(actionMenuOpen === ticket.id ? null : ticket.id)}
                    >
                      Manage <MoreHorizontal size={14} />
                    </button>
                    {actionMenuOpen === ticket.id && (
                      <div className={styles.dropdownMenu}>
                        <button className={styles.dropdownItem} onClick={() => {
                          setSelectedTicket(ticket);
                          setReplyText(ticket.admin_reply || "");
                          setActionMenuOpen(null);
                        }}>
                          <MessageSquare size={14} /> Reply to Customer
                        </button>
                        {ticket.status !== "Closed" && (
                          <button className={`${styles.dropdownItem} ${styles.success}`} onClick={() => handleStatusChange(ticket.id, "Closed")}>
                            <CheckCircle size={14} /> Mark as Resolved
                          </button>
                        )}
                        <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => handleDelete(ticket.id)}>
                          <Trash2 size={14} /> Delete Ticket
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTicket(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reply to {selectedTicket.id}</h2>
              <button className={styles.actionBtn} onClick={() => setSelectedTicket(null)} aria-label="Close" style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer Message:</p>
                <div className={styles.messageBox}>
                  {selectedTicket.message || "No description provided by customer."}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Reply:</p>
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
