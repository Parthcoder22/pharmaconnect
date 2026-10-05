import { db } from '../config/db.js';

export const REQUIRED_BUYER_DOCS = [
  { id: 'doc-1', title: 'State FDA Drug License (Form 20 / 21)', keywords: ['form 20', 'drug license', 'drug_license', 'fda', 'doc-1'] },
  { id: 'doc-2', title: 'GSTIN Registration Certificate', keywords: ['gst', 'gstin', 'doc-2'] },
  { id: 'doc-3', title: 'Registered Qualified Pharmacist Council Certificate', keywords: ['pharmacist', 'council', 'doc-3'] },
  { id: 'doc-4', title: 'Hospital NABH Accreditation / Clinical Establishment Act Certificate', keywords: ['nabh', 'clinical establishment', 'accreditation', 'doc-4'] }
];

export const REQUIRED_SUPPLIER_DOCS = [
  { id: 'doc-01', title: 'Wholesale Drug License (Form 20B & 21B)', keywords: ['form 20b', 'drug license', 'drug_license', 'doc-01', 'wholesale'] },
  { id: 'doc-02', title: 'GST Registration Certificate (REG-06)', keywords: ['gst', 'reg-06', 'doc-02'] },
  { id: 'doc-03', title: 'Certificate of Incorporation / Partnership Deed', keywords: ['incorporation', 'partnership', 'mca', 'doc-03'] },
  { id: 'doc-04', title: 'WHO-GMP Manufacturing Compliance Certificate', keywords: ['who-gmp', 'who_gmp', 'manufacturing', 'gmp', 'doc-04'] },
  { id: 'doc-05', title: 'FSSAI Wholesale Nutraceutical Permit', keywords: ['fssai', 'nutraceutical', 'doc-05'] }
];

export function checkUserVerification(userId, role) {
  const user = db.findOne('users', (u) => u.id === userId);
  if (!user) {
    return { isVerified: false, allPdfsUploaded: false, missingDocs: [], uploadedCount: 0, totalCount: 0, user: null };
  }

  const effectiveRole = role || user.role;
  const isSupplier = effectiveRole === 'supplier';
  const requiredList = isSupplier ? REQUIRED_SUPPLIER_DOCS : REQUIRED_BUYER_DOCS;
  const userDocs = db.find('verification_documents', (d) => d.user_id === userId);

  const missingDocs = [];
  let uploadedCount = 0;

  for (const reqDoc of requiredList) {
    const found = userDocs.some((d) => {
      const docType = (d.document_type || '').toLowerCase();
      const matchesKeyword = reqDoc.keywords.some((k) => docType.includes(k.toLowerCase())) || docType === reqDoc.title.toLowerCase();
      const hasFile = Boolean(d.file_name && d.document_url);
      return matchesKeyword && hasFile;
    });

    if (found) {
      uploadedCount++;
    } else {
      missingDocs.push(reqDoc.title);
    }
  }

  // Strictly require ALL PDFs uploaded AND verification_status === 'verified'
  const allPdfsUploaded = missingDocs.length === 0;
  const isVerified = allPdfsUploaded && (user.verification_status === 'verified');

  // If user does not have all PDFs uploaded, ensure database status is not verified
  if (!allPdfsUploaded && user.verification_status === 'verified') {
    db.update('users', (u) => u.id === userId, { verification_status: 'pending' });
    db.update('businesses', (b) => b.user_id === userId, { verification_status: 'pending' });
    user.verification_status = 'pending';
  }

  return {
    isVerified,
    allPdfsUploaded,
    missingDocs,
    uploadedCount,
    totalCount: requiredList.length,
    user
  };
}
