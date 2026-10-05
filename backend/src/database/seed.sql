-- ====================================================================
-- PharmaConnect Database Seed Data (PostgreSQL / Supabase)
-- Seed test personas, medicines, batches, purchase orders, and audit logs
-- ====================================================================

-- 1. Test Users
-- Dr. Aris Thorne (Supplier) - id: a0000000-0000-0000-0000-000000000001
-- Dr. V. Sharma (Buyer) - id: b0000000-0000-0000-0000-000000000001
-- Admin User - id: c0000000-0000-0000-0000-000000000001

INSERT INTO users (id, full_name, email, phone, role, verification_status, avatar_url)
VALUES
('a0000000-0000-0000-0000-000000000001', 'Dr. Aris Thorne', 'a.thorne@novartis-pharma.in', '+91 98201 44810', 'supplier', 'verified', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256'),
('b0000000-0000-0000-0000-000000000001', 'Dr. V. Sharma', 'v.sharma@apexhealth.org', '+91 98110 99420', 'buyer', 'verified', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256'),
('c0000000-0000-0000-0000-000000000001', 'CDSCO Lead Auditor', 'compliance@cdsco.nic.in', '+91 11 2323 1000', 'admin', 'verified', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256')
ON CONFLICT (id) DO NOTHING;

-- 2. Businesses
INSERT INTO businesses (id, user_id, business_name, business_type, business_address, state, city, pincode, gstin, license_number, license_type, verification_status)
VALUES
('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Novartis Lifesciences Bio-Pharma Ltd.', 'manufacturer', 'Plot 42-B, MIDC Industrial Area, Kurkumbh, Pune, MH - 413802', 'Maharashtra', 'Pune', '413802', '27AAACN0192Q1ZV', 'DL-94821 / MH-PUN-20B-184920', 'Form 20B & 21B (Wholesale & Biologicals)', 'verified'),
('b1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Apex Multispeciality Healthcare Trust', 'hospital', 'Central Pharmacy Stores, Wing C, Dr. E. Moses Rd, Worli, Mumbai - 400018', 'Maharashtra', 'Mumbai', '400018', '27AABTA4481M1ZR', 'MH-MUM-20B-391827 / NABH-H-2018-091', 'Form 20 & 21 (Hospital Pharmacy & Retail)', 'verified')
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Medicines
INSERT INTO medicines (id, supplier_id, name, brand, generic_name, category, dosage_form, description, indications, product_image, base_wholesale_price, mrp, moq, unit_pack, gst_rate, manufacturer, mfg_license, regulatory_schedule, storage_condition, is_cold_chain, is_who_gmp, cdsco_verified, total_stock_available, status)
VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Augmentin 625 Duo', 'Augmentin 625 Duo', 'Amoxicillin (500mg) + Clavulanic Acid (125mg)', 'Antimicrobial & Antibiotics', 'Tablets', 'Broad spectrum penicillin antibiotic with beta-lactamase inhibitor', 'Respiratory tract, ENT, skin and soft tissue bacterial infections', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 1.72, 2.60, 100, 'Strip of 10s', 12.00, 'GlaxoSmithKline Pharma', 'DL-G-10292-MH (WHO-GMP)', 'Schedule H1', 'Controlled Ambient 15°C–25°C', FALSE, TRUE, TRUE, 32400, 'active'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Lipitor 20mg (Atorvastatin)', 'Lipitor 20mg', 'Atorvastatin Calcium Trihydrate • USP Grade', 'Cardiovascular', 'Tablets', 'HMG-CoA reductase inhibitor for dyslipidemia and cardiovascular event prophylaxis', 'Hypercholesterolemia, coronary artery disease prevention', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=400', 12.80, 18.20, 50, 'Bottle of 90s', 12.00, 'Pfizer Global Supply', 'DL-TS-HYD-5509 (Schedule M)', 'Schedule H', 'Controlled Ambient 15°C–25°C', FALSE, TRUE, TRUE, 4150, 'active'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Remdesivir 100mg IV', 'Cipremi 100mg', 'Remdesivir Lyophilized Powder for Injection • Single-dose Vial', 'Critical Care & ICU', 'Injectables', 'Antiviral nucleotide prodrug for treatment of severe acute viral pneumonia', 'Severe viral respiratory distress syndrome', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400', 18.90, 24.50, 50, 'Single Vial + Bacteriostatic Diluent', 5.00, 'Cipla Critical Care', 'CDSCO-BIO-Form-28D', 'Schedule H1', 'Cold-Chain 2°C–8°C', TRUE, TRUE, TRUE, 1820, 'active'),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Glycomet-SR 500mg', 'Glycomet-SR 500mg', 'Metformin Hydrochloride Sustained Release', 'Anti-diabetic & Glycemic', 'Tablets', 'Biguanide antidiabetic formulation for glycemic management in Type 2 diabetes', 'Type 2 Diabetes Mellitus', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400', 0.51, 0.85, 200, 'Strip of 20s', 12.00, 'USV Private Limited', 'DL-MH-BOM-8819', 'Schedule H', 'Controlled Ambient 15°C–25°C', FALSE, TRUE, TRUE, 68000, 'active'),
('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Meropenem 1g IV Infusion', 'Meromac 1g IV', 'Broad-Spectrum Carbapenem Antibiotic', 'Critical Care & ICU', 'Injectables', 'Ultra broad-spectrum injectable carbapenem for severe multidrug-resistant nosocomial infections', 'Intra-abdominal infections, septicemia, bacterial meningitis', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400', 195.00, 290.00, 500, 'Box of 10 Vials with Sterile Water', 5.00, 'Macleods Pharma Ltd.', 'DL-G-10292-MH (WHO-GMP)', 'Schedule H1', 'Cold-Chain 2°C–8°C', TRUE, TRUE, TRUE, 15400, 'active'),
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Ciprofloxacin Infusion IP 200mg/100ml', 'Ciprowin IV', 'Ciprofloxacin Infusion IP in Sterile Glass Vial', 'Antimicrobial & Antibiotics', 'IV Fluids', 'Fluoroquinolone antibacterial infusion for severe systemic infections', 'Complicated urinary tract infections, severe gastroenteritis', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 85.00, 110.00, 500, 'Glass Vial Sterile 100ml', 12.00, 'Novartis Lifesciences Bio-Pharma Ltd.', 'MH-PUN-20B-184920', 'Schedule H1', 'Controlled Ambient 15°C–25°C', FALSE, TRUE, TRUE, 19500, 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Batches
INSERT INTO medicine_batches (id, medicine_id, batch_number, manufacturing_date, expiry_date, shelf_life_months, quantity, status, storage_condition, vault_location, coa_signed, coa_signer, gs1_barcode)
VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '#AUG-9942-A', '2025-04-01', '2026-10-31', 18, 32400, 'active', '15°C - 25°C', 'Zone A - Bay 04', TRUE, 'Dr. P. Mehta, Head Chemist', '890103004812'),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', '#PF-ATOR-881', '2025-03-01', '2027-01-31', 22, 4150, 'active', '15°C - 25°C', 'Zone B - Ambient Bay 12', TRUE, 'Pfizer QA Control Mumbai', '761102941198'),
('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', '#CIP-REM-3012', '2024-11-01', '2025-12-31', 13, 1820, 'near_expiry', '2°C - 8°C Strict Cold Chain', 'Cryo-Vault Chilled 02', TRUE, 'Cipla Quality Assurance Lead', '890111772091'),
('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', '#USV-GLY-7731', '2025-03-01', '2027-05-31', 26, 68000, 'active', '15°C - 25°C', 'Zone A - Shelf 09', TRUE, 'USV Regulatory Quality Desk', '890111009121'),
('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', '#MRP-2024-B902', '2024-06-01', '2026-04-30', 22, 15400, 'active', '2°C–8°C Cold Chain', 'Cold Vault 01', TRUE, 'Chief Analytical Chemist', '890123440019'),
('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'CP-24K09', '2025-08-01', '2028-07-31', 35, 19500, 'active', '15°C - 25°C', 'Depot Bay 4', TRUE, 'Dr. P. Mehta, Quality Lead', '890192004281')
ON CONFLICT (id) DO NOTHING;

-- 5. Active Purchase Order & Items
INSERT INTO purchase_orders (id, po_reference, buyer_id, supplier_id, status, destination, delivery_address, taxable_total, cgst_total, sgst_total, tax_total, net_payable, amount_in_words, e_way_bill_no, carrier_name, tracking_no, vehicle_no, cold_chain_temp, tamper_seals_intact, accepted_at, dispatched_at, delivered_at)
VALUES
('f0000000-0000-0000-0000-000000000001', 'PO #PC-2025-8841', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'delivered', 'St. Jude Medical Center — Wing B Central Store (Worli)', 'Central Pharmacy Stores, Wing C, Dr. E. Moses Rd, Worli, Mumbai - 400018', 384000.00, 23040.00, 23040.00, 46080.00, 430080.00, 'Four Lakh Thirty Thousand Eighty Rupees Only', '3819 0048 2910', 'TCI ColdChain', 'TRK-849102-IN', 'MH-04-AZ-4180', '+4.2°C (Continuous Nominal)', TRUE, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, medicine_id, batch_id, quantity, unit_price, taxable_amount, cgst_rate, sgst_rate, cgst_amount, sgst_amount, line_total)
VALUES
('f1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 2000, 85.00, 170000.00, 6.00, 6.00, 10200.00, 10200.00, 190400.00)
ON CONFLICT (id) DO NOTHING;

-- 6. Tax Invoice for PO 8841
INSERT INTO invoices (id, order_id, invoice_number, supplier_id, buyer_id, invoice_date, taxable_amount, tax_amount, total_amount, status, digital_signature_token)
VALUES
('f2000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'PC/INV/2025/10-994', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, 384000.00, 46080.00, 430080.00, 'issued', 'DSC/2025/NOV/84920/SHA256')
ON CONFLICT (id) DO NOTHING;

-- 7. Audit Log Sample
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata)
VALUES
(uuid_generate_v4(), 'a0000000-0000-0000-0000-000000000001', 'ORDER_DISPATCHED', 'purchase_order', 'f0000000-0000-0000-0000-000000000001', '{"carrier": "TCI ColdChain", "vehicle": "MH-04-AZ-4180", "temp": "+4.2C"}'),
(uuid_generate_v4(), 'b0000000-0000-0000-0000-000000000001', 'DELIVERY_CONFIRMED', 'purchase_order', 'f0000000-0000-0000-0000-000000000001', '{"destination": "St. Jude Medical Center", "tamper_seals": "intact"}')
ON CONFLICT (id) DO NOTHING;
