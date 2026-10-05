import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';
import { supabaseAdmin, isSupabaseSchemaReady, getIsSupabaseSchemaReady } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.resolve(__dirname, '../database/local_db.json');

// Collection to Supabase table name mapping
const TABLE_MAPPING = {
  batches: 'medicine_batches',
  medicine_batches: 'medicine_batches'
};

const getSupabaseTable = (collection) => TABLE_MAPPING[collection] || collection;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (val) => typeof val === 'string' && UUID_REGEX.test(val);

const isCloudReady = () => Boolean(supabaseAdmin && (isSupabaseSchemaReady || (typeof getIsSupabaseSchemaReady === 'function' && getIsSupabaseSchemaReady())));

const sanitizeForSupabase = (collection, record) => {
  if (!record || typeof record !== 'object') return record;
  const copy = { ...record };
  if (collection === 'medicines') {
    delete copy.volume_tiers;
  }
  if (collection === 'purchase_orders') {
    delete copy.items;
    delete copy.timeline;
  }
  if (collection === 'invoices' || collection === 'payments' || collection === 'notifications' || collection === 'audit_logs') {
    delete copy.updated_at;
  }
  if (collection === 'verification_documents') {
    delete copy.file_name;
    delete copy.updated_at;
    const lower = String(copy.document_type || '').toLowerCase();
    if (lower.includes('license') || lower.includes('20b') || lower.includes('form 20') || lower.includes('form 21')) {
      copy.document_type = 'drug_license';
    } else if (lower.includes('gst') || lower.includes('reg-06')) {
      copy.document_type = 'gst_certificate';
    } else if (lower.includes('who') || lower.includes('gmp')) {
      copy.document_type = 'who_gmp';
    } else if (lower.includes('pharmacist') || lower.includes('council')) {
      copy.document_type = 'pharmacist_reg';
    } else if (lower.includes('schedule m')) {
      copy.document_type = 'schedule_m';
    } else if (lower.includes('iso')) {
      copy.document_type = 'iso_certificate';
    } else {
      copy.document_type = 'drug_license';
    }
    if (copy.verification_status === 'under_review') {
      copy.verification_status = 'pending';
    }
  }
  return copy;
};

// Bcrypt hash for default 'password123'
const DEMO_PASSWORD_HASH = '$2a$10$45VOLwklrlkvw7nu604.3uh0ydUqQAdSIZNpPeEvW6ujnRfvyEZ46';

const getInitialSeed = () => ({
  users: [
    {
      id: 'usr-supp-01',
      auth_user_id: 'auth-supp-01',
      full_name: 'Dr. Aris Thorne',
      email: 'a.thorne@novartis-pharma.in',
      password_hash: DEMO_PASSWORD_HASH,
      phone: '+91 98201 44810',
      role: 'supplier',
      verification_status: 'verified',
      avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-buy-01',
      auth_user_id: 'auth-buy-01',
      full_name: 'Dr. V. Sharma',
      email: 'v.sharma@apexhealth.org',
      password_hash: DEMO_PASSWORD_HASH,
      phone: '+91 98110 99420',
      role: 'buyer',
      verification_status: 'verified',
      avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-admin-01',
      auth_user_id: 'auth-admin-01',
      full_name: 'CDSCO Compliance Officer',
      email: 'compliance@cdsco.nic.in',
      password_hash: DEMO_PASSWORD_HASH,
      phone: '+91 11 2323 1000',
      role: 'admin',
      verification_status: 'verified',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  businesses: [
    {
      id: 'biz-supp-01',
      user_id: 'usr-supp-01',
      business_name: 'Novartis Lifesciences Bio-Pharma Ltd.',
      business_type: 'manufacturer',
      business_address: 'Plot 42-B, MIDC Industrial Area, Kurkumbh, Pune, MH - 413802',
      state: 'Maharashtra',
      city: 'Pune',
      pincode: '413802',
      gstin: '27AAACN0192Q1ZV',
      license_number: 'DL-94821 / MH-PUN-20B-184920',
      license_type: 'Form 20B & 21B (Wholesale & Biologicals)',
      verification_status: 'verified',
      created_at: new Date().toISOString()
    },
    {
      id: 'biz-buy-01',
      user_id: 'usr-buy-01',
      business_name: 'Apex Multispeciality Healthcare Trust',
      business_type: 'hospital',
      business_address: 'Central Pharmacy Stores, Wing C, Dr. E. Moses Rd, Worli, Mumbai - 400018',
      state: 'Maharashtra',
      city: 'Mumbai',
      pincode: '400018',
      gstin: '27AABTA4481M1ZR',
      license_number: 'MH-MUM-20B-391827 / NABH-H-2018-091',
      license_type: 'Form 20 & 21 (Hospital Pharmacy & Retail)',
      verification_status: 'verified',
      created_at: new Date().toISOString()
    }
  ],
  verification_documents: [
    // Demo Supplier: Novartis Lifesciences (all 5 required statutory documents)
    {
      id: 'vdoc-01',
      user_id: 'usr-supp-01',
      document_type: 'Wholesale Drug License (Form 20B & 21B)',
      document_url: 'https://storage.pharmaconnect.internal/vault/vdoc-01-form20b.pdf',
      file_name: 'Form_20B_21B_MH_Pune_Signed.pdf',
      verification_status: 'approved',
      reviewer_notes: 'CDSCO FDA Maharashtra Form 20B/21B valid through 2028',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    },
    {
      id: 'vdoc-supp-02',
      user_id: 'usr-supp-01',
      document_type: 'GST Registration Certificate (REG-06)',
      document_url: 'https://storage.pharmaconnect.internal/vault/vdoc-02-gst-reg06.pdf',
      file_name: 'GST_Certificate_27AAACN0192Q1ZV.pdf',
      verification_status: 'approved',
      reviewer_notes: 'GSTIN active and verified with tax ledger',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    },
    {
      id: 'vdoc-supp-03',
      user_id: 'usr-supp-01',
      document_type: 'Certificate of Incorporation / Partnership Deed',
      document_url: 'https://storage.pharmaconnect.internal/vault/vdoc-03-mca.pdf',
      file_name: 'MCA_Incorporation_Novartis_India.pdf',
      verification_status: 'approved',
      reviewer_notes: 'MCA Corporate entity identity verified',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    },
    {
      id: 'vdoc-supp-04',
      user_id: 'usr-supp-01',
      document_type: 'WHO-GMP Manufacturing Compliance Certificate',
      document_url: 'https://storage.pharmaconnect.internal/vault/vdoc-04-who-gmp.pdf',
      file_name: 'WHO_GMP_Novartis_Kurkumbh.pdf',
      verification_status: 'approved',
      reviewer_notes: 'Inspected and certified by CDSCO Joint Audit',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    },
    {
      id: 'vdoc-supp-05',
      user_id: 'usr-supp-01',
      document_type: 'FSSAI Wholesale Nutraceutical Permit',
      document_url: 'https://storage.pharmaconnect.internal/vault/vdoc-05-fssai.pdf',
      file_name: 'FSSAI_Wholesale_Permit_Signed.pdf',
      verification_status: 'approved',
      reviewer_notes: 'FSSAI wholesale license certified',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    },
    // Demo Buyer: Apex Healthcare Trust (all 4 required statutory documents)
    {
      id: 'vdoc-02',
      user_id: 'usr-buy-01',
      document_type: 'State FDA Drug License (Form 20 / 21)',
      document_url: 'https://storage.pharmaconnect.internal/vault/vdoc-02-form20.pdf',
      file_name: 'Form_20_21_Apex_Hospital_Signed.pdf',
      verification_status: 'approved',
      reviewer_notes: 'NABH Hospital Pharmacy Form 20/21 verified with state council',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    },
    {
      id: 'vdoc-buy-02',
      user_id: 'usr-buy-01',
      document_type: 'GSTIN Registration Certificate',
      document_url: 'https://storage.pharmaconnect.internal/vault/vdoc-buy-02-gstin.pdf',
      file_name: 'GST_Registration_Certificate_Apex.pdf',
      verification_status: 'approved',
      reviewer_notes: 'Principal hospital GSTIN verified',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    },
    {
      id: 'vdoc-buy-03',
      user_id: 'usr-buy-01',
      document_type: 'Registered Qualified Pharmacist Council Certificate',
      document_url: 'https://storage.pharmaconnect.internal/vault/vdoc-buy-03-pharm.pdf',
      file_name: 'Pharmacy_Council_Reg_Signed.pdf',
      verification_status: 'approved',
      reviewer_notes: 'State Pharmacy Council valid registered pharmacist verified',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    },
    {
      id: 'vdoc-buy-04',
      user_id: 'usr-buy-01',
      document_type: 'Hospital NABH Accreditation / Clinical Establishment Act Certificate',
      document_url: 'https://storage.pharmaconnect.internal/vault/vdoc-buy-04-nabh.pdf',
      file_name: 'NABH_Accreditation_Certificate.pdf',
      verification_status: 'approved',
      reviewer_notes: 'NABH institutional tertiary accreditation confirmed',
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    }
  ],
  medicines: [
    {
      id: 'med-01',
      supplier_id: 'usr-supp-01',
      name: 'Augmentin 625 Duo',
      brand: 'Augmentin 625 Duo',
      generic_name: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
      category: 'Antimicrobial & Antibiotics',
      dosage_form: 'Tablets',
      description: 'Broad spectrum penicillin antibiotic with beta-lactamase inhibitor',
      indications: 'Respiratory tract, ENT, skin and soft tissue bacterial infections',
      product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
      base_wholesale_price: 1.72,
      mrp: 2.60,
      moq: 100,
      unit_pack: 'Strip of 10s',
      gst_rate: 12.00,
      manufacturer: 'GlaxoSmithKline Pharma',
      mfg_license: 'DL-G-10292-MH (WHO-GMP)',
      regulatory_schedule: 'Schedule H1',
      storage_condition: 'Controlled Ambient 15°C–25°C',
      is_cold_chain: false,
      is_who_gmp: true,
      cdsco_verified: true,
      total_stock_available: 32400,
      status: 'active',
      volume_tiers: [
        { minQty: 50, maxQty: 200, unitPrice: 1.95, label: '50 - 200 pk', discountNote: 'MRP $2.60' },
        { minQty: 201, maxQty: 1000, unitPrice: 1.72, label: '201 - 1,000 pk', discountNote: '12% Margin+' },
        { minQty: 1001, maxQty: null, unitPrice: 1.48, label: '> 1,000 pk', discountNote: 'Tier 1 Max ($1.48)' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'med-02',
      supplier_id: 'usr-supp-01',
      name: 'Lipitor 20mg (Atorvastatin)',
      brand: 'Lipitor 20mg',
      generic_name: 'Atorvastatin Calcium Trihydrate • USP Grade',
      category: 'Cardiovascular',
      dosage_form: 'Tablets',
      description: 'HMG-CoA reductase inhibitor for dyslipidemia',
      indications: 'Hypercholesterolemia, CAD prevention',
      product_image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=400',
      base_wholesale_price: 12.80,
      mrp: 18.20,
      moq: 50,
      unit_pack: 'Bottle of 90s',
      gst_rate: 12.00,
      manufacturer: 'Pfizer Global Supply',
      mfg_license: 'DL-TS-HYD-5509 (Schedule M)',
      regulatory_schedule: 'Schedule H',
      storage_condition: 'Controlled Ambient 15°C–25°C',
      is_cold_chain: false,
      is_who_gmp: true,
      cdsco_verified: true,
      total_stock_available: 4150,
      status: 'active',
      volume_tiers: [
        { minQty: 20, maxQty: 100, unitPrice: 14.50, label: '20 - 100 btl', discountNote: 'MRP $18.20' },
        { minQty: 101, maxQty: 500, unitPrice: 12.80, label: '101 - 500 btl', discountNote: '18% Wholesale' },
        { minQty: 501, maxQty: null, unitPrice: 11.20, label: '> 500 btl', discountNote: 'Contract PO' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'med-03',
      supplier_id: 'usr-supp-01',
      name: 'Remdesivir 100mg IV',
      brand: 'Cipremi 100mg',
      generic_name: 'Remdesivir Lyophilized Powder for Injection • Single-dose Vial',
      category: 'Critical Care & ICU',
      dosage_form: 'Injectables',
      description: 'Antiviral nucleotide prodrug',
      indications: 'Severe viral pneumonia',
      product_image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400',
      base_wholesale_price: 18.90,
      mrp: 24.50,
      moq: 50,
      unit_pack: 'Single Vial + Bacteriostatic Diluent',
      gst_rate: 5.00,
      manufacturer: 'Cipla Critical Care',
      mfg_license: 'CDSCO-BIO-Form-28D',
      regulatory_schedule: 'Schedule H1',
      storage_condition: 'Cold-Chain 2°C–8°C',
      is_cold_chain: true,
      is_who_gmp: true,
      cdsco_verified: true,
      total_stock_available: 1820,
      status: 'active',
      volume_tiers: [
        { minQty: 50, maxQty: 150, unitPrice: 18.90, label: '50 - 150 vials' },
        { minQty: 151, maxQty: 500, unitPrice: 16.20, label: '151 - 500 vials' },
        { minQty: 501, maxQty: null, unitPrice: 14.10, label: '> 500 vials' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'med-08',
      supplier_id: 'usr-supp-01',
      name: 'Ciprofloxacin Infusion IP 200mg/100ml',
      brand: 'Ciprowin IV',
      generic_name: 'Ciprofloxacin Infusion IP in Sterile Glass Vial',
      category: 'Antimicrobial & Antibiotics',
      dosage_form: 'IV Fluids',
      description: 'Fluoroquinolone antibacterial infusion',
      indications: 'Complicated urinary tract infections, bacteremia',
      product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
      base_wholesale_price: 85.00,
      mrp: 110.00,
      moq: 500,
      unit_pack: 'Glass Vial Sterile 100ml',
      gst_rate: 12.00,
      manufacturer: 'Novartis Lifesciences Bio-Pharma Ltd.',
      mfg_license: 'MH-PUN-20B-184920',
      regulatory_schedule: 'Schedule H1',
      storage_condition: 'Controlled Ambient 15°C–25°C',
      is_cold_chain: false,
      is_who_gmp: true,
      cdsco_verified: true,
      total_stock_available: 19500,
      status: 'active',
      volume_tiers: [
        { minQty: 200, maxQty: 1000, unitPrice: 92.00, label: '200 - 1,000 Vls' },
        { minQty: 1001, maxQty: 5000, unitPrice: 85.00, label: '1,001 - 5,000 Vls' },
        { minQty: 5001, maxQty: null, unitPrice: 78.00, label: '> 5,000 Vls' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  batches: [
    {
      id: 'bat-01',
      medicine_id: 'med-01',
      batch_number: '#AUG-9942-A',
      manufacturing_date: '2025-04-01',
      expiry_date: '2026-10-31',
      shelf_life_months: 18,
      quantity: 32400,
      status: 'active',
      storage_condition: '15°C - 25°C',
      vault_location: 'Zone A - Bay 04',
      coa_signed: true,
      coa_signer: 'Dr. P. Mehta, Head Chemist',
      gs1_barcode: '890103004812',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'bat-02',
      medicine_id: 'med-02',
      batch_number: '#PF-ATOR-881',
      manufacturing_date: '2025-03-01',
      expiry_date: '2027-01-31',
      shelf_life_months: 22,
      quantity: 4150,
      status: 'active',
      storage_condition: '15°C - 25°C',
      vault_location: 'Zone B - Ambient Bay 12',
      coa_signed: true,
      coa_signer: 'Pfizer QA Control Mumbai',
      gs1_barcode: '761102941198',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'bat-03',
      medicine_id: 'med-03',
      batch_number: '#CIP-REM-3012',
      manufacturing_date: '2024-11-01',
      expiry_date: '2025-12-31',
      shelf_life_months: 13,
      quantity: 1820,
      status: 'near_expiry',
      storage_condition: '2°C - 8°C Strict Cold Chain',
      vault_location: 'Cryo-Vault Chilled 02',
      coa_signed: true,
      coa_signer: 'Cipla Quality Assurance Lead',
      gs1_barcode: '890111772091',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'bat-08',
      medicine_id: 'med-08',
      batch_number: 'CP-24K09',
      manufacturing_date: '2025-08-01',
      expiry_date: '2028-07-31',
      shelf_life_months: 35,
      quantity: 19500,
      status: 'active',
      storage_condition: '15°C - 25°C',
      vault_location: 'Depot Bay 4',
      coa_signed: true,
      coa_signer: 'Dr. P. Mehta, Quality Lead',
      gs1_barcode: '890192004281',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  purchase_orders: [
    {
      id: 'po-8841',
      po_reference: 'PO #PC-2025-8841',
      buyer_id: 'usr-buy-01',
      supplier_id: 'usr-supp-01',
      status: 'delivered',
      destination: 'St. Jude Medical Center — Wing B Central Store (Worli)',
      delivery_address: 'Central Pharmacy Stores, Wing C, Dr. E. Moses Rd, Worli, Mumbai - 400018',
      taxable_total: 384000.00,
      cgst_total: 23040.00,
      sgst_total: 23040.00,
      tax_total: 46080.00,
      net_payable: 430080.00,
      amount_in_words: 'Four Lakh Thirty Thousand Eighty Rupees Only',
      rejection_reason: null,
      rejection_notes: null,
      e_way_bill_no: '3819 0048 2910',
      carrier_name: 'TCI ColdChain',
      tracking_no: 'TRK-849102-IN',
      vehicle_no: 'MH-04-AZ-4180',
      cold_chain_temp: '+4.2°C (Continuous Nominal)',
      tamper_seals_intact: true,
      accepted_at: '2025-10-12T11:30:00Z',
      dispatched_at: '2025-10-14T06:10:00Z',
      delivered_at: '2025-10-15T15:45:00Z',
      paid_at: null,
      created_at: '2025-10-12T09:14:00Z',
      updated_at: new Date().toISOString()
    }
  ],
  order_items: [
    {
      id: 'oi-01',
      order_id: 'po-8841',
      medicine_id: 'med-08',
      batch_id: 'bat-08',
      medicine_name: 'Ciprofloxacin Infusion IP 200mg/100ml',
      batch_number: 'CP-24K09',
      quantity: 2000,
      unit_price: 85.00,
      taxable_amount: 170000.00,
      cgst_rate: 6.00,
      sgst_rate: 6.00,
      cgst_amount: 10200.00,
      sgst_amount: 10200.00,
      line_total: 190400.00
    }
  ],
  payments: [],
  invoices: [
    {
      id: 'inv-01',
      order_id: 'po-8841',
      invoice_number: 'PC/INV/2025/10-994',
      supplier_id: 'usr-supp-01',
      buyer_id: 'usr-buy-01',
      invoice_date: '2025-10-14',
      taxable_amount: 384000.00,
      tax_amount: 46080.00,
      total_amount: 430080.00,
      invoice_url: null,
      digital_signature_token: 'DSC/2025/NOV/84920/SHA256',
      status: 'issued',
      created_at: '2025-10-14T08:00:00Z'
    }
  ],
  inventory_movements: [
    {
      id: 'im-01',
      batch_id: 'bat-08',
      business_id: 'biz-supp-01',
      movement_type: 'initial_stock',
      quantity: 21500,
      reference_type: 'batch_intake',
      reference_id: 'CP-24K09',
      created_at: new Date().toISOString()
    },
    {
      id: 'im-02',
      batch_id: 'bat-08',
      business_id: 'biz-supp-01',
      movement_type: 'dispatch',
      quantity: -2000,
      reference_type: 'purchase_order',
      reference_id: 'po-8841',
      created_at: '2025-10-14T06:10:00Z'
    }
  ],
  notifications: [
    {
      id: 'notif-01',
      user_id: 'usr-supp-01',
      type: 'ORDER_DELIVERED',
      title: 'Consignment Delivered',
      message: 'Order PO #PC-2025-8841 safely delivered to St. Jude Medical Center with seals intact.',
      is_read: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'notif-02',
      user_id: 'usr-buy-01',
      type: 'PAYMENT_DUE',
      title: 'Payment Settlement Due',
      message: 'Invoice PC/INV/2025/10-994 for ₹4,30,080.00 is due for settlement.',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ],
  conversations: [
    {
      id: 'conv-01',
      order_id: 'po-8841',
      supplier_id: 'usr-supp-01',
      buyer_id: 'usr-buy-01',
      created_at: '2025-10-12T12:00:00Z'
    }
  ],
  messages: [
    {
      id: 'msg-01',
      conversation_id: 'conv-01',
      sender_id: 'usr-buy-01',
      sender_name: 'Apex Depot Pharmacist',
      sender_role: 'buyer',
      message: 'Consignment batches CP-24K09 passed preliminary depot temperature logging (+4.2°C).',
      attachment_url: null,
      created_at: '2025-10-15T15:48:00Z',
      read_at: '2025-10-15T15:50:00Z'
    },
    {
      id: 'msg-02',
      conversation_id: 'conv-01',
      sender_id: 'usr-supp-01',
      sender_name: 'Novartis Quality Desk',
      sender_role: 'supplier',
      message: 'E-Signed Form 20B/21B invoice and Certificate of Analysis (COA) have been uploaded.',
      attachment_url: null,
      created_at: '2025-10-15T15:52:00Z',
      read_at: '2025-10-15T15:55:00Z'
    }
  ],
  patient_bills: [
    {
      id: 'pb-01',
      buyer_id: 'usr-buy-01',
      bill_number: 'PB-2025-1082',
      patient_reference: 'PT-89412 (Ramesh Patel)',
      doctor_name: 'Dr. V. Sharma, MD',
      doctor_reg_no: 'MCI-19948',
      bill_date: '2025-10-16',
      subtotal: 1240.00,
      tax_amount: 0.00,
      discount: 0.00,
      total_amount: 1240.00,
      items: [
        { medicine_name: 'Augmentin 625 Duo', batch_number: '#AUG-9942-A', expiry_date: '10/2026', quantity: 2, unit_price: 260.00, tax_rate: 12.00, total: 520.00 },
        { medicine_name: 'Lipitor 20mg (Atorvastatin)', batch_number: '#PF-ATOR-881', expiry_date: '01/2027', quantity: 1, unit_price: 720.00, tax_rate: 12.00, total: 720.00 }
      ],
      created_at: new Date().toISOString()
    }
  ],
  patient_bill_items: [],
  audit_logs: [
    {
      id: 'audit-01',
      actor_id: 'usr-supp-01',
      action: 'ORDER_ACCEPTED',
      entity_type: 'purchase_order',
      entity_id: 'po-8841',
      metadata: { po_reference: 'PO #PC-2025-8841', timestamp: '2025-10-12T11:30:00Z' },
      created_at: '2025-10-12T11:30:00Z'
    },
    {
      id: 'audit-02',
      actor_id: 'usr-supp-01',
      action: 'ORDER_DISPATCHED',
      entity_type: 'purchase_order',
      entity_id: 'po-8841',
      metadata: { carrier: 'TCI ColdChain', vehicle: 'MH-04-AZ-4180', cold_chain_temp: '+4.2C' },
      created_at: '2025-10-14T06:10:00Z'
    },
    {
      id: 'audit-03',
      actor_id: 'usr-buy-01',
      action: 'DELIVERY_CONFIRMED',
      entity_type: 'purchase_order',
      entity_id: 'po-8841',
      metadata: { destination: 'St. Jude Medical Center', tamper_seals: 'intact' },
      created_at: '2025-10-15T15:45:00Z'
    }
  ]
});

class PersistentDatabase {
  constructor() {
    this.data = {};
    this.saveTimeout = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('[Database] Loaded persistent data from:', DB_FILE_PATH);
      } else {
        this.data = getInitialSeed();
        this.saveNow();
        console.log('[Database] Initialized new persistent data store at:', DB_FILE_PATH);
      }
    } catch (err) {
      console.warn('[Database] Failed to read persistent db file, using seed:', err.message);
      this.data = getInitialSeed();
    }

    // Ensure all collections exist
    const seed = getInitialSeed();
    Object.keys(seed).forEach((collection) => {
      if (!Array.isArray(this.data[collection])) {
        this.data[collection] = seed[collection] || [];
      }
    });

    // Audit verification statuses: demote any user without all required PDFs
    const users = this.getCollection('users');
    const docs = this.getCollection('verification_documents');
    let demotedAny = false;
    users.forEach((u) => {
      if (u.role === 'admin') return;
      const isSupp = u.role === 'supplier';
      const requiredKeywords = isSupp
        ? ['form 20b', 'reg-06', 'incorporation', 'who-gmp', 'fssai']
        : ['form 20', 'gstin', 'pharmacist', 'nabh'];
      const uDocs = docs.filter((d) => d.user_id === u.id && Boolean(d.file_name && d.document_url));
      const hasAll = requiredKeywords.every((kw) => 
        uDocs.some((d) => (d.document_type || '').toLowerCase().includes(kw))
      );
      if (!hasAll && u.verification_status === 'verified') {
        u.verification_status = 'pending';
        const biz = this.findOne('businesses', (b) => b.user_id === u.id);
        if (biz) biz.verification_status = 'pending';
        demotedAny = true;
      }
    });
    if (demotedAny) {
      this.saveNow();
    }
  }

  save() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveNow();
    }, 200);
  }

  saveNow() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to persist data to disk:', err.message);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collection, filterFn) {
    const list = this.getCollection(collection);
    return list.filter(filterFn);
  }

  findOne(collection, filterFn) {
    const list = this.getCollection(collection);
    return list.find(filterFn) || null;
  }

  insert(collection, record) {
    const list = this.getCollection(collection);
    const withTimestamps = {
      ...record,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    list.unshift(withTimestamps);
    this.save();

    // Async background sync to Supabase if schema is ready and record has a valid UUID
    if (isCloudReady() && isUuid(withTimestamps.id)) {
      const table = getSupabaseTable(collection);
      const cloudPayload = sanitizeForSupabase(collection, withTimestamps);
      supabaseAdmin
        .from(table)
        .insert(cloudPayload)
        .then(({ error }) => {
          if (error) console.warn(`[Supabase Sync] insert into ${table} warning:`, error.message);
        })
        .catch(() => {});
    }

    return withTimestamps;
  }

  update(collection, filterFn, updates) {
    const list = this.getCollection(collection);
    const index = list.findIndex(filterFn);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();

    // Async background sync to Supabase if schema is ready and record has a valid UUID
    if (isCloudReady() && isUuid(list[index].id)) {
      const table = getSupabaseTable(collection);
      const cloudPayload = sanitizeForSupabase(collection, updates);
      supabaseAdmin
        .from(table)
        .update(cloudPayload)
        .eq('id', list[index].id)
        .then(({ error }) => {
          if (error) console.warn(`[Supabase Sync] update in ${table} warning:`, error.message);
        })
        .catch(() => {});
    }

    return list[index];
  }

  delete(collection, filterFn) {
    const list = this.getCollection(collection);
    const index = list.findIndex(filterFn);
    if (index === -1) return false;

    const removed = list.splice(index, 1)[0];
    this.save();

    // Async background sync to Supabase if schema is ready and record has a valid UUID
    if (isCloudReady() && isUuid(removed?.id)) {
      const table = getSupabaseTable(collection);
      supabaseAdmin
        .from(table)
        .delete()
        .eq('id', removed.id)
        .then(({ error }) => {
          if (error) console.warn(`[Supabase Sync] delete from ${table} warning:`, error.message);
        })
        .catch(() => {});
    }

    return true;
  }
}

export const memoryDb = new PersistentDatabase();

/**
 * Unified database accessor.
 * Supports Supabase when configured, otherwise uses structured persistent file store.
 */
export const db = {
  isSupabaseConfigured: () => Boolean(supabaseAdmin),
  isSupabaseReady: () => Boolean(supabaseAdmin && isSupabaseSchemaReady),
  supabase: () => supabaseAdmin,
  
  getCollection: (name) => memoryDb.getCollection(name),
  find: (collection, filterFn) => memoryDb.find(collection, filterFn),
  findOne: (collection, filterFn) => memoryDb.findOne(collection, filterFn),
  insert: (collection, record) => memoryDb.insert(collection, record),
  update: (collection, filterFn, updates) => memoryDb.update(collection, filterFn, updates),
  delete: (collection, filterFn) => memoryDb.delete(collection, filterFn)
};

