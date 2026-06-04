"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./Navigation.module.css";
import clsx from "clsx";
import Link from "next/link";

export default function Navigation() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();

  const opacity = useTransform(scrollY, [0, 100], [0, 1]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <>
      <motion.nav
        className={clsx(styles.navContainer, isScrolled && styles.scrolled)}
        style={{ opacity }}
      >
        <Link href="/" className={styles.brand}>Reddix Tech</Link>
        
        <ul className={styles.navLinks}>
          <li><Link href="/">Overview</Link></li>
          <li><Link href="/#drones">Aerial Systems</Link></li>
          <li><Link href="/#3d-printing">3D Printing</Link></li>
          <li><Link href="/shop" className={styles.shopLink}>Services</Link></li>
        </ul>

        <div className={styles.ctaContainer}>
          <button 
            className={styles.cartButton} 
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
          </button>
          <Link href="/shop" className={styles.ctaButton}>Start a Project</Link>
          
          <button 
            className={styles.hamburgerBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className={clsx(styles.hamburgerLine, isMobileMenuOpen && styles.hamburgerOpen)} />
            <div className={clsx(styles.hamburgerLine, isMobileMenuOpen && styles.hamburgerOpen)} />
            <div className={clsx(styles.hamburgerLine, isMobileMenuOpen && styles.hamburgerOpen)} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <div className={clsx(styles.mobileMenu, isMobileMenuOpen && styles.mobileMenuOpen)}>
        <ul className={styles.mobileNavLinks}>
          <li><Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Overview</Link></li>
          <li><Link href="/#drones" onClick={() => setIsMobileMenuOpen(false)}>Aerial Systems</Link></li>
          <li><Link href="/#3d-printing" onClick={() => setIsMobileMenuOpen(false)}>3D Printing</Link></li>
          <li><Link href="/shop" className={styles.shopLink} onClick={() => setIsMobileMenuOpen(false)}>Services</Link></li>
        </ul>
      </div>
    </>
  );
}
