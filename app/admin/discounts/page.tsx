"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import styles from "./discounts.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  status: string;
  usageCount: number;
  expiry: string;
}

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Discount>>({
    code: "", type: "percentage", value: 10, expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 16)
  });

  const fetchDiscounts = async () => {
    try {
      const res = await fetch("/api/discounts");
      const data = await res.json();
      setDiscounts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) return;
    try {
      await fetch(`/api/discounts/${id}`, { method: "DELETE" });
      fetchDiscounts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        expiry: new Date(formData.expiry as string).toISOString()
      };
      
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ code: "", type: "percentage", value: 10, expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 16) });
        fetchDiscounts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Discounts</h1>
          <p className={styles.subtitle}>Manage promotional codes and active offers.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Create Code
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Discount Code</th>
              <th>Type</th>
              <th className={styles.textRight}>Value</th>
              <th>Status</th>
              <th className={styles.textRight}>Usage</th>
              <th>Expiry</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign: "center", padding: "40px"}}>Loading discounts...</td></tr>
            ) : discounts.map(discount => (
              <tr key={discount.id}>
                <td><span className={styles.codeBadge}>{discount.code}</span></td>
                <td style={{textTransform: 'capitalize'}}>{discount.type}</td>
                <td className={styles.textRight} style={{fontWeight: 600}}>
                  {discount.type === 'percentage' ? `${discount.value}%` : (!currencyLoading ? formatCurrency(discount.value) : "...")}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[discount.status.toLowerCase()]}`}>
                    {discount.status}
                  </span>
                </td>
                <td className={styles.textRight}>{discount.usageCount}</td>
                <td>{new Date(discount.expiry).toLocaleDateString()}</td>
                <td className={styles.actionsCell}>
                  <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDelete(discount.id)} title="Delete Code">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && discounts.length === 0 && (
              <tr><td colSpan={7} style={{textAlign: "center", padding: "40px"}}>No active discount codes.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create Discount Code</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Promo Code (e.g. SUMMER20)</label>
                <input 
                  type="text" 
                  required 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="CODE"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Discount Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Discount Value</label>
                  <input type="number" required value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Expiry Date</label>
                <input type="datetime-local" required value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Create Code</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
