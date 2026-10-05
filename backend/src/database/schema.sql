-- ====================================================================
-- PharmaConnect Database Schema (PostgreSQL / Supabase)
-- Production-Ready Relational Model for B2B Pharmaceutical Marketplace
-- Compliant with CDSCO, Drugs & Cosmetics Act 1940, and 21 CFR Part 11
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(30),
    role VARCHAR(30) NOT NULL CHECK (role IN ('supplier', 'buyer', 'admin')),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- 2. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL CHECK (business_type IN ('manufacturer', 'hospital', 'wholesale_distributor', 'pharmacy_chain', 'clinical_depot')),
    business_address TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    gstin VARCHAR(20) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    license_type VARCHAR(100) NOT NULL, -- e.g. Form 20B/21B, Form 20/21
    verification_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_gstin ON businesses(gstin);

-- 3. VERIFICATION DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN ('drug_license', 'gst_certificate', 'who_gmp', 'schedule_m', 'iso_certificate', 'pharmacist_reg')),
    document_url TEXT NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    reviewer_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verification_docs_user ON verification_documents(user_id);

-- 4. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(100) NOT NULL,
    description TEXT,
    indications TEXT,
    product_image TEXT,
    base_wholesale_price NUMERIC(12, 2) NOT NULL CHECK (base_wholesale_price >= 0),
    mrp NUMERIC(12, 2) NOT NULL CHECK (mrp >= base_wholesale_price),
    moq INTEGER NOT NULL DEFAULT 1 CHECK (moq >= 1),
    unit_pack VARCHAR(100) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
    manufacturer VARCHAR(255) NOT NULL,
    mfg_license VARCHAR(100),
    regulatory_schedule VARCHAR(50) NOT NULL DEFAULT 'Schedule H',
    storage_condition VARCHAR(100) NOT NULL DEFAULT 'Controlled Ambient 15°C–25°C',
    is_cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
    is_who_gmp BOOLEAN NOT NULL DEFAULT FALSE,
    cdsco_verified BOOLEAN NOT NULL DEFAULT FALSE,
    total_stock_available INTEGER NOT NULL DEFAULT 0 CHECK (total_stock_available >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued', 'quarantined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_supplier ON medicines(supplier_id);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_status ON medicines(status);

-- 5. MEDICINE BATCHES TABLE
CREATE TABLE IF NOT EXISTS medicine_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    shelf_life_months INTEGER,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'near_expiry', 'expired', 'quarantined', 'depleted')),
    storage_condition VARCHAR(100) NOT NULL DEFAULT 'Controlled Ambient 15°C–25°C',
    vault_location VARCHAR(100),
    coa_signed BOOLEAN NOT NULL DEFAULT FALSE,
    coa_signer VARCHAR(255),
    gs1_barcode VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_batch_per_medicine UNIQUE (medicine_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_batches_medicine ON medicine_batches(medicine_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON medicine_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_batches_status ON medicine_batches(status);

-- 6. PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_reference VARCHAR(100) NOT NULL UNIQUE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'processing', 'dispatched', 'delivered', 'payment_due', 'paid', 'completed', 'rejected', 'cancelled')),
    destination VARCHAR(255) NOT NULL,
    delivery_address TEXT NOT NULL,
    taxable_total NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (taxable_total >= 0),
    cgst_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    sgst_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax_total NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
    net_payable NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (net_payable >= 0),
    amount_in_words TEXT,
    rejection_reason VARCHAR(255),
    rejection_notes TEXT,
    e_way_bill_no VARCHAR(100),
    carrier_name VARCHAR(100),
    tracking_no VARCHAR(100),
    vehicle_no VARCHAR(50),
    cold_chain_temp VARCHAR(100),
    tamper_seals_intact BOOLEAN DEFAULT TRUE,
    accepted_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    payment_due_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_buyer ON purchase_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES medicine_batches(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    taxable_amount NUMERIC(14, 2) NOT NULL CHECK (taxable_amount >= 0),
    cgst_rate NUMERIC(5, 2) NOT NULL DEFAULT 6.00,
    sgst_rate NUMERIC(5, 2) NOT NULL DEFAULT 6.00,
    cgst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    sgst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    line_total NUMERIC(14, 2) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    provider VARCHAR(50) NOT NULL DEFAULT 'razorpay',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    payment_due_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_rzp_order ON payments(razorpay_order_id);

-- 9. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE REFERENCES purchase_orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    taxable_amount NUMERIC(14, 2) NOT NULL,
    tax_amount NUMERIC(14, 2) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    invoice_url TEXT,
    digital_signature_token VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- 10. INVENTORY MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES medicine_batches(id) ON DELETE CASCADE,
    business_id UUID NOT NULL,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('initial_stock', 'stock_in', 'reservation', 'dispatch', 'delivery', 'dispense', 'quarantine', 'adjustment')),
    quantity INTEGER NOT NULL, -- negative for deduction, positive for addition
    reference_type VARCHAR(50) NOT NULL, -- e.g. 'purchase_order', 'patient_bill', 'manual_adjustment', 'quarantine'
    reference_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_batch ON inventory_movements(batch_id);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- 12. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE REFERENCES purchase_orders(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);

-- 14. PATIENT BILLS TABLE (Buyer Hospital Dispense Slips)
CREATE TABLE IF NOT EXISTS patient_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bill_number VARCHAR(100) NOT NULL UNIQUE,
    patient_reference VARCHAR(100) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    doctor_reg_no VARCHAR(100) NOT NULL,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_bills_buyer ON patient_bills(buyer_id);

-- 15. PATIENT BILL ITEMS TABLE
CREATE TABLE IF NOT EXISTS patient_bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES patient_bills(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES medicine_batches(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date VARCHAR(50),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_patient_bill_items ON patient_bill_items(bill_id);

-- 16. AUDIT LOGS TABLE (21 CFR Part 11 Tamper-Evident Records)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
