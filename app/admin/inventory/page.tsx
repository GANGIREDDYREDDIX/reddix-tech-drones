"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, PackageX } from "lucide-react";
import styles from "./inventory.module.css";

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
}

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  // Store local edits before saving
  const [localStock, setLocalStock] = useState<Record<string, number>>({});

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
      
      // Initialize local stock state
      const initialStock: Record<string, number> = {};
      data.forEach((p: Product) => {
        initialStock[p.id] = p.stockQuantity || 0;
      });
      setLocalStock(initialStock);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (id: string, value: string) => {
    const num = parseInt(value) || 0;
    setLocalStock(prev => ({ ...prev, [id]: num }));
  };

  const handleUpdateStock = async (product: Product) => {
    setUpdatingId(product.id);
    const newQty = localStock[product.id];
    
    try {
      const payload = {
        stockQuantity: newQty,
        inStock: newQty > 0
      };

      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      // Refresh list to show updated badge
      fetchProducts();
    } catch (e) {
      console.error("Failed to update stock", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (qty: number) => {
    if (qty <= 0) {
      return (
        <span className={`${styles.statusBadge} ${styles.outOfStock}`}>
          <PackageX size={12} /> Out of Stock
        </span>
      );
    } else if (qty < 5) {
      return (
        <span className={`${styles.statusBadge} ${styles.lowStock}`}>
          <AlertTriangle size={12} /> Low Stock
        </span>
      );
    }
    return (
      <span className={`${styles.statusBadge} ${styles.inStock}`}>
        <CheckCircle size={12} /> In Stock
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Inventory Management</h1>
          <p className={styles.subtitle}>Monitor and quickly update stock levels across your catalog.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Status</th>
              <th>Stock Level</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className={styles.loadingCell}>Loading inventory...</td></tr>
            ) : products.map(product => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productInfo}>
                    <img src={product.image || "/sequence/ezgif-frame-001.jpg"} alt={product.name} className={styles.productImg} />
                    <div>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productCategory}>{product.category}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {getStatusBadge(product.stockQuantity)}
                </td>
                <td>
                  <div className={styles.stockInputGroup}>
                    <input 
                      type="number" 
                      className={styles.stockInput}
                      value={localStock[product.id] === undefined ? "" : localStock[product.id]}
                      onChange={(e) => handleStockChange(product.id, e.target.value)}
                      min="0"
                    />
                    <button 
                      className={`${styles.updateBtn} ${localStock[product.id] !== product.stockQuantity ? styles.visible : ''}`}
                      onClick={() => handleUpdateStock(product)}
                      disabled={updatingId === product.id}
                    >
                      {updatingId === product.id ? "Saving..." : "Update"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
