"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, ArrowRight, ChevronLeft } from "lucide-react";
import styles from "./login.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

function CustomerAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth methods
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("phone");
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/shop';

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`
        }
      });
      
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Something went wrong with Google Login.");
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setError("");
    const supabase = createClient();

    try {
      if (phoneStep === "input") {
        const { error: phoneError } = await supabase.auth.signInWithOtp({
          phone,
        });
        if (phoneError) throw phoneError;
        
        setPhoneStep("otp");
      } else {
        if (!otp) return;
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: 'sms',
        });
        if (verifyError) throw verifyError;
        
        document.cookie = `customer_name=${encodeURIComponent(phone)}; path=/; max-age=2592000`;
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Make sure you configured an SMS provider in Supabase!");
    } finally {
      setLoading(false);
    }
  };

  const [resetMessage, setResetMessage] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset password.");
      return;
    }

    setLoading(true);
    setError("");
    setResetMessage("");
    const supabase = createClient();

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) throw resetError;
      
      setResetMessage("Password reset link sent! Check your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;

    setLoading(true);
    setError("");
    const supabase = createClient();

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (signUpError) throw signUpError;

        // Trigger welcome email silently in the background
        fetch('/api/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: name || email.split('@')[0] })
        }).catch(e => console.error('Failed to send welcome email', e));
      }
      
      document.cookie = `customer_name=${encodeURIComponent(name || email.split('@')[0])}; path=/; max-age=2592000`;
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <button onClick={() => router.back()} style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', textDecoration: 'none', fontWeight: 500, zIndex: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
        <ChevronLeft size={20} /> Back
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
          <h1 className={styles.title}>Reddix Tech</h1>
          <p className={styles.subtitle}>Welcome to the future of flight</p>
        </div>
        
        {/* Toggle between Log In and Sign Up */}
        <div className={styles.tabs}>
          <motion.div 
            className={styles.tabIndicator} 
            layoutId="tabIndicator"
            animate={{ x: isLogin ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button 
            className={`${styles.tabBtn} ${isLogin ? styles.active : ""}`}
            onClick={() => { setIsLogin(true); setError(""); setPhoneStep("input"); }}
            type="button"
          >
            Log In
          </button>
          <button 
            className={`${styles.tabBtn} ${!isLogin ? styles.active : ""}`}
            onClick={() => { setIsLogin(false); setError(""); setAuthMethod("email"); }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Real Google Login */}
        <button 
          className={styles.googleBtn} 
          onClick={() => handleGoogleLogin()} 
          disabled={loading}
          type="button"
        >
          <svg viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          {loading ? "Authenticating..." : `Continue with Google`}
        </button>

        <div className={styles.divider}>or</div>

        {isLogin && (
          <div className={styles.tabs} style={{ padding: '2px', marginBottom: '20px' }}>
            <button 
              className={`${styles.tabBtn} ${authMethod === "phone" ? styles.active : ""}`}
              onClick={() => { setAuthMethod("phone"); setError(""); }}
              type="button"
              style={{ fontSize: '0.85rem', padding: '6px 0' }}
            >
              Phone Number
            </button>
            <button 
              className={`${styles.tabBtn} ${authMethod === "email" ? styles.active : ""}`}
              onClick={() => { setAuthMethod("email"); setError(""); }}
              type="button"
              style={{ fontSize: '0.85rem', padding: '6px 0' }}
            >
              Email
            </button>
          </div>
        )}

        {authMethod === "phone" && isLogin ? (
          <form onSubmit={handlePhoneSubmit} className={styles.form}>
            <AnimatePresence mode="wait">
              {phoneStep === "input" ? (
                <motion.div 
                  key="phone-input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={styles.inputGroup}
                >
                  <User size={18} className={styles.inputIcon} />
                  <input 
                    type="tel" 
                    placeholder="Phone Number (e.g. +1 555-0100)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.input}
                    disabled={loading}
                    required
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="otp-input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={styles.inputGroup}
                >
                  <Lock size={18} className={styles.inputIcon} />
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code (e.g. 123456)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={styles.input}
                    disabled={loading}
                    maxLength={6}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading || (phoneStep === "input" ? !phone : otp.length < 6)}>
              {loading ? "Processing..." : (phoneStep === "input" ? "Send OTP" : "Verify & Login")}
              {!loading && <ArrowRight size={18} />}
            </button>
            
            {phoneStep === "otp" && (
              <button 
                type="button"
                onClick={() => { setPhoneStep("input"); setOtp(""); setError(""); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', marginTop: '10px' }}
                disabled={loading}
              >
                Change Phone Number
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleStandardAuth} className={styles.form}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  key="name-input"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={styles.inputGroup}
                >
                  <User size={18} className={styles.inputIcon} />
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    disabled={loading}
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.inputGroup}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type="password" 
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                disabled={loading}
                minLength={6}
                required={!resetMessage}
              />
            </div>
            
            {isLogin && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px', marginBottom: '15px' }}>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                  disabled={loading}
                >
                  Forgot your password?
                </button>
              </div>
            )}
            
            {error && <p className={styles.error}>{error}</p>}
            {resetMessage && <p className={styles.success} style={{ color: '#10b981', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px' }}>{resetMessage}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading || !email || (!password && !resetMessage)}>
              {loading ? "Processing..." : (isLogin ? "Log In" : "Create Account")}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

import { Suspense } from "react";

export default function CustomerAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerAuthForm />
    </Suspense>
  );
}
