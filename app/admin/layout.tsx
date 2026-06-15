"use client";
import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Tag, ClipboardList, RotateCcw, Star, ShoppingBag, MessageSquare, Shield, FileText } from "lucide-react";
import styles from "./admin.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import { useCurrency } from "@/context/CurrencyContext";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationsDropdown from "@/components/NotificationsDropdown";

import { createClient } from '@/utils/supabase/client';

const AUTHORIZED_EMAILS = [
  'chintureddy6165@gmail.com',
  'reddix.lpu@gmail.com',
  'yashkansal321@gmail.com',
  'iamsiddhartha9@gmail.com',
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currency, setCurrency, loading } = useCurrency();

  // ✅ BULLETPROOF FIX: Triple-layer protection.
  //
  // Layer 1 (useEffect on mount): Verifies real Supabase auth on every page load.
  //   - Catches direct URL access, expired sessions, and normal bfcache restores.
  //
  // Layer 2 (pageshow event): Fires specifically when a page is restored from
  //   bfcache. Re-checks auth since the session may have expired.
  //
  // Layer 3 (visibilitychange event): Catches the case where the user switches
  //   tabs and back, and their session expired in the meantime.
  //
  // All three layers use verifyAuth() which hits Supabase directly — no stale
  // data, no cookie tricks. If auth fails, window.location.replace() does a
  // hard redirect that removes the admin page from the history stack entirely.
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const isAdmin = user?.email && AUTHORIZED_EMAILS.includes(user.email.toLowerCase());
        if (!isAdmin) {
          window.location.replace('/login');
        }
      } catch {
        window.location.replace('/login');
      }
    };

    verifyAuth(); // Layer 1: on every mount

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) verifyAuth(); // Layer 2: bfcache restore
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') verifyAuth(); // Layer 3: tab switch back
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  // Don't show the shell on the login page
  if (pathname === '/admin/login' || pathname === '/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Hard replace removes the admin page from history entirely
    window.location.replace('/login');
  };

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Inventory", href: "/admin/inventory", icon: ClipboardList },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Price Requests", href: "/admin/price-requests", icon: FileText },
    { name: "Returns (RTO)", href: "/admin/rto", icon: RotateCcw },
    { name: "Abandoned Carts", href: "/admin/abandoned-carts", icon: ShoppingBag },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Points & Rewards", href: "/admin/rewards", icon: Star },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Discounts", href: "/admin/discounts", icon: Tag },
    { name: "Support", href: "/admin/support", icon: MessageSquare },
    { name: "Staff", href: "/admin/staff", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className={styles.adminShell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Package size={20} />
          </div>
          <span className={styles.brandText}>Reddix Admin</span>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <item.icon size={18} className={styles.navIcon} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
          </div>

          <div className={styles.topbarActions}>
            {!loading && (
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as any)}
                style={{ 
                  background: 'var(--background-secondary)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  padding: '4px 8px', 
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            )}
            <GlobalSearch />
            <NotificationsDropdown />
            <ThemeToggle />
            <div className={styles.userProfile}>
              <div className={styles.avatar}>A</div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
