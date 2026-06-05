"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Bell, Search, Tag, ClipboardList, RotateCcw, Star, ShoppingBag, MessageSquare, Shield, FileText } from "lucide-react";
import styles from "./admin.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import { useCurrency } from "@/context/CurrencyContext";

import { createClient } from '@/utils/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currency, setCurrency, loading } = useCurrency();

  // Don't show the shell on the login page
  if (pathname === '/admin/login' || pathname === '/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
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
            <button className={styles.actionBtn}>
              <Search size={18} />
            </button>
            <button className={styles.actionBtn}>
              <Bell size={18} />
            </button>
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
