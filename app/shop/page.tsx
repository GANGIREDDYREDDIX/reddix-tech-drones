"use client";

import Navigation from "@/components/Navigation";
import { categories, type Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Star, Shield, Truck, RotateCcw, ChevronDown, X, SlidersHorizontal, Search, ChevronLeft, Heart, Scale } from "lucide-react";
import styles from "./shop.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import CartSidebar from "@/components/CartSidebar";
import { useCurrency } from "@/context/CurrencyContext";
import { useCompare } from "@/context/CompareContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Shop() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { compareList, addToCompare, removeFromCompare } = useCompare();
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatCurrency } = useCurrency();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, customerName: "", text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setDbProducts(data || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });

    const checkWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const w = await res.json();
          setWishlist(w || []);
        }
      } catch (e) {}
    };
    checkWishlist();
  }, []);

  const toggleWishlist = async (product_id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      } else {
        alert("Please log in to add to wishlist.");
      }
    } catch (e) {}
  };

  const filteredProducts = useMemo(() => {
    let result = dbProducts;
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [activeCategory, sortBy, searchQuery, dbProducts]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const openReviewModal = async (product: Product) => {
    try {
      const res = await fetch(`/api/reviews/verify-purchase?productId=${product.id}`);
      
      if (res.status === 401) {
        alert("Please log in to write a review.");
        return;
      }
      
      const data = await res.json();
      
      if (!data.canReview) {
        alert("You can only review products that you have purchased and that have been delivered to you.");
        return;
      }
      
      setReviewProduct(product);
      setReviewForm({ rating: 5, customerName: data.customerName || "", text: "" });
      setReviewModalOpen(true);
    } catch(e) {
      alert("Failed to verify purchase status. Please try again.");
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProduct) return;
    setSubmittingReview(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: reviewProduct.id,
          productName: reviewProduct.name,
          rating: reviewForm.rating,
          customerName: reviewForm.customerName,
          text: reviewForm.text
        })
      });
      setReviewModalOpen(false);
      alert("Review submitted successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleCompare = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const isComparing = compareList.some((p) => p.id === product.id);
    if (isComparing) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <>
      <Navigation />
      <CartSidebar />
      <main className={styles.shopContainer}>
        {/* ─── Back Button ─── */}
        <div style={{ padding: '20px 5% 0' }}>
          <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
            <ChevronLeft size={20} /> Back
          </button>
        </div>

        {/* ─── Hero Banner ─── */}
        <section className={styles.shopHero}>
          <motion.div
            className={styles.shopHeroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className={styles.heroBadge}>🚁 Reddix Store</span>
            <h1>Aerial <span className="gradient-text">Perfection</span><br />Starts Here.</h1>
            <p>Professional drones, precision accessories, and enterprise-grade services — engineered for those who demand the best.</p>
          </motion.div>
        </section>

        {/* ─── Trust Badges ─── */}
        <section className={styles.trustBadges}>
          <div className={styles.trustItem}>
            <Truck size={20} />
            <span>Free Shipping over {formatCurrency(120)}</span>
          </div>
          <div className={styles.trustItem}>
            <Shield size={20} />
            <span>2-Year Warranty</span>
          </div>
          <div className={styles.trustItem}>
            <RotateCcw size={20} />
            <span>30-Day Returns</span>
          </div>
          <div className={styles.trustItem}>
            <Star size={20} />
            <span>4.8★ Avg Rating</span>
          </div>
        </section>

        {/* ─── Filters & Search Bar ─── */}
        <section className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search drones, accessories..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery("")}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.categoryTabs}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.catTab} ${activeCategory === cat ? styles.catTabActive : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.sortWrapper}>
            <SlidersHorizontal size={16} />
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown size={14} className={styles.sortArrow} />
          </div>
        </section>

        {/* ─── Results Count ─── */}
        <div className={styles.resultsCount}>
          <span>{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found</span>
        </div>

        {/* ─── Product Grid ─── */}
        <section className={styles.productGrid}>
          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.div
                className={styles.emptyState}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="empty"
              >
                <p>No products match your search. Try a different term.</p>
                <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>Clear Filters</button>
              </motion.div>
            ) : (
              filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className={styles.productCard}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.07, duration: 0.4 }}
                >
                  {/* Badge */}
                  {product.badge && (
                    <span className={styles.badge}>{product.badge}</span>
                  )}

                  {/* Image */}
                  <div className={styles.imageContainer}>
                    <img src={product.image || "/sequence/ezgif-frame-001.jpg"} alt={product.name} className={styles.productImage} />
                    {!product.inStock && <div className={styles.outOfStock}>Out of Stock</div>}
                    
                    <div className={styles.floatingActions}>
                      <button className={styles.floatingBtnIcon} aria-label="Add to compare" onClick={(e) => toggleCompare(product, e)}>
                        <Scale size={16} color={compareList.some(p => p.id === product.id) ? "#3b82f6" : "#fff"} />
                      </button>
                      <button className={styles.floatingBtnIcon} aria-label="Add to wishlist" onClick={(e) => toggleWishlist(product.id, e)}>
                        <Heart size={16} fill={wishlist.includes(product.id) ? "#ef4444" : "transparent"} color={wishlist.includes(product.id) ? "#ef4444" : "#fff"} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={styles.productInfo}>
                    <span className={styles.productCategory}>{product.category}</span>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productTagline}>{product.tagline}</p>
                    <p className={styles.productDesc}>{product.description}</p>

                    {/* Rating */}
                    <div className={styles.ratingRow}>
                      <div className={styles.stars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            fill={i < Math.round(product.rating) ? "#f5a623" : "transparent"}
                            stroke={i < Math.round(product.rating) ? "#f5a623" : "#666"}
                          />
                        ))}
                      </div>
                      <span className={styles.ratingText}>{product.rating} ({product.reviewCount} reviews)</span>
                      <button className={styles.writeReviewBtn} onClick={() => openReviewModal(product)}>Write a Review</button>
                    </div>

                    {/* Features */}
                    <ul className={styles.featureList}>
                      {product.features.slice(0, 3).map(f => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>

                    {/* Specs */}
                    {product.specs && Object.keys(product.specs).length > 0 && (
                      <div className={styles.specsGrid}>
                        {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                          <div key={k} className={styles.specItem}>
                            <span className={styles.specKey}>{k}</span>
                            <span className={styles.specVal}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Price + CTA */}
                    <div className={styles.cardFooter}>
                      <div className={styles.priceBlock}>
                        <span className={styles.price}>{formatCurrency(product.price)}</span>
                        {product.originalPrice && (
                          <span className={styles.originalPrice}>{formatCurrency(product.originalPrice)}</span>
                        )}
                      </div>

                      <div className={styles.productActions}>
                        <button
                          className={`${styles.addToCartBtn} ${addedId === product.id ? styles.added : ""}`}
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                        >
                          {addedId === product.id ? (
                            "✓ Added!"
                          ) : (
                            <><ShoppingCart size={15} /> Add to Cart</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </section>

        {/* ─── Why Buy Section ─── */}
        <section className={styles.whyBuy}>
          <h2>Why Choose <span className="gradient-text">Reddix Tech</span></h2>
          <div className={styles.whyGrid}>
            {[
              { icon: "🎯", title: "Precision Engineering", desc: "Every component tested to aerospace tolerance standards before shipping." },
              { icon: "🛡️", title: "2-Year Warranty", desc: "Full parts & labour warranty on all hardware products. No small print." },
              { icon: "🚀", title: "Same-Day Dispatch", desc: "Orders placed before 2 PM IST ship the same business day." },
              { icon: "💬", title: "Expert Support", desc: "Dedicated drone engineers available 7 days a week via chat or call." },
              { icon: "🔄", title: "Easy Returns", desc: "30-day no-questions-asked return policy on all orders." },
              { icon: "🏆", title: "Industry Leading", desc: "Trusted by 5000+ professionals, filmmakers and enterprise teams globally." },
            ].map(item => (
              <div key={item.title} className={styles.whyCard}>
                <span className={styles.whyIcon}>{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Newsletter ─── */}
        <section className={styles.newsletter}>
          <div className={styles.newsletterContent}>
            <h2>Stay in the <span className="gradient-text">Loop</span></h2>
            <p>Get exclusive deals, early product launches, and flight tutorials straight to your inbox.</p>
            <form className={styles.newsletterForm} onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" />
              <button type="submit">Subscribe</button>
            </form>
            <p className={styles.newsletterDisclaimer}>No spam, unsubscribe anytime. We respect your privacy.</p>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <h3>Reddix Tech Enterprises</h3>
              <p>Transforming industries through custom aerial systems, precision 3D printing, and enterprise-grade technology solutions.</p>
              <div className={styles.socialLinks}>
                <a href="/coming-soon" aria-label="Instagram">📷</a>
                <a href="/coming-soon" aria-label="YouTube">▶️</a>
                <a href="/coming-soon" aria-label="LinkedIn">💼</a>
                <a href="/coming-soon" aria-label="Twitter">🐦</a>
              </div>
            </div>

            <div className={styles.footerCol}>
              <h4>Products</h4>
              <a href="/coming-soon">Professional Drones</a>
              <a href="/coming-soon">Enterprise Systems</a>
              <a href="/coming-soon">Accessories</a>
              <a href="/coming-soon">3D Print Service</a>
            </div>

            <div className={styles.footerCol}>
              <h4>Support</h4>
              <a href="/coming-soon">Getting Started</a>
              <a href="/coming-soon">Warranty & Repairs</a>
              <a href="/coming-soon">FAQs</a>
              <a href="/coming-soon">Contact Us</a>
            </div>

            <div className={styles.footerCol}>
              <h4>Company</h4>
              <a href="/coming-soon">About Us</a>
              <a href="/coming-soon">Careers</a>
              <a href="/coming-soon">Privacy Policy</a>
              <Link href="/terms-and-conditions">Terms of Service</Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2025 Reddix Tech Enterprises. All rights reserved.</p>
            <div className={styles.paymentIcons}>
              <span>💳 Visa</span>
              <span>💳 Mastercard</span>
              <span>📱 UPI</span>
              <span>🏦 Net Banking</span>
            </div>
          </div>
        </footer>
      </main>

      {/* ─── Review Modal ─── */}
      {reviewModalOpen && reviewProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Review: {reviewProduct.name}</h2>
              <button className={styles.closeBtn} onClick={() => setReviewModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={submitReview} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Rating</label>
                <div className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      <Star 
                        size={24} 
                        fill={star <= reviewForm.rating ? "#f5a623" : "transparent"} 
                        stroke={star <= reviewForm.rating ? "#f5a623" : "#666"} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Your Name</label>
                <input 
                  required 
                  placeholder="e.g. John D." 
                  value={reviewForm.customerName} 
                  onChange={e => setReviewForm({ ...reviewForm, customerName: e.target.value })} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Your Review</label>
                <textarea 
                  required 
                  rows={4} 
                  placeholder="What did you think about this product?" 
                  value={reviewForm.text} 
                  onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} 
                ></textarea>
              </div>

              <div className={styles.modalFooter} style={{ padding: '0', marginTop: '10px', border: 'none' }}>
                <button type="button" className={styles.cancelBtn} onClick={() => setReviewModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
