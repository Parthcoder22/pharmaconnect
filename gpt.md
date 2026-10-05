# PharmaConnect — Complete Development & Implementation Specification

## 1. Project Overview & Institutional Purpose

**Platform Name:** PharmaConnect  
**Industry:** B2B Institutional Pharmaceutical Medicine Marketplace  
**Jurisdiction & Target Market:** India  
**Statutory Regulatory Frameworks:**
- **CDSCO:** Central Drugs Standard Control Organisation guidelines
- **State FDA:** Directorate of Food & Drug Administration (Maharashtra, Gujarat, Karnataka, Delhi, etc.)
- **Drugs & Cosmetics Act, 1940 & Rules, 1945:** Form 20, Form 21, Form 20B (Wholesale), Form 21B (Biologicals/Specialties)
- **Schedule M cGMP & WHO-GMP:** Current Good Manufacturing Practice cleanroom standards
- **Section 31 CGST Act, 2017:** Form INV-01 compliant B2B electronic tax invoicing
- **NIC E-Way Bill System:** Real-time road/air cargo consignment transport passes
- **21 CFR Part 11:** Tamper-evident, cryptographically verifiable electronic records and audit trails

**Core Objective:**  
Eliminate informal, fragmented broker channels and substitute them with direct institutional procurement between certified pharmaceutical manufacturers and NABH-accredited hospital networks, clinical chains, and licensed wholesale pharmacies with 100% digital audit trace, live 2°C–8°C cold-chain IoT telemetry, and automated escrow clearance.

---

## 2. Complete Conversion to Pure JavaScript (`.js` & `.jsx`)

In strict accordance with requirements:
- **No TypeScript (.ts / .tsx) files exist** in the repository.
- All components, views, modals, mock datasets, and build configurations are written in modern ECMAScript / React JSX.
- Type annotations have been cleanly eliminated in favor of clean prop destructuring, standard JavaScript object models, and native React 19 state primitives.

### Exhaustive File Tree & Role Map:
```
/
├── index.html                    # Root HTML with Google Fonts (Inter, JetBrains Mono) & Material Symbols
├── metadata.json                 # AI Studio application metadata
├── package.json                  # NPM dependencies & scripts (React 19, Tailwind CSS v4, Lucide React)
├── vite.config.js                # Vite 8.3 bundler configuration with @tailwindcss/vite
├── gpt.md                        # Master development, architecture & implementation documentation
├── src/
│   ├── main.jsx                  # React 19 DOM entry mount
│   ├── App.jsx                   # Central state machine, view routing, cart, modals & notifications
│   ├── index.css                 # Tailwind CSS v4 design system tokens and color variables
│   ├── data/
│   │   └── mockData.js           # Production-realistic pharmaceutical data, active batches & test personas
│   └── components/
│       ├── Header.jsx            # Persistent top ribbon, CDSCO live node, portal switch & notifications
│       ├── Sidebar.jsx           # Procurement suite navigation drawer with clinical icons & badges
│       ├── LandingPage.jsx       # Public institutional exchange with Hero, Mosaic, Catalog & KYC Gate
│       ├── SupplierDashboard.jsx # Enterprise Command Dashboard (6 KPIs, 4 Tabs, Cleanroom logs & Add SKU)
│       ├── MedicineCatalog.jsx   # Hospital Procurement Desk, Dual Grid/Clinical Table, Tier Pricing & PO Basket
│       ├── InvoiceAuditTrail.jsx # B2B Tax Invoice (Form INV-01), 8-Step Lifecycle Tracker & Razorpay Checkout
│       ├── BuyerDashboard.jsx    # Hospital Central Store inventory & Patient Bedside Dispense Slip generator
│       ├── ExpiryAlerts.jsx      # Batch & Expiry surveillance engine, FEFO prioritization & Form 483 quarantine
│       ├── RegulatoryKYC.jsx     # Statutory credentials vault (Form 20/21, Form 20B/21B, Live GSTIN re-verify)
│       ├── AnalyticsReports.jsx  # Commercial intelligence, therapeutic class revenue & cold-chain SLA continuity
│       ├── OrderChat.jsx         # Buyer-Supplier dispute and regulatory audit trail conversation stream
│       ├── AuthModal.jsx         # Institutional gateway authentication modal with 1-click test personas
│       ├── PoReviewModal.jsx     # Purchase Order basket review & checkout modal with GST calculation
│       └── CoaModal.jsx          # Laboratory Certificate of Analysis (CoA) monograph inspection modal
```

---

## 3. Deep-Dive Screen & Feature Breakdown

### A. Public Institutional Exchange (`LandingPage.jsx`)
1. **Regulatory Notice Ribbon:**
   - Real-time CDSCO and State FDA verification notice.
   - Active gateway node: `MH-CENTRAL-01`.
   - Real-time GSTIN and Drug License cross-verification indicator.
2. **Hero & Dual Institutional Onboarding Gateways:**
   - **"Register as Licensed Buyer"**: For NABH hospitals, clinical chains, and hospital pharmacies holding Form 20 & Form 21 licenses.
   - **"Join as Certified Supplier"**: For WHO-GMP, CDSCO-approved pharmaceutical manufacturers and C&F carrying agents holding Form 20B & Form 21B licenses.
   - Quick statutory indicators: Pre-screened Drug License, Real-time 2°C–8°C IoT log, Escrow settlement on Certificate of Analysis (CoA) release.
3. **Live Exchange Mosaic:**
   - Live escrow settlement clearance indicator with CDSCO repository reference `#IN-88921`.
   - Active lot analysis graphic with Passed CoA badge for *Cefixime 200mg USP Bulk Lot #CF-2024-819*.
   - Live telemetry gauges: Cold Chain Integrity at 99.98% (+4.2°C Continuous Avg) and Average Dispense Dispatch (14.2 hrs via Express Air Cargo).
   - Interactive GS1-128 barcode validation trigger with instant verification response.
4. **Verified Supply Chain KPI Counter Bar:**
   - **45,000+** Verified Batches Cleared (GS1 Serialized & QR Tracked).
   - **₹180Cr+** Monthly Institutional B2B Trade Turnover.
   - **12,000+** Licensed Hospitals, Clinics, and Wholesale Pharmacies.
   - **100%** Statutory Adherence Rate (CDSCO, Form 20B/21B, and GSTIN).
5. **Live Institutional Catalog Explorer:**
   - Role perspective switcher: *Hospital / Buyer View* vs *Manufacturer / Supplier View*.
   - Instant search across generic molecule names, brand names, CAS registry, and batch numbers.
   - Therapeutic category filters: Oncology, Critical Care & ICU, Vaccines & Biologics, Cardiovascular.
   - Direct button to inspect laboratory Certificate of Analysis (CoA) with digital chemist signatures.
6. **Formulation-to-Ward Traceability Flow:**
   - Immutable consignment timeline: *Origin (Sun Pharma Hazira Plant)* → *Transit (Cold-Link Logix Reefer CL-4410)* → *Destination (Apollo Medics ICU Store)*.
7. **Statutory Advisory FAQ Accordion:**
   - Expandable legal, taxation, and logistics clarifications covering statutory drug licenses, escrow mechanics, cold-chain excursion protocols, and international export clearance.

---

### B. Supplier Enterprise Command Dashboard (`SupplierDashboard.jsx`)
1. **Compliance & System Live Health Bar:**
   - Active GS1 track & trace synchronization indicator.
   - CDSCO / FDA Node ID `IND-MH-40194`.
   - 28 real-time active thermal probes monitor.
   - Quick actions: "Quick Add SKU Listing" slide-over drawer and "Export Audit CSV".
2. **6 Primary Mission-Critical KPI Metric Cards:**
   - **Active SKUs:** 1,482 (+38 active this month, 82% catalog saturation).
   - **Pending PO Review:** 18 incoming requests (7 requiring immediate pharmacist sign-off).
   - **In Cold Transit:** 42 consignments (100% telemetry locked under 8°C).
   - **Monthly Net Revenue:** ₹2.48 Cr (+14.2% MoM growth with embedded SVG sparkline).
   - **Low Stock Alert:** 6 SKUs below buffer safety threshold.
   - **Expiring Batches <30d:** Critical lots requiring immediate liquidation or return.
3. **4 Operational Workspace Tabs:**
   - **Tab 1: Purchase Requests:** Interactive incoming PO table (*Apollo Regional Distribution Hub, MedPlus Central Warehouse, Fortis Healthcare*), order values, Form 20B compliance status, *Accept & Pack* execution, and *Reject PO Modal* with mandatory CDSCO regulatory reasons (Quota, License, Depleted stock, Cold chain, Credit).
   - **Tab 2: Live Dispatch & Logistics:** Real-time consignment cards (*SHIP-MH-9942, SHIP-GJ-1092, SHIP-KA-4410*) with temperature probes, plus an interactive SVG Thermal Curve Chart (2°C–8°C permissible target zone, checkpoint markers from Pune to Bengaluru, WHO TRS 961 Annex 9 compliance).
   - **Tab 3: Expiring & Quarantine Alerts:** Lot breakdown (*Azithromycin, Ceftriaxone, Pantoprazole*) with days remaining, warehouse vault locations, and 1-click *Move to Quarantine (Form 483)* action.
   - **Tab 4: Top Moving Formulations:** Ranked formulations (*Amoxicillin + Clavulanate, Telmisartan + Amlodipine, Metformin HCl, Atorvastatin*) with volume, monthly revenue, and gross margins.
4. **cGMP Cleanroom & Dispatch Stream:**
   - 21 CFR Part 11 audit trail with real-time logs (CoA digitally signed, SSCC serialized pallet aggregation, Buyer KYC auto-validation).
5. **Regulatory Audit Score Donut Gauge:**
   - 95% Audit Ready score, Batch Manufacturing Records filed (99.2%), CoA signed (100%), and cold chain continuity ratio (98.8%), plus CDSCO Inspection Dossier generation.
6. **Slide-Over Drawer (Quick Add SKU Listing):**
   - Comprehensive formulation intake form supporting active batch creation, storage conditions, volume pricing, and CoA attachment.

---

### C. Medicine Catalog & Order Console (`MedicineCatalog.jsx`)
1. **Destination Hub Selector:**
   - St. Jude Medical Center — Wing B Central Store.
   - Apollo Multispeciality ICU Depot (Mumbai).
   - Fortis Escorts Heart Central Pharmacy (Delhi).
   - Manipal Hospital Surgical Pharmacy Node (Bengaluru).
2. **Real-Time PO Basket Widget:**
   - Live line item count, unit quantity tally, and subtotal calculation with *Review Purchase Order* checkout trigger.
3. **Comprehensive Clinical Filter Sidebar:**
   - *Therapeutic Categories:* Cardiovascular, Antimicrobial & Antibiotics, Anti-diabetic, Oncology, Respiratory.
   - *Dosage Forms:* Tablets, Injectables, Syrups, IV Fluids.
   - *Regulatory Schedules:* Schedule H (Prescription), Schedule H1 (Strict Register), Schedule X (DEA Lock), General / OTC (Open).
   - *Minimum Expiry Shelf-Life:* >12 Months, 6–12 Months, Near-Expiry Clearance.
   - *Max Batch MOQ Range Slider:* Interactive range from 50 to 2,500 units with dynamic updates.
   - *Cold-Chain Filter:* 2°C–8°C isolation toggle.
   - *Quality Certification:* WHO-GMP validated only filter.
4. **Product Presentation & Volume Tier Discounts:**
   - **Dual Display Modes:** Instant toggle between **Card Grid View** and **Dense Clinical Table View**.
   - **Volume Tier Pricing:** Automatic price calculation based on quantity ordered (*50-200 pk, 201-1,000 pk, >1,000 pk*).
   - **Calculators & Actions:** Numeric and +/- quantity steppers enforcing minimum order quantities, stock availability indicators, and instant addition to the PO basket with toast notifications.

---

### D. Tax Invoice & Order Lifecycle Audit Trail (`InvoiceAuditTrail.jsx`)
1. **Header & Consignment Metadata:**
   - PO Reference `#PC-2025-8841` (*Ciprofloxacin & Amoxicillin Bulk Consignment*), active e-Way Bill `#EW-9821-4190`, and carrier details.
2. **8-Step Order Lifecycle Progress Tracker:**
   - *Requested → Accepted → Processing → Dispatched → Delivered → Payment Due → Paid → Completed*.
   - Interactive clickable milestones allowing status simulation.
3. **Stage Detail Callout:**
   - Delivery verification at Mumbai Central Depot Bay 4, carrier vehicle GPS tracking (`MH-04-AZ-4180`), tamper seals intact, and outstanding balance of ₹4,30,080.00.
4. **B2B Tax Invoice (Form INV-01 Compliant):**
   - Section 31 CGST Act 2017 & Drugs and Cosmetics Act 1940 compliance.
   - Full tax details: Invoice `#PC/INV/2025/10-994`, E-Way Bill `#3819 0048 2910`, Dispatch Date, Place of Supply (`27-Maharashtra`).
   - Bilateral verification:
     - *Supplier (Consignor):* Novartis Lifesciences Bio-Pharma Ltd., GSTIN `27AAACN0192Q1ZV`, Form 20B `MH-PUN-20B-184920`, Form 21B `MH-PUN-21B-184921`.
     - *Buyer (Consignee):* Apex Multispeciality Healthcare Trust, GSTIN `27AABTA4481M1ZR`, Buyer Form 20B `MH-MUM-20B-391827`, Form 21B `MH-MUM-21B-391828`.
   - Itemized drug monograph table:
     - *Ciprofloxacin Infusion IP 200mg/100ml* (HSN 3004 20 42, Batch CP-24K09, Exp 07/2028, 2,000 Vials, Taxable ₹1,70,000, CGST/SGST 6%, Total ₹1,90,400).
     - *Amoxicillin & Potassium Clavulanate Inj 1.2g* (HSN 3004 10 30, Batch AMC-88L14, Exp 08/2027, 1,200 Vials, Taxable ₹1,62,000, CGST/SGST 6%, Total ₹1,81,440).
     - *Paracetamol Infusion 1000mg/100ml* (HSN 3004 90 60, Batch PCM-391D2, Exp 06/2028, 1,000 Bags, Taxable ₹52,000, Total ₹58,240).
   - Electronic Bank Settlement Details: HDFC Bank Fort Mumbai, A/C No `5020 0098 4410 29`, IFSC `HDFC0000060`, Razorpay Virtual VPA `novartis.b2b.8841@hdfcbank`.
   - Statutory Quality Certification statement under Section 18 of the Drugs and Cosmetics Act.
   - GST computation breakdown: Taxable ₹3,84,000.00, CGST ₹23,040.00, SGST ₹23,040.00, Net Payable ₹4,30,080.00.
   - Digital signature token: `DSC/2025/NOV/84920/SHA256` (e-Signed Verified).
5. **Simulated Razorpay B2B Escrow Checkout Modal:**
   - Corporate NetBanking / NEFT / RTGS Challan simulation.
   - Simulated processing state with automatic UTR generation (`RZPAY-98124801`) and order advancement to "Paid".
6. **Dispute & Audit Chat Slide-Over Panel:**
   - Real-time audit thread between Apex Depot Pharmacist and Novartis Quality Assurance desk.

---

### E. Specialized Hospital & Compliance Modules
1. **Hospital Buyer Dashboard & Patient Bedside Dispensing (`BuyerDashboard.jsx`):**
   - Formulary stock visibility and inward checking.
   - **Patient Dispense Bill Generator:** Prescribing doctor credentials, MCI registration number, patient UHID, medicine batch allocation, and invoice generation adhering to Form 20/21 regulations.
2. **Batch & Expiry Surveillance Engine (`ExpiryAlerts.jsx`):**
   - FEFO (First-Expiry-First-Out) prioritization, critical <30-day alerts, near-expiry liquidation listings, and CDSCO Form 483 quarantine holding protocols.
3. **Regulatory Audit & Statutory Verification Vault (`RegulatoryKYC.jsx`):**
   - Form 20/21 and Form 20B/21B certification status, live GSTIN verification simulation via GSTN API, and WHO-GMP / Schedule M cleanroom audit records.
4. **Institutional Analytics & Reporting (`AnalyticsReports.jsx`):**
   - Revenue breakdown by therapeutic class (Antimicrobial, Cardiovascular, ICU, Oncology) and 30-day cold-chain continuous SLA telemetry graph.
5. **Buyer-Supplier Order Chat (`OrderChat.jsx`):**
   - Multi-order communications stream with immutable audit history.
6. **Authentication & Persona Switcher Modal (`AuthModal.jsx`):**
   - 1-click test personas for **Dr. Aris Thorne (Novartis Supplier)** and **Dr. V. Sharma (Apex Hospital Buyer)**, with persistent fast-switch navigation across all screens.
7. **Certificate of Analysis (CoA) Inspection Modal (`CoaModal.jsx`):**
   - Detailed laboratory parameters (Active assay HPLC 99.84%, dissolution rate, bacterial endotoxins, sterility) signed by the Chief Analytical Chemist.

---

## 4. Key Data Entities & Schemas (`mockData.js`)

- **User:** `id`, `name`, `email`, `phone`, `role` ('supplier' | 'buyer'), `licenseNumber`, `licenseType`, `organization`, `gstin`, `verificationStatus`, `avatarUrl`.
- **Medicine:** `id`, `name`, `brand`, `genericName`, `category`, `dosageForm`, `regulatorySchedule`, `mrp`, `baseWholesalePrice`, `moq`, `unitPack`, `gstRate`, `manufacturer`, `mfgLicense`, `storageCondition`, `isColdChain`, `isWhoGmp`, `cdscoVerified`, `totalStockAvailable`, `activeBatch`, `volumeTiers`.
- **Batch:** `id`, `medicineId`, `batchNumber`, `manufacturingDate`, `expiryDate`, `shelfLifeMonths`, `quantity`, `status`, `temperatureRange`, `vaultLocation`, `coaSigned`, `coaSigner`, `gs1Barcode`.
- **PurchaseOrder:** `id`, `poReference`, `buyerId`, `buyerName`, `buyerLicense`, `buyerGstin`, `buyerAddress`, `supplierId`, `supplierName`, `supplierLicense`, `supplierGstin`, `supplierAddress`, `destinationHub`, `status`, `createdAt`, `taxableTotal`, `cgstTotal`, `sgstTotal`, `netPayable`, `amountInWords`, `items`, `eWayBillNo`, `invoiceNumber`, `invoiceDate`.
- **PatientBill:** `id`, `billNumber`, `patientName`, `patientId`, `doctorName`, `doctorRegNo`, `date`, `items`, `totalAmount`.
- **ColdChainLog:** `id`, `shipmentId`, `productName`, `destination`, `carrier`, `currentTemp`, `status`, `beaconId`, `eta`.
- **ChatMessage:** `id`, `orderId`, `senderName`, `senderRole`, `timestamp`, `message`.

---

## 5. Build, Lint & Verification Status

| Check | Tool | Result |
|---|---|---|
| **Compilation** | `compile_applet` | **Success** (Vite 8.3 production build succeeded without warnings) |
| **Linting** | `lint_applet` | **Success** (0 syntax or import issues) |
| **Language Standards** | Pure JavaScript | **Strict adherence**: 100% of files use `.js` and `.jsx` |
| **Styling** | Tailwind CSS v4 | **Configured** with custom clinical theme tokens in `src/index.css` |
| **Icons & Typography** | Lucide React + Material Symbols | **Active** throughout all modules |

---

## 6. Backend System Architecture & Implementation

### A. Architectural Overview
The PharmaConnect backend is engineered as a secure, high-concurrency Node.js REST and WebSocket platform adhering to:
- **CDSCO & Drugs and Cosmetics Rules (1945)**
- **21 CFR Part 11 Electronic Records & Tamper-Evident Audit Trails**
- **Section 31 CGST Act, 2017 (Form INV-01 B2B Electronic Invoicing)**
- **GS1 Serialized Batch Tracking & FEFO Warehouse Priority**

The backend is modularized with separation of concerns:
- **Routes:** Endpoint URI declaration and middleware bindings
- **Middleware:** Token validation (`requireAuth`), role enforcement (`requireSupplier`, `requireBuyer`, `requireVerifiedBusiness`, `requireAdmin`), Zod request payload schema validation, rate limiting, and centralized error handling
- **Controllers:** Request orchestration, response formatting
- **Services:** Business and domain logic, statutory calculations, inventory concurrency, state machine transitions
- **Database Abstraction:** Supabase PostgreSQL with automated schema migrations and dual-mode resilient local persistence store for rapid offline testability
- **Sockets:** Real-time order-scoped communication channels powered by Socket.IO
- **Jobs:** Scheduled surveillance scanning for near-expiry formulations (<30d, <7d, expired) with Nodemailer SMTP alerts

### B. Exhaustive Backend Directory Tree
```
backend/
├── .env                          # Local environment variables
├── .env.example                  # Environment configuration template
├── package.json                  # ES Module backend dependencies & test runners
├── server.js                     # HTTP server, Socket.IO binding & periodic cron initializers
├── tests/
│   └── api.test.js               # 17 automated end-to-end integration tests
└── src/
    ├── app.js                    # Express application instance, CORS, helmet & route mounting
    ├── config/
    │   ├── env.js                # Environment configuration loader with defaults
    │   ├── db.js                 # Unified database layer with memory store fallback
    │   ├── supabase.js           # Supabase client & admin service-role initializer
    │   ├── razorpay.js           # Razorpay client & simulation fallback
    │   ├── cloudinary.js         # Cloudinary SDK & signed upload manager
    │   └── email.js              # Nodemailer SMTP transporter & simulator
    ├── controllers/
    │   ├── authController.js     # Register, login, demo personas, KYC submission & admin review
    │   ├── medicineController.js # Marketplace querying, supplier SKU creation & batch intake
    │   ├── orderController.js    # PO creation, state progression (accept, reject, dispatch, deliver)
    │   ├── paymentController.js  # Razorpay order generation, HMAC SHA-256 verification & webhooks
    │   ├── invoiceController.js  # Form INV-01 tax invoice retrieval & digital signatures
    │   ├── patientBillController.js # Hospital pharmacy patient dispense slips (UHID & MCI reg)
    │   ├── reportController.js   # Commercial KPIs, category revenue & batch surveillance
    │   ├── notificationController.js # In-app notification center & unread counts
    │   ├── chatController.js     # Order-scoped audit trail messaging
    │   └── uploadController.js   # Cloudinary signed upload token generator
    ├── middleware/
    │   ├── authMiddleware.js     # Bearer JWT token verification & user context injection
    │   ├── roleMiddleware.js     # Role guards (supplier, buyer, admin, verified business)
    │   ├── validationMiddleware.js # Zod schema request validation
    │   ├── errorHandler.js       # Centralized error handler sanitizing stacks in production
    │   └── rateLimiter.js        # IP-based rate limiting (global & sensitive auth routes)
    ├── routes/
    │   ├── authRoutes.js         # /api/auth/*
    │   ├── medicineRoutes.js     # /api/medicines/*
    │   ├── supplierRoutes.js     # /api/supplier/*
    │   ├── buyerRoutes.js        # /api/buyer/*
    │   ├── orderRoutes.js        # /api/orders/*
    │   ├── paymentRoutes.js      # /api/payments/*
    │   ├── invoiceRoutes.js      # /api/invoices/*
    │   ├── patientBillRoutes.js  # /api/patient-bills/*
    │   ├── reportRoutes.js       # /api/reports/*
    │   ├── notificationRoutes.js # /api/notifications/*
    │   ├── chatRoutes.js         # /api/chat/*
    │   └── uploadRoutes.js       # /api/uploads/*
    ├── services/
    │   ├── authService.js        # Password hashing (bcryptjs) & JWT signing
    │   ├── medicineService.js    # Catalog management, search algorithms & batch allocations
    │   ├── orderStateService.js  # Strict 8-step lifecycle state machine & stock reservation
    │   ├── paymentService.js     # Razorpay order creation & HMAC verification
    │   └── reportService.js      # Aggregations, revenue trends & surveillance calculations
    ├── validators/
    │   ├── authValidator.js      # Validation schemas for auth, registration, documents
    │   ├── medicineValidator.js  # Validation schemas for SKU creation & batches
    │   ├── orderValidator.js     # Validation schemas for PO placement, rejection, dispatch
    │   └── patientBillValidator.js # Validation schemas for patient dispense bills
    ├── utils/
    │   ├── AppError.js           # Custom domain error class with HTTP status codes
    │   ├── responseFormatter.js  # Standardized API response formatters (success / error)
    │   └── auditLogger.js        # 21 CFR Part 11 immutable audit logger
    ├── jobs/
    │   └── expiryAlertJob.js     # Automated batch expiry scanner (<30d, <7d, expired)
    ├── sockets/
    │   └── chatSocket.js         # Socket.IO authenticated room channels (order:<orderId>)
    └── database/
        ├── schema.sql            # Complete PostgreSQL / Supabase schema (16 tables)
        └── seed.sql              # Seed SQL dataset matching clinical personas & medicines
```

---

## 7. Relational Database Schema (`schema.sql`)

| Table Name | Description | Key Columns & Constraints |
|---|---|---|
| `users` | Core user identity & credentials | `id` (UUID PK), `email` (UNIQUE), `role` ('supplier' \| 'buyer' \| 'admin'), `verification_status` ('pending' \| 'under_review' \| 'verified' \| 'rejected') |
| `businesses` | Statutory company / hospital profiles | `id` (UUID PK), `user_id` (FK), `gstin`, `license_number`, `license_type` ('Form 20B/21B' \| 'Form 20/21'), `verification_status` |
| `verification_documents` | Private regulatory dossiers | `id` (UUID PK), `user_id` (FK), `document_type`, `document_url`, `verification_status`, `reviewer_notes` |
| `medicines` | Catalog formulation listings | `id` (UUID PK), `supplier_id` (FK), `name`, `generic_name`, `category`, `dosage_form`, `base_wholesale_price`, `mrp`, `moq`, `gst_rate`, `is_cold_chain`, `is_who_gmp`, `total_stock_available`, `status` |
| `medicine_batches` | Serialized batch inventory | `id` (UUID PK), `medicine_id` (FK), `batch_number`, `manufacturing_date`, `expiry_date`, `quantity`, `status`, `vault_location`, `coa_signed`, `gs1_barcode` |
| `purchase_orders` | B2B institutional orders | `id` (UUID PK), `po_reference` (UNIQUE), `buyer_id` (FK), `supplier_id` (FK), `status`, `taxable_total`, `cgst_total`, `sgst_total`, `net_payable`, `e_way_bill_no`, `carrier_name`, `vehicle_no`, `cold_chain_temp` |
| `order_items` | Itemized drug monographs | `id` (UUID PK), `order_id` (FK), `medicine_id` (FK), `batch_id` (FK), `quantity`, `unit_price`, `taxable_amount`, `cgst_amount`, `sgst_amount`, `line_total` |
| `payments` | Settlement transaction records | `id` (UUID PK), `order_id` (FK), `buyer_id` (FK), `provider` ('razorpay'), `razorpay_order_id`, `razorpay_payment_id`, `amount`, `status` |
| `invoices` | Form INV-01 tax invoices | `id` (UUID PK), `order_id` (FK UNIQUE), `invoice_number` (UNIQUE), `taxable_amount`, `tax_amount`, `total_amount`, `digital_signature_token`, `status` |
| `inventory_movements` | Stock balance audit trail | `id` (UUID PK), `batch_id` (FK), `movement_type` ('initial_stock' \| 'stock_in' \| 'reservation' \| 'dispatch' \| 'delivery' \| 'dispense' \| 'quarantine'), `quantity`, `reference_type`, `reference_id` |
| `notifications` | Role-based notification events | `id` (UUID PK), `user_id` (FK), `type`, `title`, `message`, `is_read` |
| `conversations` | Order-scoped chat threads | `id` (UUID PK), `order_id` (FK UNIQUE), `supplier_id` (FK), `buyer_id` (FK) |
| `messages` | Tamper-evident chat logs | `id` (UUID PK), `conversation_id` (FK), `sender_id` (FK), `message`, `attachment_url`, `read_at` |
| `patient_bills` | Hospital pharmacy dispense slips | `id` (UUID PK), `buyer_id` (FK), `bill_number` (UNIQUE), `patient_reference`, `doctor_name`, `doctor_reg_no`, `total_amount` |
| `patient_bill_items` | Dispensed drug monographs | `id` (UUID PK), `bill_id` (FK), `medicine_name`, `batch_number`, `quantity`, `unit_price`, `total` |
| `audit_logs` | 21 CFR Part 11 compliant audit log | `id` (UUID PK), `actor_id` (FK), `action`, `entity_type`, `entity_id`, `metadata` (JSONB) |

---

## 8. Complete API Endpoint Reference

### Public & Authentication
- `POST /api/auth/register`: Onboard institutional buyer or supplier (starts in `pending` status)
- `POST /api/auth/login`: Authenticate and issue 7-day JWT Bearer token
- `GET /api/auth/demo-token/:role`: Issue instant demo token for `supplier`, `buyer`, or `admin`
- `GET /api/auth/me`: Retrieve authenticated profile, business records, and verification documents
- `POST /api/auth/logout`: End session and record logout in audit log
- `POST /api/auth/business`: Register or update business license, GSTIN, and corporate depot address
- `POST /api/auth/documents`: Upload Drug License / WHO-GMP verification document for compliance review
- `GET /api/auth/documents`: Retrieve authenticated organization's submitted documents
- `POST /api/auth/admin/review/:docId`: CDSCO admin endpoint to approve or reject licenses

### Medicine Marketplace & Supplier Catalog
- `GET /api/medicines`: Search and filter catalog with search query, category, price, cold chain, and WHO-GMP filters
- `GET /api/medicines/categories`: Retrieve unique therapeutic categories
- `GET /api/medicines/:id`: Retrieve single medicine with batch monographs
- `POST /api/supplier/medicines`: Create new WHO-GMP formulation (requires verified supplier)
- `GET /api/supplier/medicines`: List all active formulations owned by authenticated supplier
- `PATCH /api/supplier/medicines/:id`: Update pricing, MOQ, or formulations
- `DELETE /api/supplier/medicines/:id`: Soft-delete/deactivate SKU to preserve historical order records
- `POST /api/supplier/medicines/:id/batches`: Add new production lot with manufacturing and expiry date

### Purchase Orders & 8-Step Lifecycle
- `POST /api/orders`: Buyer places purchase request (prices, GST rates, and totals recalculated server-side)
- `GET /api/orders`: List orders scoped by role (supplier sees incoming POs, buyer sees purchases)
- `GET /api/orders/:id`: Detailed PO breakdown with line items and Form INV-01 tax invoice
- `POST /api/supplier/orders/:id/accept`: Supplier accepts PO; stock is safely reserved in inventory
- `POST /api/supplier/orders/:id/reject`: Supplier rejects PO with mandatory CDSCO regulatory reason
- `PATCH /api/supplier/orders/:id/dispatch`: Supplier records dispatch, vehicle number, cold-chain temperature, and e-Way Bill; auto-generates Form INV-01 tax invoice
- `POST /api/orders/:id/confirm-delivery`: Hospital logs arrival and tamper-seal inspection; unlocks payment settlement
- `POST /api/orders/:id/cancel`: Buyer cancels pending purchase request

### Payments (Razorpay Escrow Settlement)
- `POST /api/payments/create-order`: Initialize server-side Razorpay order with net payable amount
- `POST /api/payments/verify`: Cryptographically verify checkout signature via HMAC-SHA256 and advance order to `paid`
- `POST /api/payments/webhook`: Idempotent webhook handler verifying Razorpay webhook signature
- `GET /api/payments/history`: List transaction logs and settlement UTRs

### Invoices & Hospital Dispensing
- `GET /api/invoices`: List Section 31 CGST Act compliant B2B tax invoices
- `GET /api/invoices/:id`: Detailed Form INV-01 tax invoice with bilateral GSTINs and digital signature
- `POST /api/patient-bills`: Generate hospital patient bedside dispense slip with MCI registration number and batch assignment
- `GET /api/patient-bills`: List patient billing history

### Commercial Intelligence & Surveillance
- `GET /api/reports/supplier/overview`: Supplier command KPIs (active SKUs, revenue, cold transit, low stock)
- `GET /api/reports/buyer/overview`: Buyer procurement spend, active shipments, and inward logs
- `GET /api/reports/batch-surveillance`: Lot expiry surveillance engine with FEFO calculations
- `POST /api/surveillance/scan-expiry`: Trigger immediate batch expiry scan (<30d, <7d, expired) and dispatch Nodemailer alerts

### Communications & Utilities
- `GET /api/notifications`: Retrieve unread alert notifications
- `PATCH /api/notifications/:id/read`: Mark notification as read
- `POST /api/notifications/read-all`: Mark all notifications as read
- `GET /api/chat/conversations`: List order-scoped communication channels
- `GET /api/chat/:orderId/messages`: Retrieve chat message stream for specific order
- `POST /api/chat/:orderId/messages`: Post message with order reference
- `POST /api/uploads/signature`: Generate signed Cloudinary upload credentials
- `GET /api/health`: Health status endpoint returning active CDSCO node

---

## 9. Verification & Automated Test Results

Integration testing executed via Node.js test runner (`node --test tests/api.test.js`) and Supertest:

```
▶ PharmaConnect B2B Core API Integration Tests
  ✔ 1. Health Check Endpoint responds with CDSCO node
  ✔ 2. Authentication: User registration with Form 20B / GSTIN
  ✔ 3. Authentication: Login with valid demo credentials
  ✔ 4. Role Protection: Buyer cannot add medicines via Supplier endpoint
  ✔ 5. Supplier: Create new WHO-GMP Medicine and Batch listing
  ✔ 6. Marketplace: Search and filter medicines
  ✔ 7. Purchase Orders: Buyer creates purchase order with server recalculated GST
  ✔ 8. Supplier: Accept purchase order and reserve stock
  ✔ 9. Lifecycle Guard: Prevent duplicate order acceptance (HTTP 400)
  ✔ 10. Supplier: Dispatch order and generate B2B tax invoice
  ✔ 11. Delivery Confirmation: Record delivery at hospital hub
  ✔ 12. Payments: Initialize Razorpay order for delivered consignment
  ✔ 13. Payments: Verify payment signature and mark order paid
  ✔ 14. Tax Invoices: Retrieve B2B invoice matching paid order
  ✔ 15. Patient Dispensing: Generate hospital patient bill
  ✔ 16. Surveillance: Scan batch expiries and generate automated alerts
  ✔ 17. Chat: Send and retrieve order-scoped messages
✔ PharmaConnect B2B Core API Integration Tests (Pass: 17/17, Fail: 0)
```

---

## 10. Honest Feature Implementation Matrix

| Module | Feature | Status | Notes |
|---|---|---|---|
| **Auth & KYC** | JWT Authentication | **Production-ready** | Verified with bcryptjs & JWT |
| | Dual Role RBAC | **Production-ready** | Supplier, Buyer, Admin separation |
| | Demo Persona Fast Switch | **Integrated** | Integrated in UI & API |
| | KYC Document Submission | **Implemented** | Private storage metadata recorded |
| | CDSCO Admin License Review | **Implemented** | Verified via admin review route |
| **Medicines** | Catalog Search & Filter | **Integrated** | Connected to live `/api/medicines` |
| | Supplier SKU Creation | **Integrated** | Adds formulation & active batch |
| | Batch Inventory Tracking | **Production-ready** | Concurrency-safe quantity updates |
| | Soft Listing Deactivation | **Implemented** | Retains audit trails on delete |
| **Orders** | Server-Side Recalculation | **Production-ready** | Never trusts frontend prices/taxes |
| | 8-Step State Transition | **Production-ready** | Strict predecessor state validation |
| | Duplicate Accept Prevention | **Production-ready** | Enforced with HTTP 400 |
| | Stock Reservation | **Production-ready** | Deducts batch upon acceptance |
| | Delivery Confirmation | **Integrated** | Records seal verification |
| **Settlement** | Razorpay Order Creation | **Implemented** | Server-side paise calculation |
| | HMAC-SHA256 Signature Verify | **Production-ready** | Cryptographic verification |
| | Webhook Idempotency | **Production-ready** | Prevents duplicate processing |
| **Invoices & Billing** | Form INV-01 Tax Invoice | **Integrated** | Bilateral GSTIN & digital signature |
| | Hospital Patient Dispensing | **Integrated** | UHID & MCI doctor registration |
| **Surveillance** | Automated Expiry Alert Job | **Production-ready** | <30d, <7d, expired scanning |
| | Nodemailer SMTP Delivery | **Implemented** | Live SMTP or simulation mode |
| | In-App Notification Center | **Integrated** | Role-scoped unread counts |
| **Chat** | Order-Scoped Messages | **Integrated** | Database persisted & Socket.IO room |

---

## 11. How to Run Frontend & Backend Together

### Start Backend API:
```bash
cd backend
npm install
npm run dev
# Server runs at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Start Frontend Application:
```bash
# In project root
npm install --legacy-peer-deps
npm run dev
# Frontend runs at http://localhost:3000
```

### Run Automated Backend Tests:
```bash
cd backend
npm test
# Executes 17 end-to-end integration tests
```

