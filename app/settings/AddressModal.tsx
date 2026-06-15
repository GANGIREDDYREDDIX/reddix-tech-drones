import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './settings.module.css';

export default function AddressModal({ isOpen, onClose, onSave, address }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, address: any }) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', company: '', gst: '', phone: '',
    street1: '', street2: '', city: '', state: '', zip: '', country: 'India', type: 'Billing', is_default: false
  });

  useEffect(() => {
    if (address) {
      // Parse street if it's JSON
      let parsed = { street1: address.street, street2: '', firstName: '', lastName: '', email: '', company: '', gst: '', phone: '' };
      try {
        if (address.street.startsWith('{')) {
          parsed = JSON.parse(address.street);
        }
      } catch(e) {}
      
      setFormData({
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        email: parsed.email || '',
        company: parsed.company || '',
        gst: parsed.gst || '',
        phone: parsed.phone || '',
        street1: parsed.street1 || '',
        street2: parsed.street2 || '',
        city: address.city || '',
        state: address.state || '',
        zip: address.zip || '',
        country: address.country || 'India',
        type: address.type || 'Billing',
        is_default: address.is_default || false
      });
    } else {
      setFormData({
        firstName: '', lastName: '', email: '', company: '', gst: '', phone: '',
        street1: '', street2: '', city: '', state: '', zip: '', country: 'India', type: 'Billing', is_default: false
      });
    }
  }, [address, isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--background-secondary)', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(var(--text-primary-rgb), 0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{address ? 'Edit Address' : 'Add New Address'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className={styles.inputLabel}>Type</label>
            <select className={styles.selectInput} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option>Billing</option>
              <option>Shipping</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} style={{ width: '16px', height: '16px' }} />
              Set as Default
            </label>
          </div>
          <div>
            <label className={styles.inputLabel}>First Name</label>
            <input className={styles.input} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          </div>
          <div>
            <label className={styles.inputLabel}>Last Name</label>
            <input className={styles.input} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <div>
            <label className={styles.inputLabel}>Email</label>
            <input className={styles.input} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className={styles.inputLabel}>Phone</label>
            <input className={styles.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label className={styles.inputLabel}>Company (Optional)</label>
            <input className={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
          </div>
          <div>
            <label className={styles.inputLabel}>GST Number (Optional)</label>
            <input className={styles.input} value={formData.gst} onChange={e => setFormData({...formData, gst: e.target.value})} />
          </div>
          <div>
            <label className={styles.inputLabel}>Street 1</label>
            <input className={styles.input} value={formData.street1} onChange={e => setFormData({...formData, street1: e.target.value})} required />
          </div>
          <div>
            <label className={styles.inputLabel}>Street 2 (Optional)</label>
            <input className={styles.input} value={formData.street2} onChange={e => setFormData({...formData, street2: e.target.value})} />
          </div>
          <div>
            <label className={styles.inputLabel}>City</label>
            <input className={styles.input} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
          </div>
          <div>
            <label className={styles.inputLabel}>State</label>
            <input className={styles.input} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
          </div>
          <div>
            <label className={styles.inputLabel}>Zip / PIN</label>
            <input className={styles.input} value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} required />
          </div>
          <div>
            <label className={styles.inputLabel}>Country</label>
            <input className={styles.input} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required />
          </div>
        </div>
        
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => {
            onSave(formData);
          }} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--text-primary)', color: 'var(--background-primary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Address</button>
        </div>
      </div>
    </div>
  );
}
