"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Package, MapPin, User, FileText, 
  Heart, Scale, Ticket, HeadphonesIcon, FileOutput, 
  Coins, LogOut, ChevronLeft, ChevronRight, Eye, Save, Plus, Trash2, CreditCard, Settings
} from "lucide-react";
import styles from "./settings.module.css";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import Navigation from "@/components/Navigation";
import CartSidebar from "@/components/CartSidebar";
import { useRouter } from "next/navigation";

export default function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    points: 0,
    referralCode: "",
  });
  const [rewardsConfig, setRewardsConfig] = useState({
    purchases_amount: 100,
    purchases_points: 1,
    reviews_points: 50,
    referrals_points: 500
  });
  const [products, setProducts] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { currency, setCurrency, formatCurrency } = useCurrency();

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/login";
        return;
      }
      
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";
      const email = user.email || user.phone || "";
      
      let points = 0;
      let referralCode = "";
      
      try {
        const { data: customer, error } = await supabase
          .from('customers')
          .select('points_issued, points_redeemed, referral_code')
          .eq('email', email)
          .single();
          
        if (error || !customer) {
          // If customer doesn't exist in our public.customers table, create them now
          const generatedRefCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const newCustomerId = `CUST-${Math.floor(Math.random() * 100000)}`;
          
          const { data: newCustomer } = await supabase.from('customers').insert({
            id: newCustomerId,
            name: name,
            email: email,
            referral_code: generatedRefCode,
            points_issued: 0,
            points_redeemed: 0,
            status: 'Active'
          }).select().single();
          
          if (newCustomer) {
            points = 0;
            referralCode = newCustomer.referral_code;
          }
        } else if (customer) {
          points = (customer.points_issued || 0) - (customer.points_redeemed || 0);
          referralCode = customer.referral_code || "";
        }
      } catch (e) {
        console.error("Error fetching customer data:", e);
      }
      
      setProfile({ name, email, points, referralCode });

      // Fetch dynamic rewards configuration
      try {
        const { data: config } = await supabase.from('rewards_config').select('*').single();
        if (config) {
          setRewardsConfig(config);
        }
      } catch (e) {
        console.error("Error fetching rewards config:", e);
      }

      // Load products for "You may also like"
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.slice(0, 3)); // show first 3
        }
      } catch (e) {}

      setLoading(false);
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = 'customer_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = "/";
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading your account...</div></div>;
  }

  const renderDashboard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.dashboardContainer}>
      <h2 className={styles.welcomeTitle}>Welcome to your account page</h2>
      <p className={styles.welcomeText}>
        Hi <strong>{profile.name.toUpperCase()}</strong>, today is a great day to check your account page. You can check also:
      </p>

      <div className={styles.quickLinks}>
        <button className={styles.quickBtn} onClick={() => window.location.href = '/orders'}>
          <Package size={18} /> Recent Orders
        </button>
        <button className={styles.quickBtn} onClick={() => setActiveTab('addresses')}>
          <MapPin size={18} /> Addresses
        </button>
        <button className={styles.quickBtn} onClick={() => setActiveTab('account')}>
          <User size={18} /> Account Details
        </button>
      </div>

      <div className={styles.youMayLikeSection}>
        <h3 className={styles.sectionTitle}>You may also like...</h3>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageWrapper}>
                <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                <button className={styles.quickViewBtn}>QUICK VIEW</button>
                <button className={styles.wishlistBtn}><Heart size={16} /></button>
              </div>
              <div className={styles.productInfo}>
                <h4 className={styles.productName}>{product.name}</h4>
                <p className={styles.sku}>SKU: {product.id.split('-').pop()?.toUpperCase() || 'RED-X1'}</p>
                <p className={styles.price}>
                  {formatCurrency(product.price)} <span className={styles.taxInfo}>(+ Tax)</span>
                </p>
                <button 
                  className={styles.addToCartBtn}
                  onClick={() => addToCart(product, 1)}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Profile Details</h2>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Full Name</label>
        <input type="text" className={styles.input} defaultValue={profile.name} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Email Address</label>
        <input type="email" className={styles.input} defaultValue={profile.email} disabled />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Phone Number</label>
        <input type="tel" className={styles.input} placeholder="+1 (555) 000-0000" />
      </div>
      <button className={styles.saveBtn}><Save size={18} /> Save Changes</button>
    </motion.div>
  );

  const renderAddresses = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className={styles.tabTitle} style={{ marginBottom: 0 }}>Saved Addresses</h2>
        <button className={styles.addBtn}><Plus size={16} /> Add New</button>
      </div>
      <div className={styles.cardList}>
        <div className={styles.itemCard}>
          <div className={styles.itemCardHeader}>
            <span className={styles.itemType}>Shipping</span>
            <span className={styles.defaultBadge}>DEFAULT</span>
          </div>
          <div className={styles.itemDetail}>
            123 Tech Lane, Silicon Valley, CA 94025
          </div>
          <button className={styles.deleteBtn}><Trash2 size={16} /> Remove</button>
        </div>
      </div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className={styles.tabTitle} style={{ marginBottom: 0 }}>Payment Methods</h2>
        <button className={styles.addBtn}><Plus size={16} /> Add New</button>
      </div>
      <div className={styles.cardList}>
        <div className={styles.itemCard}>
          <div className={styles.itemCardHeader}>
            <span className={styles.itemType} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} /> Visa ending in 4242
            </span>
            <span className={styles.defaultBadge}>DEFAULT</span>
          </div>
          <div className={styles.itemDetail}>
            Expires 12/2028
          </div>
          <button className={styles.deleteBtn}><Trash2 size={16} /> Remove</button>
        </div>
      </div>
    </motion.div>
  );

  const renderPreferences = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Preferences</h2>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Currency</label>
        <select className={styles.selectInput} value={currency.toLowerCase()} onChange={(e) => setCurrency(e.target.value.toUpperCase() as any)}>
          <option value="usd">USD ($)</option>
          <option value="eur">EUR (€)</option>
          <option value="gbp">GBP (£)</option>
          <option value="inr">INR (₹)</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Language</label>
        <select className={styles.selectInput} defaultValue="en">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
      <div className={styles.formGroup} style={{ marginTop: '30px' }}>
        <h3 className={styles.inputLabel} style={{ marginBottom: '12px' }}>Notifications</h3>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" defaultChecked />
          Order Updates via Email
        </label>
        <label className={styles.checkboxLabel} style={{ marginTop: '8px' }}>
          <input type="checkbox" />
          Newsletter and Special Offers
        </label>
      </div>
      <button className={styles.saveBtn}><Save size={18} /> Save Preferences</button>
    </motion.div>
  );

  const renderWishlist = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>My Wishlist</h2>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImageWrapper}>
              <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
              <button className={styles.wishlistBtn} style={{ color: '#ef4444', borderColor: '#ef4444' }}><Heart size={16} fill="#ef4444" /></button>
            </div>
            <div className={styles.productInfo}>
              <h4 className={styles.productName}>{product.name}</h4>
              <p className={styles.price}>{formatCurrency(product.price)}</p>
              <button className={styles.addToCartBtn} onClick={() => addToCart(product, 1)}>Add To Cart</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderPriceRequests = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className={styles.tabTitle} style={{ marginBottom: 0 }}>Price Requests</h2>
        <button className={styles.addBtn}><Plus size={16} /> New Request</button>
      </div>
      <div className={styles.cardList}>
        <div className={styles.itemCard}>
          <div className={styles.itemCardHeader}>
            <span className={styles.itemType}>Reddix Pro X1 Drone (Bulk Order: 10 units)</span>
            <span className={styles.defaultBadge} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>PENDING</span>
          </div>
          <div className={styles.itemDetail}>
            Requested Price: {formatCurrency(20000)} • Submitted: Oct 12, 2026
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCompare = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Compare Products</h2>
      <div style={{ padding: '40px', textAlign: 'center', background: 'var(--background-secondary)', borderRadius: '12px', border: '2px dashed var(--nav-border)' }}>
        <Scale size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Your compare list is empty</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Add products to compare their features and specifications.</p>
        <button className={styles.saveBtn} style={{ margin: '0 auto' }}>Browse Products</button>
      </div>
    </motion.div>
  );

  const renderCoupons = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>My Coupons</h2>
      <div className={styles.productGrid}>
        <div className={styles.itemCard} style={{ borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '8px' }}>10% OFF</h3>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Welcome Bonus</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>Valid until Dec 31, 2026</p>
          <div style={{ background: 'var(--background-secondary)', padding: '8px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px', border: '1px dashed rgba(var(--text-primary-rgb), 0.2)' }}>WELCOME10</div>
        </div>
        <div className={styles.itemCard} style={{ borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#3b82f6', marginBottom: '8px' }}>FREE SHIP</h3>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Orders over {formatCurrency(500)}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>No expiration</p>
          <div style={{ background: 'var(--background-secondary)', padding: '8px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px', border: '1px dashed rgba(var(--text-primary-rgb), 0.2)' }}>FREESHIP500</div>
        </div>
      </div>
    </motion.div>
  );

  const renderSupport = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Support Center</h2>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>How can we help you?</label>
        <select className={styles.selectInput} defaultValue="general">
          <option value="general">General Inquiry</option>
          <option value="order">Order Tracking / Status</option>
          <option value="returns">Returns & Refunds</option>
          <option value="tech">Technical Support</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Message</label>
        <textarea className={styles.input} rows={5} placeholder="Describe your issue..."></textarea>
      </div>
      <button className={styles.saveBtn}>Submit Ticket</button>
    </motion.div>
  );

  const renderInvoices = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Order Invoices</h2>
      <div className={styles.cardList}>
        <div className={styles.itemCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Invoice #INV-2026-7294</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Order Date: Oct 10, 2026 • Amount: {formatCurrency(2499)}</p>
          </div>
          <button className={styles.addBtn}><FileOutput size={16} /> Download PDF</button>
        </div>
      </div>
    </motion.div>
  );

  const renderPoints = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
        <Coins size={64} color="#f59e0b" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{profile.points.toLocaleString()}</h2>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Available Reddix Points</p>
      </div>

      {profile.referralCode && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '24px', borderRadius: '12px', border: '1px dashed #f59e0b', marginBottom: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', color: '#f59e0b', marginBottom: '8px' }}>Your Unique Referral Code</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Share this code with friends. When they register using it, you both get rewarded!</p>
          <div style={{ display: 'inline-block', background: 'var(--background-primary)', padding: '12px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '3px', userSelect: 'all' }}>
            {profile.referralCode}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--background-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--nav-border)' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>How to earn more?</h3>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: 1.8 }}>
          <li>Earn {rewardsConfig.purchases_points} point{rewardsConfig.purchases_points !== 1 ? 's' : ''} for every {formatCurrency(rewardsConfig.purchases_amount)} spent on our store.</li>
          <li>Leave a product review ({rewardsConfig.reviews_points} points).</li>
          <li>Refer a friend ({rewardsConfig.referrals_points} points).</li>
        </ul>
      </div>
    </motion.div>
  );

  const sidebarLinks = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders', icon: Package, label: 'Orders', href: '/orders' },
    { id: 'addresses', icon: MapPin, label: 'Addresses' },
    { id: 'payments', icon: CreditCard, label: 'Payment Methods' },
    { id: 'account', icon: User, label: 'Account details' },
    { id: 'preferences', icon: Settings, label: 'Preferences' },
    { id: 'price-requests', icon: FileText, label: 'Price Requests' },
    { id: 'wishlist', icon: Heart, label: 'Wishlist' },
    { id: 'compare', icon: Scale, label: 'Compare' },
    { id: 'coupons', icon: Ticket, label: 'My Coupons' },
    { id: 'support', icon: HeadphonesIcon, label: 'Support' },
    { id: 'invoices', icon: FileOutput, label: 'Order Invoices' },
    { id: 'points', icon: Coins, label: 'Reddix Points' },
  ];

  return (
    <>
      <Navigation />
      <CartSidebar />
      <div className={styles.pageWrapper}>
      <motion.div 
        className={styles.pageHeader} 
        style={{ position: 'relative' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <button onClick={() => router.back()} style={{ position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1><User size={24} /> MY ACCOUNT</h1>
      </motion.div>

      <div className={styles.container}>
        <div className={styles.layout}>
          
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>
                <User size={48} color="#9ca3af" />
              </div>
              <h3 className={styles.userName}>{profile.name.toUpperCase()}</h3>
              <p className={styles.userEmail}>{profile.email}</p>
            </div>

            <nav className={styles.navMenu}>
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                if (link.href) {
                  return (
                    <Link key={link.id} href={link.href} className={styles.navItem}>
                      <Icon size={18} /> {link.label}
                    </Link>
                  );
                }
                return (
                  <button 
                    key={link.id}
                    className={`${styles.navItem} ${activeTab === link.id ? styles.active : ''}`}
                    onClick={() => setActiveTab(link.id)}
                  >
                    <Icon size={18} /> {link.label}
                  </button>
                );
              })}
              <button className={styles.navItem} onClick={handleLogout}>
                <LogOut size={18} /> Log out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className={styles.content}>
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'account' && renderProfile()}
              {activeTab === 'addresses' && renderAddresses()}
              {activeTab === 'payments' && renderPayments()}
              {activeTab === 'preferences' && renderPreferences()}
              {activeTab === 'wishlist' && renderWishlist()}
              {activeTab === 'price-requests' && renderPriceRequests()}
              {activeTab === 'compare' && renderCompare()}
              {activeTab === 'coupons' && renderCoupons()}
              {activeTab === 'support' && renderSupport()}
              {activeTab === 'invoices' && renderInvoices()}
              {activeTab === 'points' && renderPoints()}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
      </div>
    </>
  );
}
