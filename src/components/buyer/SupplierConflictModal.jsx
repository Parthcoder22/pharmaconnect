import React from 'react';

export const SupplierConflictModal = ({
  isOpen,
  currentSupplierName,
  newSupplierName,
  pendingMedicine,
  pendingQuantity = 100,
  cartItemCount = 1,
  onConfirmReplace,
  onCheckoutCurrent,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#eaedff] space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#fff8e6] text-[#b37400] flex items-center justify-center shrink-0 border border-[#f5dc99]">
            <span className="material-symbols-outlined text-2xl">storefront</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b37400] bg-[#fff8e6] px-2 py-0.5 rounded">
                Single Manufacturer Cart Policy
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#131b2e] mt-1 leading-snug">
              Different Manufacturer Detected
            </h2>
          </div>
        </div>

        {/* Informative Explanation */}
        <p className="text-xs text-[#5e6b7f] leading-relaxed">
          In institutional B2B pharmaceutical procurement, purchase orders, CDSCO Form 20B/21B compliance, and commercial payments are settled individually per verified manufacturer.
          Your cart currently contains formulations from a different seller.
        </p>

        {/* Visual Seller Comparison Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#eaedff] text-xs">
          {/* Current Seller in Cart */}
          <div className="p-3 bg-white rounded-xl border border-[#eaedff] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e6b7f] block font-mono">
              Current in Cart ({cartItemCount} item{cartItemCount > 1 ? 's' : ''})
            </span>
            <span className="font-bold text-[#131b2e] block truncate">
              {currentSupplierName || 'Verified Manufacturer'}
            </span>
            <span className="text-[10px] text-[#006f61] font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">receipt_long</span>
              PO in progress
            </span>
          </div>

          {/* New Item Seller */}
          <div className="p-3 bg-white rounded-xl border border-[#0047c1]/30 bg-[#f4f7ff] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0047c1] block font-mono">
              New Selection
            </span>
            <span className="font-bold text-[#131b2e] block truncate">
              {newSupplierName || 'Another Manufacturer'}
            </span>
            <span className="text-[10px] text-[#5e6b7f] block truncate">
              {pendingMedicine?.name || pendingMedicine?.brand || 'Formulation'} ({pendingQuantity} units)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Option 1: Replace Cart & Add New */}
          <button
            type="button"
            onClick={onConfirmReplace}
            className="w-full py-2.5 px-4 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            <span>Clear Cart &amp; Add from {newSupplierName || 'New Manufacturer'}</span>
          </button>

          {/* Option 2: Go to Cart & Checkout Current Seller */}
          <button
            type="button"
            onClick={onCheckoutCurrent}
            className="w-full py-2.5 px-4 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#0047c1] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
            <span>Checkout Current Order ({currentSupplierName || 'Current Seller'})</span>
          </button>

          {/* Option 3: Keep Current Cart (Cancel) */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 px-4 bg-transparent hover:bg-neutral-100 text-[#5e6b7f] rounded-xl text-xs font-medium transition-all"
          >
            Keep Current Cart &amp; Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
