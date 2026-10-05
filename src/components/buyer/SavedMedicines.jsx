import React from 'react';

export const SavedMedicines = ({
  savedMedicines = [],
  onRemoveFromSaved,
  onAddToCart,
  onNavigate,
  onShowToast
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Saved Medicines</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Your formulary watchlist, recurring institutional supplies, and quick reorder list
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('browse-medicines')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-base">search</span>
          <span>Explore More Formulations</span>
        </button>
      </div>

      {/* List of Saved Medicines */}
      {savedMedicines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#eaedff] space-y-4 max-w-md mx-auto my-8 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#f2f3ff] flex items-center justify-center mx-auto text-[#0047c1]">
            <span className="material-symbols-outlined text-3xl">bookmark_border</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#131b2e]">No Saved Medicines Yet</h2>
            <p className="text-xs text-[#5e6b7f] mt-1">
              Save key medicines, antibiotics, and recurring hospital formulations while browsing the marketplace for instant 1-click reordering.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('browse-medicines')}
            className="px-4 py-2 bg-[#0047c1] text-white rounded-xl text-xs font-bold transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {savedMedicines.map((med) => {
            const price = med.unitPrice ?? med.baseWholesalePrice ?? 100;
            const moq = med.moq || 100;
            const stock = med.stock ?? med.total_stock_available ?? med.totalStockAvailable ?? 1000;
            const isAvailable = stock > 0;

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs flex flex-col justify-between hover:border-[#c2d5ff] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#0047c1] bg-[#eef2ff] px-2 py-0.5 rounded uppercase">
                      {med.category || 'Pharmaceutical'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveFromSaved?.(med.id);
                        onShowToast?.(`Removed ${med.name || med.brand} from saved list`, 'info');
                      }}
                      className="p-1 text-[#ba1a1a] hover:bg-[#ffebee] rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-[#131b2e] mt-2.5">
                    {med.name || med.brand || 'Medicine Formulation'}
                  </h3>
                  <p className="text-xs text-[#5e6b7f] line-clamp-1">
                    {med.genericName || med.generic_name || 'Generic active salt'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[#eaedff] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#5e6b7f]">
                      <span>Supplier:</span>
                      <span className="font-semibold text-[#131b2e] truncate max-w-[160px]">
                        {med.manufacturer || 'Novartis Bio-Pharma'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#5e6b7f]">
                      <span>Packaging:</span>
                      <span className="font-medium text-[#131b2e]">
                        {med.unitPack || med.packSize || '10x10 Strips'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#5e6b7f]">
                      <span>Availability:</span>
                      <span
                        className={`font-bold ${
                          isAvailable ? 'text-[#006f61]' : 'text-[#ba1a1a]'
                        }`}
                      >
                        {isAvailable ? `${stock.toLocaleString()} units` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#eaedff] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#5e6b7f] block">Unit Price (MOQ {moq})</span>
                    <span className="font-mono font-bold text-base text-[#131b2e]">
                      ₹ {Number(price).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      onAddToCart?.(med, moq);
                    }}
                    className="px-3.5 py-2 bg-[#0047c1] hover:bg-[#155eef] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                    <span>Add {moq} pk</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
