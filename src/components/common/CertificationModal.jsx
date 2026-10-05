import React from 'react';

export const CertificationModal = ({
  isOpen,
  role = 'buyer',
  actionAttempted = 'buy', // 'buy' | 'sell' | 'cart'
  onNavigateToVerification,
  onClose
}) => {
  if (!isOpen) return null;

  const isBuyer = role === 'buyer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#eaedff] space-y-5 animate-in zoom-in-95 duration-150">
        {/* Compliance Warning Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#fff8e6] text-[#b37400] flex items-center justify-center shrink-0 border border-[#f5dc99]">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b37400] bg-[#fff8e6] px-2 py-0.5 rounded border border-[#f5dc99]">
                CDSCO Compliance Gate
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#131b2e] mt-1 leading-snug">
              {isBuyer ? 'Statutory Buyer Verification Required' : 'Manufacturer Verification Required'}
            </h2>
          </div>
        </div>

        {/* Informative Regulatory Explanation */}
        <p className="text-xs text-[#5e6b7f] leading-relaxed">
          {isBuyer ? (
            <>
              Under the <strong>Drugs and Cosmetics Act, 1940</strong> and statutory CDSCO Form 20/21 regulations, prescription formulations (Schedule H &amp; H1) can only be procured by <strong>Certified Healthcare Establishments</strong>.
              <br /><br />
              <strong className="text-[#b37400]">Mandatory PDF Requirement:</strong> All 4 statutory PDF certificates (Form 20/21, GSTIN, Pharmacist Council, NABH/Establishment) must be uploaded under <strong>Security &amp; Verification</strong> to become certified before purchasing medicines.
            </>
          ) : (
            <>
              Under statutory <strong>CDSCO Form 20B/21B</strong> wholesale regulations and <strong>WHO-GMP</strong> guidelines, pharmaceutical formulations can only be listed and sold by <strong>Certified Manufacturers &amp; Distributors</strong>.
              <br /><br />
              <strong className="text-[#b37400]">Mandatory PDF Requirement:</strong> All 5 statutory PDF licenses (Form 20B/21B, GST REG-06, Incorporation, WHO-GMP, FSSAI) must be uploaded under <strong>Security &amp; Verification</strong> to become certified before listing or selling medicines.
            </>
          )}
        </p>

        {/* Compliance Features Box */}
        <div className="p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#eaedff] space-y-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e6b7f] block font-mono">
            {isBuyer ? 'What Buyer Certification Unlocks:' : 'What Seller Certification Unlocks:'}
          </span>
          <div className="space-y-1.5 text-[#131b2e]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006f61] text-sm">check_circle</span>
              <span className="text-[11px] font-medium">
                {isBuyer ? 'Direct Institutional B2B Wholesale Ordering' : 'Publish & List Formulations in Buyer Marketplace'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006f61] text-sm">check_circle</span>
              <span className="text-[11px] font-medium">
                {isBuyer ? 'Commercial Razorpay Escrow & Net-30 Credit' : 'Accept Purchase Orders & Dispatch Form 20B/21B Batches'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006f61] text-sm">check_circle</span>
              <span className="text-[11px] font-medium">
                {isBuyer ? 'Automated GST Invoices & Batch COA Release' : 'Receive Escrow Settlements to Verified Account'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onNavigateToVerification}
            className="w-full py-2.5 px-4 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">security</span>
            <span>Go to Security &amp; Verification</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 bg-transparent hover:bg-neutral-100 text-[#5e6b7f] rounded-xl text-xs font-medium transition-all"
          >
            Stay in Catalog (Browse Only)
          </button>
        </div>
      </div>
    </div>
  );
};
