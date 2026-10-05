import React, { useState, useMemo } from 'react';

export const BrowseMedicines = ({
  medicines = [],
  savedMedicines = [],
  cartItems = [],
  currentUser = null,
  onToggleSaveMedicine,
  onAddToCart,
  onShowToast,
  onNavigate,
  onOpenVerificationModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDosageForm, setSelectedDosageForm] = useState('all');
  const [selectedStorage, setSelectedStorage] = useState('all');
  const [priceSort, setPriceSort] = useState('default'); // 'default', 'price-low', 'price-high'

  // Modals / Drawers state
  const [selectedMedDetail, setSelectedMedDetail] = useState(null);
  const [compareModalMed, setCompareModalMed] = useState(null);

  // Quantity input state per medicine: { [medId]: number }
  const [quantities, setQuantities] = useState({});

  // 1. Extract Categories & Dosage forms
  const categories = useMemo(() => {
    const set = new Set();
    medicines.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [medicines]);

  const dosageForms = useMemo(() => {
    const set = new Set();
    medicines.forEach((m) => {
      const df = m.dosageForm || m.dosage_form;
      if (df) set.add(df);
    });
    return Array.from(set);
  }, [medicines]);

  // 2. Filter & Sort Logic
  const filteredMedicines = useMemo(() => {
    let result = medicines.filter((m) => {
      // Must not be inactive or discontinued
      if (m.status === 'inactive' || m.status === 'discontinued') return false;

      // Category filter
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;

      // Dosage form filter
      const mForm = m.dosageForm || m.dosage_form || '';
      if (selectedDosageForm !== 'all' && mForm.toLowerCase() !== selectedDosageForm.toLowerCase()) {
        return false;
      }

      // Storage filter
      const mStorage = m.storageCondition || m.storage_condition || '';
      if (selectedStorage === 'cold' && !mStorage.toLowerCase().includes('cold')) return false;
      if (selectedStorage === 'ambient' && mStorage.toLowerCase().includes('cold')) return false;

      // Search query (name, brand, generic, strength)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (m.name || '').toLowerCase().includes(q);
        const brandMatch = (m.brand || m.brandName || '').toLowerCase().includes(q);
        const genericMatch = (m.genericName || m.generic_name || '').toLowerCase().includes(q);
        const strengthMatch = (m.strength || '').toLowerCase().includes(q);
        const mfgMatch = (m.manufacturer || '').toLowerCase().includes(q);
        if (!nameMatch && !brandMatch && !genericMatch && !strengthMatch && !mfgMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (priceSort === 'price-low') {
      result.sort((a, b) => {
        const pA = a.unitPrice ?? a.baseWholesalePrice ?? 0;
        const pB = b.unitPrice ?? b.baseWholesalePrice ?? 0;
        return pA - pB;
      });
    } else if (priceSort === 'price-high') {
      result.sort((a, b) => {
        const pA = a.unitPrice ?? a.baseWholesalePrice ?? 0;
        const pB = b.unitPrice ?? b.baseWholesalePrice ?? 0;
        return pB - pA;
      });
    }

    return result;
  }, [medicines, selectedCategory, selectedDosageForm, selectedStorage, searchQuery, priceSort]);

  // Quantity helpers
  const getQty = (med) => {
    return quantities[med.id] || med.moq || 100;
  };

  const setQty = (medId, val, moq) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < moq) {
      setQuantities((prev) => ({ ...prev, [medId]: moq }));
    } else {
      setQuantities((prev) => ({ ...prev, [medId]: parsed }));
    }
  };

  const isBuyerVerified = currentUser ? (currentUser.verificationStatus === 'verified' || currentUser.verification_status === 'verified') : false;

  const handleAddToCartClick = (med) => {
    if (currentUser?.role === 'buyer' && !isBuyerVerified) {
      if (onOpenVerificationModal) {
        onOpenVerificationModal();
      } else {
        onShowToast?.('CDSCO Statutory Buyer Verification required before purchasing medicines', 'lock');
        onNavigate?.('business-verification');
      }
      return;
    }
    const qty = getQty(med);
    if (onAddToCart) {
      onAddToCart(med, qty);
    }
  };

  // Compare offers generator (simulates multiple verified suppliers offering equivalent formulations)
  const getComparableOffers = (med) => {
    const basePrice = med.unitPrice ?? med.baseWholesalePrice ?? 120;
    const moq = med.moq || 100;
    return [
      {
        id: `offer-1-${med.id}`,
        supplierName: med.manufacturer || 'Novartis Bio-Pharma Ltd.',
        location: 'Kurkumbh, Maharashtra',
        verificationStatus: 'verified',
        unitPrice: basePrice,
        moq: moq,
        stock: med.stock ?? med.total_stock_available ?? 12000,
        leadTime: '24-48 Hours Dispatch',
        paymentTerms: 'Net 30 Available'
      },
      {
        id: `offer-2-${med.id}`,
        supplierName: 'Cipla Institutional Logistics Ltd.',
        location: 'Vapi, Gujarat',
        verificationStatus: 'verified',
        unitPrice: Number((basePrice * 1.04).toFixed(2)),
        moq: Math.max(50, Math.floor(moq * 0.8)),
        stock: 8500,
        leadTime: 'Immediate Ready Stock',
        paymentTerms: 'Advance / Escrow'
      },
      {
        id: `offer-3-${med.id}`,
        supplierName: 'Sun Pharma Distribution Depot',
        location: 'Baddi, Himachal Pradesh',
        verificationStatus: 'verified',
        unitPrice: Number((basePrice * 0.96).toFixed(2)),
        moq: Math.floor(moq * 1.5),
        stock: 24000,
        leadTime: '3-4 Working Days',
        paymentTerms: 'Net 15 / Credit Approved'
      }
    ];
  };

  const isSaved = (medId) => {
    return savedMedicines.some((m) => m.id === medId || m.medicineId === medId);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Browse Medicines</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Discover verified institutional pharmaceutical formulations, pricing, and supplier offers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('saved-medicines')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#f2f3ff] text-[#131b2e] rounded-xl text-xs font-semibold border border-[#eaedff] transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base text-[#0047c1]">bookmark</span>
            <span>Saved ({savedMedicines.length})</span>
          </button>
        </div>
      </div>

      {/* Active Single-Manufacturer Cart Banner */}
      {cartItems && cartItems.length > 0 && (
        <div className="bg-[#fff8e6] border border-[#f5dc99] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#b37400] flex items-center justify-center shrink-0 border border-[#f5dc99] shadow-2xs">
              <span className="material-symbols-outlined text-xl">storefront</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b37400] bg-white px-2 py-0.5 rounded border border-[#f5dc99]">
                  Single Manufacturer Order in Progress
                </span>
                <span className="text-xs text-[#5e6b7f]">
                  ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})
                </span>
              </div>
              <p className="text-xs text-[#131b2e] font-medium mt-0.5">
                Current Cart: <strong className="text-[#b37400]">{cartItems[0]?.supplierName || cartItems[0]?.manufacturer || 'Verified Manufacturer'}</strong>. In B2B wholesale pharma, all items in a purchase order are billed to 1 manufacturer.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('shopping-cart')}
            className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
            <span>View Cart &amp; Checkout</span>
          </button>
        </div>
      )}

      {/* Uncertified Buyer Compliance Advisory Banner */}
      {currentUser?.role === 'buyer' && !isBuyerVerified && (
        <div className="bg-[#fff8e6] border border-[#f5dc99] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#b37400] flex items-center justify-center shrink-0 border border-[#f5dc99] shadow-2xs">
              <span className="material-symbols-outlined text-xl">gavel</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b37400] bg-white px-2 py-0.5 rounded border border-[#f5dc99]">
                  Statutory Certification Required
                </span>
              </div>
              <p className="text-xs text-[#131b2e] font-medium mt-0.5">
                Under CDSCO Form 20/21 regulations, unverified buyers cannot purchase prescription pharmaceuticals. Verify your healthcare establishment in Security &amp; Verification to enable procurement.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('business-verification')}
            className="px-4 py-2 bg-[#b37400] hover:bg-[#8f5d00] text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">security</span>
            <span>Go to Security &amp; Verification</span>
          </button>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[#5e6b7f] text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name, generic formulation, active salt, strength (e.g. Augmentin, Ceftriaxone)..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] placeholder:text-[#5e6b7f] focus:outline-none focus:ring-2 focus:ring-[#0047c1] border border-transparent focus:border-[#0047c1]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#5e6b7f] hover:text-[#131b2e]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Dosage Form Filter */}
            <select
              value={selectedDosageForm}
              onChange={(e) => setSelectedDosageForm(e.target.value)}
              className="h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-medium border border-transparent focus:ring-2 focus:ring-[#0047c1] focus:outline-none"
            >
              <option value="all">All Forms</option>
              {dosageForms.map((df) => (
                <option key={df} value={df}>
                  {df}
                </option>
              ))}
            </select>

            {/* Storage Filter */}
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-medium border border-transparent focus:ring-2 focus:ring-[#0047c1] focus:outline-none"
            >
              <option value="all">All Storage Conditions</option>
              <option value="ambient">Ambient (15°C - 25°C)</option>
              <option value="cold">Cold-Chain (2°C - 8°C)</option>
            </select>

            {/* Sort Price */}
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              className="h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-medium border border-transparent focus:ring-2 focus:ring-[#0047c1] focus:outline-none"
            >
              <option value="default">Default Sort</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-[#eaedff]">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#0047c1] text-white'
                : 'bg-[#f2f3ff] text-[#5e6b7f] hover:bg-[#eaedff] hover:text-[#131b2e]'
            }`}
          >
            All Formulations ({medicines.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#0047c1] text-white'
                    : 'bg-[#f2f3ff] text-[#5e6b7f] hover:bg-[#eaedff] hover:text-[#131b2e]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Results Count */}
      <div className="flex items-center justify-between text-xs text-[#5e6b7f]">
        <span>
          Showing <strong className="text-[#131b2e] font-mono">{filteredMedicines.length}</strong> matching formulations
        </span>
        {(searchQuery || selectedCategory !== 'all' || selectedDosageForm !== 'all' || selectedStorage !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDosageForm('all');
              setSelectedStorage('all');
              setPriceSort('default');
            }}
            className="text-[#0047c1] font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 4. Medicine Cards Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#eaedff] space-y-3">
          <span className="material-symbols-outlined text-4xl text-[#5e6b7f]">search_off</span>
          <h2 className="text-sm font-bold text-[#131b2e]">No Medicines Found</h2>
          <p className="text-xs text-[#5e6b7f] max-w-sm mx-auto">
            We couldn't find any listings matching your search or filter criteria. Try adjusting keywords or category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDosageForm('all');
              setSelectedStorage('all');
            }}
            className="px-4 py-2 bg-[#0047c1] text-white text-xs font-bold rounded-xl"
          >
            Clear Search Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const price = med.unitPrice ?? med.baseWholesalePrice ?? 100;
            const stock = med.stock ?? med.total_stock_available ?? med.totalStockAvailable ?? 0;
            const moq = med.moq || 100;
            const currentQty = getQty(med);
            const saved = isSaved(med.id);
            const isCold = (med.storageCondition || med.storage_condition || '').toLowerCase().includes('cold');

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs hover:shadow-md hover:border-[#c2d5ff] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges & Save action */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#0047c1] bg-[#eef2ff] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {med.category || 'General Formulations'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleSaveMedicine?.(med);
                        onShowToast?.(
                          saved
                            ? `Removed ${med.name || med.brand} from saved`
                            : `Saved ${med.name || med.brand} to favorites`,
                          'bookmark'
                        );
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        saved
                          ? 'text-[#0047c1] bg-[#eef2ff]'
                          : 'text-[#5e6b7f] hover:text-[#0047c1] hover:bg-[#f2f3ff]'
                      }`}
                      title={saved ? 'Remove from saved' : 'Save medicine'}
                    >
                      <span className="material-symbols-outlined text-base">
                        {saved ? 'bookmark_added' : 'bookmark_border'}
                      </span>
                    </button>
                  </div>

                  {/* Brand & Generic Name */}
                  <div className="mt-3">
                    <h3
                      onClick={() => setSelectedMedDetail(med)}
                      className="text-sm font-bold text-[#131b2e] hover:text-[#0047c1] cursor-pointer transition-colors"
                    >
                      {med.name || med.brand || 'Medicine Formulation'}
                    </h3>
                    <p className="text-xs text-[#5e6b7f] line-clamp-1 mt-0.5">
                      {med.genericName || med.generic_name || 'Active generic formulation'}
                    </p>
                  </div>

                  {/* Form, Strength, Pack specs */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#eaedff] text-[11px]">
                    <div>
                      <span className="text-[#5e6b7f] block">Strength &amp; Form:</span>
                      <span className="font-semibold text-[#131b2e]">
                        {med.strength || 'Standard'} • {med.dosageForm || med.dosage_form || 'Tablet'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#5e6b7f] block">Packaging:</span>
                      <span className="font-semibold text-[#131b2e]">
                        {med.unitPack || med.packSize || '10x10 Strips'}
                      </span>
                    </div>
                  </div>

                  {/* Supplier & Storage */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#5e6b7f]">
                    <div className="flex items-center gap-1 truncate max-w-[190px]">
                      <span className="material-symbols-outlined text-xs text-[#006f61]">verified</span>
                      <span className="font-medium text-[#131b2e] truncate">
                        {med.manufacturer || 'Novartis Bio-Pharma Ltd.'}
                      </span>
                    </div>
                    {isCold ? (
                      <span className="inline-flex items-center gap-1 text-[#0284c7] font-semibold text-[10px] bg-[#e0f2fe] px-2 py-0.5 rounded">
                        <span className="material-symbols-outlined text-xs">ac_unit</span>
                        2°C–8°C
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#5e6b7f]">Controlled Ambient</span>
                    )}
                  </div>
                </div>

                {/* Bottom Commercial Row: Price, Stock, MOQ & Add to Cart */}
                <div className="mt-4 pt-3 border-t border-[#eaedff] space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-[#5e6b7f] block">Institutional Pack Price</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono font-bold text-base text-[#131b2e]">
                          ₹ {Number(price).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#5e6b7f]">/ pack</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#5e6b7f] block">Available Stock</span>
                      <span className="font-mono font-bold text-xs text-[#006f61]">
                        {stock.toLocaleString()} units
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Add Button */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#eaedff] rounded-xl bg-[#f2f3ff] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.max(moq, currentQty - 50);
                          setQty(med.id, next, moq);
                        }}
                        className="w-8 h-9 flex items-center justify-center text-[#5e6b7f] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <input
                        type="number"
                        min={moq}
                        value={currentQty}
                        onChange={(e) => setQty(med.id, e.target.value, moq)}
                        className="w-16 h-9 text-center text-xs font-mono font-bold text-[#131b2e] bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setQty(med.id, currentQty + 50, moq);
                        }}
                        className="w-8 h-9 flex items-center justify-center text-[#5e6b7f] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCartClick(med)}
                      className="flex-1 h-9 px-3 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                      <span>Add {currentQty} pk</span>
                    </button>
                  </div>

                  {/* Compare Offers Shortcut */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#5e6b7f]">
                    <span>MOQ: <strong>{moq} units</strong></span>
                    <button
                      type="button"
                      onClick={() => setCompareModalMed(med)}
                      className="text-[#0047c1] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">compare_arrows</span>
                      <span>Compare 3 Supplier Offers</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Compare Supplier Offers Modal */}
      {compareModalMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-xl border border-[#eaedff] my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <span className="text-[10px] font-bold text-[#0047c1] uppercase bg-[#eef2ff] px-2 py-0.5 rounded">
                  Offer Comparison
                </span>
                <h3 className="text-base font-bold text-[#131b2e] mt-1">
                  Compare Supplier Offers for {compareModalMed.name || compareModalMed.brand}
                </h3>
                <p className="text-xs text-[#5e6b7f]">
                  Equivalent institutional formulation • {compareModalMed.genericName || 'Active Active Ingredients'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompareModalMed(null)}
                className="p-1.5 rounded-lg text-[#5e6b7f] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="divide-y divide-[#eaedff]">
              {getComparableOffers(compareModalMed).map((offer, idx) => (
                <div key={offer.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#131b2e]">{offer.supplierName}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#006f61] bg-[#e6f8f3] px-2 py-0.5 rounded">
                        <span className="material-symbols-outlined text-[10px]">verified</span>
                        Verified
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold text-[#0047c1] bg-[#eef2ff] px-2 py-0.5 rounded">
                          Current Listing
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5e6b7f] mt-0.5">
                      Depot Location: {offer.location} • Lead Time: {offer.leadTime}
                    </p>
                    <p className="text-[11px] text-[#5e6b7f]">
                      Commercial Terms: <span className="font-medium text-[#131b2e]">{offer.paymentTerms}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-[#5e6b7f] block">Unit Price (MOQ {offer.moq})</span>
                      <span className="font-mono font-bold text-sm text-[#131b2e]">
                        ₹ {offer.unitPrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (currentUser?.role === 'buyer' && !isBuyerVerified) {
                          if (onOpenVerificationModal) {
                            onOpenVerificationModal();
                          } else {
                            onShowToast?.('CDSCO Statutory Buyer Verification required before purchasing medicines', 'lock');
                            onNavigate?.('business-verification');
                          }
                          return;
                        }
                        const customMed = {
                          ...compareModalMed,
                          manufacturer: offer.supplierName,
                          unitPrice: offer.unitPrice,
                          baseWholesalePrice: offer.unitPrice,
                          moq: offer.moq
                        };
                        onAddToCart?.(customMed, offer.moq);
                        setCompareModalMed(null);
                      }}
                      className="px-3.5 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      Select &amp; Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#eaedff] flex justify-end">
              <button
                type="button"
                onClick={() => setCompareModalMed(null)}
                className="px-4 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-semibold rounded-xl"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Medicine Details Drawer / Modal */}
      {selectedMedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-[#eaedff] my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <span className="text-[10px] font-bold text-[#0047c1] uppercase bg-[#eef2ff] px-2.5 py-0.5 rounded">
                  {selectedMedDetail.category || 'Pharmaceutical Formulation'}
                </span>
                <h3 className="text-base font-bold text-[#131b2e] mt-1">
                  {selectedMedDetail.name || selectedMedDetail.brand}
                </h3>
                <p className="text-xs text-[#5e6b7f]">{selectedMedDetail.genericName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMedDetail(null)}
                className="p-1.5 rounded-lg text-[#5e6b7f] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Formulation Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">Strength &amp; Form</span>
                <span className="font-bold text-[#131b2e] mt-0.5 block">
                  {selectedMedDetail.strength || 'Standard'} • {selectedMedDetail.dosageForm || 'Tablet'}
                </span>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">Standard Pack Size</span>
                <span className="font-bold text-[#131b2e] mt-0.5 block">
                  {selectedMedDetail.unitPack || selectedMedDetail.packSize || '10x10 Strips'}
                </span>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">CDSCO Schedule</span>
                <span className="font-bold text-[#0047c1] mt-0.5 block">
                  {selectedMedDetail.regulatorySchedule || 'Schedule H'}
                </span>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">Manufacturer</span>
                <span className="font-bold text-[#131b2e] mt-0.5 block truncate">
                  {selectedMedDetail.manufacturer || 'Novartis Bio-Pharma'}
                </span>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">Storage Instruction</span>
                <span className="font-bold text-[#131b2e] mt-0.5 block">
                  {selectedMedDetail.storageCondition || 'Ambient (15°C - 25°C)'}
                </span>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">GST Rate</span>
                <span className="font-bold text-[#131b2e] mt-0.5 block">
                  {selectedMedDetail.gstRate || 12}% Applicable
                </span>
              </div>
            </div>

            {/* Description */}
            {selectedMedDetail.description && (
              <div className="p-3.5 bg-[#faf8ff] rounded-xl border border-[#eaedff] text-xs text-[#434655]">
                <span className="font-bold text-[#131b2e] block mb-1">Product Description</span>
                <p>{selectedMedDetail.description}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#eaedff] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#5e6b7f] block">Unit Price (MOQ {selectedMedDetail.moq || 100})</span>
                <span className="font-mono font-bold text-base text-[#131b2e]">
                  ₹ {Number(selectedMedDetail.unitPrice ?? selectedMedDetail.baseWholesalePrice ?? 100).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMedDetail(null)}
                  className="px-4 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCartClick(selectedMedDetail);
                    setSelectedMedDetail(null);
                  }}
                  className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
