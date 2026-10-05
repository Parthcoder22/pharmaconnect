import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('PharmaConnect B2B Core API Integration Tests', () => {
  let supplierToken = '';
  let buyerToken = '';
  let createdMedicineId = '';
  let testOrderId = '';

  before(async () => {
    // 1. Fetch demo token for supplier (Dr. Aris Thorne)
    const suppRes = await request(app).get('/api/auth/demo-token/supplier');
    assert.equal(suppRes.status, 200);
    assert.equal(suppRes.body.success, true);
    supplierToken = suppRes.body.data.token;
    assert.ok(supplierToken);

    // 2. Fetch demo token for buyer (Dr. V. Sharma)
    const buyRes = await request(app).get('/api/auth/demo-token/buyer');
    assert.equal(buyRes.status, 200);
    assert.equal(buyRes.body.success, true);
    buyerToken = buyRes.body.data.token;
    assert.ok(buyerToken);
  });

  test('1. Health Check Endpoint responds with CDSCO node', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'healthy');
    assert.equal(res.body.data.cdscoNode, 'IND-MH-40194');
  });

  test('2. Authentication: User registration with Form 20B / GSTIN', async () => {
    const testEmail = `new-supplier-${Date.now()}@pharmatest.in`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123#',
        fullName: 'Dr. Anand Kulkarni',
        role: 'supplier',
        organization: 'Kulkarni Bio-Pharma Labs',
        licenseNumber: 'MH-PUN-20B-998811',
        licenseType: 'Form 20B/21B',
        gstin: '27AAACK1234M1ZR'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testEmail);
    assert.equal(res.body.data.user.role, 'supplier');
    // Security check: Must be pending CDSCO approval, not self-verified!
    assert.equal(res.body.data.user.verification_status, 'pending');
    assert.ok(res.body.data.token);
  });

  test('3. Authentication: Login with valid demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'a.thorne@novartis-pharma.in',
        password: 'password123',
        role: 'supplier'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'supplier');
  });

  test('3b. Authentication: Login rejects account role mismatch', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'a.thorne@novartis-pharma.in',
        password: 'password123',
        role: 'buyer'
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Role Mismatch/i);
  });

  test('4. Role Protection: Buyer cannot add medicines via Supplier endpoint', async () => {
    const res = await request(app)
      .post('/api/supplier/medicines')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Unauthorized Drug Entry',
        brand: 'Unauthorized Drug',
        genericName: 'Fake Generic',
        category: 'Cardiovascular',
        dosageForm: 'Tablets',
        baseWholesalePrice: 100,
        mrp: 150,
        moq: 50,
        unitPack: 'Box of 10s',
        manufacturer: 'Apex Hospital'
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test('5. Supplier: Create new WHO-GMP Medicine and Batch listing', async () => {
    const res = await request(app)
      .post('/api/supplier/medicines')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        name: 'Ceftriaxone Sodium 1g IV',
        brand: 'Monocef 1g',
        genericName: 'Ceftriaxone Sodium USP Sterile Powder',
        category: 'Antimicrobial & Antibiotics',
        dosageForm: 'Injectables',
        baseWholesalePrice: 48.50,
        mrp: 65.00,
        moq: 100,
        unitPack: 'Single Vial with Sterile WFI',
        gstRate: 12,
        manufacturer: 'Novartis Lifesciences Bio-Pharma Ltd.',
        mfgLicense: 'MH-PUN-20B-184920',
        regulatorySchedule: 'Schedule H1',
        storageCondition: 'Controlled Ambient 15°C–25°C',
        isColdChain: false,
        isWhoGmp: true,
        batchNumber: 'CTX-2025-998',
        manufacturingDate: '2025-01-10',
        expiryDate: '2027-12-31',
        initialStock: 10000
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.medicine.id);
    assert.equal(res.body.data.medicine.total_stock_available, 10000);
    createdMedicineId = res.body.data.medicine.id;
  });

  test('6. Marketplace: Search and filter medicines', async () => {
    const res = await request(app)
      .get('/api/medicines')
      .query({ search: 'Ceftriaxone' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.items.length >= 1);
    assert.equal(res.body.data.items[0].id, createdMedicineId);
  });

  test('7. Purchase Orders: Buyer creates purchase order with server recalculated GST', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        destinationHub: 'St. Jude Medical Center — Wing B Central Store',
        deliveryAddress: 'Central Pharmacy Stores, Worli, Mumbai',
        items: [
          {
            medicineId: createdMedicineId,
            quantity: 200,
            unitPrice: 1.00 // Intentionally spoofed frontend price; server must ignore and use 48.50
          }
        ]
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    const po = res.body.data;
    assert.equal(po.status, 'requested');
    testOrderId = po.id;

    // Verify server-side recalculation: 200 units * 48.50 = 9,700 taxable
    // CGST 6% = 582, SGST 6% = 582, Net = 10,864
    assert.equal(po.taxableTotal, 9700);
    assert.equal(po.cgstTotal, 582);
    assert.equal(po.sgstTotal, 582);
    assert.equal(po.netPayable, 10864);
  });

  test('8. Supplier: Accept purchase order and reserve stock', async () => {
    const res = await request(app)
      .post(`/api/supplier/orders/${testOrderId}/accept`)
      .set('Authorization', `Bearer ${supplierToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'processing');
  });

  test('9. Lifecycle Guard: Prevent duplicate order acceptance', async () => {
    const res = await request(app)
      .post(`/api/supplier/orders/${testOrderId}/accept`)
      .set('Authorization', `Bearer ${supplierToken}`);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('processing'));
  });

  test('10. Supplier: Dispatch order and generate B2B tax invoice', async () => {
    const res = await request(app)
      .patch(`/api/supplier/orders/${testOrderId}/dispatch`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        eWayBillNo: 'EW-9821-4190-MAH',
        carrierName: 'TCI ColdChain Express',
        vehicleNo: 'MH-04-AZ-4180',
        coldChainTemp: '+4.2°C (Continuous Nominal)'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'dispatched');
    assert.ok(res.body.data.invoiceNumber);
  });

  test('11. Delivery Confirmation: Record delivery at hospital hub', async () => {
    const res = await request(app)
      .post(`/api/orders/${testOrderId}/confirm-delivery`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        tamperSealsIntact: true,
        receivedNotes: 'Inspected by Chief Pharmacist. Passed cold chain verification.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'delivered');
  });

  test('12. Payments: Initialize Razorpay order for delivered consignment', async () => {
    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ orderId: testOrderId });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.razorpayOrderId);
    assert.equal(res.body.data.amount, 10864);
  });

  test('13. Payments: Verify payment signature and mark order paid', async () => {
    const res = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        orderId: testOrderId,
        razorpayOrderId: 'order_sim_test_123',
        razorpayPaymentId: 'pay_test_sim_99881',
        razorpaySignature: 'simulated_sig_ok'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'paid');
    assert.ok(res.body.data.paidAt);
  });

  test('14. Tax Invoices: Retrieve B2B invoice matching paid order', async () => {
    const res = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${buyerToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
  });

  test('15. Patient Dispensing: Generate hospital patient bill', async () => {
    const res = await request(app)
      .post('/api/patient-bills')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        patientName: 'Kavita Sundaram',
        patientId: 'UHID-98124',
        doctorName: 'Dr. V. Sharma, MD',
        doctorRegNo: 'MCI-19948',
        items: [
          {
            medicineName: 'Augmentin 625 Duo',
            batchNumber: '#AUG-9942-A',
            expDate: '10/2026',
            quantity: 3,
            mrp: 260.00
          }
        ]
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.totalAmount, 780.00);
  });

  test('16. Surveillance: Scan batch expiries and generate automated alerts', async () => {
    const res = await request(app)
      .post('/api/surveillance/scan-expiry')
      .set('Authorization', `Bearer ${supplierToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  test('17. Chat: Send and retrieve order-scoped messages', async () => {
    const sendRes = await request(app)
      .post(`/api/chat/${testOrderId}/messages`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        message: 'Batch inspection passed with zero non-conformance. Thank you.'
      });

    assert.equal(sendRes.status, 201);
    assert.equal(sendRes.body.success, true);

    const getRes = await request(app)
      .get(`/api/chat/${testOrderId}/messages`)
      .set('Authorization', `Bearer ${supplierToken}`);

    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.success, true);
    assert.ok(getRes.body.data.length >= 1);
  });

  test('18. Statutory Certification Gate: Unverified buyer cannot place orders until verified', async () => {
    // 1. Register a new buyer (status is 'pending')
    const unverifiedEmail = `unverified-buyer-${Date.now()}@hospital.in`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: unverifiedEmail,
        password: 'Password123#',
        fullName: 'Dr. Rahul Mehta',
        role: 'buyer',
        organization: 'Mehta Memorial Hospital',
        licenseNumber: 'MH-MUM-20-449911',
        licenseType: 'Form 20/21',
        gstin: '27AABCM9988P1ZZ'
      });

    assert.equal(regRes.status, 201);
    const unverifiedToken = regRes.body.data.token;

    // 2. Attempt to create an order - must be rejected with 403
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({
        destinationHub: 'Mehta Hospital Central Depot',
        items: [{ medicineId: 'med-01', quantity: 100 }]
      });

    assert.equal(orderRes.status, 403);
    assert.match(orderRes.body.message, /Unverified buyers cannot procure/i);

    // 3. Attempt to verify self BEFORE uploading all required PDFs - must fail with 400
    const prematureVerifyRes = await request(app)
      .post('/api/auth/verify-self')
      .set('Authorization', `Bearer ${unverifiedToken}`);

    assert.equal(prematureVerifyRes.status, 400);
    assert.match(prematureVerifyRes.body.message, /All 4 required PDF documents must be uploaded/i);

    // 4. Buyer uploads all 4 required statutory PDF documents
    const dummyPdfBase64 = Buffer.from('%PDF-1.4 statutory test content').toString('base64');
    const buyerDocsToUpload = [
      { type: 'State FDA Drug License (Form 20 / 21)', name: 'Form_20_21_License.pdf' },
      { type: 'GSTIN Registration Certificate', name: 'GSTIN_Registration.pdf' },
      { type: 'Registered Qualified Pharmacist Council Certificate', name: 'Pharmacist_Council.pdf' },
      { type: 'Hospital NABH Accreditation / Clinical Establishment Act Certificate', name: 'NABH_Accreditation.pdf' }
    ];

    for (const doc of buyerDocsToUpload) {
      const upRes = await request(app)
        .post('/api/uploads/document')
        .set('Authorization', `Bearer ${unverifiedToken}`)
        .send({
          documentType: doc.type,
          fileName: doc.name,
          fileData: `data:application/pdf;base64,${dummyPdfBase64}`
        });
      assert.equal(upRes.status, 201);
    }

    // 5. Now that all 4 PDFs are uploaded, buyer verifies themselves via Security & Verification
    const verifyRes = await request(app)
      .post('/api/auth/verify-self')
      .set('Authorization', `Bearer ${unverifiedToken}`);

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.data.user.verification_status, 'verified');

    // 6. Now verified buyer can place order!
    const verifiedOrderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({
        destinationHub: 'Mehta Hospital Central Depot',
        items: [{ medicineId: 'med-01', quantity: 100 }]
      });

    assert.equal(verifiedOrderRes.status, 201);
    assert.equal(verifiedOrderRes.body.success, true);
  });

  test('19. Statutory Certification Gate: Unverified supplier cannot list medicines until verified with all PDFs', async () => {
    // 1. Register a new supplier (status is 'pending')
    const unverifiedEmail = `unverified-supplier-${Date.now()}@pharmamfg.in`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: unverifiedEmail,
        password: 'Password123#',
        fullName: 'Mr. Deepak Verma',
        role: 'supplier',
        organization: 'Verma Bio-Formulations Ltd.',
        licenseNumber: 'MH-PUN-20B-771122',
        licenseType: 'Form 20B/21B',
        gstin: '27AAACV7711Q1ZX'
      });

    assert.equal(regRes.status, 201);
    const unverifiedToken = regRes.body.data.token;

    // 2. Attempt to create a medicine - must be rejected with 403
    const medRes = await request(app)
      .post('/api/supplier/medicines')
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({
        name: 'Amoxicillin Trihydrate 500mg',
        brand: 'AmoxiVer 500',
        genericName: 'Amoxicillin IP 500mg',
        category: 'Antimicrobial & Antibiotics',
        dosageForm: 'Capsules',
        baseWholesalePrice: 85,
        mrp: 120,
        moq: 50,
        unitPack: 'Box of 100s'
      });

    assert.equal(medRes.status, 403);
    assert.match(medRes.body.message, /Unverified suppliers cannot list or sell/i);

    // 3. Attempt to verify self BEFORE uploading all required PDFs - must fail with 400
    const prematureVerifyRes = await request(app)
      .post('/api/auth/verify-self')
      .set('Authorization', `Bearer ${unverifiedToken}`);

    assert.equal(prematureVerifyRes.status, 400);
    assert.match(prematureVerifyRes.body.message, /All 5 required PDF documents must be uploaded/i);

    // 4. Supplier uploads all 5 required statutory PDF documents
    const dummyPdfBase64 = Buffer.from('%PDF-1.4 statutory test content').toString('base64');
    const supplierDocsToUpload = [
      { type: 'Wholesale Drug License (Form 20B & 21B)', name: 'Form_20B_21B_License.pdf' },
      { type: 'GST Registration Certificate (REG-06)', name: 'GST_Certificate_REG06.pdf' },
      { type: 'Certificate of Incorporation / Partnership Deed', name: 'MCA_Incorporation.pdf' },
      { type: 'WHO-GMP Manufacturing Compliance Certificate', name: 'WHO_GMP_Compliance.pdf' },
      { type: 'FSSAI Wholesale Nutraceutical Permit', name: 'FSSAI_Permit.pdf' }
    ];

    for (const doc of supplierDocsToUpload) {
      const upRes = await request(app)
        .post('/api/uploads/document')
        .set('Authorization', `Bearer ${unverifiedToken}`)
        .send({
          documentType: doc.type,
          fileName: doc.name,
          fileData: `data:application/pdf;base64,${dummyPdfBase64}`
        });
      assert.equal(upRes.status, 201);
    }

    // 5. Supplier verifies themselves via Security & Verification
    const verifyRes = await request(app)
      .post('/api/auth/verify-self')
      .set('Authorization', `Bearer ${unverifiedToken}`);

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.data.user.verification_status, 'verified');

    // 6. Now supplier can create and sell medicines!
    const verifiedMedRes = await request(app)
      .post('/api/supplier/medicines')
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({
        name: 'Amoxicillin Trihydrate 500mg',
        brand: 'AmoxiVer 500',
        genericName: 'Amoxicillin IP 500mg',
        category: 'Antimicrobial & Antibiotics',
        dosageForm: 'Capsules',
        baseWholesalePrice: 85,
        mrp: 120,
        moq: 50,
        unitPack: 'Box of 100s'
      });

    assert.equal(verifiedMedRes.status, 201);
    assert.equal(verifiedMedRes.body.success, true);
  });
});
