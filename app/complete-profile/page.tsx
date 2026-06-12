"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, ArrowRight, Loader2 } from "lucide-react";
import styles from "../login/login.module.css";
import { motion } from "framer-motion";
import { Suspense } from "react";

function CompleteProfileForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/shop';

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.push('/login');
        return;
      }
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || "");
      setEmail(user.email || "");
      setLoading(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Register customer profile securely via the registration webhook
      const res = await fetch('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, referralCode })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete profile");
      }

      // Trigger welcome email silently in the background
      fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      }).catch(e => console.error('Failed to send welcome email', e));
      
      document.cookie = `customer_name=${encodeURIComponent(name)}; path=/; max-age=2592000`;
      router.push(next);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />

      <motion.div 
        className={styles.authCard}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>Almost There!</h1>
          <p className={styles.subtitle}>Complete your profile to finish signing up.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <User size={18} className={styles.inputIcon} />
            <input 
              type="text" 
              placeholder="Referral Code (Optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className={styles.input}
              disabled={submitting}
            />
          </div>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>
            Have a referral code? Enter it above to claim your welcome bonus points!
          </p>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "Processing..." : "Complete Sign Up"}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className={styles.pageContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className={styles.spinner} size={48} />
      </div>
    }>
      <CompleteProfileForm />
    </Suspense>
  );
}
