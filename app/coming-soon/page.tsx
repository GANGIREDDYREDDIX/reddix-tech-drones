"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { ArrowLeft } from "lucide-react";

export default function ComingSoon() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background-base)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', maxWidth: '600px' }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚧</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', background: 'linear-gradient(45deg, #f5f7fa, #c3cfe2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Page Under Construction
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px' }}>
            We're working hard to bring you this page. Please check back later! In the meantime, continue exploring our cutting-edge drone catalog.
          </p>
          
          <Link href="/shop" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 24px', 
            background: 'var(--primary-color)', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: '8px',
            fontWeight: 600
          }}>
            <ArrowLeft size={18} /> Back to Shop
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
