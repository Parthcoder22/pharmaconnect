# PharmaConnect — B2B Institutional Pharmaceutical Marketplace

<div align="center">

[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite_8-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_/_Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Realtime](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Payment](https://img.shields.io/badge/Payments-Razorpay_Escrow-0C2340?logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Compliance](https://img.shields.io/badge/Compliance-CDSCO_%7C_WHO--GMP_%7C_21_CFR_Part_11-107C41)](https://cdsco.gov.in/)

**Next-Generation Compliant Procurement Platform Connecting Certified Pharmaceutical Manufacturers Directly with NABH-Accredited Hospitals, Healthcare Networks, and Licensed Wholesale Pharmacies.**

[Features](#-key-features--capabilities) • [Architecture](#-system-architecture) • [Database Schema](#-database-schema--data-models) • [API Reference](#-api-endpoints-reference) • [Getting Started](#-getting-started--installation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Executive Summary & Purpose](#-executive-summary--purpose)
- [Statutory Regulatory & Compliance Framework](#-statutory-regulatory--compliance-framework)
- [Key Features & Capabilities](#-key-features--capabilities)
  - [1. Public Institutional Exchange & Verification](#1-public-institutional-exchange--verification)
  - [2. Buyer Suite (Hospitals & Pharmacies)](#2-buyer-suite-hospitals--clinical-chains)
  - [3. Supplier Suite (Manufacturers & Distributors)](#3-supplier-suite-manufacturers--cf-agents)
  - [4. Cold Chain IoT Surveillance & Tamper Detection](#4-cold-chain-iot-telemetry--quarantine-engine)
  - [5. Tax Invoicing, E-Way Bill & Escrow Clearance](#5-tax-invoicing-e-way-bills--escrow-settlement)
  - [6. Real-time Communication & Audit Trails](#6-real-time-communication--audit-logging)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Database Schema & Data Models](#-database-schema--data-models)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Installation](#-getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables Guide](#environment-variables-guide)
- [Running Tests](#-running-tests)
- [Deployment](#-deployment)
- [Security & Compliance Standards](#-security--compliance-standards)

---

## 🔬 Executive Summary & Purpose

**PharmaConnect** is a mission-critical B2B institutional pharmaceutical marketplace designed to eradicate opaque, multi-tier middleman networks in medicine procurement across India. By leveraging direct digital procurement between certified pharmaceutical manufacturing plants and NABH-accredited hospital networks, institutional buying groups, and wholesale pharmacies, the platform establishes 100% statutory compliance, digital batch traceability, cold-chain integrity, and automated financial escrow settlement.

### Problems Solved:
1. **Supply Chain Disruption & Counterfeit Risks:** Replaces unverified brokers with CDSCO-verified manufacturers holding valid Form 20B/21B wholesale licenses and WHO-GMP / Schedule M cleanroom certifications.
2. **Cold Chain Excursions:** Guarantees end-to-end active IoT thermal monitoring (2°C–8°C) with automated excursion quarantine.
3. **Regulatory Non-Compliance:** Digitally enforces statutory drug licensing, GST Form INV-01 tax invoicing, NIC E-Way bill generation, and 21 CFR Part 11 immutable audit trails.
4. **Institutional Working Capital Bottlenecks:** Facilitates secure milestone-based escrow payments powered by Razorpay with automatic clearance upon digital Certificate of Analysis (CoA) sign-off.

---

## 🏛️ Statutory Regulatory & Compliance Framework

The application implements rigorous guardrails aligned with central and state health regulations:

| Regulatory Body / Standard | Implementation in PharmaConnect |
| :--- | :--- |
| **CDSCO** (Central Drugs Standard Control Organisation) | Node-level license verification, Schedule H/H1/X compliance validation, and recall broadcast propagation. |
| **State FDA** (Directorate of Food & Drug Administration) | Form 20, Form 21, Form 20B, and Form 21B drug license validation and automated expiration alerts. |
| **Schedule M cGMP & WHO-GMP** | Real-time cleanroom batch record validation, ISO cleanroom class logging, and batch CoA digital signatures. |
| **21 CFR Part 11** | Cryptographically signed, tamper-evident audit logging with immutable action timestamps and user actor IDs. |
| **Section 31 CGST Act, 2017** | Automated B2B Form INV-01 compliant tax invoice generation with split CGST/SGST/IGST computations and amount in words. |
| **NIC E-Way Bill System** | Integrated carrier consignment tracking, vehicle numbering, tamper seal verification, and transport passes. |
| **GS1-128 & 2D Barcoding** | Batch-specific GS1 serialized barcode generation and scanning for formulation-to-ward traceability. |

---

## 🚀 Key Features & Capabilities

### 1. Public Institutional Exchange & Verification
- **Live Institutional Exchange Mosaic:** Real-time CDSCO clearing status, daily trade turnover metrics, and active thermal fleet tracking.
- **Interactive Barcode Scanner:** Instant client-side & server-side lookup of GS1-128 batch identifiers.
- **Therapeutic Category Browsing:** Filter by Oncology, Critical Care & ICU, Vaccines & Biologics, Cardiovascular, Antimicrobials, and Nephrology.
- **Role Switcher & Quick Personas:** Instantly test user workflows as *Apollo Medics Central Store (Buyer)* or *Sun Pharma Laboratories (Supplier)*.

### 2. Buyer Suite (Hospitals & Clinical Chains)
- **Hospital Procurement Desk (`MedicineCatalog.jsx`):**
  - Search by generic salt molecule name, commercial brand, CAS number, or manufacturer.
  - Multi-tier volume wholesale pricing (Tier 1, Tier 2, Tier 3) with dynamic discount calculation.
  - Real-time stock reservation and Minimum Order Quantity (MOQ) validation.
  - Interactive modal for instant inspection of laboratory **Certificate of Analysis (CoA)** with chief chemist signatures.
- **Purchase Order Basket & Checkout (`PoReviewModal.jsx`):**
  - Automated GST calculation (CGST + SGST), institutional shipping destination selection, and digital PO generation.
- **Central Pharmacy Store Management (`BuyerDashboard.jsx`):**
  - Live stock replenishment monitoring, batch consumption rates, and fast-moving SKU identification.
  - **Patient Bedside Dispense Slip Generator:** Issues official hospital dispense slips mapped directly to patient ID, attending doctor name, medical registration number, batch number, and expiration date.

### 3. Supplier Suite (Manufacturers & C&F Agents)
- **Enterprise Command Center (`SupplierDashboard.jsx`):**
  - Real-time KPI metrics: Total Wholesale GMV, Active B2B Orders, Cleanroom Capacity Utilization, Cold Chain SLA Compliance.
  - Quick SKU addition slide-over drawer with regulatory schedules (Schedule H, Schedule H1, Schedule X, OTC) and storage conditions.
- **Order Fulfillment Pipeline:**
  - 8-stage lifecycle tracker: `Requested` ➔ `Accepted` ➔ `Processing` ➔ `Dispatched` ➔ `Delivered` ➔ `Payment Due` ➔ `Paid` ➔ `Completed`.
  - Dispatch authorization drawer requiring E-Way bill number, carrier name, vehicle number, tamper seal confirmation, and live thermal probe reading.
- **Batch & Cleanroom Monitoring:**
  - Real-time monitoring of Class 100/10,000 cleanroom HVAC parameters, particle counts, and relative humidity.

### 4. Cold Chain IoT Telemetry & Quarantine Engine
- Continuous thermal logging for temperature-sensitive biologics and vaccines (2°C–8°C).
- Automatic detection of temperature excursions outside statutory thresholds.
- Instant quarantine protocols (Form 483 quarantine flagging) preventing excursion-damaged stock from being dispensed.

### 5. Tax Invoicing, E-Way Bills & Escrow Settlement
- **B2B Tax Invoicing (`InvoiceAuditTrail.jsx`):**
  - Section 31 CGST Act compliant Form INV-01 tax invoices with dynamic QR codes, digital signature tokens, and HSN/SAC breakdowns.
  - Print-ready and downloadable PDF formats.
- **Razorpay Escrow Integration:**
  - Automated escrow generation for verified purchase orders.
  - Secure webhook listener verifying HMAC SHA-256 signatures (`razorpay_signature`).
  - Milestone-based fund release upon Certificate of Analysis verification and tamper seal inspection.

### 6. Real-time Communication & Audit Logging
- **Order-Specific Secure Chat (`OrderChat.jsx`):**
  - Direct buyer-to-supplier dispute resolution and shipment update channel powered by WebSockets (Socket.IO).
  - Upload compliance documents, shipping manifests, and lab reports directly within the conversation.
- **21 CFR Part 11 Audit Trail:**
  - Comprehensive immutable event logging covering every order status transition, inventory movement, dispense event, and KYC approval.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────────────────────┐
                                  │      Client Browser (React 19)        │
                                  │   Tailwind CSS v4 • Lucide • Motion   │
                                  └──────────────────┬─────────────────────┘
                                                     │
                                      HTTP / REST    │    WebSocket (WS)
                                                     ▼
                                  ┌────────────────────────────────────────┐
                                  │       Node.js / Express Backend        │
                                  │   Rate Limiting • Helmet • JWT Auth    │
                                  └──────┬───────────┬───────────┬─────────┘
                                         │           │           │
                     ┌───────────────────┘           │           └────────────────────┐
                     ▼                               ▼                                ▼
        ┌─────────────────────────┐     ┌─────────────────────────┐      ┌─────────────────────────┐
        │  PostgreSQL / Supabase  │     │   Razorpay Gateway API  │      │  Cloudinary / Storage   │
        │  16 Relational Tables   │     │   Escrow & Webhooks     │      │  Document & CoA Vault   │
        │  Row Level Security     │     └─────────────────────────┘      └─────────────────────────┘
        └─────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) (Pure JavaScript / JSX)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom pharmaceutical design system tokens
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts & Visualizations:** [Recharts](https://recharts.org/)
- **Animations:** [Motion](https://motion.dev/)
- **Real-Time Client:** [Socket.IO Client](https://socket.io/)

### Backend
- **Runtime & Framework:** [Node.js](https://nodejs.org/) (ES Modules) + [Express 4](https://expressjs.com/)
- **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) via [`@supabase/supabase-js`](https://supabase.com/) with Local JSON Fallback Driver
- **Validation:** [Zod](https://zod.dev/)
- **Authentication & Security:** JWT (JSON Web Tokens), `bcryptjs`, `helmet`, `cors`, `express-rate-limit`
- **Real-Time Engine:** [Socket.IO](https://socket.io/)
- **Payment Processing:** [Razorpay Node SDK](https://razorpay.com/docs/)
- **File & Media Storage:** [Cloudinary SDK](https://cloudinary.com/) / Local Disk Storage
- **Automated Alerts & Mailer:** [Nodemailer](https://nodemailer.com/)

---

## 🗄️ Database Schema & Data Models

The PostgreSQL schema is structured across 16 interconnected, normalized tables with foreign keys, constraints, and optimized indexes:

```
├── users                   # Institutional user profiles (supplier, buyer, admin)
├── businesses              # Registered pharmaceutical entity details, GSTIN, Drug License
├── verification_documents  # Form 20/21, Form 20B/21B, WHO-GMP, ISO certificates
├── medicines               # Master drug catalog, HSN codes, storage specifications
├── medicine_batches        # Lot numbers, manufacturing/expiry dates, cleanroom sign-offs
├── purchase_orders         # PO headers, lifecycle state machine, transit & logistics metadata
├── order_items             # PO line items, unit price, quantity, CGST/SGST amounts
├── payments                # Razorpay transactions, escrow status, webhook audit logs
├── invoices                # Form INV-01 tax invoices, digital tokens, fiscal timestamps
├── inventory_movements     # Real-time stock ledger (stock-in, reservations, dispenses)
├── notifications           # Real-time institutional push alerts & regulatory notices
├── conversations           # PO-bound communication threads between buyer and supplier
├── messages                # Direct messages, attachments, read receipts
├── patient_bills           # Hospital bedside dispense slip headers
├── patient_bill_items      # Dispensed batch line items with patient tracking
└── audit_logs              # 21 CFR Part 11 immutable audit trail entries
```

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new buyer/supplier organization with license credentials.
- `POST /api/auth/login` — Authenticate and receive JWT access token.
- `GET /api/auth/me` — Retrieve authenticated user profile and business verification status.

### Medicines & Batches (`/api/medicines`)
- `GET /api/medicines` — Search catalog with filters for category, schedule, cold-chain, and price.
- `GET /api/medicines/:id` — Retrieve detailed SKU profile, batch breakdown, and CoA specs.
- `POST /api/medicines` — Add new medicine listing (Supplier only).
- `PUT /api/medicines/:id` — Update medicine details or pricing tiers.
- `POST /api/medicines/:id/batches` — Add fresh manufacturing batch with QA chemist sign-off.

### Purchase Orders (`/api/orders`)
- `GET /api/orders` — List purchase orders for the active organization.
- `GET /api/orders/:id` — Get full order details, items, invoice, and tracking timeline.
- `POST /api/orders` — Create a new Purchase Order from cart.
- `PATCH /api/orders/:id/status` — Advance order state (`accepted`, `dispatched`, `delivered`, etc.).
- `POST /api/orders/:id/dispatch` — Authorize dispatch with E-Way bill, carrier, and thermal readings.

### Invoicing & Payments (`/api/invoices` & `/api/payments`)
- `GET /api/invoices/:orderId` — Fetch Form INV-01 tax invoice for an order.
- `POST /api/payments/create-order` — Initialize Razorpay escrow order.
- `POST /api/payments/verify` — Verify Razorpay signature and transition order to `paid`.
- `POST /api/payments/webhook` — Razorpay asynchronous webhook listener.

### Hospital Dispensing (`/api/patient-bills`)
- `GET /api/patient-bills` — List hospital patient bedside dispense slips.
- `POST /api/patient-bills` — Create patient dispense slip and automatically deduct batch inventory.

### Compliance & Analytics (`/api/reports` & `/api/upload`)
- `GET /api/reports/analytics` — Fetch GMV trends, therapeutic distribution, and cold chain continuity.
- `GET /api/reports/audit-logs` — Fetch 21 CFR Part 11 immutable audit records.
- `POST /api/upload` — Upload verification licenses, CoA PDFs, or dispatch manifests.

---

## 📁 Project Directory Structure

```
pharmaconnect/
├── backend/                              # Express.js REST API & WebSocket Server
│   ├── src/
│   │   ├── config/                       # DB, Supabase, Cloudinary, Razorpay configs
│   │   ├── controllers/                  # Route handlers and business logic
│   │   ├── database/
│   │   │   ├── schema.sql                # PostgreSQL 16-table relational schema
│   │   │   ├── seed.sql                  # Comprehensive demo seed data
│   │   │   └── local_db.json             # High-fidelity offline JSON database fallback
│   │   ├── jobs/                         # Automated cron jobs (Expiry surveillance)
│   │   ├── middleware/                   # JWT auth, role guard, rate limiter, error handler
│   │   ├── routes/                       # Express router definitions
│   │   ├── services/                     # Core services (Orders, Invoices, Payments, Email)
│   │   ├── sockets/                      # Real-time WebSocket connection manager
│   │   ├── utils/                        # Tax calculators, compliance validator, logger
│   │   └── validators/                   # Zod request validation schemas
│   ├── tests/                            # Automated integration and unit tests
│   ├── .env.example                      # Backend environment variable template
│   ├── package.json                      # Backend dependencies and run scripts
│   └── server.js                         # Application entrypoint & HTTP/WS server
│
├── src/                                  # React 19 Frontend Application
│   ├── components/
│   │   ├── buyer/                        # Specialized Hospital & Buyer components
│   │   ├── supplier/                     # Specialized Manufacturer & Supplier components
│   │   ├── common/                       # Shared UI widgets (badges, loaders, alerts)
│   │   ├── AnalyticsReports.jsx          # Institutional analytics & revenue charts
│   │   ├── AuthModal.jsx                 # Gateway login/register with 1-click personas
│   │   ├── BuyerDashboard.jsx            # Central store inventory & Bedside dispense generator
│   │   ├── CoaModal.jsx                  # Certificate of Analysis monograph viewer
│   │   ├── ExpiryAlerts.jsx              # FEFO surveillance & Form 483 quarantine manager
│   │   ├── Header.jsx                    # Top regulatory status ribbon & user switcher
│   │   ├── InvoiceAuditTrail.jsx         # Form INV-01 Tax Invoice & 8-step lifecycle tracker
│   │   ├── LandingPage.jsx               # Public institutional exchange & catalog explorer
│   │   ├── MedicineCatalog.jsx           # Wholesale procurement desk & pricing tiers
│   │   ├── OrderChat.jsx                 # Direct dispute resolution & file exchange
│   │   ├── PoReviewModal.jsx             # Purchase Order cart review & checkout
│   │   ├── RegulatoryKYC.jsx             # Statutory license verification & vault
│   │   ├── Sidebar.jsx                   # Navigation drawer with clinical indicators
│   │   └── SupplierDashboard.jsx         # Manufacturer command center & cleanroom logs
│   ├── data/
│   │   └── mockData.js                   # High-fidelity pharmaceutical dataset & personas
│   ├── services/                         # Frontend API & WebSocket abstraction layer
│   ├── App.jsx                           # Primary state machine, routing & global context
│   ├── index.css                         # Tailwind CSS v4 design system
│   └── main.jsx                          # React 19 DOM bootstrap
│
├── .env.example                          # Frontend environment variable template
├── package.json                          # Frontend dependencies & scripts
├── vite.config.js                        # Vite 8.3 configuration
└── README.md                             # Comprehensive project documentation
```

---

## 🛠️ Getting Started & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher ([Download](https://nodejs.org/))
- **NPM**: `v9.0.0` or higher
- **PostgreSQL / Supabase Account** *(Optional — fallback local database runs automatically)*

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Edit `.env` with your Supabase, Razorpay, or Cloudinary credentials if available. If left as default, the backend operates in fully functional offline fallback mode).*

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will boot on `http://localhost:5000` with WebSocket support enabled.*

---

### Frontend Setup

1. Open a new terminal in the project root:
   ```bash
   cd ..
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the Vite frontend development server:
   ```bash
   npm run dev
   ```
   *The client application will start on `http://localhost:3000`.*

---

### Environment Variables Guide

#### Backend (`backend/.env`):
```ini
# Server
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=supersecret_jwt_key_pharmaconnect_b2b_dev_2025_min32chars
JWT_EXPIRES_IN=7d

# Supabase (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Razorpay (Optional - for live payments)
RAZORPAY_KEY_ID=rzp_test_placeholder_key_id
RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret
RAZORPAY_WEBHOOK_SECRET=rzp_whsec_placeholder

# Cloudinary (Optional - for file storage)
CLOUDINARY_CLOUD_NAME=placeholder_cloud_name
CLOUDINARY_API_KEY=placeholder_api_key
CLOUDINARY_API_SECRET=placeholder_api_secret

# SMTP Email (Optional - for email notifications)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=placeholder_smtp_user
SMTP_PASSWORD=placeholder_smtp_password
EMAIL_FROM="PharmaConnect Regulatory Alerts <alerts@pharmaconnect.in>"
```

#### Frontend (`.env`):
```ini
# Gemini API Key (For AI Studio integration)
GEMINI_API_KEY=your_gemini_api_key

# App URL
APP_URL=http://localhost:3000
```

---

## 🧪 Running Tests

To run the backend test suite:
```bash
cd backend
npm test
```

To run TypeScript type check / linting:
```bash
npm run lint
```

---

## 🚢 Deployment

### Frontend (Netlify / Vercel / Cloudflare Pages)
1. Build the production client bundle:
   ```bash
   npm run build
   ```
2. The optimized static distribution files will be generated in `/dist`.
3. Set the build output directory to `dist` and build command to `npm run build`.

### Backend (Render / Railway / AWS / Docker)
1. Ensure `NODE_ENV=production` is set in your hosting platform.
2. Supply valid `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CLIENT_ORIGIN`.
3. Start command: `npm start` (which runs `node --dns-result-order=ipv4first server.js`).

---

## 🛡️ Security & Compliance Standards

- **Zero TypeScript Runtime Overhead:** Pure ECMAScript and React 19 architecture.
- **Role-Based Access Control (RBAC):** Strict isolation between Buyer, Supplier, and Regulatory Admin operations.
- **Rate Limiting & HTTP Headers:** Protected against brute-force and injection attacks using `express-rate-limit` and `helmet`.
- **21 CFR Part 11 Audit Trail:** Every database state change generates an immutable cryptographic ledger entry.
- **Tamper-Proof Escrow:** Razorpay webhook verification utilizing HMAC SHA-256 signatures to prevent payment tampering.

---

<div align="center">

**PharmaConnect — Powering India's Certified B2B Pharmaceutical Exchange.**  
*Built for Healthcare Networks, Approved by Regulatory Standards.*

</div>
