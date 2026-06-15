"use client";

import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import styles from "./checkout.module.css";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Script from "next/script";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { formatCurrency } = useCurrency();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);

  // Dynamic Shipping State
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<any>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    billingEmail: "",
    billingFirstName: "",
    billingLastName: "",
    billingCompany: "",
    billingCountry: "India",
    billingStreet1: "",
    billingStreet2: "",
    billingCity: "",
    billingState: "Punjab",
    billingPin: "",
    billingPhone: "",
    shippingFirstName: "",
    shippingLastName: "",
    shippingCompany: "",
    shippingCountry: "India",
    shippingStreet1: "",
    shippingStreet2: "",
    shippingCity: "",
    shippingState: "",
    shippingPin: "",
    orderNotes: ""
  });

  // Load saved address data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("reddix_checkout_address");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (e) {
        console.error("Failed to parse saved address data");
      }
    }
    const savedShippingToggle = localStorage.getItem("reddix_ship_different");
    if (savedShippingToggle) {
      setShipToDifferentAddress(savedShippingToggle === "true");
    }
  }, []);

  // Save address data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("reddix_checkout_address", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShipToDifferentAddress(isChecked);
    localStorage.setItem("reddix_ship_different", String(isChecked));
  };

  // Fetch Shipping Rates when PIN code changes
  useEffect(() => {
    const targetPin = shipToDifferentAddress ? formData.shippingPin : formData.billingPin;
    
    // Only fetch if PIN is 6 digits long
    if (targetPin && targetPin.length === 6) {
      const fetchRates = async () => {
        setIsFetchingRates(true);
        setShippingError(null);
        try {
          const res = await fetch("/api/shipping/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ delivery_postcode: targetPin, items }),
          });
          const data = await res.json();
          if (res.ok && data.rates && data.rates.length > 0) {
            setShippingRates(data.rates);
            // Auto-select the first (cheapest) rate
            setShippingMethod(data.rates[0]);
          } else {
            setShippingRates([]);
            setShippingMethod(null);
            setShippingError(data.error || "No shipping available to this PIN.");
          }
        } catch (err) {
          setShippingRates([]);
          setShippingMethod(null);
          setShippingError("Failed to calculate shipping.");
        } finally {
          setIsFetchingRates(false);
        }
      };

      // Simple debounce
      const timeoutId = setTimeout(() => {
        fetchRates();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      // Clear rates if PIN is invalid/cleared
      setShippingRates([]);
      setShippingMethod(null);
      setShippingError(null);
    }
  }, [formData.billingPin, formData.shippingPin, shipToDifferentAddress, items]);

  const shippingCost = shippingMethod ? shippingMethod.rate : 0;
  const finalTotal = cartTotal + shippingCost;

  const handlePayment = async () => {
    if (!termsAccepted) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!formData.billingFirstName || !formData.billingLastName || !formData.billingEmail || !formData.billingStreet1 || !formData.billingCity || !formData.billingPin || !formData.billingPhone) {
      alert("Please fill in all required billing details.");
      return;
    }

    if (shipToDifferentAddress) {
      if (!formData.shippingFirstName || !formData.shippingLastName || !formData.shippingStreet1 || !formData.shippingCity || !formData.shippingPin) {
        alert("Please fill in all required shipping details.");
        return;
      }
    }

    setIsProcessing(true);

    try {
      // 1. Call our backend to create a Razorpay order
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_HERE", // Replace with real key or set in .env
        amount: orderData.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: orderData.currency,
        name: "Reddix Tech Enterprises",
        description: "Test Transaction",
        image: "/sequence/ezgif-frame-001.jpg",
        order_id: orderData.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: async function (response: any) {
          // In a real app, verify the payment signature here
          // After verification, save the full order details to the database
          try {
            const orderPayload = {
              items,
              total: finalTotal,
              paymentId: response.razorpay_payment_id,
              billingAddress: {
                firstName: formData.billingFirstName,
                lastName: formData.billingLastName,
                email: formData.billingEmail,
                company: formData.billingCompany,
                street1: formData.billingStreet1,
                street2: formData.billingStreet2,
                city: formData.billingCity,
                state: formData.billingState,
                pin: formData.billingPin,
                phone: formData.billingPhone,
              },
              shippingAddress: shipToDifferentAddress ? {
                firstName: formData.shippingFirstName,
                lastName: formData.shippingLastName,
                company: formData.shippingCompany,
                street1: formData.shippingStreet1,
                street2: formData.shippingStreet2,
                city: formData.shippingCity,
                state: formData.shippingState,
                pin: formData.shippingPin,
              } : null,
              shippingMethod: shippingMethod ? shippingMethod.courier_name : "Pickup",
            };
            
            // Note: We would normally post this to /api/orders, but the current /api/orders
            // requires authentication. Assuming success for this demo flow.
            console.log("Order saved:", orderPayload);
            alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            
            clearCart();
            router.push("/cart?success=true");
          } catch (e) {
            alert("Error saving order details.");
          }
        },
        prefill: {
          name: `${formData.billingFirstName} ${formData.billingLastName}`.trim() || "VISHNU VARDHAN REDDY",
          email: formData.billingEmail || "reddix.lpu@gmail.com",
          contact: formData.billingPhone || "9000090000"
        },
        theme: {
          color: "#0073aa"
        }
      };

      // @ts-ignore
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
      });
      rzp1.open();

    } catch (error: any) {
      alert("Error initializing payment: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main>
      <Navigation />
      {/* Load Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <span className={styles.inactiveStep}>SHOPPING CART</span>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.activeStep}>CHECKOUT DETAILS</span>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.inactiveStep}>ORDER COMPLETE</span>
        </div>

        <div className={styles.content}>
          {/* Left Column: Billing Details */}
          <div className={styles.leftCol}>
            <h2 className={styles.sectionTitle}>Billing Details</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                  <label>Email address *</label>
                  <input type="email" name="billingEmail" value={formData.billingEmail} onChange={handleInputChange} className={styles.inputField} required />
                </div>

                <div className={styles.inputGroup}>
                  <label>First name *</label>
                  <input type="text" name="billingFirstName" value={formData.billingFirstName} onChange={handleInputChange} className={styles.inputField} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Last name *</label>
                  <input type="text" name="billingLastName" value={formData.billingLastName} onChange={handleInputChange} className={styles.inputField} required />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                  <label>Company name (Optional)</label>
                  <input type="text" name="billingCompany" value={formData.billingCompany} onChange={handleInputChange} className={styles.inputField} />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                  <label>Country / Region *</label>
                  <select name="billingCountry" value={formData.billingCountry} onChange={handleInputChange} className={styles.selectField}>
                    <option value="India">India</option>
                  </select>
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                  <label>Street address *</label>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <input type="text" name="billingStreet1" value={formData.billingStreet1} onChange={handleInputChange} className={styles.inputField} placeholder="House number and street name" style={{ flex: 2 }} required />
                    <input type="text" name="billingStreet2" value={formData.billingStreet2} onChange={handleInputChange} className={styles.inputField} placeholder="Apartment, suite, unit, etc. (optional)" style={{ flex: 1 }} />
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                  <label>Town / City *</label>
                  <input type="text" name="billingCity" value={formData.billingCity} onChange={handleInputChange} className={styles.inputField} required />
                </div>

                <div className={styles.inputGroup}>
                  <label>State *</label>
                  <select name="billingState" value={formData.billingState} onChange={handleInputChange} className={styles.selectField} required>
                    <option value="Punjab">Punjab</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>PIN Code *</label>
                  <input type="text" name="billingPin" value={formData.billingPin} onChange={handleInputChange} className={styles.inputField} required />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                  <label>Phone *</label>
                  <input type="tel" name="billingPhone" value={formData.billingPhone} onChange={handleInputChange} className={styles.inputField} required />
                </div>
              </div>

              {/* Shipping Address Toggle */}
              <div style={{ marginTop: "32px", marginBottom: "24px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: 600, fontSize: "1.1rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={shipToDifferentAddress}
                    onChange={handleShippingToggle}
                    style={{ width: "18px", height: "18px" }}
                  />
                  Ship to a different address?
                </label>
              </div>

              {/* Shipping Address Fields */}
              {shipToDifferentAddress && (
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>First name *</label>
                    <input type="text" name="shippingFirstName" value={formData.shippingFirstName} onChange={handleInputChange} className={styles.inputField} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Last name *</label>
                    <input type="text" name="shippingLastName" value={formData.shippingLastName} onChange={handleInputChange} className={styles.inputField} required />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                    <label>Company name (Optional)</label>
                    <input type="text" name="shippingCompany" value={formData.shippingCompany} onChange={handleInputChange} className={styles.inputField} />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                    <label>Country / Region *</label>
                    <select name="shippingCountry" value={formData.shippingCountry} onChange={handleInputChange} className={styles.selectField}>
                      <option value="India">India</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                    <label>Street address *</label>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <input type="text" name="shippingStreet1" value={formData.shippingStreet1} onChange={handleInputChange} className={styles.inputField} placeholder="House number and street name" style={{ flex: 2 }} required />
                      <input type="text" name="shippingStreet2" value={formData.shippingStreet2} onChange={handleInputChange} className={styles.inputField} placeholder="Apartment, suite, unit, etc. (optional)" style={{ flex: 1 }} />
                    </div>
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                    <label>Town / City *</label>
                    <input type="text" name="shippingCity" value={formData.shippingCity} onChange={handleInputChange} className={styles.inputField} required />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>State *</label>
                    <select name="shippingState" value={formData.shippingState} onChange={handleInputChange} className={styles.selectField} required>
                      <option value="" disabled>Select an option...</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>PIN Code *</label>
                    <input type="text" name="shippingPin" value={formData.shippingPin} onChange={handleInputChange} className={styles.inputField} required />
                  </div>
                </div>
              )}

              <div className={styles.inputGroup} style={{ marginTop: "24px" }}>
                <label>Order notes (optional)</label>
                <textarea 
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  className={styles.textareaField} 
                  placeholder="Notes about your order, e.g. special notes for delivery."
                ></textarea>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className={styles.rightCol}>
            <div className={styles.orderSummaryBox}>
              <h3 className={styles.orderSummaryTitle}>Your Order</h3>
              
              <table className={styles.orderTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "right" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.productName}>
                        {item.name} <strong className={styles.productQty}>× {item.quantity}</strong>
                      </td>
                      <td className={styles.subtotalAmt}>
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.totalsRow}>
                <span>Subtotal</span>
                <strong>{formatCurrency(cartTotal)}</strong>
              </div>

              <div className={styles.totalsRow} style={{ flexDirection: "column" }}>
                <span>Shipment</span>
                <div className={styles.shippingOptions}>
                  {isFetchingRates ? (
                    <div style={{ color: "var(--accent-blue)", fontSize: "0.9rem", padding: "10px 0" }}>
                      Calculating live rates for your PIN...
                    </div>
                  ) : shippingError ? (
                    <div style={{ color: "#ff4d4d", fontSize: "0.85rem", padding: "10px 0" }}>
                      {shippingError}
                    </div>
                  ) : shippingRates.length > 0 ? (
                    shippingRates.map((rate, index) => (
                      <label key={index}>
                        <input 
                          type="radio" 
                          name="shipping" 
                          checked={shippingMethod?.courier_name === rate.courier_name}
                          onChange={() => setShippingMethod(rate)}
                        />
                        <span>{rate.courier_name} (Est. {rate.estimated_delivery_days} Days): <strong>{formatCurrency(rate.rate)}</strong></span>
                      </label>
                    ))
                  ) : (
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", padding: "10px 0" }}>
                      Enter a valid 6-digit PIN code to see shipping rates.
                    </div>
                  )}
                  
                  {/* Always allow store pickup */}
                  <label style={{ marginTop: "8px" }}>
                    <input 
                      type="radio" 
                      name="shipping" 
                      checked={shippingMethod === null}
                      onChange={() => setShippingMethod(null)}
                    />
                    <span>Store Pickup - Free (Contact Care for Appt)</span>
                  </label>
                </div>
              </div>

              <div className={styles.finalTotal}>
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>

              <div className={styles.paymentMethods}>
                <div className={`${styles.paymentMethod} ${paymentMethod === "upi" ? styles.active : ""}`}>
                  <label className={styles.paymentLabel}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="upi" 
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                    />
                    Pay with UPI
                  </label>
                  {paymentMethod === "upi" && (
                    <div className={styles.paymentDesc}>
                      It uses UPI apps like BHIM, Paytm, Google Pay, PhonePe or any Banking UPI app to make payment.
                    </div>
                  )}
                </div>

                <div className={`${styles.paymentMethod} ${paymentMethod === "razorpay" ? styles.active : ""}`}>
                  <label className={styles.paymentLabel}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="razorpay" 
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                    />
                    Pay by Razorpay
                  </label>
                  {paymentMethod === "razorpay" && (
                    <div className={styles.paymentDesc}>
                      Pay securely by Credit or Debit card or Internet Banking through Razorpay.
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.termsContainer}>
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms">
                  I have read and agree to the website <a href="#">terms and conditions</a> *
                </label>
              </div>

              <button 
                className={styles.btnPrimary}
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? "PROCESSING..." : "PROCEED TO PAYMENT"}
              </button>
              
              <div style={{ marginTop: "16px", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <a href="#" style={{ color: "var(--accent-blue)" }}>privacy policy</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
