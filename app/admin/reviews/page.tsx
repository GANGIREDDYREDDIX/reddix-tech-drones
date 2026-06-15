"use client";

import { useState, useEffect } from "react";
import { Star, Check, X, Search, MoreHorizontal, Trash2 } from "lucide-react";
import styles from "./reviews.module.css";

interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  text: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

const mockReviews: Review[] = [];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Reviews");

  const fetchReviews = async () => {
    try {
      // Pass ?all=true so admin sees Pending + Approved + Rejected
      const res = await fetch("/api/reviews?all=true");
      const data = await res.json();
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAction = async (id: string, action: string) => {
    setMenuOpenId(null);
    setProcessingId(id);
    try {
      if (action === "Delete") {
        if (!confirm("Are you sure you want to permanently delete this review?")) return;
        const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
        if (res.ok) fetchReviews();
        return;
      }

      await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action })
      });
      fetchReviews();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReviews = [...reviews]
    .filter(r => {
      const searchMatch = 
        r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.text.toLowerCase().includes(searchTerm.toLowerCase());
        
      let statusMatch = true;
      if (statusFilter !== "All Reviews") statusMatch = r.status === statusFilter;
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      // Sort by Pending first, then by date (newest first)
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (a.status !== "Pending" && b.status === "Pending") return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  const closeMenu = () => setMenuOpenId(null);


  return (
    <div className={styles.container} onClick={closeMenu}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Reviews & Ratings</h1>
          <p className={styles.subtitle}>Moderate customer reviews before they appear on the storefront.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search reviews by product, customer, or text..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.toolbarFilters}>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Reviews">All Reviews</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>Loading reviews...</td></tr>
            ) : filteredReviews.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No reviews found.</td></tr>
            ) : filteredReviews.map(review => (
              <tr key={review.id}>
                <td>
                  <div className={styles.productName}>{review.productName}</div>
                </td>
                <td>{review.customerName}</td>
                <td>{formatDate(review.date)}</td>
                <td>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} opacity={i < review.rating ? 1 : 0.3} />
                    ))}
                  </div>
                </td>
                <td>
                  <div className={styles.reviewText}>{review.text}</div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[`badge${review.status}`]}`}>
                    {review.status}
                  </span>
                </td>
                <td>
                  {processingId === review.id ? (
                    <span className={styles.loadingCell}>...</span>
                  ) : (
                    <div className={styles.actionMenuContainer} onClick={e => e.stopPropagation()}>
                      <button 
                        className={styles.actionMenuBtn}
                        onClick={() => setMenuOpenId(menuOpenId === review.id ? null : review.id)}
                      >
                        Manage <MoreHorizontal size={14} />
                      </button>
                      
                      {menuOpenId === review.id && (
                        <div className={styles.dropdownMenu}>
                          {review.status !== "Approved" && (
                            <button className={styles.dropdownItem} onClick={() => handleAction(review.id, "Approved")}>
                              <Check size={14} /> Approve Review
                            </button>
                          )}
                          {review.status !== "Rejected" && (
                            <button className={styles.dropdownItem} onClick={() => handleAction(review.id, "Rejected")}>
                              <X size={14} /> Reject Review
                            </button>
                          )}
                          <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => handleAction(review.id, "Delete")}>
                            <Trash2 size={14} /> Delete Record
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
