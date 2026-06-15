"use client";

import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import styles from "./checkout.module.css";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { formatCurrency } = useCurrency();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);

  // Quick autofill for testing
  const autofillTestData = () => {
    setFormData({
      ...formData,
      billingFirstName: "Vishnu",
      billingLastName: "Reddy",
      billingEmail: "reddix.lpu@gmail.com",
      billingCompany: "Reddix Tech",
      billingGstNumber: "29ABCDE1234F1Z5",
      billingCountry: "India",
      billingStreet1: "LPU Campus, Jalandhar",
      billingStreet2: "Block 34",
      billingCity: "Phagwara",
      billingState: "Punjab",
      billingPin: "144411",
      billingPhone: "9876543210",
    });
  };

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
    billingGstNumber: "",
    billingCountry: "India",
    billingStreet1: "",
    billingStreet2: "",
    billingCity: "",
    billingState: "",
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
      if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === "rzp_test_YOUR_KEY_HERE" || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        // MOCK PAYMENT FOR TESTING
        const isSuccess = window.confirm("MOCK RAZORPAY: Click 'OK' to simulate a SUCCESSFUL payment, or 'Cancel' to simulate a FAILED payment.");
        if (isSuccess) {
           const mockPaymentId = "pay_mock_" + Math.random().toString(36).substring(7);
           alert(`Payment successful! Payment ID: ${mockPaymentId}`);
           clearCart();
           router.push("/cart?success=true");
        } else {
           alert("Payment Failed: Simulated failure by user.");
        }
        setIsProcessing(false);
        return;
      }

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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className={styles.sectionTitle}>Billing Details</h2>
                <button 
                  onClick={autofillTestData}
                  style={{
                    backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ccc', 
                    padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                  }}
                >
                  🧪 Autofill Test Data
                </button>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                  <label>Email address *</label>
                  <input
                    type="email"
                    name="billingEmail"
                    value={formData.billingEmail}
                    onChange={handleInputChange}
                    className={styles.inputField}
                    pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                    title="Please enter a valid email address with @"
                    placeholder="example@domain.com"
                    required
                  />
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
                  <label>GST Number (Optional — for B2B invoicing)</label>
                  <input
                    type="text"
                    name="billingGstNumber"
                    value={formData.billingGstNumber}
                    onChange={handleInputChange}
                    className={styles.inputField}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    maxLength={15}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                  <label>Country / Region *</label>
                  <select name="billingCountry" value={formData.billingCountry} onChange={handleInputChange} className={styles.selectField}>
                    <option value="" disabled>Select a country...</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Albania">Albania</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Andorra">Andorra</option>
                    <option value="Angola">Angola</option>
                    <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Armenia">Armenia</option>
                    <option value="Australia">Australia</option>
                    <option value="Austria">Austria</option>
                    <option value="Azerbaijan">Azerbaijan</option>
                    <option value="Bahamas">Bahamas</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Barbados">Barbados</option>
                    <option value="Belarus">Belarus</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Belize">Belize</option>
                    <option value="Benin">Benin</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Bulgaria">Bulgaria</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Burundi">Burundi</option>
                    <option value="Cabo Verde">Cabo Verde</option>
                    <option value="Cambodia">Cambodia</option>
                    <option value="Cameroon">Cameroon</option>
                    <option value="Canada">Canada</option>
                    <option value="Central African Republic">Central African Republic</option>
                    <option value="Chad">Chad</option>
                    <option value="Chile">Chile</option>
                    <option value="China">China</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Comoros">Comoros</option>
                    <option value="Congo, Democratic Republic of the">Congo, Democratic Republic of the</option>
                    <option value="Congo, Republic of the">Congo, Republic of the</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Croatia">Croatia</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Cyprus">Cyprus</option>
                    <option value="Czechia">Czechia</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Dominica">Dominica</option>
                    <option value="Dominican Republic">Dominican Republic</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Egypt">Egypt</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="Equatorial Guinea">Equatorial Guinea</option>
                    <option value="Eritrea">Eritrea</option>
                    <option value="Estonia">Estonia</option>
                    <option value="Eswatini">Eswatini</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Fiji">Fiji</option>
                    <option value="Finland">Finland</option>
                    <option value="France">France</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Gambia">Gambia</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Germany">Germany</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Greece">Greece</option>
                    <option value="Grenada">Grenada</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Guinea">Guinea</option>
                    <option value="Guinea-Bissau">Guinea-Bissau</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Haiti">Haiti</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Iceland">Iceland</option>
                    <option value="India">India</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Iran">Iran</option>
                    <option value="Iraq">Iraq</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Israel">Israel</option>
                    <option value="Italy">Italy</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="Japan">Japan</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Kiribati">Kiribati</option>
                    <option value="Korea, North">Korea, North</option>
                    <option value="Korea, South">Korea, South</option>
                    <option value="Kosovo">Kosovo</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Kyrgyzstan">Kyrgyzstan</option>
                    <option value="Laos">Laos</option>
                    <option value="Latvia">Latvia</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Liberia">Liberia</option>
                    <option value="Libya">Libya</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Mali">Mali</option>
                    <option value="Malta">Malta</option>
                    <option value="Marshall Islands">Marshall Islands</option>
                    <option value="Mauritania">Mauritania</option>
                    <option value="Mauritius">Mauritius</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Micronesia">Micronesia</option>
                    <option value="Moldova">Moldova</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mongolia">Mongolia</option>
                    <option value="Montenegro">Montenegro</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Myanmar">Myanmar</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Nauru">Nauru</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="North Macedonia">North Macedonia</option>
                    <option value="Norway">Norway</option>
                    <option value="Oman">Oman</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Palau">Palau</option>
                    <option value="Palestine">Palestine</option>
                    <option value="Panama">Panama</option>
                    <option value="Papua New Guinea">Papua New Guinea</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Peru">Peru</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Poland">Poland</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Romania">Romania</option>
                    <option value="Russia">Russia</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                    <option value="Saint Lucia">Saint Lucia</option>
                    <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                    <option value="Samoa">Samoa</option>
                    <option value="San Marino">San Marino</option>
                    <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Serbia">Serbia</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Slovenia">Slovenia</option>
                    <option value="Solomon Islands">Solomon Islands</option>
                    <option value="Somalia">Somalia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="South Sudan">South Sudan</option>
                    <option value="Spain">Spain</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Sudan">Sudan</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Syria">Syria</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="Tajikistan">Tajikistan</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Timor-Leste">Timor-Leste</option>
                    <option value="Togo">Togo</option>
                    <option value="Tonga">Tonga</option>
                    <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Turkmenistan">Turkmenistan</option>
                    <option value="Tuvalu">Tuvalu</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Uzbekistan">Uzbekistan</option>
                    <option value="Vanuatu">Vanuatu</option>
                    <option value="Vatican City">Vatican City</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Yemen">Yemen</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
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
                    <option value="" disabled>Select a state...</option>
                    <option>Andhra Pradesh</option>
                    <option>Arunachal Pradesh</option>
                    <option>Assam</option>
                    <option>Bihar</option>
                    <option>Chhattisgarh</option>
                    <option>Goa</option>
                    <option>Gujarat</option>
                    <option>Haryana</option>
                    <option>Himachal Pradesh</option>
                    <option>Jharkhand</option>
                    <option>Karnataka</option>
                    <option>Kerala</option>
                    <option>Madhya Pradesh</option>
                    <option>Maharashtra</option>
                    <option>Manipur</option>
                    <option>Meghalaya</option>
                    <option>Mizoram</option>
                    <option>Nagaland</option>
                    <option>Odisha</option>
                    <option>Punjab</option>
                    <option>Rajasthan</option>
                    <option>Sikkim</option>
                    <option>Tamil Nadu</option>
                    <option>Telangana</option>
                    <option>Tripura</option>
                    <option>Uttar Pradesh</option>
                    <option>Uttarakhand</option>
                    <option>West Bengal</option>
                    <option>Andaman and Nicobar Islands</option>
                    <option>Chandigarh</option>
                    <option>Dadra and Nagar Haveli and Daman and Diu</option>
                    <option>Delhi</option>
                    <option>Jammu and Kashmir</option>
                    <option>Ladakh</option>
                    <option>Lakshadweep</option>
                    <option>Puducherry</option>
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
                      <option value="" disabled>Select a country...</option>
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Albania">Albania</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Andorra">Andorra</option>
                      <option value="Angola">Angola</option>
                      <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Armenia">Armenia</option>
                      <option value="Australia">Australia</option>
                      <option value="Austria">Austria</option>
                      <option value="Azerbaijan">Azerbaijan</option>
                      <option value="Bahamas">Bahamas</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Barbados">Barbados</option>
                      <option value="Belarus">Belarus</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Belize">Belize</option>
                      <option value="Benin">Benin</option>
                      <option value="Bhutan">Bhutan</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Brunei">Brunei</option>
                      <option value="Bulgaria">Bulgaria</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Burundi">Burundi</option>
                      <option value="Cabo Verde">Cabo Verde</option>
                      <option value="Cambodia">Cambodia</option>
                      <option value="Cameroon">Cameroon</option>
                      <option value="Canada">Canada</option>
                      <option value="Central African Republic">Central African Republic</option>
                      <option value="Chad">Chad</option>
                      <option value="Chile">Chile</option>
                      <option value="China">China</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Comoros">Comoros</option>
                      <option value="Congo, Democratic Republic of the">Congo, Democratic Republic of the</option>
                      <option value="Congo, Republic of the">Congo, Republic of the</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Croatia">Croatia</option>
                      <option value="Cuba">Cuba</option>
                      <option value="Cyprus">Cyprus</option>
                      <option value="Czechia">Czechia</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Djibouti">Djibouti</option>
                      <option value="Dominica">Dominica</option>
                      <option value="Dominican Republic">Dominican Republic</option>
                      <option value="Ecuador">Ecuador</option>
                      <option value="Egypt">Egypt</option>
                      <option value="El Salvador">El Salvador</option>
                      <option value="Equatorial Guinea">Equatorial Guinea</option>
                      <option value="Eritrea">Eritrea</option>
                      <option value="Estonia">Estonia</option>
                      <option value="Eswatini">Eswatini</option>
                      <option value="Ethiopia">Ethiopia</option>
                      <option value="Fiji">Fiji</option>
                      <option value="Finland">Finland</option>
                      <option value="France">France</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Gambia">Gambia</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Germany">Germany</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Greece">Greece</option>
                      <option value="Grenada">Grenada</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="Guinea">Guinea</option>
                      <option value="Guinea-Bissau">Guinea-Bissau</option>
                      <option value="Guyana">Guyana</option>
                      <option value="Haiti">Haiti</option>
                      <option value="Honduras">Honduras</option>
                      <option value="Hungary">Hungary</option>
                      <option value="Iceland">Iceland</option>
                      <option value="India">India</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Iran">Iran</option>
                      <option value="Iraq">Iraq</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Israel">Israel</option>
                      <option value="Italy">Italy</option>
                      <option value="Jamaica">Jamaica</option>
                      <option value="Japan">Japan</option>
                      <option value="Jordan">Jordan</option>
                      <option value="Kazakhstan">Kazakhstan</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Kiribati">Kiribati</option>
                      <option value="Korea, North">Korea, North</option>
                      <option value="Korea, South">Korea, South</option>
                      <option value="Kosovo">Kosovo</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Kyrgyzstan">Kyrgyzstan</option>
                      <option value="Laos">Laos</option>
                      <option value="Latvia">Latvia</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Lesotho">Lesotho</option>
                      <option value="Liberia">Liberia</option>
                      <option value="Libya">Libya</option>
                      <option value="Liechtenstein">Liechtenstein</option>
                      <option value="Lithuania">Lithuania</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Madagascar">Madagascar</option>
                      <option value="Malawi">Malawi</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Maldives">Maldives</option>
                      <option value="Mali">Mali</option>
                      <option value="Malta">Malta</option>
                      <option value="Marshall Islands">Marshall Islands</option>
                      <option value="Mauritania">Mauritania</option>
                      <option value="Mauritius">Mauritius</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Micronesia">Micronesia</option>
                      <option value="Moldova">Moldova</option>
                      <option value="Monaco">Monaco</option>
                      <option value="Mongolia">Mongolia</option>
                      <option value="Montenegro">Montenegro</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Myanmar">Myanmar</option>
                      <option value="Namibia">Namibia</option>
                      <option value="Nauru">Nauru</option>
                      <option value="Nepal">Nepal</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Niger">Niger</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="North Macedonia">North Macedonia</option>
                      <option value="Norway">Norway</option>
                      <option value="Oman">Oman</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Palau">Palau</option>
                      <option value="Palestine">Palestine</option>
                      <option value="Panama">Panama</option>
                      <option value="Papua New Guinea">Papua New Guinea</option>
                      <option value="Paraguay">Paraguay</option>
                      <option value="Peru">Peru</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Poland">Poland</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Romania">Romania</option>
                      <option value="Russia">Russia</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                      <option value="Saint Lucia">Saint Lucia</option>
                      <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                      <option value="Samoa">Samoa</option>
                      <option value="San Marino">San Marino</option>
                      <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Senegal">Senegal</option>
                      <option value="Serbia">Serbia</option>
                      <option value="Seychelles">Seychelles</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Slovakia">Slovakia</option>
                      <option value="Slovenia">Slovenia</option>
                      <option value="Solomon Islands">Solomon Islands</option>
                      <option value="Somalia">Somalia</option>
                      <option value="South Africa">South Africa</option>
                      <option value="South Sudan">South Sudan</option>
                      <option value="Spain">Spain</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Sudan">Sudan</option>
                      <option value="Suriname">Suriname</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Syria">Syria</option>
                      <option value="Taiwan">Taiwan</option>
                      <option value="Tajikistan">Tajikistan</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Timor-Leste">Timor-Leste</option>
                      <option value="Togo">Togo</option>
                      <option value="Tonga">Tonga</option>
                      <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                      <option value="Tunisia">Tunisia</option>
                      <option value="Turkey">Turkey</option>
                      <option value="Turkmenistan">Turkmenistan</option>
                      <option value="Tuvalu">Tuvalu</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Ukraine">Ukraine</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Uzbekistan">Uzbekistan</option>
                      <option value="Vanuatu">Vanuatu</option>
                      <option value="Vatican City">Vatican City</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Yemen">Yemen</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Zimbabwe">Zimbabwe</option>
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
                      <option value="" disabled>Select a state...</option>
                      <option>Andhra Pradesh</option>
                      <option>Arunachal Pradesh</option>
                      <option>Assam</option>
                      <option>Bihar</option>
                      <option>Chhattisgarh</option>
                      <option>Goa</option>
                      <option>Gujarat</option>
                      <option>Haryana</option>
                      <option>Himachal Pradesh</option>
                      <option>Jharkhand</option>
                      <option>Karnataka</option>
                      <option>Kerala</option>
                      <option>Madhya Pradesh</option>
                      <option>Maharashtra</option>
                      <option>Manipur</option>
                      <option>Meghalaya</option>
                      <option>Mizoram</option>
                      <option>Nagaland</option>
                      <option>Odisha</option>
                      <option>Punjab</option>
                      <option>Rajasthan</option>
                      <option>Sikkim</option>
                      <option>Tamil Nadu</option>
                      <option>Telangana</option>
                      <option>Tripura</option>
                      <option>Uttar Pradesh</option>
                      <option>Uttarakhand</option>
                      <option>West Bengal</option>
                      <option>Andaman and Nicobar Islands</option>
                      <option>Chandigarh</option>
                      <option>Dadra and Nagar Haveli and Daman and Diu</option>
                      <option>Delhi</option>
                      <option>Jammu and Kashmir</option>
                      <option>Ladakh</option>
                      <option>Lakshadweep</option>
                      <option>Puducherry</option>
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
                  I have read and agree to the website{" "}
                  <Link href="/terms-and-conditions" target="_blank" style={{ color: "#007bff", textDecoration: "underline" }}>
                    terms and conditions
                  </Link>{" "}
                  *
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
