"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ShoppingCart, MessageSquare, Tag, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./NotificationsDropdown.module.css";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  href: string;
}

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotifications(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Close on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart size={16} />;
      case 'ticket': return <MessageSquare size={16} />;
      case 'price_request': return <Tag size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        className={styles.actionBtn} 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3 className={styles.title}>Notifications</h3>
            {notifications.length > 0 && (
              <span className={styles.count}>{notifications.length} pending</span>
            )}
          </div>

          <div className={styles.content}>
            {loading ? (
              <div className={styles.emptyState}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><Bell size={24} /></div>
                <p>You're all caught up!</p>
              </div>
            ) : (
              <ul className={styles.list}>
                {notifications.map((notif) => (
                  <li key={notif.id}>
                    <button 
                      className={styles.item}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(notif.href);
                      }}
                    >
                      <div className={styles.iconWrapper}>
                        {getIcon(notif.type)}
                      </div>
                      <div className={styles.details}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemTitle}>{notif.title}</span>
                          <span className={styles.time}>{getRelativeTime(notif.date)}</span>
                        </div>
                        <span className={styles.itemMessage}>{notif.message}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
