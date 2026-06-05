"use client";

import styles from "../dashboard.module.css";
import { Star, Gift, Users } from "lucide-react";

export default function RewardsAdmin() {
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
          <div className={styles.kpiValue}>145,200</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Points Redeemed</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Gift size={18} style={{ color: '#10b981' }} />
            </div>
          </div>
          <div className={styles.kpiValue}>32,500</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Active Members</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Users size={18} style={{ color: '#3b82f6' }} />
            </div>
          </div>
          <div className={styles.kpiValue}>1,248</div>
        </div>
      </div>

      <div className={styles.dashboardContent} style={{ marginTop: '24px' }}>
        <div className={styles.activityCard} style={{ gridColumn: '1 / -1' }}>
          <h2>Reward Rules configuration</h2>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--background-secondary)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Purchases</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Points earned per $1 spent</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" defaultValue={1} style={{ width: '60px', padding: '8px', background: 'var(--background-main)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', textAlign: 'center' }} />
                <span style={{ color: 'var(--text-secondary)' }}>points</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--background-secondary)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Product Reviews</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Points awarded for leaving a review</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" defaultValue={50} style={{ width: '60px', padding: '8px', background: 'var(--background-main)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', textAlign: 'center' }} />
                <span style={{ color: 'var(--text-secondary)' }}>points</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--background-secondary)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Referrals</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Points awarded for a successful referral</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" defaultValue={500} style={{ width: '60px', padding: '8px', background: 'var(--background-main)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', textAlign: 'center' }} />
                <span style={{ color: 'var(--text-secondary)' }}>points</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button style={{ padding: '10px 24px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Save Configurations</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
