"use client";

import { useState, useEffect } from "react";
import { Star, Check, X, Search, Loader2 } from "lucide-react";
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

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
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

  const handleUpdateStatus = async (id: string, newStatus: "Approved" | "Rejected") => {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchReviews(); // Refresh
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Reviews & Ratings</h1>
          <p className={styles.subtitle}>Moderate customer reviews before they appear on the storefront.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>Loading reviews...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No reviews found.</td></tr>
            ) : reviews.map(review => (
              <tr key={review.id}>
                <td>
                  <div className={styles.productName}>{review.productName}</div>
                </td>
                <td>{review.customerName}</td>
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
                  <div className={styles.actionsCell}>
                    {review.status === "Pending" && (
                      <>
                        <button className={`${styles.iconBtn} ${styles.approve}`} title="Approve" onClick={() => handleUpdateStatus(review.id, "Approved")}>
                          <Check size={18} />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.reject}`} title="Reject" onClick={() => handleUpdateStatus(review.id, "Rejected")}>
                          <X size={18} />
                        </button>
                      </>
                    )}
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
