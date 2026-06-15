import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './settings.module.css';

export default function PriceRequestModal({ isOpen, onClose, onSave, products }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, products: any[] }) {
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 10,
    requested_price: '',
    notes: ''
  });

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--background-secondary)', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(var(--text-primary-rgb), 0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>New Price Request</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className={styles.inputLabel}>Select Product</label>
            <select className={styles.selectInput} value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})} required>
              <option value="">-- Choose a Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Retail: ₹{p.price})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.inputLabel}>Bulk Quantity</label>
            <input className={styles.input} type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} required />
          </div>
          <div>
            <label className={styles.inputLabel}>Requested Price (per unit)</label>
            <input className={styles.input} type="number" min="0" value={formData.requested_price} onChange={e => setFormData({...formData, requested_price: e.target.value})} required placeholder="e.g. 50000" />
          </div>
          <div>
            <label className={styles.inputLabel}>Additional Notes (Optional)</label>
            <textarea className={styles.input} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Why are you requesting this price?" rows={3} style={{ resize: 'vertical' }} />
          </div>
        </div>
        
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => {
            if (!formData.product_id || !formData.quantity || !formData.requested_price) {
              alert('Please fill out all required fields.');
              return;
            }
            onSave({
              product_id: formData.product_id,
              quantity: formData.quantity,
              requested_price: parseFloat(formData.requested_price),
              notes: formData.notes
            });
          }} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--text-primary)', color: 'var(--background-primary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Submit Request</button>
        </div>
      </div>
    </div>
  );
}
