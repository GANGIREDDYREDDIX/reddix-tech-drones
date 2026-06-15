"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./Navigation.module.css";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { createClient } from "@/utils/supabase/client";

export default function Navigation() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();

  const opacity = useTransform(scrollY, [0, 100], [1, 1]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        }
      } catch (e) {}
    };

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || user.phone || 'User';
        setCustomerName(name);
        checkAdmin();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || session.user.phone || 'User';
        setCustomerName(name);
        checkAdmin();
      } else {
        setCustomerName(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = 'customer_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setCustomerName(null);
    setIsAdmin(false);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const pathname = usePathname();
  const navOpacity = pathname === "/" ? opacity : 1;

  return (
    <>
      <motion.nav
        className={clsx(styles.navContainer, isScrolled && styles.scrolled)}
        style={{ opacity: navOpacity }}
      >
        <Link href="/" className={styles.brand}>Reddix Tech</Link>
        
        <ul className={styles.navLinks}>
          <li><Link href="/" className={styles.shopLink}>Home</Link></li>
          <li><Link href="/shop" className={styles.shopLink}>Services</Link></li>
        </ul>

        <div className={styles.ctaContainer}>
          <ThemeToggle />
          
          {customerName ? (
            <div style={{ position: 'relative' }}>
              <button 
                style={{ 
                  background: 'var(--background-secondary)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--nav-border)', 
                  padding: '0.5rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.85rem'
                }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Hi, {customerName}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--nav-border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  padding: '0.5rem',
                  minWidth: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 50
                }}>
                  <Link href="/orders" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                    📦 My Orders
                  </Link>
                  <Link href="/settings" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                    ⚙️ Account Settings
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)} style={{ color: 'var(--accent-blue, #3b82f6)' }}>
                      🛡️ Admin Portal
                    </Link>
                  )}
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                  <button onClick={handleLogout} className={styles.dropdownItem} style={{ color: 'var(--accent-red, #ef4444)', textAlign: 'left' }}>
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.ctaButton}>
              Log In
            </Link>
          )}

          <button 
            className={styles.cartButton} 
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
          </button>

          <button 
            className={styles.hamburgerBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className={clsx(styles.hamburgerLine, isMobileMenuOpen && styles.hamburgerOpen)}></span>
            <span className={clsx(styles.hamburgerLine, isMobileMenuOpen && styles.hamburgerOpen)}></span>
            <span className={clsx(styles.hamburgerLine, isMobileMenuOpen && styles.hamburgerOpen)}></span>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <div className={clsx(styles.mobileMenu, isMobileMenuOpen && styles.mobileMenuOpen)}>
        <ul className={styles.mobileNavLinks}>
          <li><Link href="/" className={styles.shopLink} onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link href="/shop" className={styles.shopLink} onClick={() => setIsMobileMenuOpen(false)}>Services</Link></li>
        </ul>
      </div>
    </>
  );
}
