"use client";

import { Save } from "lucide-react";
import styles from "./settings.module.css";
import { useState } from "react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("General");
  const [storeName, setStoreName] = useState("Reddix Tech Enterprises");
  const [supportEmail, setSupportEmail] = useState("support@reddix.tech");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newOrderAlerts, setNewOrderAlerts] = useState(true);

  const [domesticShipping, setDomesticShipping] = useState("500");
  const [intlShipping, setIntlShipping] = useState("2500");
  const [defaultTax, setDefaultTax] = useState("18");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved successfully!");
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
        
        {activeTab === "General" && (
          <>
            <div>
              <h2 className={styles.sectionTitle}>Store Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div className={styles.formGroup}>
                  <label>Store Name</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={storeName} 
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Support Email Address</label>
                  <input 
                    type="email" 
                    className={styles.input} 
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
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
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
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
                    checked={newOrderAlerts}
                    onChange={(e) => setNewOrderAlerts(e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </>
        )}

        {activeTab === "Shipping" && (
          <div>
            <h2 className={styles.sectionTitle}>Shipping Rates</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className={styles.formGroup}>
                <label>Domestic Shipping</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={domesticShipping} 
                  onChange={(e) => setDomesticShipping(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>International Shipping</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={intlShipping} 
                  onChange={(e) => setIntlShipping(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Taxes" && (
          <div>
            <h2 className={styles.sectionTitle}>Tax Configuration</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className={styles.formGroup}>
                <label>Default Tax Rate (%)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={defaultTax} 
                  onChange={(e) => setDefaultTax(e.target.value)}
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                This tax rate will be automatically applied at checkout based on the customer's shipping address.
              </p>
            </div>
          </div>
        )}

        <button type="submit" className={styles.saveBtn}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} />
            Save Changes
          </div>
        </button>
        
      </form>
    </div>
  );
}
