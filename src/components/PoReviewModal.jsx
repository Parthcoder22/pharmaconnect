import React from 'react';

export const PoReviewModal = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onUpdateQty,
  destinationHub,
  onSubmitPo
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const gst = subtotal * 0.12;
  const netTotal = subtotal + gst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-[#eaedff] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eaedff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#155eef] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#131b2e]">
                Institutional Purchase Order Basket
              </h3>
              <p className="text-xs text-[#434655]">
                Consignment Destination: <strong>{destinationHub}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#eaedff] text-[#434655]" type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-[#737687]">
              <span className="material-symbols-outlined text-4xl text-[#c3c6d8] mb-2 block">
                remove_shopping_cart
              </span>
              <span>Your procurement basket is currently empty.</span>
            </div>
          ) : (
            cartItems.map(({ medicine, quantity, unitPrice }) => (
              <div
                key={medicine.id}
                className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-sm text-[#131b2e]">{medicine.name}</div>
                  <div className="font-mono text-[11px] text-[#434655] mt-0.5">
                    LOT: {medicine.activeBatch?.batchNumber} • Mfg: {medicine.manufacturer}
                  </div>
                  <div className="text-[10px] text-[#006b5d] font-bold mt-1">
                    Rate: ${unitPrice.toFixed(2)} / unit • MOQ: {medicine.moq}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center bg-white rounded-xl p-1 border border-[#eaedff]">
                    <button
                      onClick={() => onUpdateQty(medicine.id, Math.max(medicine.moq, quantity - medicine.moq))}
                      className="w-7 h-7 rounded text-[#131b2e] hover:bg-[#f2f3ff] font-bold"
                      type="button"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-mono font-bold text-xs">{quantity}</span>
                    <button
                      onClick={() => onUpdateQty(medicine.id, quantity + medicine.moq)}
                      className="w-7 h-7 rounded text-[#131b2e] hover:bg-[#f2f3ff] font-bold"
                      type="button"
                    >
                      +
                    </button>
                  </div>

                  <div className="font-mono font-bold text-sm text-[#0047c1] w-24 text-right">
                    ${(quantity * unitPrice).toFixed(2)}
                  </div>

                  <button
                    onClick={() => onRemoveItem(medicine.id)}
                    className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                    title="Remove item"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Summary */}
        {cartItems.length > 0 && (
          <div className="bg-[#f2f3ff] p-4 rounded-2xl space-y-2 border border-[#eaedff] text-xs">
            <div className="flex justify-between text-[#434655]">
              <span>Taxable Subtotal:</span>
              <span className="font-mono font-bold text-[#131b2e]">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#434655]">
              <span>Estimated GST (12% Pharma Average):</span>
              <span className="font-mono font-bold text-[#131b2e]">${gst.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[#eaedff] flex justify-between items-baseline font-bold text-sm text-[#131b2e]">
              <span>Net PO Payable Value:</span>
              <span className="font-mono text-xl text-[#0047c1]">${netTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] text-xs font-bold"
            type="button"
          >
            Continue Shopping
          </button>
          <button
            onClick={onSubmitPo}
            disabled={cartItems.length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#0047c1] hover:bg-[#155eef] text-white text-xs font-bold shadow-md transition-all disabled:opacity-40"
            type="button"
          >
            Submit Purchase Order to Supplier
          </button>
        </div>
      </div>
    </div>
  );
};
