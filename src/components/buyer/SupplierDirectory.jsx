import React, { useState, useMemo } from 'react';

export const SupplierDirectory = ({
  medicines = [],
  onNavigate,
  onOpenChat,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState(null);

  // Realistic directory of verified pharmaceutical suppliers active in the marketplace
  const suppliers = useMemo(() => {
    return [
      {
        id: 'supp-01',
        name: 'Novartis Lifesciences Bio-Pharma Ltd.',
        type: 'Primary Formulation Manufacturer',
        city: 'Pune',
        state: 'Maharashtra',
        address: 'Plot 42-B, MIDC Industrial Area, Kurkumbh, Pune, MH - 413802',
        verificationStatus: 'verified',
        licenseNumber: 'DL-94821 / MH-PUN-20B-184920',
        gstin: '27AAACN0192Q1ZV',
        categories: ['Critical Care & ICU', 'Cardiovascular', 'Antibiotics'],
        leadTime: '24-48 Hours Dispatch',
        paymentTerms: 'Net 30 Credit / Escrow'
      },
      {
        id: 'supp-02',
        name: 'Cipla Institutional Logistics & Depot Ltd.',
        type: 'Wholesale Depot & Formulation Supply',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: 'Cipla Commercial Zone, Vikhroli West, Mumbai - 400083',
        verificationStatus: 'verified',
        licenseNumber: 'DL-88210 / MH-MUM-21B-449102',
        gstin: '27AABCC3310M1ZQ',
        categories: ['Respiratory & Pulmonology', 'Antimicrobial', 'Critical Care'],
        leadTime: 'Same Day Depot Dispatch',
        paymentTerms: 'Advance / Net 15'
      },
      {
        id: 'supp-03',
        name: 'Sun Pharma Distribution Central Depot',
        type: 'Central Pharma Distribution Depot',
        city: 'Baddi',
        state: 'Himachal Pradesh',
        address: 'Industrial Area Phase III, Baddi, Solan, HP - 173205',
        verificationStatus: 'verified',
        licenseNumber: 'DL-HP-SOL-20B-1092',
        gstin: '02AAACS4412B1ZY',
        categories: ['Cardiology & Glycemic', 'Oncology', 'Neurology'],
        leadTime: '2-3 Days Logistics Dispatch',
        paymentTerms: 'Institutional Credit Lines'
      },
      {
        id: 'supp-04',
        name: 'Dr. Reddy’s Institutional Hospital Supply',
        type: 'Clinical & Hospital Formulary Supply',
        city: 'Hyderabad',
        state: 'Telangana',
        address: 'Bachupally Industrial Corridor, Hyderabad, TS - 500090',
        verificationStatus: 'verified',
        licenseNumber: 'DL-TS-HYD-20B-99120',
        gstin: '36AAACD5501P1Z5',
        categories: ['Critical Care & ICU', 'Gastroenterology', 'Antibiotics'],
        leadTime: '48 Hours Express Dispatch',
        paymentTerms: 'Net 30 Available'
      },
      {
        id: 'supp-05',
        name: 'Zydus Cadila Healthcare Bulk Logistics',
        type: 'Wholesale Distributor',
        city: 'Ahmedabad',
        state: 'Gujarat',
        address: 'Sarkhej-Bavla Highway, Changodar, Ahmedabad, GJ - 382213',
        verificationStatus: 'verified',
        licenseNumber: 'DL-GJ-AHM-21B-55091',
        gstin: '24AAACZ1190K1ZX',
        categories: ['Anti-diabetic & Glycemic', 'Cardiovascular', 'Vaccines'],
        leadTime: '24 Hours Express Dispatch',
        paymentTerms: 'Net 30 Credit / Advance'
      }
    ];
  }, []);

  // Filter logic
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (selectedCity !== 'all' && s.city !== selectedCity) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = s.name.toLowerCase().includes(q);
        const cityMatch = s.city.toLowerCase().includes(q);
        const typeMatch = s.type.toLowerCase().includes(q);
        const catMatch = s.categories.some((c) => c.toLowerCase().includes(q));
        if (!nameMatch && !cityMatch && !typeMatch && !catMatch) return false;
      }

      return true;
    });
  }, [suppliers, selectedCity, searchQuery]);

  // Medicines offered by selected supplier
  const getSupplierMedicines = (supplierName) => {
    return medicines.filter(
      (m) =>
        (m.manufacturer || '').toLowerCase().includes(supplierName.slice(0, 6).toLowerCase()) ||
        supplierName.toLowerCase().includes((m.manufacturer || '').slice(0, 6).toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Verified Supplier Directory</h1>
        <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
          Browse licensed pharmaceutical manufacturers, institutional depots, and state distributors
        </p>
      </div>

      {/* 2. Search & City Filters */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-4 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5e6b7f] text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers by business name, therapeutic categories, or location..."
            className="w-full pl-9 pr-4 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
          />
        </div>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-medium border border-transparent focus:ring-2 focus:ring-[#0047c1] focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Locations</option>
          <option value="Pune">Pune, MH</option>
          <option value="Mumbai">Mumbai, MH</option>
          <option value="Baddi">Baddi, HP</option>
          <option value="Hyderabad">Hyderabad, TS</option>
          <option value="Ahmedabad">Ahmedabad, GJ</option>
        </select>
      </div>

      {/* 3. Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredSuppliers.map((supp) => {
          return (
            <div
              key={supp.id}
              className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs hover:shadow-md hover:border-[#c2d5ff] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#eef2ff] flex items-center justify-center text-[#0047c1]">
                      <span className="material-symbols-outlined text-lg">storefront</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#006f61] bg-[#e6f8f3] px-2 py-0.5 rounded flex items-center gap-0.5 w-fit">
                        <span className="material-symbols-outlined text-[10px]">verified</span>
                        CDSCO Licensed
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#5e6b7f]">
                    {supp.city}, {supp.state}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#131b2e] mt-3">{supp.name}</h3>
                <p className="text-xs text-[#5e6b7f]">{supp.type}</p>

                <div className="mt-3 pt-3 border-t border-[#eaedff] text-xs space-y-1.5">
                  <div className="text-[11px] text-[#5e6b7f]">
                    <span>Drug License: </span>
                    <strong className="text-[#131b2e] font-mono">{supp.licenseNumber}</strong>
                  </div>
                  <div className="text-[11px] text-[#5e6b7f]">
                    <span>GSTIN: </span>
                    <strong className="text-[#131b2e] font-mono">{supp.gstin}</strong>
                  </div>
                  <div className="text-[11px] text-[#5e6b7f]">
                    <span>Dispatch SLA: </span>
                    <strong className="text-[#006f61]">{supp.leadTime}</strong>
                  </div>

                  {/* Categories Tags */}
                  <div className="pt-1 flex flex-wrap gap-1">
                    {supp.categories.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#f2f3ff] text-[#0047c1] font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#eaedff] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierDetail(supp)}
                  className="flex-1 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#0047c1] rounded-xl text-xs font-bold transition-colors text-center"
                >
                  View Profile &amp; Formulations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenChat) onOpenChat();
                    else onNavigate('order-chat');
                    onShowToast?.(`Opening chat with ${supp.name}`, 'chat');
                  }}
                  className="p-2 bg-[#eef2ff] hover:bg-[#dbe4ff] text-[#0047c1] rounded-xl transition-colors"
                  title="Direct Message"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Supplier Profile Modal */}
      {selectedSupplierDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-[#eaedff] my-8 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <span className="text-[10px] font-bold text-[#006f61] uppercase bg-[#e6f8f3] px-2 py-0.5 rounded">
                  Verified Pharmaceutical Partner
                </span>
                <h3 className="text-base font-bold text-[#131b2e] mt-1">
                  {selectedSupplierDetail.name}
                </h3>
                <p className="text-xs text-[#5e6b7f]">
                  {selectedSupplierDetail.type} • {selectedSupplierDetail.city}, {selectedSupplierDetail.state}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSupplierDetail(null)}
                className="p-1.5 rounded-lg text-[#5e6b7f] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Profile specifications */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">Premises &amp; Warehouse Address</span>
                <span className="font-semibold text-[#131b2e] mt-0.5 block">
                  {selectedSupplierDetail.address}
                </span>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">Commercial Settlement Terms</span>
                <span className="font-semibold text-[#131b2e] mt-0.5 block">
                  {selectedSupplierDetail.paymentTerms}
                </span>
              </div>
            </div>

            {/* Available Formulations from this supplier */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#131b2e] block">
                Catalog Formulations Available on PharmaConnect
              </span>
              <div className="divide-y divide-[#eaedff] border border-[#eaedff] rounded-xl max-h-48 overflow-y-auto">
                {getSupplierMedicines(selectedSupplierDetail.name).length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#5e6b7f]">
                    All active marketplace formulations can be discovered via Browse Medicines.
                  </div>
                ) : (
                  getSupplierMedicines(selectedSupplierDetail.name).map((m) => (
                    <div key={m.id} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#131b2e]">{m.name}</span>
                        <span className="block text-[11px] text-[#5e6b7f]">{m.genericName}</span>
                      </div>
                      <span className="font-mono font-bold text-[#0047c1]">
                        ₹ {Number(m.unitPrice ?? m.baseWholesalePrice ?? 100).toFixed(2)} / pk
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-[#eaedff] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (onOpenChat) onOpenChat();
                  else onNavigate('order-chat');
                  setSelectedSupplierDetail(null);
                }}
                className="px-4 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#0047c1] rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>Message Supplier</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSupplierDetail(null);
                  onNavigate('browse-medicines');
                }}
                className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Browse Full Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
