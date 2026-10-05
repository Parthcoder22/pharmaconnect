import React, { useState } from 'react';

export const RegulatoryKYC = ({ currentUser, onShowToast }) => {
  const [gstinInput, setGstinInput] = useState(currentUser.gstin);
  const [dlInput, setDlInput] = useState(currentUser.licenseNumber);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyGstin = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onShowToast(`GSTIN ${gstinInput} verified via GSTN API. Legal entity: ${currentUser.organization}`, 'verified');
    }, 900);
  };

  return (
    <div className="flex flex-col w-full bg-[#faf8ff] pb-16">
      <div className="p-4 sm:p-8 max-w-[1540px] mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#006b5d] uppercase bg-[#80f3dd]/40 px-2.5 py-0.5 rounded font-mono">
                CENTRAL DRUGS STANDARD CONTROL ORGANISATION (CDSCO)
              </span>
              <span className="font-mono text-xs text-[#0047c1] font-bold">STATE FDA REPOSITORY NODE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
              Statutory Credentials &amp; Audit Vault
            </h1>
            <p className="text-xs sm:text-sm text-[#434655] mt-0.5">
              Form 20/21 &amp; Form 20B/21B verification dossiers, registered pharmacist credentials, and GSTIN clearance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006b5d] animate-pulse"></span>
              <span>Audit Status: 100% Certified</span>
            </span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Drug License */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] text-[#0047c1] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">badge</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#131b2e]">Drug Selling &amp; Wholesale License</h3>
                  <span className="font-mono text-xs text-[#434655]">
                    {currentUser.role === 'supplier' ? 'Form 20B & 21B (Wholesale)' : 'Form 20 & 21 (Retail/Hospital)'}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-mono text-[10px] font-bold">
                VALID THROUGH 2028
              </span>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#434655] mb-1">
                  License Number / Registration String
                </label>
                <input
                  value={dlInput}
                  onChange={(e) => setDlInput(e.target.value)}
                  className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl font-mono text-xs text-[#131b2e] focus:ring-2 focus:ring-[#0047c1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">Licensing Authority</span>
                  <span className="font-bold text-[#131b2e]">Food &amp; Drug Administration MH</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">Registered Person</span>
                  <span className="font-bold text-[#131b2e]">Pharmacist Reg #RPH-88912</span>
                </div>
              </div>

              <div className="p-3 bg-[#f2f3ff] rounded-xl flex items-center justify-between border border-[#eaedff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0047c1] text-lg">description</span>
                  <span className="font-mono text-xs font-semibold text-[#131b2e]">Form20B_Signed_Certificate.pdf</span>
                </div>
                <button
                  onClick={() => onShowToast('Viewing signed Form 20B license dossier...', 'verified')}
                  className="text-xs font-bold text-[#0047c1] hover:underline"
                >
                  Inspect PDF
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: GSTIN Verification */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#80f3dd]/40 text-[#006f61] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">account_balance</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#131b2e]">GSTIN Institutional Registry</h3>
                  <span className="font-mono text-xs text-[#434655]">GST Network Statutory Clearance</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-mono text-[10px] font-bold">
                ACTIVE TAXPAYER
              </span>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#434655] mb-1">
                  Goods and Services Tax Identification Number (GSTIN)
                </label>
                <div className="flex gap-2">
                  <input
                    value={gstinInput}
                    onChange={(e) => setGstinInput(e.target.value)}
                    className="flex-1 h-9 px-3 bg-[#f2f3ff] rounded-xl font-mono text-xs text-[#131b2e] focus:ring-2 focus:ring-[#0047c1]"
                  />
                  <button
                    onClick={handleVerifyGstin}
                    disabled={isVerifying}
                    className="px-4 bg-[#0047c1] text-white rounded-xl text-xs font-bold hover:bg-[#155eef] transition-colors"
                  >
                    {isVerifying ? 'Checking...' : 'Re-verify'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">Legal Business Name</span>
                  <span className="font-bold text-[#131b2e] truncate block">{currentUser.organization}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">Taxpayer Type</span>
                  <span className="font-bold text-[#131b2e]">Regular (B2B Pharmaceutical)</span>
                </div>
              </div>

              <div className="p-3 bg-[#f2f3ff] rounded-xl flex items-center justify-between border border-[#eaedff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006b5d] text-lg">verified</span>
                  <span className="font-mono text-xs font-semibold text-[#131b2e]">GSTIN_Clearance_Record.json</span>
                </div>
                <span className="font-mono text-[10px] text-[#006b5d] font-bold">Live API Synced</span>
              </div>
            </div>
          </div>
        </div>

        {/* WHO GMP & Schedule M Quality Dossier */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eaedff] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
            <div>
              <h2 className="text-base font-bold text-[#131b2e]">WHO-GMP &amp; Schedule M Compliance Certifications</h2>
              <p className="text-xs text-[#434655]">Quality control, cleanroom airborne particle monitoring, and microbial assay logs</p>
            </div>
            <button
              onClick={() => onShowToast('Uploading new quality inspection certificate...', 'cloud_upload')}
              className="px-4 py-2 bg-[#0047c1] text-white rounded-xl text-xs font-bold hover:bg-[#155eef] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">cloud_upload</span>
              <span>Upload Renewal Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#131b2e]">WHO-GMP Certificate</span>
                <span className="material-symbols-outlined text-[#006b5d] text-base">check_circle</span>
              </div>
              <p className="text-[#434655] text-[11px]">Cert No: WHO-GMP-2023-MH-994</p>
              <span className="text-[10px] text-[#006b5d] font-bold block pt-1">Valid till Dec 2026</span>
            </div>

            <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#131b2e]">Schedule M Facility Audit</span>
                <span className="material-symbols-outlined text-[#006b5d] text-base">check_circle</span>
              </div>
              <p className="text-[#434655] text-[11px]">Cleanroom Grade A/B Laminar Flow</p>
              <span className="text-[10px] text-[#006b5d] font-bold block pt-1">Last Audit: Oct 2025 (Passed)</span>
            </div>

            <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#131b2e]">ISO 13485 &amp; ISO 9001</span>
                <span className="material-symbols-outlined text-[#006b5d] text-base">check_circle</span>
              </div>
              <p className="text-[#434655] text-[11px]">Quality Management Systems</p>
              <span className="text-[10px] text-[#006b5d] font-bold block pt-1">Zero Non-Conformance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
