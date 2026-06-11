"use client";

import { useState, useEffect } from "react";
import { FileText, Send, Check, X } from "lucide-react";
import styles from "../dashboard.module.css";

interface Request {
  id: string;
  product: string;
  customer_name: string;
  company: string;
  quantity: number;
  status: "Pending" | "Quoted" | "Accepted" | "Rejected";
  date: string;
}

export default function PriceRequestsAdmin() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/price-requests")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus as Request["status"] } : r));
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Price Requests</h1>
        <p>Manage bulk order discounts and special pricing requests.</p>
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.activityCard} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.activityList}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
            ) : requests.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>No requests found</div>
            ) : requests.map((req) => (
              <div key={req.id} className={styles.activityItem} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.id}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(req.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.product}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.customer_name} • Qty: {req.quantity}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.company || "No Company"}</div>
                </div>
                <div>
                  <span className={`${styles.statusBadge}`} style={{
                    background: req.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: req.status === 'Pending' ? '#f59e0b' : '#10b981',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <select 
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    style={{ padding: '6px', background: 'var(--background-secondary)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
