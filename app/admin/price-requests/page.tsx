"use client";

import { useState, useEffect } from "react";
import { FileText, Send, Check, X, MessageSquare } from "lucide-react";
import styles from "../dashboard.module.css";

interface Request {
  id: string;
  product_id: string;
  customer_email: string;
  quantity: number;
  requested_price: number;
  notes?: string;
  admin_remark?: string;
  status: "Pending" | "Quoted" | "Accepted" | "Rejected";
  date: string;
}

export default function PriceRequestsAdmin() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [tempRemark, setTempRemark] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/price-requests").then(r => r.json()),
      fetch("/api/products").then(r => r.json())
    ]).then(([reqData, prodData]) => {
      setRequests(reqData);
      setProducts(prodData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/price-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus as Request["status"] } : r));
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const handleSaveRemark = async (id: string) => {
    try {
      const res = await fetch("/api/price-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, admin_remark: tempRemark })
      });
      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, admin_remark: tempRemark } : r));
        setEditingRemarkId(null);
      } else {
        alert("Failed to save remark");
      }
    } catch (e) {
      alert("Error saving remark");
    }
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
              <div style={{ padding: '24px', textAlign: 'center' }}>Loading requests...</div>
            ) : requests.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>No requests found</div>
            ) : requests.map((req) => {
              const product = products.find(p => p.id === req.product_id);
              const productName = product ? product.name : `Product ID: ${req.product_id}`;
              const retailPrice = product ? product.price : 0;
              const discount = retailPrice > 0 ? Math.round(((retailPrice - req.requested_price) / retailPrice) * 100) : 0;

              return (
                <div key={req.id} className={styles.activityItem} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '4px' }}>{productName}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{req.customer_email} • Requested {new Date(req.date).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className={`${styles.statusBadge}`} style={{
                        background: req.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : req.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: req.status === 'Pending' ? '#f59e0b' : req.status === 'Rejected' ? '#ef4444' : '#10b981',
                        padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600
                      }}>
                        {req.status.toUpperCase()}
                      </span>
                      <select 
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        style={{ padding: '8px', background: 'var(--background-secondary)', color: 'var(--text-primary)', border: '1px solid var(--nav-border)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', background: 'var(--background-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--nav-border)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requested Qty</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{req.quantity} units</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Retail Price</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>₹{retailPrice}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Price</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#10b981' }}>₹{req.requested_price} <span style={{ fontSize: '0.9rem', color: '#f59e0b', marginLeft: '8px' }}>({discount}% Off)</span></div>
                    </div>
                  </div>

                  {req.notes && (
                    <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.05)', borderLeft: '4px solid #3b82f6', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6', marginBottom: '4px' }}>Customer Notes:</div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{req.notes}</div>
                    </div>
                  )}

                  <div style={{ borderTop: '1px dashed var(--nav-border)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Admin Remarks:</div>
                      {editingRemarkId !== req.id && (
                        <button 
                          onClick={() => { setEditingRemarkId(req.id); setTempRemark(req.admin_remark || ""); }}
                          style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {req.admin_remark ? "Edit Remark" : "+ Add Remark"}
                        </button>
                      )}
                    </div>
                    
                    {editingRemarkId === req.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea 
                          value={tempRemark}
                          onChange={(e) => setTempRemark(e.target.value)}
                          placeholder="Leave a note or counter-offer for the customer..."
                          rows={3}
                          style={{ width: '100%', padding: '12px', background: 'var(--background-secondary)', border: '1px solid #3b82f6', borderRadius: '6px', color: 'var(--text-primary)', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditingRemarkId(null)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                          <button onClick={() => handleSaveRemark(req.id)} style={{ padding: '6px 12px', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Save Remark</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.95rem', color: req.admin_remark ? 'var(--text-primary)' : 'var(--text-secondary)', fontStyle: req.admin_remark ? 'normal' : 'italic' }}>
                        {req.admin_remark || "No remarks added yet."}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
