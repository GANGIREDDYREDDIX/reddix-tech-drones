"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";
import { Star, Gift, Users } from "lucide-react";

interface RewardsConfig {
  purchases_multiplier: number;
  review_points: number;
  referral_points: number;
}

interface RewardsKPIs {
  total_issued: number;
  total_redeemed: number;
  active_members: number;
}

export default function RewardsAdmin() {
  const [config, setConfig] = useState<RewardsConfig | null>(null);
  const [kpis, setKpis] = useState<RewardsKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/rewards")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setConfig(data.config);
          setKpis(data.kpis);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Rewards configuration saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Points & Rewards</h1>
        <p>Manage the Reddix Points loyalty program.</p>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Points Issued</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Star size={18} style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? "..." : (kpis?.total_issued || 0).toLocaleString()}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Points Redeemed</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Gift size={18} style={{ color: '#10b981' }} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? "..." : (kpis?.total_redeemed || 0).toLocaleString()}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Active Members</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Users size={18} style={{ color: '#3b82f6' }} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {loading ? "..." : (kpis?.active_members || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className={styles.dashboardContent} style={{ marginTop: '24px' }}>
        <div className={styles.activityCard} style={{ gridColumn: '1 / -1' }}>
          <h2>Reward Rules configuration</h2>
          {loading ? (
            <div style={{ padding: "24px", textAlign: "center" }}>Loading config...</div>
          ) : !config ? (
            <div style={{ padding: "24px", textAlign: "center" }}>Failed to load config</div>
          ) : (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--background-secondary)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Purchases</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Points earned per $100 spent</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    value={config.purchases_multiplier}
                    onChange={(e) => setConfig({ ...config, purchases_multiplier: Number(e.target.value) })}
                    style={{ width: '60px', padding: '8px', background: 'var(--background-main)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', textAlign: 'center' }} 
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>points</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--background-secondary)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Product Reviews</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Points awarded for leaving a review</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    value={config.review_points}
                    onChange={(e) => setConfig({ ...config, review_points: Number(e.target.value) })}
                    style={{ width: '60px', padding: '8px', background: 'var(--background-main)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', textAlign: 'center' }} 
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>points</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--background-secondary)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Referrals</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Points awarded for a successful referral</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    value={config.referral_points}
                    onChange={(e) => setConfig({ ...config, referral_points: Number(e.target.value) })}
                    style={{ width: '60px', padding: '8px', background: 'var(--background-main)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', textAlign: 'center' }} 
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>points</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding: '10px 24px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save Configurations'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
