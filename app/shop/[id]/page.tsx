"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Star, Shield, Truck, Heart, ArrowRight } from "lucide-react";
import styles from "./product-detail.module.css";
import type { Product } from "@/data/products";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { addToCart } = useCart();
  const { formatCurrency } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) router.push("/shop");
          return;
        }
        const data = await res.json();
        setProduct(data);
        setActiveImage(data.image || "/sequence/ezgif-frame-001.jpg");
        // Simulated multiple images since DB currently holds 1
        setGallery([
          data.image || "/sequence/ezgif-frame-001.jpg",
          "/sequence/ezgif-frame-015.jpg",
          "/sequence/ezgif-frame-030.jpg"
        ]);

        // Fetch all to get related products
        const allRes = await fetch("/api/products");
        if (allRes.ok) {
          const allData = await allRes.json();
          const otherProducts = allData.filter((p: Product) => p.id !== data.id);
          const sameCategory = otherProducts.filter((p: Product) => p.category === data.category);
          const diffCategory = otherProducts.filter((p: Product) => p.category !== data.category);
          
          // Combine same category first, then fallback to others, limit to 4
          const related = [...sameCategory, ...diffCategory].slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    checkWishlist();
  }, [id, router]);

  const checkWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const w = await res.json();
        setWishlist(w || []);
      }
    } catch (e) {}
  };

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === "added") setWishlist([...wishlist, product.id]);
        else setWishlist(wishlist.filter(wId => wId !== product.id));
      } else {
        alert("Please log in to add to wishlist.");
      }
    } catch (e) {}
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={`${styles.productLayout} ${styles.skeleton}`} style={{ height: "60vh" }}></div>
          </div>
        </div>
      </>
    );
  }

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.backWrapper}>
            <BackButton />
          </div>

          <div className={styles.productLayout}>
            {/* Gallery Left */}
            <div className={styles.gallery}>
              <div className={styles.mainImageContainer}>
                {product.badge && <span className={styles.badge} style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>{product.badge}</span>}
                <img src={activeImage} alt={product.name} className={styles.mainImage} />
              </div>
              <div className={styles.thumbnails}>
                {gallery.map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`${styles.thumbnailBtn} ${activeImage === img ? styles.thumbnailActive : ""}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`Thumbnail ${idx+1}`} className={styles.thumbImage} />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Right */}
            <div className={styles.info}>
              <span className={styles.category}>{product.category}</span>
              <h1 className={styles.title}>{product.name}</h1>
              <p className={styles.tagline}>{product.tagline}</p>

              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.round(product.rating) ? "#f5a623" : "transparent"}
                      stroke={i < Math.round(product.rating) ? "#f5a623" : "#666"}
                    />
                  ))}
                </div>
                <span className={styles.reviewCount}>{product.rating} ({product.reviewCount} verified reviews)</span>
              </div>

              <div className={styles.priceBlock}>
                <span className={styles.price}>{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>{formatCurrency(product.originalPrice)}</span>
                )}
              </div>

              <div className={styles.actionArea}>
                <div className={styles.qtyWrapper}>
                  <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)} disabled={!product.inStock}>+</button>
                </div>
                <button 
                  className={`${styles.addToCartBtn} ${added ? styles.added : ""}`}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  {added ? "Added to Cart" : product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
                <button 
                  className={styles.wishlistBtn} 
                  onClick={toggleWishlist}
                  aria-label="Add to Wishlist"
                >
                  <Heart size={20} fill={isWishlisted ? "#ef4444" : "transparent"} color={isWishlisted ? "#ef4444" : "var(--text-primary)"} />
                </button>
              </div>

              <h3 className={styles.sectionTitle}>Product Description</h3>
              <p className={styles.description}>{product.description}</p>

              <h3 className={styles.sectionTitle}>Key Features</h3>
              <ul className={styles.featuresList}>
                {product.features?.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>

              {product.specs && Object.keys(product.specs).length > 0 && (
                <>
                  <h3 className={styles.sectionTitle}>Technical Specifications</h3>
                  <div className={styles.specsGrid}>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className={styles.specItem}>
                        <span className={styles.specKey}>{key}</span>
                        <span className={styles.specVal}>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className={styles.relatedSection}>
              <h2 className={styles.relatedTitle}>Customers also viewed</h2>
              <div className={styles.relatedGrid}>
                {relatedProducts.map(rp => (
                  <Link href={`/shop/${rp.id}`} key={rp.id} style={{ textDecoration: 'none' }}>
                    <div className={styles.relatedCard}>
                      <div className={styles.relatedCardImageContainer}>
                        <img src={rp.image || "/sequence/ezgif-frame-001.jpg"} alt={rp.name} className={styles.relatedCardImage} />
                      </div>
                      <h4 className={styles.relatedCardTitle}>{rp.name}</h4>
                      <p className={styles.relatedCardPrice}>{formatCurrency(rp.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
