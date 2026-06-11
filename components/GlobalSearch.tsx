"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Package, ShoppingCart, Users, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./GlobalSearch.module.css";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Product': return <Package size={16} />;
      case 'Order': return <ShoppingCart size={16} />;
      case 'Customer': return <Users size={16} />;
      case 'Ticket': return <MessageSquare size={16} />;
      default: return <Search size={16} />;
    }
  };

  return (
    <>
      <button 
        className={styles.actionBtn} 
        onClick={() => setIsOpen(true)}
        title="Search (Cmd+K)"
      >
        <Search size={18} />
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.searchModal} onClick={e => e.stopPropagation()}>
            <div className={styles.searchInputWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Search products, orders, customers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.resultsContainer}>
              {loading && <div className={styles.loading}>Searching...</div>}
              
              {!loading && query.length >= 2 && results.length === 0 && (
                <div className={styles.noResults}>No results found for "{query}"</div>
              )}

              {!loading && results.length > 0 && (
                <ul className={styles.resultsList}>
                  {results.map((result) => (
                    <li key={`${result.type}-${result.id}`}>
                      <button 
                        className={styles.resultItem}
                        onClick={() => {
                          setIsOpen(false);
                          router.push(result.href);
                        }}
                      >
                        <div className={styles.resultIconWrapper}>
                          {getIcon(result.type)}
                        </div>
                        <div className={styles.resultDetails}>
                          <span className={styles.resultTitle}>{result.title}</span>
                          <span className={styles.resultSubtitle}>{result.type} • {result.subtitle}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className={styles.footer}>
              <span className={styles.shortcutKey}>esc</span> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
