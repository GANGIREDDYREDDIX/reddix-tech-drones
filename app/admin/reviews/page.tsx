"use client";

import { useState } from "react";
import { Star, Check, X, Search } from "lucide-react";
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

const mockReviews: Review[] = [
  { id: "REV-001", productId: "DRN-001", productName: "Reddix X1 Pro", customerName: "Alice M.", rating: 5, text: "Amazing drone! The camera quality is unbelievable.", date: "2024-06-01", status: "Pending" },
  { id: "REV-002", productId: "DRN-002", productName: "Reddix Air Lite", customerName: "Bob S.", rating: 4, text: "Good for the price, but battery life could be better.", date: "2024-06-02", status: "Approved" },
  { id: "REV-003", productId: "DRN-001", productName: "Reddix X1 Pro", customerName: "Charlie D.", rating: 1, text: "Box arrived damaged and the drone wouldn't connect to my phone. Sending it back.", date: "2024-06-03", status: "Rejected" },
  { id: "REV-004", productId: "ACC-001", productName: "Pro Battery Pack", customerName: "Diana W.", rating: 5, text: "Essential for long shoots.", date: "2024-06-04", status: "Pending" }
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  const handleUpdateStatus = (id: string, newStatus: "Approved" | "Rejected") => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
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
            {reviews.map(review => (
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
