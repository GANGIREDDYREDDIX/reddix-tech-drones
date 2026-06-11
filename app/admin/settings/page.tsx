"use client";

import { Save } from "lucide-react";
import styles from "./settings.module.css";
import { useState, useEffect } from "react";

interface StoreSettings {
  store_name: string;
  support_email: string;
  maintenance_mode: boolean;
  new_order_alerts: boolean;
  domestic_shipping: string;
  intl_shipping: string;
  default_tax: string;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("General");
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: "",
    support_email: "",
    maintenance_mode: false,
    new_order_alerts: false,
    domestic_shipping: "",
    intl_shipping: "",
    default_tax: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof StoreSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Configure your store preferences, shipping, and taxes.</p>
      </div>

      <div className={styles.tabsContainer}>
        <button className={`${styles.tab} ${activeTab === "General" ? styles.activeTab : ""}`} onClick={() => setActiveTab("General")}>General</button>
        <button className={`${styles.tab} ${activeTab === "Shipping" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Shipping")}>Shipping Zones</button>
        <button className={`${styles.tab} ${activeTab === "Taxes" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Taxes")}>Taxes</button>
      </div>

      <form className={styles.settingsCard} onSubmit={handleSave}>
        
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading settings...</div>
        ) : activeTab === "General" ? (
          <>
            <div>
              <h2 className={styles.sectionTitle}>Store Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div className={styles.formGroup}>
                  <label>Store Name</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.store_name} 
                    onChange={(e) => handleChange('store_name', e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Support Email Address</label>
                  <input 
                    type="email" 
                    className={styles.input} 
                    value={settings.support_email}
                    onChange={(e) => handleChange('support_email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h2 className={styles.sectionTitle}>System Preferences</h2>
              
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Maintenance Mode</span>
                  <span className={styles.toggleDesc}>Temporarily disable public access to the storefront.</span>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={settings.maintenance_mode}
                    onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>New Order Alerts</span>
                  <span className={styles.toggleDesc}>Receive push notifications for new incoming orders.</span>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={settings.new_order_alerts}
                    onChange={(e) => handleChange('new_order_alerts', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </>
        ) : activeTab === "Shipping" ? (
          <div>
            <h2 className={styles.sectionTitle}>Shipping Configuration</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className={styles.formGroup}>
                <label>Domestic Shipping Flat Rate (₹)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={settings.domestic_shipping} 
                  onChange={(e) => handleChange('domestic_shipping', e.target.value)}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>International Shipping Flat Rate (₹)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={settings.intl_shipping}
                  onChange={(e) => handleChange('intl_shipping', e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : activeTab === "Taxes" ? (
          <div>
            <h2 className={styles.sectionTitle}>Tax Configuration</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className={styles.formGroup}>
                <label>Default GST Rate (%)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={settings.default_tax} 
                  onChange={(e) => handleChange('default_tax', e.target.value)}
                />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                This tax rate will be applied to all products unless overridden at the product level.
              </p>
            </div>
          </div>
        ) : null}

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn} disabled={saving || loading}>
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
