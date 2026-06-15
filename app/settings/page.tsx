"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Package, MapPin, User, FileText, 
  Heart, Scale, Ticket, HeadphonesIcon, FileOutput, 
  Coins, LogOut, ChevronLeft, ChevronRight, Eye, Save, Plus, Trash2, CreditCard, Settings, X, Copy, Check, Clock, Edit2
} from "lucide-react";
import styles from "./settings.module.css";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCompare } from "@/context/CompareContext";
import Navigation from "@/components/Navigation";
import CartSidebar from "@/components/CartSidebar";
import { useRouter } from "next/navigation";
import AddressModal from "./AddressModal";
import PriceRequestModal from "./PriceRequestModal";

const COUNTRY_CODES = [
  { code: '+91', name: 'India' },
  { code: '+1', name: 'US/Canada' },
  { code: '+44', name: 'UK' },
  { code: '+61', name: 'Australia' },
  { code: '+81', name: 'Japan' },
  { code: '+86', name: 'China' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+971', name: 'UAE' },
  { code: '+65', name: 'Singapore' },
  { code: '+55', name: 'Brazil' },
  { code: '+52', name: 'Mexico' },
  { code: '+27', name: 'South Africa' }
];

export default function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phoneCode: "+91",
    phoneNum: "",
    currency: "INR",
    language: "en",
    email_orders: true,
    email_offers: false,
    points: 0,
    pendingPoints: 0,
    referralCode: "",
  });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [priceRequests, setPriceRequests] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [rewardsConfig, setRewardsConfig] = useState({
    purchases_multiplier: 1,
    review_points: 50,
    referral_points: 500
  });
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { currency, setCurrency, formatCurrency } = useCurrency();
  const [supportForm, setSupportForm] = useState({ subject: 'General Inquiry', message: '' });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const { compareList, removeFromCompare } = useCompare();
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const [isPriceRequestModalOpen, setIsPriceRequestModalOpen] = useState(false);

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
        // Use limit(1) + order to always get the most recently updated customer row
        // This prevents .single() from crashing on duplicate rows
        const { data: customers, error } = await supabase
          .from('customers')
          .select('id, name, points_issued, points_redeemed, referral_code, phone, currency, language, email_orders, email_offers')
          .eq('email', email)
          .order('joined_date', { ascending: false, nullsFirst: false })
          .limit(1);

        const customer = customers && customers.length > 0 ? customers[0] : null;
          
        if (error || !customer) {
          // Only create a new row if truly no customer exists yet
          const { count } = await supabase
            .from('customers')
            .select('id', { count: 'exact', head: true })
            .eq('email', email);

          if (!count || count === 0) {
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
            }).select().maybeSingle();
            
            if (newCustomer) {
              points = 0;
              referralCode = newCustomer.referral_code;
            }
          }
        } else {
          points = (customer.points_issued || 0) - (customer.points_redeemed || 0);
          referralCode = customer.referral_code || "";
          // Use the name saved in DB; fall back to auth metadata only if DB has no name
          const dbName = customer.name || name;
          let code = "+91";
          let num = customer.phone || "";
          if (num.startsWith("+")) {
            const match = num.match(/^(\+\d{1,4})\s*(.*)$/);
            if (match) {
              code = match[1];
              num = match[2];
            }
          }
          
          setProfile(p => ({
            ...p,
            name: dbName,
            phoneCode: code,
            phoneNum: num,
            currency: "INR",
            language: customer.language || "en",
            email_orders: customer.email_orders ?? true,
            email_offers: customer.email_offers ?? false
          }));
          // Currency is now fixed to INR, no need to update context
        }
      } catch (e) {
        console.error("Error fetching customer data:", e);
      }
      
      // Only set email, points, referralCode here — name is set above from DB
      setProfile(p => ({ ...p, email, points, referralCode }));

      // Fetch dynamic arrays
      Promise.all([
        fetch("/api/addresses").then(r => r.ok ? r.json() : []).then(data => Array.isArray(data) ? setAddresses(data) : null).catch(() => {}),
        fetch("/api/payments").then(r => r.ok ? r.json() : []).then(data => Array.isArray(data) ? setPayments(data) : null).catch(() => {}),
        fetch("/api/price-requests").then(r => r.ok ? r.json() : []).then(data => Array.isArray(data) ? setPriceRequests(data.filter((d:any) => d.customer_email === email)) : null).catch(() => {}),
        fetch("/api/discounts").then(r => r.ok ? r.json() : []).then(data => Array.isArray(data) ? setCoupons(data) : null).catch(() => {}),
        fetch("/api/wishlist").then(r => r.ok ? r.json() : []).then(data => Array.isArray(data) ? setWishlist(data) : null).catch(() => {}),
        fetch("/api/support/user").then(r => r.ok ? r.json() : []).then(data => Array.isArray(data) ? setMyTickets(data) : null).catch(() => {}),
        fetch("/api/orders").then(r => r.ok ? r.json() : []).then(data => {
          if (Array.isArray(data)) {
            const userOrders = data.filter((o: any) => o.customer?.email === email);
            let pending = 0;
            userOrders.forEach((o: any) => {
              if (['Pending', 'Processing', 'Shipped'].includes(o.status) && o.customer?.points_earned && !o.customer?.points_awarded) {
                pending += o.customer.points_earned;
              }
            });
            setProfile(p => ({ ...p, pendingPoints: pending }));
          }
        }).catch(() => {})
      ]);

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
          setAllProducts(data);
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

  const updateProfile = async () => {
    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: `${profile.phoneCode} ${profile.phoneNum}`.trim(),
          currency: profile.currency,
          language: profile.language,
          email_orders: profile.email_orders,
          email_offers: profile.email_offers
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile: " + (data?.error || res.status));
      }
    } catch (e: any) {
      alert("An error occurred: " + e.message);
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (addr: any) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const saveAddress = async (formData: any) => {
    try {
      const payload = {
        id: editingAddress ? editingAddress.id : undefined,
        type: formData.type,
        street: JSON.stringify({
          street1: formData.street1,
          street2: formData.street2,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          gst: formData.gst
        }),
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        is_default: formData.is_default
      };

      const url = "/api/addresses" + (editingAddress ? `?id=${editingAddress.id}` : "");
      const res = await fetch(url, {
        method: editingAddress ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const savedData = await res.json();
        if (editingAddress) {
          setAddresses(addresses.map(a => a.id === savedData.id ? savedData : a));
        } else {
          setAddresses([savedData, ...addresses]);
        }
        setIsAddressModalOpen(false);
      } else {
        alert("Failed to save address");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving address");
    }
  };

  const removeAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) setAddresses(addresses.filter(a => a.id !== id));
    } catch (e) {}
  };

  const addPayment = async () => {
    const last4 = prompt("Enter last 4 digits of card:");
    if (!last4) return;
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last4, type: "Visa", exp_month: "12", exp_year: "2028", is_default: payments.length === 0 })
      });
      if (res.ok) {
        const newPayment = await res.json();
        setPayments([newPayment, ...payments]);
      }
    } catch (e) {}
  };

  const removePayment = async (id: string) => {
    try {
      const res = await fetch(`/api/payments?id=${id}`, { method: "DELETE" });
      if (res.ok) setPayments(payments.filter(p => p.id !== id));
    } catch (e) {}
  };

  const toggleWishlist = async (product_id: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === "added") setWishlist([...wishlist, product_id]);
        else setWishlist(wishlist.filter(id => id !== product_id));
      }
    } catch (e) {}
  };

  const addPriceRequest = () => {
    setIsPriceRequestModalOpen(true);
  };

  const handleSavePriceRequest = async (formData: any) => {
    try {
      const res = await fetch("/api/price-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, customer_email: profile.email })
      });
      if (res.ok) {
        const newReq = await res.json();
        setPriceRequests([newReq, ...priceRequests]);
        setIsPriceRequestModalOpen(false);
        alert("Request submitted!");
      } else {
        alert("Failed to submit request.");
      }
    } catch (e) {
      alert("Error: " + e);
    }
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
                <img src={product.image || "/sequence/ezgif-frame-001.jpg"} alt={product.name} className={styles.productImage} />
                <button className={styles.quickViewBtn}>QUICK VIEW</button>
                <button className={styles.wishlistBtn} onClick={() => toggleWishlist(product.id)}>
                  <Heart size={16} fill={wishlist.includes(product.id) ? "#ef4444" : "transparent"} color={wishlist.includes(product.id) ? "#ef4444" : "#666"} />
                </button>
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
        <input type="text" className={styles.input} value={profile.name} onChange={(e) => setProfile(p => ({...p, name: e.target.value}))} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Email Address</label>
        <input type="email" className={styles.input} value={profile.email} disabled />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Phone Number</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            className={styles.input} 
            style={{ width: '150px' }}
            value={profile.phoneCode}
            onChange={(e) => setProfile(p => ({...p, phoneCode: e.target.value}))}
          >
            {COUNTRY_CODES.map(c => (
              <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
            ))}
          </select>
          <input 
            type="tel" 
            className={styles.input} 
            style={{ flex: 1 }}
            placeholder="98765 43210" 
            value={profile.phoneNum} 
            onChange={(e) => setProfile(p => ({...p, phoneNum: e.target.value}))} 
          />
        </div>
      </div>
      <button className={styles.saveBtn} onClick={updateProfile}><Save size={18} /> Save Changes</button>
    </motion.div>
  );

  const renderAddresses = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className={styles.tabTitle} style={{ marginBottom: 0 }}>Saved Addresses</h2>
        <button className={styles.addBtn} onClick={openAddAddress}><Plus size={16} /> Add New</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Billing Addresses</h3>
          <div className={styles.cardList} style={{ display: 'flex', flexDirection: 'column' }}>
            {addresses.filter(a => a.type === 'Billing').length === 0 ? <p>No billing addresses found.</p> : addresses.filter(a => a.type === 'Billing').map(addr => {
              let parsedStreet = addr.street;
              let parsedObj = null;
              try {
                if (addr.street.startsWith('{')) {
                  parsedObj = JSON.parse(addr.street);
                  parsedStreet = parsedObj.street1 + (parsedObj.street2 ? ', ' + parsedObj.street2 : '');
                }
              } catch(e) {}
              
              return (
                <div key={addr.id} className={styles.itemCard}>
                  <div className={styles.itemCardHeader}>
                    <span className={styles.itemType}>{addr.type}</span>
                    {addr.is_default && <span className={styles.defaultBadge}>DEFAULT</span>}
                  </div>
                  <div className={styles.itemDetail}>
                    {parsedObj?.firstName && <strong>{parsedObj.firstName} {parsedObj.lastName}</strong>}
                    {parsedObj?.firstName && <br />}
                    {parsedStreet}, {addr.city}, {addr.state} {addr.zip} {addr.country}
                    {parsedObj?.phone && <div>Phone: {parsedObj.phone}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={styles.deleteBtn} style={{ background: 'transparent', color: 'var(--text-primary)' }} onClick={() => openEditAddress(addr)}><Edit2 size={16} /> Edit</button>
                    <button className={styles.deleteBtn} onClick={() => removeAddress(addr.id)}><Trash2 size={16} /> Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Shipping Addresses</h3>
          <div className={styles.cardList} style={{ display: 'flex', flexDirection: 'column' }}>
            {addresses.filter(a => a.type === 'Shipping').length === 0 ? <p>No shipping addresses found.</p> : addresses.filter(a => a.type === 'Shipping').map(addr => {
              let parsedStreet = addr.street;
              let parsedObj = null;
              try {
                if (addr.street.startsWith('{')) {
                  parsedObj = JSON.parse(addr.street);
                  parsedStreet = parsedObj.street1 + (parsedObj.street2 ? ', ' + parsedObj.street2 : '');
                }
              } catch(e) {}
              
              return (
                <div key={addr.id} className={styles.itemCard}>
                  <div className={styles.itemCardHeader}>
                    <span className={styles.itemType}>{addr.type}</span>
                    {addr.is_default && <span className={styles.defaultBadge}>DEFAULT</span>}
                  </div>
                  <div className={styles.itemDetail}>
                    {parsedObj?.firstName && <strong>{parsedObj.firstName} {parsedObj.lastName}</strong>}
                    {parsedObj?.firstName && <br />}
                    {parsedStreet}, {addr.city}, {addr.state} {addr.zip} {addr.country}
                    {parsedObj?.phone && <div>Phone: {parsedObj.phone}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={styles.deleteBtn} style={{ background: 'transparent', color: 'var(--text-primary)' }} onClick={() => openEditAddress(addr)}><Edit2 size={16} /> Edit</button>
                    <button className={styles.deleteBtn} onClick={() => removeAddress(addr.id)}><Trash2 size={16} /> Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSave={saveAddress} 
        address={editingAddress} 
      />
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className={styles.tabTitle} style={{ marginBottom: 0 }}>Payment Methods</h2>
        <button className={styles.addBtn} onClick={addPayment}><Plus size={16} /> Add New</button>
      </div>
      <div className={styles.cardList}>
        {payments.length === 0 ? <p>No payment methods found.</p> : payments.map(pay => (
          <div key={pay.id} className={styles.itemCard}>
            <div className={styles.itemCardHeader}>
              <span className={styles.itemType} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} /> {pay.type} ending in {pay.last4}
              </span>
              {pay.is_default && <span className={styles.defaultBadge}>DEFAULT</span>}
            </div>
            <div className={styles.itemDetail}>
              Expires {pay.exp_month}/{pay.exp_year}
            </div>
            <button className={styles.deleteBtn} onClick={() => removePayment(pay.id)}><Trash2 size={16} /> Remove</button>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderPreferences = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Preferences</h2>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Currency</label>
        <div className={styles.selectInput} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', cursor: 'not-allowed', opacity: 0.7 }}>
          ₹ INR — Indian Rupee (Default)
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Language</label>
        <select className={styles.selectInput} value={profile.language} onChange={(e) => setProfile(p => ({...p, language: e.target.value}))}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
      <div className={styles.formGroup} style={{ marginTop: '30px' }}>
        <h3 className={styles.inputLabel} style={{ marginBottom: '12px' }}>Notifications</h3>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={profile.email_orders} onChange={(e) => setProfile(p => ({...p, email_orders: e.target.checked}))} />
          Order Updates via Email
        </label>
        <label className={styles.checkboxLabel} style={{ marginTop: '8px' }}>
          <input type="checkbox" checked={profile.email_offers} onChange={(e) => setProfile(p => ({...p, email_offers: e.target.checked}))} />
          Newsletter and Special Offers
        </label>
      </div>
      <button className={styles.saveBtn} onClick={updateProfile}><Save size={18} /> Save Preferences</button>
    </motion.div>
  );

  const renderWishlist = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>My Wishlist</h2>
      <div className={styles.productGrid}>
        {allProducts.filter(p => wishlist.includes(p.id)).length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Your wishlist is empty.</p>
        ) : (
          allProducts.filter(p => wishlist.includes(p.id)).map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageWrapper}>
                <img src={product.image || "/sequence/ezgif-frame-001.jpg"} alt={product.name} className={styles.productImage} />
                <button className={styles.wishlistBtn} style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => toggleWishlist(product.id)}>
                  <Heart size={16} fill="#ef4444" />
                </button>
              </div>
              <div className={styles.productInfo}>
                <h4 className={styles.productName}>{product.name}</h4>
                <p className={styles.price}>{formatCurrency(product.price)}</p>
                <button className={styles.addToCartBtn} onClick={() => addToCart(product, 1)}>Add To Cart</button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );

  const renderPriceRequests = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className={styles.tabTitle} style={{ marginBottom: 0 }}>Price Requests</h2>
        <button className={styles.addBtn} onClick={addPriceRequest}><Plus size={16} /> New Request</button>
      </div>
      <div className={styles.cardList}>
        {priceRequests.length === 0 ? <p>No price requests found.</p> : priceRequests.map(req => {
          const product = allProducts.find(p => p.id === req.product_id);
          const productName = product ? product.name : `Product ID: ${req.product_id}`;
          return (
            <div key={req.id} className={styles.itemCard}>
              <div className={styles.itemCardHeader}>
                <span className={styles.itemType}>{productName} (Bulk Order: {req.quantity} units)</span>
                <span className={styles.defaultBadge} style={{ background: req.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : req.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: req.status === 'Pending' ? '#f59e0b' : req.status === 'Rejected' ? '#ef4444' : '#10b981' }}>{req.status.toUpperCase()}</span>
              </div>
              <div className={styles.itemDetail}>
                Requested Price: {formatCurrency(req.requested_price)} • Submitted: {new Date(req.date).toLocaleDateString()}
              </div>
              {req.admin_remark && (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--background-secondary)', borderLeft: '3px solid #3b82f6', borderRadius: '4px', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 600, color: '#3b82f6', marginBottom: '4px' }}>Admin Response:</div>
                  <div style={{ color: 'var(--text-primary)' }}>{req.admin_remark}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PriceRequestModal 
        isOpen={isPriceRequestModalOpen}
        onClose={() => setIsPriceRequestModalOpen(false)}
        onSave={handleSavePriceRequest}
        products={allProducts}
      />
    </motion.div>
  );

  const renderCompare = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Compare Products</h2>
      {compareList.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--background-secondary)', borderRadius: '12px', border: '2px dashed var(--nav-border)' }}>
          <Scale size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Your compare list is empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Add products to compare their features and specifications.</p>
          <button className={styles.saveBtn} style={{ margin: '0 auto' }} onClick={() => window.location.href = '/shop'}>Browse Products</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(2, compareList.length)}, 1fr)`, gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
          {compareList.map((product) => (
            <div key={product.id} className={styles.itemCard} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <button 
                onClick={() => removeFromCompare(product.id)}
                style={{ position: 'absolute', top: 10, right: 10, background: 'var(--background-primary)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={14} color="var(--text-secondary)" />
              </button>
              <img src={product.image || "/sequence/ezgif-frame-001.jpg"} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{product.name}</h3>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>{formatCurrency(product.price)}</p>
              
              <div style={{ flex: 1 }}>
                {Object.entries(product.specs || {}).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--nav-border)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                    <span style={{ fontWeight: 500, textAlign: 'right', marginLeft: '10px' }}>{String(val)}</span>
                  </div>
                ))}
              </div>
              
              <button className={styles.addToCartBtn} style={{ marginTop: '20px' }} onClick={() => addToCart(product, 1)}>Add To Cart</button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderCoupons = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>My Coupons</h2>
      <div className={styles.productGrid}>
        {coupons.length === 0 ? <p>No coupons available right now.</p> : coupons.map(coupon => (
          <div key={coupon.id} className={styles.itemCard} style={{ borderLeft: '4px solid #10b981' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '8px' }}>{coupon.type === 'percentage' ? `${coupon.value}% OFF` : formatCurrency(coupon.value) + ' OFF'}</h3>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Discount Code</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>{coupon.expiry ? `Valid until ${new Date(coupon.expiry).toLocaleDateString()}` : 'No expiration'}</p>
            <div style={{ background: 'var(--background-secondary)', padding: '8px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px', border: '1px dashed rgba(var(--text-primary-rgb), 0.2)' }}>{coupon.code}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const handleSupportSubmit = async () => {
    if (!supportForm.message.trim()) {
      alert("Please enter a message.");
      return;
    }
    
    setIsSubmittingTicket(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportForm)
      });
      if (res.ok) {
        alert("Support ticket submitted successfully! We will get back to you soon.");
        setSupportForm({ subject: 'General Inquiry', message: '' });
        // Refresh tickets
        fetch("/api/support/user").then(r => r.ok ? r.json() : []).then(data => Array.isArray(data) ? setMyTickets(data) : null).catch(() => {});
      } else {
        alert("Failed to submit ticket.");
      }
    } catch(e) {
      alert("Error submitting ticket.");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const renderSupport = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Support Center</h2>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>How can we help you?</label>
        <select 
          className={styles.selectInput} 
          value={supportForm.subject}
          onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
        >
          <option value="General Inquiry">General Inquiry</option>
          <option value="Order Tracking / Status">Order Tracking / Status</option>
          <option value="Returns & Refunds">Returns & Refunds</option>
          <option value="Technical Support">Technical Support</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Message</label>
        <textarea 
          className={styles.input} 
          rows={5} 
          placeholder="Describe your issue..."
          value={supportForm.message}
          onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
        ></textarea>
      </div>
      <button 
        className={styles.saveBtn} 
        onClick={handleSupportSubmit}
        disabled={isSubmittingTicket}
      >
        {isSubmittingTicket ? "Submitting..." : "Submit Ticket"}
      </button>

      {myTickets.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>My Tickets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myTickets.map(ticket => (
              <div key={ticket.id} style={{ 
                background: 'rgba(var(--text-primary-rgb), 0.02)', 
                border: '1px solid rgba(var(--text-primary-rgb), 0.08)',
                padding: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ticket.subject}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    padding: '4px 8px', 
                    borderRadius: '100px',
                    backgroundColor: ticket.status === 'Open' ? 'rgba(59, 130, 246, 0.1)' : 
                                     ticket.status === 'In Progress' ? 'rgba(245, 166, 35, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: ticket.status === 'Open' ? '#3b82f6' : 
                           ticket.status === 'In Progress' ? '#f5a623' : '#10b981'
                  }}>
                    {ticket.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{ticket.message || "No description provided."}</p>
                {ticket.admin_reply && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #3b82f6' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', marginBottom: '4px' }}>Admin Reply:</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{ticket.admin_reply}</p>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Ticket ID: {ticket.id}</span>
                  <span>{new Date(ticket.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
        
        {profile.pendingPoints > 0 && (
          <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Clock size={16} color="#f59e0b" />
            <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>{profile.pendingPoints.toLocaleString()} points on the way!</span>
          </div>
        )}
      </div>

      {profile.referralCode && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '24px', borderRadius: '12px', border: '1px dashed #f59e0b', marginBottom: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', color: '#f59e0b', marginBottom: '8px' }}>Your Unique Referral Code</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Share this code with friends. When they register using it, you both get rewarded!</p>
          <div 
            onClick={() => {
              navigator.clipboard.writeText(profile.referralCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'var(--background-primary)', padding: '12px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '3px', cursor: 'pointer', transition: 'all 0.2s' }}
            title="Click to copy"
          >
            {profile.referralCode}
            {copied ? <Check size={20} color="#10b981" /> : <Copy size={20} color="var(--text-secondary)" />}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--background-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--nav-border)' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>How to earn more?</h3>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: 1.8 }}>
          <li>Earn {rewardsConfig.purchases_multiplier} point{rewardsConfig.purchases_multiplier !== 1 ? 's' : ''} for every ₹100 spent on our store.</li>
          <li>Leave a product review ({rewardsConfig.review_points} points).</li>
          <li>Refer a friend ({rewardsConfig.referral_points} points).</li>
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
