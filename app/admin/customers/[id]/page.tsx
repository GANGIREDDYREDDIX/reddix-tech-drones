"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Ban, Check, Package, MapPin, DollarSign, Award, ShoppingCart } from "lucide-react";
import styles from "./customer-detail.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface CustomerDetails {
  customer: any;
  orders: any[];
  addresses: any[];
}

export default function CustomerDetailView() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency, loading: currencyLoading } = useCurrency();
  
  const [data, setData] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/customers/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch customer details");
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  const handleToggleStatus = async () => {
    if (!data) return;
    const currentStatus = data.customer.status;
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.customer.id, status: newStatus })
      });
      if (res.ok) {
        setData({
          ...data,
          customer: { ...data.customer, status: newStatus }
        });
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const handleEmail = () => {
    if (data?.customer?.email) {
      window.location.href = `mailto:${data.customer.email}`;
    }
  };

  if (loading) {
    return <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>Loading customer profile...</div>;
  }

  if (error || !data) {
    return <div style={{ padding: "48px", textAlign: "center", color: "#ef4444" }}>{error || "Customer not found"}</div>;
  }

  const { customer, orders, addresses } = data;
  const isVip = customer.total_spent >= 10000;
  const pointsBalance = (customer.points_issued || 0) - (customer.points_redeemed || 0);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <button className={styles.backBtn} onClick={() => router.push('/admin/customers')}>
          <ArrowLeft size={16} /> Back to Customers
        </button>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileInfo}>
          <div className={styles.avatar} style={{ background: "linear-gradient(135deg, #4D96FF, #2B7FFF)" }}>
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.details}>
            <h1>
              {customer.name}
              {isVip && <span className={styles.vipBadge}>VIP</span>}
            </h1>
            <p><Mail size={14} /> {customer.email}</p>
            <p>Joined {new Date(customer.joined_date).toLocaleDateString()}</p>
            <div className={styles.badges}>
              <span className={`${styles.statusBadge} ${customer.status === 'Active' ? styles.active : styles.suspended}`}>
                {customer.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleEmail}>
            <Mail size={16} /> Email Customer
          </button>
          <button 
            className={`${styles.btn} ${customer.status === 'Active' ? styles.btnDanger : styles.btnPrimary}`} 
            onClick={handleToggleStatus}
          >
            {customer.status === 'Active' ? <Ban size={16} /> : <Check size={16} />}
            {customer.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
          </button>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}><DollarSign size={24} /></div>
          <div className={styles.metricInfo}>
            <h3>Lifetime Value</h3>
            <p>{!currencyLoading ? formatCurrency(customer.total_spent) : "..."}</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}><ShoppingCart size={24} /></div>
          <div className={styles.metricInfo}>
            <h3>Total Orders</h3>
            <p>{orders.length}</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}><Award size={24} /></div>
          <div className={styles.metricInfo}>
            <h3>Reward Points</h3>
            <p>{pointsBalance} pts</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Column: Orders */}
        <div className={styles.card}>
          <h2><Package size={20} /> Order History</h2>
          {orders.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No orders placed yet.</p>
          ) : (
            <div className={styles.list}>
              {orders.map((order: any) => (
                <div key={order.id} className={styles.orderItem}>
                  <div className={styles.orderMain}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderDate}>{new Date(order.date).toLocaleString()}</span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderTotal}>{!currencyLoading ? formatCurrency(order.total) : "..."}</span>
                    <span className={`${styles.statusBadge} ${order.status === 'Delivered' ? styles.active : styles.suspended}`} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Addresses */}
        <div className={styles.card}>
          <h2><MapPin size={20} /> Saved Addresses</h2>
          {addresses.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No addresses saved.</p>
          ) : (
            <div className={styles.list}>
              {addresses.map((address: any) => (
                <div key={address.id} className={styles.addressItem}>
                  <div className={styles.addressType}>
                    {address.type} {address.is_default && "(Default)"}
                  </div>
                  <div className={styles.addressText}>
                    {address.street}<br/>
                    {address.city}, {address.state} {address.zip}<br/>
                    {address.country}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
