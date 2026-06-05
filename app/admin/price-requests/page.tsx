"use client";

import styles from "../dashboard.module.css";
import { FileText, Check, X, Clock } from "lucide-react";

export default function PriceRequestsAdmin() {
  const mockRequests = [
    {
      id: "REQ-001",
      customer: "Tech Corp Inc.",
      product: "Reddix Pro X1 Drone",
      quantity: 10,
      requestedPrice: 20000,
      standardPrice: 24990,
      status: "pending",
      date: "Oct 12, 2026"
    },
    {
      id: "REQ-002",
      customer: "Sarah Smith",
      product: "Reddix Thermal IR",
      quantity: 5,
      requestedPrice: 25000,
      standardPrice: 27495,
      status: "approved",
      date: "Oct 10, 2026"
    }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Price Requests</h1>
        <p>Manage bulk order discounts and special pricing requests.</p>
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.activityCard} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.activityList}>
            {mockRequests.map((req) => (
              <div key={req.id} className={styles.activityItem} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.id}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.date}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.product}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.customer} • Qty: {req.quantity}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${req.requestedPrice.toLocaleString()}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Standard: ${req.standardPrice.toLocaleString()}</div>
                </div>
                <div>
                  <span className={`${styles.statusBadge} ${styles[req.status]}`} style={{
                    background: req.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: req.status === 'pending' ? '#f59e0b' : '#10b981'
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {req.status === 'pending' && (
                    <>
                      <button style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Check size={16} /></button>
                      <button style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><X size={16} /></button>
                    </>
                  )}
                  {req.status !== 'pending' && (
                    <button style={{ padding: '6px 12px', background: 'var(--background-secondary)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>View Details</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
