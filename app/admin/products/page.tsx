"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Upload, ImageOff, AlertTriangle, Search } from "lucide-react";
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
  badge?: string;
  tagline?: string;
  rating?: number;
  reviews?: number;
}

type TabType = "basic" | "details" | "media" | "inventory" | "features";

interface SpecItem { key: string; value: string; }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, loading: currencyLoading } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [formData, setFormData] = useState<Partial<Product>>({
    id: "", name: "", price: 0, category: "Drones", description: "", image: "", inStock: true, stockQuantity: 0, badge: "", tagline: "", rating: 5, reviews: 0, features: [], specs: {}
  });
  const [specsList, setSpecsList] = useState<SpecItem[]>([]);
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
    setFormData({ id: "", name: "", price: 0, category: "Drones", description: "", image: "", inStock: true, features: [], specs: {}, badge: "", tagline: "", rating: 5, reviews: 0, stockQuantity: 0 });
    setSpecsList([]);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
    setSpecsList(Object.entries(product.specs || {}).map(([key, value]) => ({ key, value })));
    setActiveTab("basic");
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

  const handleNameChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      name: val,
      id: !editingId ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";

    const submitData = { ...formData };
    
    // Map specsList back to Record<string, string>
    const newSpecs: Record<string, string> = {};
    specsList.forEach(item => {
      if (item.key.trim() && item.value.trim()) {
        newSpecs[item.key.trim()] = item.value.trim();
      }
    });
    submitData.specs = newSpecs;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });

    setIsModalOpen(false);
    fetchProducts();
  };

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search products by name or slug..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Drones">Drones</option>
          <option value="Enterprise">Enterprise</option>
          <option value="Accessories">Accessories</option>
          <option value="Services">Services</option>
        </select>
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
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign: "center", padding: "40px", color: "var(--text-secondary)"}}>No products found matching your criteria.</td></tr>
            ) : filteredProducts.map(p => (
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
                  {p.stockQuantity === 0 ? (
                    <span className={`${styles.statusBadge} ${styles.outOfStock}`}>
                      <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> 0 Left
                    </span>
                  ) : p.stockQuantity < 20 ? (
                    <span className={`${styles.statusBadge} ${styles.lowStock}`}>
                      <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {p.stockQuantity} Left
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
            
            <div className={styles.tabs}>
              <button className={`${styles.tabBtn} ${activeTab === 'basic' ? styles.activeTab : ''}`} onClick={() => setActiveTab('basic')}>Basic Info</button>
              <button className={`${styles.tabBtn} ${activeTab === 'details' ? styles.activeTab : ''}`} onClick={() => setActiveTab('details')}>Details</button>
              <button className={`${styles.tabBtn} ${activeTab === 'media' ? styles.activeTab : ''}`} onClick={() => setActiveTab('media')}>Media</button>
              <button className={`${styles.tabBtn} ${activeTab === 'inventory' ? styles.activeTab : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</button>
              <button className={`${styles.tabBtn} ${activeTab === 'features' ? styles.activeTab : ''}`} onClick={() => setActiveTab('features')}>Features & Specs</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.modalBody}>
                {activeTab === 'basic' && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Product Name</label>
                      <input required value={formData.name || ""} onChange={e => handleNameChange(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Product ID (slug) - Auto-generated</label>
                      <input required disabled value={formData.id || ""} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Price (INR)</label>
                      <input required type="number" value={formData.price || 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Category</label>
                      <select value={formData.category || "Drones"} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="Drones">Drones</option>
                        <option value="Enterprise">Enterprise</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Services">Services</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tagline</label>
                      <input value={formData.tagline || ""} onChange={e => setFormData({...formData, tagline: e.target.value})} placeholder="e.g. See What Others Miss" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Badge</label>
                      <input value={formData.badge || ""} onChange={e => setFormData({...formData, badge: e.target.value})} placeholder="e.g. ENTERPRISE" />
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className={styles.formGroup}>
                    <div className={styles.formGrid} style={{marginBottom: '16px'}}>
                      <div className={styles.formGroup}>
                        <label>Rating (1-5)</label>
                        <input 
                          type="number" step="0.1" min="1" max="5" 
                          value={formData.rating || ""} 
                          onChange={e => {
                            let val = parseFloat(e.target.value);
                            if (val > 5) val = 5;
                            if (val < 0) val = 0;
                            setFormData({...formData, rating: isNaN(val) ? 0 : val});
                          }} 
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Review Count</label>
                        <input type="number" value={formData.reviews || 0} onChange={e => setFormData({...formData, reviews: Number(e.target.value)})} />
                      </div>
                    </div>
                    <label>Description</label>
                    <textarea rows={6} value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className={styles.formGroup}>
                      <label>Product Image</label>
                      <div className={styles.imageUploadGroup}>
                        {formData.image ? (
                          <>
                            <img src={formData.image} alt="Preview" className={styles.imagePreview} style={{width: 100, height: 100}} />
                            <button type="button" className={styles.iconBtn} onClick={removeImage} title="Remove Image">
                              <Trash2 size={18} color="#ef4444" /> Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <div className={styles.imagePreview} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 100, height: 100 }}>
                              <ImageOff size={32} color="var(--text-secondary)" />
                            </div>
                            <label className={styles.uploadBtn}>
                              <Upload size={16} />
                              {uploadingImg ? "Uploading..." : "Upload Image"}
                              <input 
                                type="file" accept="image/*" style={{ display: "none" }} 
                                onChange={handleImageUpload} disabled={uploadingImg}
                              />
                            </label>
                          </>
                        )}
                      </div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Stock Quantity</label>
                      <input 
                        type="number" value={formData.stockQuantity} 
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setFormData({...formData, stockQuantity: val, inStock: val > 0})
                        }} 
                      />
                    </div>
                    <div className={styles.formGroupCheckbox} style={{ marginTop: '24px' }}>
                        <input type="checkbox" id="inStock" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} />
                        <label htmlFor="inStock">Visible in Storefront</label>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Features</label>
                      <div className={styles.dynamicList}>
                        {formData.features?.map((f, i) => (
                          <div key={i} className={styles.dynamicListItem}>
                            <input 
                              value={f} 
                              onChange={e => {
                                const newFeatures = [...(formData.features || [])];
                                newFeatures[i] = e.target.value;
                                setFormData({...formData, features: newFeatures});
                              }}
                            />
                            <button type="button" className={styles.removeBtn} onClick={() => {
                              const newFeatures = [...(formData.features || [])];
                              newFeatures.splice(i, 1);
                              setFormData({...formData, features: newFeatures});
                            }}><Trash2 size={16} /></button>
                          </div>
                        ))}
                        <button type="button" className={styles.addListItemBtn} onClick={() => {
                          setFormData({...formData, features: [...(formData.features || []), ""]});
                        }}><Plus size={16} /> Add Feature</button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Specifications</label>
                      <div className={styles.dynamicList}>
                        {specsList.map((spec, i) => (
                          <div key={i} className={styles.dynamicListItem}>
                            <input 
                              placeholder="Key (e.g. WEIGHT)" 
                              style={{flex: '0 0 100px'}}
                              value={spec.key} 
                              onChange={e => {
                                const newList = [...specsList];
                                newList[i].key = e.target.value;
                                setSpecsList(newList);
                              }}
                            />
                            <input 
                              placeholder="Value" 
                              value={spec.value} 
                              onChange={e => {
                                const newList = [...specsList];
                                newList[i].value = e.target.value;
                                setSpecsList(newList);
                              }}
                            />
                            <button type="button" className={styles.removeBtn} onClick={() => {
                              const newList = [...specsList];
                              newList.splice(i, 1);
                              setSpecsList(newList);
                            }}><Trash2 size={16} /></button>
                          </div>
                        ))}
                        <button type="button" className={styles.addListItemBtn} onClick={() => {
                          setSpecsList([...specsList, {key: "", value: ""}]);
                        }}><Plus size={16} /> Add Specification</button>
                      </div>
                    </div>
                  </div>
                )}
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
