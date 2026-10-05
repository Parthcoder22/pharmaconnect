import React, { useState, useRef, useEffect } from 'react';
import { verificationService } from '../../services/verificationService';
import { authService } from '../../services/authService';

const BACKEND_BASE = 'http://localhost:5000';

export const BusinessVerification = ({
  currentUser,
  onShowToast,
  onVerificationUpdated
}) => {
  const fileInputRefs = useRef({});
  const [isVerifyingSelf, setIsVerifyingSelf] = useState(false);
  const [statutoryAgreed, setStatutoryAgreed] = useState(false);

  const [businessProfile, setBusinessProfile] = useState(() => ({
    legalName: currentUser?.organization || 'Registered Pharmaceutical Supplier',
    businessType: 'Pharmaceutical Manufacturer & C&F Distributor',
    registeredAddress: currentUser?.businessAddress || 'Plot 42-B, Industrial Area, Kurkumbh, Maharashtra',
    state: 'Maharashtra',
    gstin: currentUser?.gstin || 'Pending Registration',
    drugLicenseNo: currentUser?.licenseNumber || 'Form 20B/21B Pending',
    contactEmail: currentUser?.email || '',
    contactPhone: currentUser?.phone || '+91 98201 44810'
  }));

  useEffect(() => {
    if (currentUser) {
      setBusinessProfile({
        legalName: currentUser.organization || 'Registered Pharmaceutical Supplier',
        businessType: 'Pharmaceutical Manufacturer & C&F Distributor',
        registeredAddress: currentUser.businessAddress || 'Plot 42-B, Industrial Area, Kurkumbh, Maharashtra',
        state: 'Maharashtra',
        gstin: currentUser.gstin || 'Pending Registration',
        drugLicenseNo: currentUser.licenseNumber || 'Form 20B/21B Pending',
        contactEmail: currentUser.email || '',
        contactPhone: currentUser.phone || '+91 98201 44810'
      });
    }
  }, [currentUser]);

  const defaultTemplates = [
    {
      id: 'doc-01',
      type: 'Wholesale Drug License (Form 20B & 21B)',
      title: 'Wholesale Drug License (Form 20B & 21B)',
      description: 'Mandatory statutory wholesale license issued by State Licensing Authority.'
    },
    {
      id: 'doc-02',
      type: 'GST Registration Certificate (REG-06)',
      title: 'GST Registration Certificate (REG-06)',
      description: 'Principal place of business GST registration certificate.'
    },
    {
      id: 'doc-03',
      type: 'Certificate of Incorporation / Partnership Deed',
      title: 'Certificate of Incorporation / Partnership Deed',
      description: 'Corporate registration certificate issued by Ministry of Corporate Affairs.'
    },
    {
      id: 'doc-04',
      type: 'WHO-GMP Manufacturing Compliance Certificate',
      title: 'WHO-GMP Manufacturing Compliance Certificate',
      description: 'Quality assurance certificate for pharmaceutical formulations manufacturing.'
    },
    {
      id: 'doc-05',
      type: 'FSSAI Wholesale Nutraceutical Permit',
      title: 'FSSAI Wholesale Nutraceutical Permit',
      description: 'Required if supplying dietary supplements or medical nutrition items.'
    }
  ];

  const [documents, setDocuments] = useState(() => {
    return defaultTemplates.map(tmpl => ({
      id: tmpl.id,
      title: tmpl.title,
      description: tmpl.description,
      fileName: null,
      uploadDate: null,
      expiryDate: null,
      status: 'not_submitted',
      reviewerNotes: null,
      fileUrl: null
    }));
  });

  const totalDocsCount = documents.length;
  const uploadedDocsCount = documents.filter((d) => Boolean(d.fileName) && (d.status === 'verified' || d.status === 'under_review')).length;
  const allDocsUploaded = totalDocsCount > 0 && uploadedDocsCount === totalDocsCount;
  const isVerified = Boolean((currentUser?.verificationStatus === 'verified' || currentUser?.verification_status === 'verified') && allDocsUploaded);

  // Fetch real uploaded documents from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadDocuments() {
      try {
        const serverDocs = await verificationService.getMyDocuments();
        if (!isMounted || !Array.isArray(serverDocs) || serverDocs.length === 0) return;

        setDocuments(prev => prev.map(slot => {
          const match = serverDocs.find(
            d => d.document_type === slot.title || d.document_type === slot.id
          );
          if (match) {
            return {
              ...slot,
              fileName: match.file_name,
              status: match.verification_status || 'under_review',
              uploadDate: match.submitted_at ? new Date(match.submitted_at).toLocaleDateString('en-GB') : 'Recently Submitted',
              reviewerNotes: match.reviewer_notes || 'Official PDF stored in CDSCO audit repository.',
              fileUrl: match.document_url ? (match.document_url.startsWith('http') ? match.document_url : `${BACKEND_BASE}${match.document_url}`) : null
            };
          }
          return slot;
        }));
      } catch (err) {
        console.warn('Failed to load verification documents:', err);
      }
    }
    loadDocuments();
    return () => { isMounted = false; };
  }, [currentUser]);

  const [uploadingDocId, setUploadingDocId] = useState(null);

  const handleTriggerUpload = (docId) => {
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId].click();
    }
  };

  const handleRealPdfUpload = async (docId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate PDF file format
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      onShowToast?.('Please upload a valid PDF document (e.g. .pdf file)', 'warning');
      event.target.value = '';
      return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      onShowToast?.('PDF size exceeds 20MB limit. Please select a smaller file.', 'warning');
      event.target.value = '';
      return;
    }

    setUploadingDocId(docId);
    const targetDoc = documents.find((d) => d.id === docId);
    const docTitle = targetDoc?.title || 'Wholesale Drug License (Form 20B & 21B)';

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    try {
      // Real upload to backend via base64/service
      const result = await verificationService.uploadDocument(docTitle, file);
      const fileUrl = result?.document_url 
        ? (result.document_url.startsWith('http') ? result.document_url : `${BACKEND_BASE}${result.document_url}`)
        : URL.createObjectURL(file);

      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id === docId) {
            return {
              ...d,
              fileName: file.name,
              fileSize: formattedSize,
              fileUrl: fileUrl,
              uploadDate: new Date().toLocaleDateString('en-GB'),
              status: 'under_review',
              reviewerNotes: 'Official PDF document submitted. Under CDSCO regulatory audit review.'
            };
          }
          return d;
        })
      );

      onShowToast?.(`PDF "${file.name}" (${formattedSize}) submitted for regulatory verification.`, 'verified');
    } catch (e) {
      console.error('Document upload failed:', e);
      onShowToast?.(`Upload failed: ${e.message}`, 'warning');
    } finally {
      setUploadingDocId(null);
      event.target.value = '';
    }
  };

  const handleVerifySelf = async () => {
    if (!allDocsUploaded) {
      const missingDocs = documents.filter(d => !d.fileName || (d.status !== 'verified' && d.status !== 'under_review'));
      onShowToast?.(
        `All ${totalDocsCount} statutory PDF documents must be uploaded before certification. Missing (${missingDocs.length}): ${missingDocs.map(d => d.title).join(', ')}`,
        'warning'
      );
      return;
    }
    if (!statutoryAgreed) {
      onShowToast?.('Please check the statutory declaration checkbox to confirm WHO-GMP compliance', 'warning');
      return;
    }
    setIsVerifyingSelf(true);
    try {
      const updatedUser = await authService.verifySelf();
      onVerificationUpdated?.(updatedUser);
      onShowToast?.('Statutory Manufacturer Verification complete! You can now list and sell formulations.', 'verified');
    } catch (e) {
      console.error('Supplier verification error:', e);
      onShowToast?.(e.message || 'Verification failed. Please ensure all 5 required statutory PDF documents are uploaded.', 'warning');
    } finally {
      setIsVerifyingSelf(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e6f8f3] text-[#006f61] border border-[#a6ebd8]">
            Verified
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff8e6] text-[#b37400] border border-[#f5dc99]">
            Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fde8e8] text-[#c81e1e] border border-[#f8b4b4]">
            Rejected
          </span>
        );
      case 'not_submitted':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]">
            Not Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">
            Regulatory &amp; Business Verification
          </h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Submit required statutory PDF documents to verify your pharmaceutical trade licenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-white rounded-xl border border-[#eaedff] text-xs shadow-2xs">
            <span className="text-[#5e6b7f]">Compliance Status: </span>
            <span className={`font-bold ${isVerified ? 'text-[#006f61]' : allDocsUploaded ? 'text-[#0047c1]' : 'text-[#b37400]'}`}>
              {isVerified ? 'Certified Manufacturer' : allDocsUploaded ? 'All PDFs Ready' : `${uploadedDocsCount} of ${totalDocsCount} PDFs Uploaded`}
            </span>
          </div>
        </div>
      </div>

      {/* Verification Status Alert & Interactive Certification Card */}
      {!isVerified ? (
        <div className="p-5 bg-gradient-to-r from-[#fffbf0] to-[#fff8e6] border-2 border-[#f5dc99] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#b37400] flex items-center justify-center shrink-0 border border-[#f5dc99] shadow-2xs">
              <span className="material-symbols-outlined text-xl">gavel</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b37400] bg-white px-2 py-0.5 rounded border border-[#f5dc99]">
                  CDSCO Form 20B/21B Mandate
                </span>
                <span className="text-xs font-bold text-[#b37400]">All PDFs Required to Sell</span>
              </div>
              <h3 className="text-sm font-bold text-[#131b2e]">
                Certify Your Manufacturing &amp; Wholesale Operations
              </h3>
              <p className="text-xs text-[#5e6b7f] leading-relaxed">
                Under wholesale pharmaceutical regulations, sellers cannot list formulations, publish catalog items, or accept purchase orders until verified. All {totalDocsCount} statutory PDF documents must be uploaded to become a Certified Seller.
              </p>
            </div>
          </div>

          {/* Progress Callout */}
          {!allDocsUploaded ? (
            <div className="p-3.5 bg-white rounded-xl border border-[#f5dc99] flex items-start gap-2.5 text-xs text-[#b37400]">
              <span className="material-symbols-outlined text-lg shrink-0 text-[#b37400]">warning</span>
              <div>
                <span className="font-bold block text-[#131b2e]">
                  Mandatory Document Uploads: {uploadedDocsCount} of {totalDocsCount} Complete
                </span>
                <p className="text-[11px] text-[#5e6b7f] mt-0.5">
                  Please upload the remaining <strong>{totalDocsCount - uploadedDocsCount} statutory PDF document(s)</strong> in the section below. The certification button will unlock automatically once all PDFs are attached.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-[#e6f8f3] rounded-xl border border-[#a2ecd8] flex items-center gap-2.5 text-xs text-[#006f61]">
              <span className="material-symbols-outlined text-lg shrink-0">check_circle</span>
              <span className="font-bold">
                All {totalDocsCount} Statutory PDF documents uploaded! Confirm the declaration below to complete verification and unlock selling.
              </span>
            </div>
          )}

          <div className="p-3.5 bg-white rounded-xl border border-[#f5dc99] flex items-center gap-3">
            <input
              type="checkbox"
              id="statutorySupplierCheck"
              checked={statutoryAgreed}
              onChange={(e) => setStatutoryAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-[#0047c1] focus:ring-[#0047c1] cursor-pointer shrink-0"
            />
            <label htmlFor="statutorySupplierCheck" className="text-xs text-[#131b2e] cursor-pointer select-none font-medium">
              I declare under <strong>WHO-GMP standards and Schedule M</strong> of the Drugs &amp; Cosmetics Rules that our manufacturing and wholesale licenses are valid and all formulations are authentic.
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-[#5e6b7f]">
              {allDocsUploaded 
                ? `✓ All ${totalDocsCount} regulatory license(s) submitted` 
                : `⚠️ ${totalDocsCount - uploadedDocsCount} of ${totalDocsCount} statutory PDFs still required`}
            </span>
            <button
              type="button"
              disabled={!allDocsUploaded || isVerifyingSelf || !statutoryAgreed}
              onClick={handleVerifySelf}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                allDocsUploaded && statutoryAgreed
                  ? 'bg-[#006f61] hover:bg-[#005247] text-white cursor-pointer'
                  : 'bg-neutral-200 text-neutral-500 cursor-not-allowed border border-neutral-300'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isVerifyingSelf ? 'hourglass_top' : allDocsUploaded ? 'verified' : 'lock'}
              </span>
              <span>
                {isVerifyingSelf
                  ? 'Certifying Account...'
                  : allDocsUploaded
                  ? 'Verify & Certify Manufacturer Account'
                  : `Upload All ${totalDocsCount} PDFs to Enable Certification (${uploadedDocsCount}/${totalDocsCount})`}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#e6f8f3] border border-[#a2ecd8] rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#006f61] flex items-center justify-center shrink-0 border border-[#a2ecd8]">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#006f61] bg-white px-2 py-0.5 rounded border border-[#a2ecd8]">
                Certified WHO-GMP Supplier
              </span>
              <p className="text-xs font-bold text-[#131b2e] mt-0.5">
                Full Wholesale Listing &amp; Commercial Dispatch Privileges Active
              </p>
              <span className="text-[11px] text-[#006f61]">
                Licensed under Form 20B/21B #{businessProfile.drugLicenseNo}
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-white text-[#006f61] rounded-full text-xs font-bold border border-[#a2ecd8]">
            <span className="material-symbols-outlined text-sm">lock_open</span>
            Selling Enabled
          </span>
        </div>
      )}

      {/* A. Business Profile Information */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <div>
            <h2 className="text-sm font-bold text-[#131b2e]">Registered Business Entity</h2>
            <p className="text-[11px] text-[#5e6b7f]">Enterprise trading profile recorded on PharmaConnect</p>
          </div>
          {isVerified ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f8f3] text-[#006f61] border border-[#a6ebd8]">
              Platform Verified
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#fff8e6] text-[#b37400] border border-[#f5dc99]">
              Verification Pending
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#eaedff]">
            <span className="text-[#5e6b7f] text-[11px] block">Legal Entity Name</span>
            <span className="font-bold text-[#131b2e] block mt-1">{businessProfile.legalName}</span>
          </div>

          <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#eaedff]">
            <span className="text-[#5e6b7f] text-[11px] block">Business Constitution</span>
            <span className="font-semibold text-[#131b2e] block mt-1">{businessProfile.businessType}</span>
          </div>

          <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#eaedff]">
            <span className="text-[#5e6b7f] text-[11px] block">GST Identification (GSTIN)</span>
            <span className="font-mono font-bold text-[#0047c1] block mt-1">{businessProfile.gstin}</span>
          </div>

          <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#eaedff]">
            <span className="text-[#5e6b7f] text-[11px] block">Wholesale Drug License No.</span>
            <span className="font-mono font-bold text-[#131b2e] block mt-1">{businessProfile.drugLicenseNo}</span>
          </div>

          <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#eaedff] sm:col-span-2">
            <span className="text-[#5e6b7f] text-[11px] block">Registered Facility Address</span>
            <span className="font-medium text-[#131b2e] block mt-1">{businessProfile.registeredAddress}</span>
          </div>
        </div>
      </div>

      {/* B. Document Verification Records with Real PDF Upload */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-[#eaedff]">
          <h2 className="text-sm font-bold text-[#131b2e]">Required Statutory Documents (Official PDF Upload)</h2>
          <p className="text-[11px] text-[#5e6b7f]">
            Upload signed PDF copies of required statutory licenses for CDSCO and State Licensing Authority audit.
          </p>
        </div>

        <div className="divide-y divide-[#eaedff]">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-sm text-[#131b2e]">{doc.title}</h3>
                  {getStatusBadge(doc.status)}
                </div>
                <p className="text-[#5e6b7f] text-[11px]">{doc.description}</p>
                {doc.fileName ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#434655]">
                    <span className="inline-flex items-center gap-1 font-mono text-[#0047c1] font-semibold bg-[#eff4ff] px-2 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[13px]">picture_as_pdf</span>
                      {doc.fileName}
                    </span>
                    {doc.fileSize && <span>({doc.fileSize})</span>}
                    {doc.uploadDate && <span>• Uploaded: {doc.uploadDate}</span>}
                    {doc.expiryDate && <span>• Valid till: {doc.expiryDate}</span>}
                  </div>
                ) : (
                  <div className="pt-1 text-[11px] text-[#b37400] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span>No PDF document submitted yet. Mandatory for compliance clearance.</span>
                  </div>
                )}
                {doc.reviewerNotes && (
                  <p className="text-[11px] text-[#5e6b7f] italic bg-[#faf8ff] px-2.5 py-1 rounded-md inline-block mt-1">
                    Reviewer Note: {doc.reviewerNotes}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {/* Real File Input */}
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[doc.id] = el)}
                  accept="application/pdf,.pdf"
                  onChange={(e) => handleRealPdfUpload(doc.id, e)}
                  className="hidden"
                />

                {/* View PDF Button if URL exists */}
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white hover:bg-[#f2f3ff] text-[#0047c1] border border-[#eaedff] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="View uploaded PDF document in new tab"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                    <span>View PDF</span>
                  </a>
                )}

                {/* Upload / Replace PDF Button */}
                <button
                  type="button"
                  disabled={uploadingDocId === doc.id}
                  onClick={() => handleTriggerUpload(doc.id)}
                  className="px-3.5 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">
                    {uploadingDocId === doc.id ? 'hourglass_top' : 'upload_file'}
                  </span>
                  <span>
                    {uploadingDocId === doc.id
                      ? 'Uploading PDF...'
                      : doc.fileName && doc.status !== 'not_submitted'
                      ? 'Replace PDF'
                      : 'Upload PDF'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
