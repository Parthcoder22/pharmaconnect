import React, { useState } from 'react';

export const MedicineCatalog = ({
  medicines,
  onAddToPo,
  onReviewPo,
  cartItemCount,
  cartUnitCount,
  cartSubtotal,
  onShowToast,
  destinationHub,
  onSelectDestinationHub
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([
    'Cardiovascular',
    'Antimicrobial & Antibiotics'
  ]);
  const [selectedDosage, setSelectedDosage] = useState('All');
  const [selectedSchedules, setSelectedSchedules] = useState(['Schedule H', 'Schedule H1', 'General / OTC']);
  const [expiryFilter, setExpiryFilter] = useState('gt12');
  const [maxMoq, setMaxMoq] = useState(500);
  const [whoGmpOnly, setWhoGmpOnly] = useState(true);
  const [coldChainOnly, setColdChainOnly] = useState(false);
  const [sortOption, setSortOption] = useState('margin');

  // Quantities for each card
  const [quantities, setQuantities] = useState({
    'med-01': 250,
    'med-02': 150,
    'med-03': 100,
    'med-04': 500,
    'med-05': 500,
    'med-06': 50,
    'med-07': 2000,
    'med-08': 1000
  });

  const hubs = [
    'St. Jude Medical Center — Wing B Central Store',
    'Apollo Multispeciality ICU Depot (Mumbai)',
    'Fortis Escorts Heart Central Pharmacy (Delhi)',
    'Manipal Hospital Surgical Pharmacy Node (Bengaluru)'
  ];

  const handleQtyChange = (id, delta, minMoq) => {
    const curr = quantities[id] || minMoq;
    const next = Math.max(minMoq, curr + delta);
    setQuantities({ ...quantities, [id]: next });
  };

  const getTierPrice = (med, qty) => {
    if (med.volumeTiers && med.volumeTiers.length > 0) {
      for (let i = med.volumeTiers.length - 1; i >= 0; i--) {
        const tier = med.volumeTiers[i];
        if (qty >= tier.minQty) {
          return tier.unitPrice;
        }
      }
    }
    return med.baseWholesalePrice;
  };

  const filteredMedicines = medicines.filter((m) => {
    // Search
    const q = searchQuery.toLowerCase();
    const matchSearch =
      q === '' ||
      m.name?.toLowerCase().includes(q) ||
      m.genericName?.toLowerCase().includes(q) ||
      m.manufacturer?.toLowerCase().includes(q) ||
      m.activeBatch?.batchNumber?.toLowerCase().includes(q);

    // Category
    const matchCat =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) => m.category?.toLowerCase().includes(cat.toLowerCase()));

    // Dosage
    const matchDosage = selectedDosage === 'All' || m.dosageForm?.toLowerCase() === selectedDosage.toLowerCase();

    // Schedule
    const matchSched = selectedSchedules.length === 0 || selectedSchedules.includes(m.regulatorySchedule);

    // MOQ
    const matchMoq = m.moq <= maxMoq;

    // Cold chain
    const matchCold = !coldChainOnly || m.isColdChain;

    // WHO GMP
    const matchWho = !whoGmpOnly || m.isWhoGmp;

    return matchSearch && matchCat && matchDosage && matchSched && matchMoq && matchCold && matchWho;
  });

  return (
    <div className="flex flex-col w-full bg-[#faf8ff] pb-16">
      {/* Top Context & Live Order Basket Header Bar */}
      <div className="w-full bg-white shadow-xs border-b border-[#eaedff] px-4 sm:px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left Context Info */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-[#006b5d] font-bold tracking-wider font-mono">
                  Hospital Procurement Desk
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-mono text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006b5d]"></span>
                  CDSCO Verified Hub
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#131b2e] tracking-tight mt-0.5">
                Medicine Catalog &amp; Order Console
              </h1>
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#eaedff] bg-[#f2f3ff] py-1.5 px-3 rounded-xl">
              <span className="material-symbols-outlined text-[#0047c1] text-lg">local_hospital</span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#434655]">Destination Hub</span>
                <select
                  value={destinationHub}
                  onChange={(e) => onSelectDestinationHub(e.target.value)}
                  className="bg-transparent font-semibold text-xs text-[#131b2e] outline-none cursor-pointer"
                >
                  {hubs.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right: Real-time PO Basket Widget */}
          <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
            <div className="flex items-center gap-3 bg-[#f2f3ff] px-4 py-2 rounded-2xl border border-[#eaedff]">
              <div className="w-9 h-9 rounded-xl bg-[#155eef] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#131b2e]">
                    {cartItemCount} Line Items
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#737687]"></span>
                  <span className="font-mono text-xs text-[#006b5d] font-bold">
                    {cartUnitCount.toLocaleString()} Units
                  </span>
                </div>
                <p className="text-xs text-[#434655]">
                  Subtotal:{' '}
                  <strong className="font-mono text-[#131b2e] font-bold">
                    ${cartSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </p>
              </div>
            </div>

            <button
              onClick={onReviewPo}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              type="button"
            >
              <span>Review Purchase Order</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Workspace Layout */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT FILTER SIDEBAR (3 cols) */}
          <aside className="lg:col-span-3 space-y-4 bg-white rounded-2xl p-5 shadow-sm border border-[#eaedff]">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0047c1] text-xl">tune</span>
                <span className="font-bold text-sm text-[#131b2e]">Filters</span>
              </div>
              <button
                onClick={() => {
                  setSelectedCategories(['Cardiovascular', 'Antimicrobial & Antibiotics']);
                  setSelectedDosage('All');
                  setSelectedSchedules(['Schedule H', 'Schedule H1', 'General / OTC']);
                  setMaxMoq(500);
                  setColdChainOnly(false);
                  setWhoGmpOnly(true);
                  onShowToast('Filters reset to institutional standard', 'refresh');
                }}
                className="text-[11px] font-bold text-[#0047c1] hover:underline uppercase font-mono"
                type="button"
              >
                Reset All
              </button>
            </div>

            {/* Therapeutic Category */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-bold uppercase text-[#434655] tracking-wider block">
                Therapeutic Category
              </label>
              <div className="space-y-1 text-xs text-[#131b2e]">
                {[
                  { name: 'Cardiovascular', count: 142 },
                  { name: 'Antimicrobial & Antibiotics', count: 218 },
                  { name: 'Anti-diabetic & Glycemic', count: 89 },
                  { name: 'Oncology & Cytotoxic', count: 44 },
                  { name: 'Respiratory & Pulmonary', count: 67 }
                ].map((cat) => {
                  const checked = selectedCategories.includes(cat.name);
                  return (
                    <label
                      key={cat.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2f3ff] cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedCategories(selectedCategories.filter((c) => c !== cat.name));
                            } else {
                              setSelectedCategories([...selectedCategories, cat.name]);
                            }
                          }}
                          className="w-4 h-4 rounded text-[#0047c1] focus:ring-[#0047c1]"
                          type="checkbox"
                        />
                        <span>{cat.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#434655]">{cat.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Dosage Form */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold uppercase text-[#434655] tracking-wider block">
                Dosage Form
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'Tablets', label: 'Tablets (120)', icon: 'pill' },
                  { id: 'Injectables', label: 'Injectables', icon: 'vaccines' },
                  { id: 'Syrups', label: 'Syrups (45)', icon: 'water_drop' },
                  { id: 'IV Fluids', label: 'IV Fluids (31)', icon: 'sanitizer' }
                ].map((dose) => {
                  const active = selectedDosage === dose.id;
                  return (
                    <button
                      key={dose.id}
                      onClick={() => setSelectedDosage(active ? 'All' : dose.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        active
                          ? 'bg-[#155eef] text-white shadow-xs'
                          : 'bg-[#f2f3ff] text-[#131b2e] hover:bg-[#eaedff]'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">{dose.icon}</span>
                      <span>{dose.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Regulatory Schedule Restriction */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-bold uppercase text-[#434655] tracking-wider block">
                Regulatory Schedule Class
              </label>
              <div className="space-y-1 text-xs">
                {[
                  { name: 'Schedule H', tag: 'Prescription', tagClass: 'bg-[#ffdad6] text-[#93000a]' },
                  { name: 'Schedule H1', tag: 'Strict Register', tagClass: 'bg-red-100 text-red-700' },
                  { name: 'Schedule X', tag: 'DEA Lock', tagClass: 'bg-gray-200 text-gray-700' },
                  { name: 'General / OTC', tag: 'Open', tagClass: 'bg-[#80f3dd]/40 text-[#006f61]' }
                ].map((sch) => {
                  const checked = selectedSchedules.includes(sch.name);
                  return (
                    <label
                      key={sch.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2f3ff] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedSchedules(selectedSchedules.filter((s) => s !== sch.name));
                            } else {
                              setSelectedSchedules([...selectedSchedules, sch.name]);
                            }
                          }}
                          className="w-4 h-4 rounded text-[#0047c1]"
                          type="checkbox"
                        />
                        <span className="font-semibold">{sch.name}</span>
                      </span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${sch.tagClass}`}>
                        {sch.tag}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Minimum Expiry Shelf-Life */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-bold uppercase text-[#434655] tracking-wider block">
                Minimum Expiry Shelf-Life
              </label>
              <div className="flex flex-col gap-1 text-xs">
                <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#f2f3ff] cursor-pointer">
                  <input
                    checked={expiryFilter === 'gt12'}
                    onChange={() => setExpiryFilter('gt12')}
                    name="exp-shelf"
                    type="radio"
                    className="text-[#0047c1]"
                  />
                  <span>&gt; 12 Months (Hospital Standard)</span>
                </label>
                <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#f2f3ff] cursor-pointer">
                  <input
                    checked={expiryFilter === '6to12'}
                    onChange={() => setExpiryFilter('6to12')}
                    name="exp-shelf"
                    type="radio"
                    className="text-[#0047c1]"
                  />
                  <span>6 – 12 Months (Fast-Track)</span>
                </label>
                <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#f2f3ff] cursor-pointer">
                  <input
                    checked={expiryFilter === 'near'}
                    onChange={() => setExpiryFilter('near')}
                    name="exp-shelf"
                    type="radio"
                    className="text-[#0047c1]"
                  />
                  <span>Near-Expiry (&gt;35% Discount)</span>
                </label>
              </div>
            </div>

            {/* Minimum Order Quantity Range Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">
                  Max Batch MOQ
                </label>
                <span className="font-mono text-xs text-[#0047c1] font-bold">{maxMoq} Units</span>
              </div>
              <input
                className="w-full accent-[#0047c1] h-1.5 bg-[#eaedff] rounded-lg cursor-pointer"
                max={2500}
                min={50}
                step={50}
                type="range"
                value={maxMoq}
                onChange={(e) => setMaxMoq(Number(e.target.value))}
              />
              <div className="flex justify-between font-mono text-[10px] text-[#434655]">
                <span>50 packs</span>
                <span>2,500 packs</span>
              </div>
            </div>

            {/* Cold Chain & Tier */}
            <div className="space-y-2 pt-2 border-t border-[#eaedff]">
              <label className="flex items-center justify-between p-2 rounded-lg bg-[#f2f3ff] cursor-pointer text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006b5d] text-base">ac_unit</span>
                  <span>Cold-Chain Only (2-8°C)</span>
                </div>
                <input
                  checked={coldChainOnly}
                  onChange={(e) => setColdChainOnly(e.target.checked)}
                  type="checkbox"
                  className="rounded text-[#006b5d]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#f2f3ff] cursor-pointer text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0047c1] text-base">verified</span>
                  <span>WHO-GMP Validated Only</span>
                </div>
                <input
                  checked={whoGmpOnly}
                  onChange={(e) => setWhoGmpOnly(e.target.checked)}
                  type="checkbox"
                  className="rounded text-[#0047c1]"
                />
              </label>
            </div>
          </aside>

          {/* RIGHT / MAIN MARKETPLACE INTERFACE (9 cols) */}
          <main className="lg:col-span-9 space-y-4">
            {/* Live Batch Regulatory Alert Banner */}
            <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#80f3dd]/40 text-[#006f61] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#006b5d] uppercase font-mono">
                      Authenticated CDSCO &amp; 20B/21B Gateway
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#80f3dd]/30 text-[#006f61] font-mono text-[10px] font-bold">
                      Real-Time Batch Provenance
                    </span>
                  </div>
                  <p className="text-xs text-[#434655] mt-0.5">
                    Every listed batch contains verifiable Certificate of Analysis (CoA) records, digital temperature
                    loggers, and GS1 barcode tracking.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  onShowToast('Downloading Form 20/21 Hospital Regulatory Mandates...', 'download')
                }
                className="shrink-0 text-xs font-bold text-[#0047c1] hover:underline flex items-center gap-1"
                type="button"
              >
                <span>Download Form 20/21 Mandates</span>
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>

            {/* Search, Sorting & Display Toggle Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#737687] text-lg">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-12 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] placeholder:text-[#737687] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    placeholder="Search by Generic name (e.g. Amoxicillin, Atorvastatin), Brand name, or CAS registry..."
                    type="text"
                  />
                  <span className="absolute right-3 top-2.5 font-mono text-[10px] text-[#434655] bg-[#eaedff] px-1.5 py-0.5 rounded font-bold">
                    ⌘K
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-[#f2f3ff] rounded-xl p-1 border border-[#eaedff]">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white text-[#0047c1] shadow-xs font-bold'
                          : 'text-[#434655] hover:text-[#131b2e]'
                      }`}
                      title="Card View"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">grid_view</span>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                        viewMode === 'table'
                          ? 'bg-white text-[#0047c1] shadow-xs font-bold'
                          : 'text-[#434655] hover:text-[#131b2e]'
                      }`}
                      title="Dense Clinical Table"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">table_rows</span>
                    </button>
                  </div>

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="h-10 bg-[#f2f3ff] text-[#131b2e] text-xs font-medium rounded-xl px-3 border border-[#eaedff] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  >
                    <option value="margin">Sort: Best Bulk Margin (%)</option>
                    <option value="expiry">Sort: Earliest Expiry First</option>
                    <option value="price">Sort: Lowest Unit Price</option>
                    <option value="stock">Sort: Highest Available Stock</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Pill Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] font-bold text-[#434655] uppercase font-mono">Applied:</span>
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaedff] text-[#131b2e] text-[11px]"
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== cat))}
                      className="text-[#434655] hover:text-[#ba1a1a]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                ))}
                {whoGmpOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#80f3dd]/40 text-[#006f61] text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006b5d]"></span>
                    <span>WHO-GMP Validated Only</span>
                    <button
                      onClick={() => setWhoGmpOnly(false)}
                      className="text-[#006f61] hover:text-[#ba1a1a]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                )}
                {coldChainOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dbe1ff] text-[#00174b] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-xs">ac_unit</span>
                    <span>Cold Chain (2°C-8°C)</span>
                    <button
                      onClick={() => setColdChainOnly(false)}
                      className="text-[#00174b] hover:text-[#ba1a1a]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* PRODUCT GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredMedicines.map((med) => {
                  const qty = quantities[med.id] || med.moq;
                  const unitPrice = getTierPrice(med, qty);
                  const totalCost = (qty * unitPrice).toFixed(2);

                  return (
                    <div
                      key={med.id}
                      className="bg-white rounded-2xl shadow-sm border border-[#eaedff] p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        {/* Top Card Bar */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#f2f3ff] flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[#0047c1] text-2xl">
                                {med.dosageForm === 'Injectables'
                                  ? 'science'
                                  : med.dosageForm === 'Tablets'
                                  ? 'medication'
                                  : 'water_drop'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                    med.regulatorySchedule === 'Schedule H1'
                                      ? 'bg-[#ffdad6] text-[#93000a]'
                                      : 'bg-[#eaedff] text-[#003da9]'
                                  }`}
                                >
                                  {med.regulatorySchedule}
                                </span>
                                {med.isColdChain && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#83f6e0] text-[#00201b] font-mono">
                                    2°C – 8°C Cold
                                  </span>
                                )}
                                <span className="font-mono text-[11px] text-[#006b5d] font-bold">
                                  GS1: {med.activeBatch?.gs1Barcode?.slice(0, 8)}...
                                </span>
                              </div>
                              <h2 className="text-base font-bold text-[#131b2e] mt-1">{med.name}</h2>
                              <p className="text-xs text-[#434655] italic">{med.genericName}</p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-mono text-[10px] font-bold flex items-center gap-1 shrink-0">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            CDSCO Verified
                          </span>
                        </div>

                        {/* Supplier & Batch Metadata */}
                        <div className="bg-[#f2f3ff] rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 my-3 font-mono text-xs">
                          <div>
                            <span className="text-[#434655] block text-[10px] uppercase font-sans font-bold">
                              Manufacturer
                            </span>
                            <span className="font-bold text-[#131b2e] truncate block">{med.manufacturer}</span>
                          </div>
                          <div>
                            <span className="text-[#434655] block text-[10px] uppercase font-sans font-bold">
                              Batch LOT
                            </span>
                            <span className="font-bold text-[#0047c1]">{med.activeBatch?.batchNumber}</span>
                          </div>
                          <div>
                            <span className="text-[#434655] block text-[10px] uppercase font-sans font-bold">
                              Expiry Shelf-life
                            </span>
                            <span className="font-bold text-[#006b5d] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#006b5d]"></span>
                              {med.activeBatch?.expiryDate} ({med.activeBatch?.shelfLifeMonths} mo)
                            </span>
                          </div>
                        </div>

                        {/* Bulk Tier Pricing Grid */}
                        <div className="my-3">
                          <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider block mb-1.5">
                            Volume Discount Tiers ({med.unitPack})
                          </span>
                          <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                            {med.volumeTiers?.map((tier, idx) => {
                              const isTierActive =
                                qty >= tier.minQty && (tier.maxQty === null || qty <= tier.maxQty);
                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-xl transition-all ${
                                    isTierActive
                                      ? 'bg-[#155eef]/15 ring-2 ring-[#0047c1] text-[#0047c1]'
                                      : 'bg-[#f2f3ff] text-[#131b2e]'
                                  }`}
                                >
                                  <div className="text-[10px] text-[#434655]">{tier.label}</div>
                                  <div className="font-bold text-sm mt-0.5">${tier.unitPrice.toFixed(2)}</div>
                                  <div className="text-[10px] text-[#006b5d] font-bold">{tier.discountNote}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Card Interactive Footer & Calculator */}
                      <div className="pt-3 border-t border-[#eaedff]">
                        <div className="flex items-center justify-between mb-3 text-xs">
                          <span className="text-[#434655]">
                            Min. Order Qty (MOQ):{' '}
                            <strong className="text-[#131b2e] font-mono">{med.moq} units</strong>
                          </span>
                          <span className="text-[#006b5d] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                            {med.totalStockAvailable?.toLocaleString()} In Stock
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-[#f2f3ff] rounded-xl p-1 border border-[#eaedff]">
                            <button
                              onClick={() => handleQtyChange(med.id, -med.moq, med.moq)}
                              className="w-8 h-8 rounded-lg bg-white text-[#131b2e] flex items-center justify-center font-bold hover:bg-[#eaedff] transition-colors"
                              type="button"
                            >
                              -
                            </button>
                            <input
                              value={qty}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                if (!isNaN(v)) {
                                  setQuantities({ ...quantities, [med.id]: Math.max(med.moq, v) });
                                }
                              }}
                              className="w-16 text-center bg-transparent font-mono text-xs font-bold text-[#131b2e] focus:outline-none"
                              min={med.moq}
                              type="number"
                            />
                            <button
                              onClick={() => handleQtyChange(med.id, med.moq, med.moq)}
                              className="w-8 h-8 rounded-lg bg-white text-[#131b2e] flex items-center justify-center font-bold hover:bg-[#eaedff] transition-colors"
                              type="button"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onAddToPo(med, qty, unitPrice)}
                            className="flex-1 h-10 px-3 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                            <span>Add ${totalCost} to PO</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DENSE CLINICAL TABLE VIEW */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#eaedff] overflow-x-auto">
                <table className="w-full text-left text-xs text-[#131b2e]">
                  <thead className="bg-[#f2f3ff] font-mono text-[11px] text-[#434655] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Medicine &amp; Formulation</th>
                      <th className="py-3.5 px-4">Class</th>
                      <th className="py-3.5 px-4">Active Batch LOT</th>
                      <th className="py-3.5 px-4">Expiry Window</th>
                      <th className="py-3.5 px-4">CDSCO Supplier</th>
                      <th className="py-3.5 px-4">Unit Rate</th>
                      <th className="py-3.5 px-4">MOQ</th>
                      <th className="py-3.5 px-4 text-right">Procure Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaedff]">
                    {filteredMedicines.map((med) => (
                      <tr key={med.id} className="hover:bg-[#f2f3ff]/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#131b2e]">{med.name}</div>
                          <div className="text-[11px] text-[#434655] font-mono">{med.genericName}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#eaedff] text-[#003da9] font-bold">
                            {med.regulatorySchedule}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#0047c1] font-bold">
                          {med.activeBatch?.batchNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#006b5d] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006b5d]"></span>
                            {med.activeBatch?.expiryDate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{med.manufacturer}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                          ${med.baseWholesalePrice.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-mono">{med.moq} units</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onAddToPo(med, med.moq, med.baseWholesalePrice)}
                            className="px-3 py-1.5 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                            type="button"
                          >
                            Quick PO +
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination & Bulk Export Bar */}
            <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-[#434655]">
                <span>
                  Showing <strong>1 - {filteredMedicines.length}</strong> of <strong>320</strong> verified formulations
                </span>
                <span className="w-1 h-1 rounded-full bg-[#737687]"></span>
                <button
                  onClick={() => onShowToast('Exporting catalog quote CSV...', 'download')}
                  className="text-[#0047c1] hover:underline font-bold"
                  type="button"
                >
                  Export CSV Quote
                </button>
              </div>

              <div className="flex items-center gap-1 font-mono">
                <button
                  className="w-8 h-8 rounded-lg bg-[#f2f3ff] text-[#131b2e] flex items-center justify-center hover:bg-[#eaedff] transition-colors disabled:opacity-40"
                  disabled
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-[#155eef] text-white font-bold flex items-center justify-center"
                  type="button"
                >
                  1
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-[#f2f3ff] text-[#131b2e] flex items-center justify-center hover:bg-[#eaedff] transition-colors"
                  type="button"
                >
                  2
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-[#f2f3ff] text-[#131b2e] flex items-center justify-center hover:bg-[#eaedff] transition-colors"
                  type="button"
                >
                  3
                </button>
                <span className="px-1 text-[#737687]">...</span>
                <button
                  className="w-8 h-8 rounded-lg bg-[#f2f3ff] text-[#131b2e] flex items-center justify-center hover:bg-[#eaedff] transition-colors"
                  type="button"
                >
                  12
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-[#f2f3ff] text-[#131b2e] flex items-center justify-center hover:bg-[#eaedff] transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
