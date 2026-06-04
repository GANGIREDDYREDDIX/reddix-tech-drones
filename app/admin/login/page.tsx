"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./login.module.css";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Force a hard refresh to let middleware handle the redirect correctly
        window.location.href = "/admin";
      } else {
        setError("Invalid credentials.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <motion.div 
        className={styles.loginCard}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={styles.iconWrapper}>
          <ShieldCheck size={32} className={styles.icon} />
        </div>
        <h1>Admin Portal</h1>
        <p className={styles.subtitle}>Enter the master password to continue</p>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input 
              type="password" 
              placeholder="Password (hint: admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={loading}
              autoFocus
            />
          </div>
          
          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading || !password}>
            {loading ? "Verifying..." : "Authenticate"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
