"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Upload, ImageOff, AlertTriangle } from "lucide-react";
import styles from "./products.module.css";
import { useCurrency } from "@/context/CurrencyContext";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  inStock: boolean;
  stockQuantity: number;
  features?: string[];
  specs?: Record<string, string>;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    id: "", name: "", price: 0, category: "Drones", description: "", image: "", inStock: true, stockQuantity: 0
  });
  const [uploadingImg, setUploadingImg] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ id: "", name: "", price: 0, category: "Drones", description: "", image: "", inStock: true, features: [], specs: {} });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, image: data.url });
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImg(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    fetchProducts();
  };

  return (
    <div className={styles.productsContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>Manage your drone catalog and inventory.</p>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{textAlign: "center", padding: "40px"}}>Loading...</td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td>
                  <div className={styles.productCell}>
                    <img src={p.image || "/sequence/ezgif-frame-001.jpg"} alt={p.name} className={styles.productImg} />
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{p.name}</span>
                      <span className={styles.productId}>{p.id}</span>
                    </div>
                  </div>
                </td>
                <td><span className={styles.categoryBadge}>{p.category}</span></td>
                <td className={styles.priceCell}>{!currencyLoading ? formatCurrency(p.price) : "..."}</td>
                <td>
                  {p.stockQuantity < 5 ? (
                    <span className={`${styles.statusBadge} ${styles.outOfStock}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                      <AlertTriangle size={12} /> {p.stockQuantity} Left
                    </span>
                  ) : (
                    <span className={`${styles.statusBadge} ${styles.inStock}`}>
                      {p.stockQuantity} in Stock
                    </span>
                  )}
                </td>
                <td className={styles.actionsCell}>
                  <button className={styles.iconBtn} onClick={() => openEditModal(p)}>
                    <Edit2 size={16} />
                  </button>
                  <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDelete(p.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Product ID (slug)</label>
                  <input required disabled={!!editingId} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="e.g. reddix-x2" />
                </div>
                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Price (USD)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Drones">Drones</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                  <label>Product Image</label>
                  <div className={styles.imageUploadGroup}>
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className={styles.imagePreview} />
                        <button type="button" className={styles.iconBtn} onClick={removeImage} title="Remove Image">
                          <ImageOff size={18} color="#ef4444" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className={styles.imagePreview} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageOff size={20} color="var(--text-secondary)" />
                        </div>
                        <label className={styles.uploadBtn}>
                          <Upload size={16} />
                          {uploadingImg ? "Uploading..." : "Upload Image"}
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: "none" }} 
                            onChange={handleImageUpload}
                            disabled={uploadingImg}
                          />
                        </label>
                      </>
                    )}
                  </div>
              </div>
              <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Stock Quantity</label>
                  <input 
                    type="number" 
                    value={formData.stockQuantity} 
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setFormData({...formData, stockQuantity: val, inStock: val > 0})
                    }} 
                  />
                </div>
                
                <div className={styles.formGroupCheckbox} style={{ marginTop: '24px' }}>
                    <input type="checkbox" id="inStock" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} />
                    <label htmlFor="inStock">Visible in Storefront</label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
