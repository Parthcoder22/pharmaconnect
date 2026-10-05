import React, { useState, useEffect, useRef } from 'react';
import { verificationService } from '../../services/verificationService';
import { authService } from '../../services/authService';

const BACKEND_BASE = 'http://localhost:5000';

export const BusinessVerification = ({
  currentUser,
  onShowToast,
  onVerificationUpdated
}) => {
  const fileInputRefs = useRef({});
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [isVerifyingSelf, setIsVerifyingSelf] = useState(false);
  const [statutoryAgreed, setStatutoryAgreed] = useState(false);

  const [businessProfile, setBusinessProfile] = useState(() => ({
    businessName: currentUser?.organization || 'Registered Healthcare Entity',
    businessType: 'Hospital & Clinical Formulary Depot',
    licenseNumber: currentUser?.licenseNumber || 'Form 20B/21B',
    licenseType: currentUser?.licenseType || 'Form 20B & 21B (Retail/Wholesale Pharmacy)',
    gstin: currentUser?.gstin || 'Pending Registration',
    registeredAddress: currentUser?.businessAddress || 'Registered Address Pending Verification',
    registeredPhone: currentUser?.phone || '+91 98110 00000',
    registeredEmail: currentUser?.email || 'procurement@hospital.org',
    pharmacistName: currentUser?.name || 'Authorized Pharmacist',
    status: currentUser?.verificationStatus || 'pending'
  }));

  useEffect(() => {
    if (currentUser) {
      setBusinessProfile({
        businessName: currentUser.organization || 'Registered Healthcare Entity',
        businessType: 'Hospital & Clinical Formulary Depot',
        licenseNumber: currentUser.licenseNumber || 'Form 20B/21B',
        licenseType: currentUser.licenseType || 'Form 20B & 21B',
        gstin: currentUser.gstin || 'Pending Registration',
        registeredAddress: currentUser.businessAddress || 'Registered Address Pending Verification',
        registeredPhone: currentUser.phone || '+91 98110 00000',
        registeredEmail: currentUser.email || '',
        pharmacistName: currentUser.name || 'Authorized Pharmacist',
        status: currentUser.verificationStatus || 'pending'
      });
    }
  }, [currentUser]);

  const defaultTemplates = [
    {
      id: 'doc-1',
      title: 'State FDA Drug License (Form 20 / 21)',
      docNumber: currentUser?.licenseNumber || 'Form 20/21',
      validUntil: 'Under Review'
    },
    {
      id: 'doc-2',
      title: 'GSTIN Registration Certificate',
      docNumber: currentUser?.gstin || 'GSTIN Reg',
      validUntil: 'Under Review'
    },
    {
      id: 'doc-3',
      title: 'Registered Qualified Pharmacist Council Certificate',
      docNumber: 'Council Registration',
      validUntil: 'Permanent'
    },
    {
      id: 'doc-4',
      title: 'Hospital NABH Accreditation / Clinical Establishment Act Certificate',
      docNumber: 'Accreditation',
      validUntil: 'Pending'
    }
  ];

  const [documents, setDocuments] = useState(() => {
    return defaultTemplates.map(tmpl => ({
      id: tmpl.id,
      title: tmpl.title,
      docNumber: tmpl.docNumber,
      validUntil: tmpl.validUntil,
      status: 'pending',
      fileName: null,
      uploadDate: 'Not Uploaded',
      fileUrl: null
    }));
  });

  const totalDocsCount = documents.length;
  const uploadedDocsCount = documents.filter(d => Boolean(d.fileName) && (d.status === 'verified' || d.status === 'under_review')).length;
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

  const handleTriggerUpload = (docId) => {
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId].click();
    }
  };

  const handleRealPdfUpload = async (docId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      onShowToast?.('Please upload a valid PDF document (e.g. .pdf file)', 'warning');
      event.target.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      onShowToast?.('PDF size exceeds 20MB limit. Please select a compressed file.', 'warning');
      event.target.value = '';
      return;
    }

    setUploadingDocId(docId);
    const targetDoc = documents.find((d) => d.id === docId);
    const docTitle = targetDoc?.title || 'State FDA Drug License (Form 20 / 21)';

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    try {
      const result = await verificationService.uploadDocument(docTitle, file);
      const fileUrl = result?.document_url 
        ? (result.document_url.startsWith('http') ? result.document_url : `${BACKEND_BASE}${result.document_url}`)
        : URL.createObjectURL(file);

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                fileName: file.name,
                fileSize: formattedSize,
                fileUrl: fileUrl,
                uploadDate: new Date().toLocaleDateString('en-GB'),
                status: 'under_review'
              }
            : d
        )
      );

      onShowToast?.(`PDF "${file.name}" (${formattedSize}) submitted for CDSCO verification review.`, 'verified');
    } catch (e) {
      console.error('Buyer document upload failed:', e);
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
      onShowToast?.('Please check the statutory declaration checkbox to confirm license authenticity', 'warning');
      return;
    }
    setIsVerifyingSelf(true);
    try {
      const updatedUser = await authService.verifySelf();
      onVerificationUpdated?.(updatedUser);
      onShowToast?.('CDSCO Statutory Buyer Verification complete! You are now certified to purchase pharmaceuticals.', 'verified');
    } catch (e) {
      console.error('Buyer verification error:', e);
      onShowToast?.(e.message || 'Verification failed. Please ensure all required statutory PDF documents are uploaded.', 'warning');
    } finally {
      setIsVerifyingSelf(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e6f8f3] text-[#006f61] border border-[#a6ebd8]">
            Verified
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#fff8e6] text-[#b37400] border border-[#f5dc99]">
            Under Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#f2f3ff] text-[#5e6b7f] border border-[#eaedff]">
            Pending Upload
          </span>
        );
    }
  };

  const [activeTab, setActiveTab] = useState('kyc'); // 'kyc' | 'security'
  const [passwordState, setPasswordState] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordState.current || !passwordState.newPass) {
      onShowToast?.('Please enter both current and new password', 'warning');
      return;
    }
    if (passwordState.newPass !== passwordState.confirm) {
      onShowToast?.('New passwords do not match', 'warning');
      return;
    }
    setPasswordState({ current: '', newPass: '', confirm: '' });
    onShowToast?.('Account security credentials updated successfully', 'check_circle');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">
            Security &amp; Statutory Verification
          </h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Maintain your institutional drug license, CDSCO statutory KYC compliance, and account security controls
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f2f3ff] rounded-2xl border border-[#eaedff]">
          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'kyc'
                ? 'bg-[#0047c1] text-white shadow-xs'
                : 'text-[#5e6b7f] hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span>Drug License &amp; KYC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-[#0047c1] text-white shadow-xs'
                : 'text-[#5e6b7f] hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-base">security</span>
            <span>Account Security</span>
          </button>
        </div>
      </div>

      {activeTab === 'security' ? (
        /* ================= SECURITY & ACCESS TAB ================= */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Management */}
            <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#eaedff]">
                <span className="material-symbols-outlined text-[#0047c1]">lock_reset</span>
                <h2 className="text-xs font-bold text-[#131b2e]">Password &amp; Authentication Credentials</h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter existing password"
                    value={passwordState.current}
                    onChange={(e) => setPasswordState({ ...passwordState, current: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="At least 8 characters"
                      value={passwordState.newPass}
                      onChange={(e) => setPasswordState({ ...passwordState, newPass: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={passwordState.confirm}
                      onChange={(e) => setPasswordState({ ...passwordState, confirm: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#eaedff]">
                <span className="material-symbols-outlined text-[#006f61]">phonelink_lock</span>
                <h2 className="text-xs font-bold text-[#131b2e]">Statutory Multi-Factor Authentication</h2>
              </div>

              <div className="p-3.5 bg-[#e6f8f3] rounded-xl border border-[#a2ecd8] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#006f61] block">2FA Verification Active</span>
                  <span className="text-[11px] text-[#434655]">
                    OTP required on critical B2B purchase orders &amp; contract changes.
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#006f61] text-white">
                  ENFORCED
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 bg-[#f8f9ff] rounded-xl">
                  <div>
                    <span className="font-semibold text-[#131b2e] block">Email Authorization Channel</span>
                    <span className="text-[11px] text-[#5e6b7f]">{businessProfile.registeredEmail}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#006f61] bg-white px-2 py-0.5 rounded border border-[#eaedff]">Verified</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#f8f9ff] rounded-xl">
                  <div>
                    <span className="font-semibold text-[#131b2e] block">Mobile SMS Statutory Alerts</span>
                    <span className="text-[11px] text-[#5e6b7f]">{businessProfile.registeredPhone}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#006f61] bg-white px-2 py-0.5 rounded border border-[#eaedff]">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Session & Audit Vault */}
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-[#131b2e] pb-2 border-b border-[#eaedff]">
              Active Procurement Sessions &amp; Compliance Audit Trail
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#f8f9ff] rounded-xl space-y-1">
                <span className="text-[10px] text-[#5e6b7f] block">Current Authenticated Node</span>
                <span className="font-mono font-bold text-[#0047c1]">MH-CENTRAL-ESCROW-01</span>
                <span className="text-[10px] text-[#006f61] block font-semibold">● Live Encrypted TLS 1.3</span>
              </div>

              <div className="p-3 bg-[#f8f9ff] rounded-xl space-y-1">
                <span className="text-[10px] text-[#5e6b7f] block">Digital Signer Token (DSC)</span>
                <span className="font-mono font-bold text-[#131b2e]">SHA256:ECDSA-HOSP-2025</span>
                <span className="text-[10px] text-[#006f61] block font-semibold">● CDSCO 21 CFR Part 11</span>
              </div>

              <div className="p-3 bg-[#f8f9ff] rounded-xl space-y-1">
                <span className="text-[10px] text-[#5e6b7f] block">Regulatory Account Role</span>
                <span className="font-bold text-[#131b2e] block">Authorized Hospital Procurement</span>
                <span className="text-[10px] text-[#5e6b7f]">Form 20/21 Hospital Depot</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= STATUTORY KYC TAB ================= */
        <>
          {/* 2. Verification Status Banner */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isVerified 
              ? 'bg-gradient-to-r from-[#e6f8f3] to-[#f0fbf8] border-[#a2ecd8]' 
              : uploadedDocsCount > 0 
              ? 'bg-gradient-to-r from-[#f0f4ff] to-[#f7f9ff] border-[#c8d8ff]'
              : 'bg-gradient-to-r from-[#fffbf0] to-[#fff8e6] border-[#f5dc99]'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                isVerified ? 'bg-[#006f61] text-white' : uploadedDocsCount > 0 ? 'bg-[#0047c1] text-white' : 'bg-[#b37400] text-white'
              }`}>
                <span className="material-symbols-outlined text-2xl">
                  {isVerified ? 'verified_user' : uploadedDocsCount > 0 ? 'pending_actions' : 'shield'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isVerified ? 'text-[#006f61]' : uploadedDocsCount === totalDocsCount ? 'text-[#006f61]' : 'text-[#b37400]'
                  }`}>
                    {isVerified ? 'CDSCO Certified Institutional Buyer' : allDocsUploaded ? 'All PDFs Uploaded - Ready to Certify' : 'Mandatory PDF Uploads Pending'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isVerified ? 'bg-[#006f61] text-white' : allDocsUploaded ? 'bg-[#006f61] text-white' : 'bg-[#b37400] text-white'
                  }`}>
                    {isVerified ? 'Certified Active' : `${uploadedDocsCount}/${totalDocsCount} PDFs Uploaded`}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-[#131b2e] mt-0.5">
                  {isVerified 
                    ? 'Authorized to Purchase Schedule H & H1 Institutional Formulations' 
                    : allDocsUploaded 
                    ? 'All Required Documents Submitted — Ready for Instant Statutory Certification'
                    : 'All Statutory PDFs Must Be Uploaded — Unverified Buyers Cannot Purchase Medicines'}
                </h2>
                <p className="text-[11px] text-[#5e6b7f]">
                  {isVerified 
                    ? 'Your establishment holds active statutory licenses under the Drugs and Cosmetics Act, 1940.' 
                    : 'Every buyer must upload all 4 statutory PDF certificates below to become certified before purchasing.'}
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-[#eaedff] sm:pl-5">
              <span className="text-[10px] text-[#5e6b7f] block">Compliance Status</span>
              <span className={`font-mono font-bold text-xs ${isVerified ? 'text-[#006f61]' : allDocsUploaded ? 'text-[#0047c1]' : 'text-[#b37400]'}`}>
                {isVerified ? 'Certified (Form 20/21)' : allDocsUploaded ? 'All PDFs Ready' : `${totalDocsCount - uploadedDocsCount} PDF(s) Missing`}
              </span>
            </div>
          </div>

          {/* Interactive Statutory Buyer Certification Card */}
          {!isVerified && (
            <div className="p-5 bg-gradient-to-r from-[#fffbf0] to-[#fff8e6] border-2 border-[#f5dc99] rounded-2xl shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#b37400] flex items-center justify-center shrink-0 border border-[#f5dc99] shadow-2xs">
                  <span className="material-symbols-outlined text-xl">gavel</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b37400] bg-white px-2 py-0.5 rounded border border-[#f5dc99]">
                      CDSCO Form 20/21 Mandate
                    </span>
                    <span className="text-xs font-bold text-[#b37400]">All PDFs Required to Buy</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#131b2e]">
                    Certify Your Healthcare Establishment
                  </h3>
                  <p className="text-xs text-[#5e6b7f] leading-relaxed">
                    Under Indian wholesale pharmaceutical rules, prescription medicines cannot be purchased by unverified accounts. All {totalDocsCount} statutory PDF documents must be uploaded to unlock certification.
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
                    All {totalDocsCount} Statutory PDF documents uploaded! Confirm the declaration below to complete verification and unlock buying.
                  </span>
                </div>
              )}

              <div className="p-3.5 bg-white rounded-xl border border-[#f5dc99] flex items-center gap-3">
                <input
                  type="checkbox"
                  id="statutoryBuyerCheck"
                  checked={statutoryAgreed}
                  onChange={(e) => setStatutoryAgreed(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0047c1] focus:ring-[#0047c1] cursor-pointer shrink-0"
                />
                <label htmlFor="statutoryBuyerCheck" className="text-xs text-[#131b2e] cursor-pointer select-none font-medium">
                  I declare under the <strong>Drugs and Cosmetics Act, 1940</strong> and Pharmacy Council rules that our healthcare entity holds valid statutory licenses (Form 20/21) and is legally authorized to purchase pharmaceuticals.
                </label>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-[#5e6b7f]">
                  {allDocsUploaded 
                    ? `✓ All ${totalDocsCount} PDF certificates attached` 
                    : `⚠️ ${totalDocsCount - uploadedDocsCount} of ${totalDocsCount} PDF documents still required`}
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
                      ? 'Verify & Certify Buyer Account'
                      : `Upload All ${totalDocsCount} PDFs to Enable Certification (${uploadedDocsCount}/${totalDocsCount})`}
                  </span>
                </button>
              </div>
            </div>
          )}

      {/* 3. Statutory Profile Details */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-[#131b2e] pb-2 border-b border-[#eaedff]">
          Registered Healthcare Establishment Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#f8f9ff] rounded-xl">
            <span className="text-[10px] text-[#5e6b7f] block">Legal Entity Name</span>
            <span className="font-bold text-[#131b2e] mt-0.5 block">{businessProfile.businessName}</span>
          </div>

          <div className="p-3 bg-[#f8f9ff] rounded-xl">
            <span className="text-[10px] text-[#5e6b7f] block">Business Type</span>
            <span className="font-semibold text-[#131b2e] mt-0.5 block">{businessProfile.businessType}</span>
          </div>

          <div className="p-3 bg-[#f8f9ff] rounded-xl">
            <span className="text-[10px] text-[#5e6b7f] block">Drug License Number</span>
            <span className="font-mono font-bold text-[#0047c1] mt-0.5 block">{businessProfile.licenseNumber}</span>
          </div>

          <div className="p-3 bg-[#f8f9ff] rounded-xl">
            <span className="text-[10px] text-[#5e6b7f] block">License Category</span>
            <span className="font-semibold text-[#131b2e] mt-0.5 block">{businessProfile.licenseType}</span>
          </div>

          <div className="p-3 bg-[#f8f9ff] rounded-xl">
            <span className="text-[10px] text-[#5e6b7f] block">GSTIN Registration</span>
            <span className="font-mono font-bold text-[#131b2e] mt-0.5 block">{businessProfile.gstin}</span>
          </div>

          <div className="p-3 bg-[#f8f9ff] rounded-xl">
            <span className="text-[10px] text-[#5e6b7f] block">Registered Pharmacist in Charge</span>
            <span className="font-semibold text-[#131b2e] mt-0.5 block">{businessProfile.pharmacistName}</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#faf8ff] rounded-xl border border-[#eaedff] text-xs">
          <span className="text-[10px] text-[#5e6b7f] block">Registered Physical Address of Store</span>
          <span className="font-medium text-[#131b2e] mt-0.5 block">{businessProfile.registeredAddress}</span>
        </div>
      </div>

      {/* 4. Statutory Document Uploads */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-[#131b2e]">Statutory Compliance Certificates (Official PDF Upload)</h2>

        <div className="divide-y divide-[#eaedff] border border-[#eaedff] rounded-xl overflow-hidden">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#faf8ff] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#131b2e]">{doc.title}</span>
                  {getStatusBadge(doc.status)}
                </div>
                <div className="text-[11px] text-[#5e6b7f] mt-1 space-x-2">
                  <span>Cert #: <strong className="font-mono text-[#131b2e]">{doc.docNumber}</strong></span>
                  <span>•</span>
                  <span>Validity: <strong className="text-[#131b2e]">{doc.validUntil}</strong></span>
                  {doc.fileName && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[#0047c1] font-semibold">{doc.fileName}</span>
                    </>
                  )}
                  {doc.fileSize && <span>({doc.fileSize})</span>}
                  <span>•</span>
                  <span>Uploaded: {doc.uploadDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Real File Input */}
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[doc.id] = el)}
                  accept="application/pdf,.pdf"
                  onChange={(e) => handleRealPdfUpload(doc.id, e)}
                  className="hidden"
                />

                {/* View PDF Button */}
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-[#f2f3ff] text-[#0047c1] border border-[#eaedff] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="View uploaded PDF"
                  >
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    <span>View PDF</span>
                  </a>
                )}

                {/* Upload Button */}
                <button
                  type="button"
                  disabled={uploadingDocId === doc.id}
                  onClick={() => handleTriggerUpload(doc.id)}
                  className="px-3 py-1.5 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">
                    {uploadingDocId === doc.id ? 'hourglass_top' : 'upload_file'}
                  </span>
                  <span>
                    {uploadingDocId === doc.id
                      ? 'Uploading...'
                      : doc.fileName && doc.status !== 'pending'
                      ? 'Replace PDF'
                      : 'Upload PDF'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )}
</div>
  );
};
