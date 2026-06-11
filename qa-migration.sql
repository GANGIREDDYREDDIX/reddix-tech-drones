-- ==========================================
-- REDDIX TECH DRONES - QA INTEGRATION MIGRATION
-- ==========================================
-- Run this script in your Supabase SQL Editor

-- 1. Customer Addresses Table
CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  type TEXT DEFAULT 'Shipping',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Customer Payments (Mock) Table
CREATE TABLE IF NOT EXISTS customer_payments (
  id TEXT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  type TEXT NOT NULL,
  last4 TEXT NOT NULL,
  exp_month TEXT NOT NULL,
  exp_year TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Customer Preferences
-- Since preferences are 1-to-1 with a customer, we can just add columns to the customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS email_orders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_offers BOOLEAN DEFAULT false;

-- 4. Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: The price_requests table already exists, but we ensure it has the right columns if needed.
CREATE TABLE IF NOT EXISTS price_requests (
  id TEXT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  requested_price NUMERIC,
  status TEXT DEFAULT 'Pending',
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Disable RLS to allow our API to work smoothly
ALTER TABLE customer_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE price_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;
