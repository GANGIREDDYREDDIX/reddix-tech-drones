"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ChevronLeft } from "lucide-react";
import styles from "../login/login.module.css";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is actually authenticated from the reset link
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Invalid or expired password reset link. Please request a new one.");
      }
    };
    checkUser();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      if (updateError) throw updateError;
      
      setSuccess("Password updated successfully! You can now log in with your new password.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <button onClick={() => router.push('/login')} style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', textDecoration: 'none', fontWeight: 500, zIndex: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
        <ChevronLeft size={20} /> Back to Login
      </button>
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />

      <motion.div 
        className={styles.authCard}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your new password below</p>
        </div>

        <form onSubmit={handleResetPassword} className={styles.form}>
          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input 
              type="password" 
              placeholder="New Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={loading || !!success}
              minLength={6}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input 
              type="password" 
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              disabled={loading || !!success}
              minLength={6}
              required
            />
          </div>
          
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success} style={{ color: '#10b981', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px' }}>{success}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading || !password || !confirmPassword || !!success}>
            {loading ? "Updating..." : "Update Password"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
