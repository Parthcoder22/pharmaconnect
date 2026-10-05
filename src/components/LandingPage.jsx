import React, { useState } from 'react';

export const LandingPage = ({
  medicines,
  currentUser,
  onSelectBuyer,
  onSelectSupplier,
  onRequestAllocation,
  onInspectCoa,
  onOpenAuth,
  onLogout
}) => {
  const [catalogRole, setCatalogRole] = useState('buyer');
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [verifiedBarcode, setVerifiedBarcode] = useState(false);

  const categories = ['All Categories', 'Oncology', 'Critical Care & ICU', 'Vaccines & Biologics', 'Cardiovascular'];

  const filteredMeds = medicines.filter((m) => {
    const matchesCat =
      selectedCategory === 'All' ||
      selectedCategory === 'All Categories' ||
      (m.category && m.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch =
      (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.activeBatch?.batchNumber && m.activeBatch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const faqs = [
    {
      q: 'What statutory drug licenses are necessary to purchase pharmaceuticals on PharmaConnect?',
      a: 'All prospective buyers must submit a valid Drug License issued by their State Licensing Authority: Form 20 (retail sale of drugs other than specified in Schedule C, C1 and X) and Form 21, or institutional hospital pharmacy approvals. For wholesale trading, Form 20B and 21B are required, along with an active GSTIN.'
    },
    {
      q: 'How does the escrow settlement mechanism safeguard buyer payments?',
      a: 'Buyer funds are held in a scheduled bank escrow account. The funds are only disbursed to the manufacturer or seller 24 hours post physical receipt at the hospital store, contingent upon temperature log verification and COA inspection matching the shipment batch.'
    },
    {
      q: 'What happens in case of cold-chain temperature excursion during transit?',
      a: 'Consignments carrying biologicals, insulins, or vaccines use continuous calibrated IoT data loggers. If temperatures exceed specified ranges (e.g., 2°C–8°C for biologics) for cumulative durations exceeding safety allowances, the shipment is rejected at gate, a transit breach report is automatically issued, and the buyer receives a 100% escrow refund or immediate replacement lot.'
    },
    {
      q: 'Can international institutional buyers participate on this exchange?',
      a: 'Yes. PharmaConnect supports export compliance pipelines including WHO-GMP Certificate of Pharmaceutical Product (COPP), legalized export documentation, and customs bonded warehouse clearance for global ministries of health and authorized import consortia.'
    }
  ];

  return (
    <div className="w-full flex flex-col bg-[#faf8ff] text-[#131b2e]">
      {/* Primary Commerce & Exchange Hero Section */}
      <section className="relative w-full pt-6 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
        {currentUser && (
          <div className="bg-[#155eef]/10 border border-[#0047c1]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0047c1] text-white flex items-center justify-center font-bold text-sm">
                {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'PC'}
              </div>
              <div>
                <p className="text-sm font-bold text-[#131b2e]">
                  Signed in as {currentUser.name} ({currentUser.organization || 'Institutional Account'})
                </p>
                <p className="text-xs text-[#434655]">
                  Active Role: <span className="font-semibold text-[#0047c1] uppercase font-mono">{currentUser.role}</span> &bull; GSTIN: {currentUser.gstin || 'Registered'}
                </p>
              </div>
            </div>
            <button
              onClick={currentUser.role === 'supplier' ? onSelectSupplier : onSelectBuyer}
              className="px-4 py-2 bg-[#0047c1] text-white rounded-xl text-xs font-bold hover:bg-[#155eef] transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <span>Go to {currentUser.role === 'supplier' ? 'Supplier Portal' : 'Buyer Hub'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Value Prop & Dual CTA */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#eaedff] text-[#0047c1] text-[11px] font-semibold uppercase tracking-wider shadow-sm">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              India’s Licensed B2B Institutional Pharmaceutical Exchange
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#131b2e] tracking-tight leading-[1.15]">
              Direct institutional drug trade with{' '}
              <span className="text-[#0047c1]">100% digital audit trace.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#434655] max-w-2xl leading-relaxed">
              PharmaConnect bridges verified pharmaceutical manufacturers and authorized wholesale distributors
              with NABH hospitals, clinical chains, and licensed retail pharmacies. Complete cold-chain IoT tracking,
              batch-level Certificate of Analysis (COA), and automated Form 20B/21B compliance.
            </p>

            {/* Dynamic Portal Gateways */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {/* Buyer Portal Card */}
              <div className="group bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff] hover:shadow-md hover:border-[#155eef]/40 transition-all duration-200 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#0047c1]">
                      <span className="material-symbols-outlined">local_hospital</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#eaedff] text-[#434655]">
                      Procurement
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#131b2e] group-hover:text-[#0047c1] transition-colors">
                    Register as Licensed Buyer
                  </h2>
                  <p className="text-xs text-[#434655] leading-relaxed">
                    For Hospitals, Nursing Homes, Polyclinics, and Retail Pharmacy chains with valid Form 20/21.
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#eaedff]">
                  <span className="font-mono text-xs text-[#434655]">GSTIN + Form 20/21</span>
                  <button
                    onClick={onSelectBuyer}
                    className="px-3.5 py-1.5 bg-[#0047c1] text-white rounded-lg text-xs font-semibold hover:bg-[#155eef] transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    <span>{currentUser?.role === 'buyer' ? 'Enter Buyer Console' : currentUser ? 'Switch to Buyer' : 'Sign In as Buyer'}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Supplier Portal Card */}
              <div className="group bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff] hover:shadow-md hover:border-[#006b5d]/40 transition-all duration-200 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-[#83f6e0] flex items-center justify-center text-[#006b5d]">
                      <span className="material-symbols-outlined">precision_manufacturing</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#80f3dd]/40 text-[#006b5d]">
                      Suppliers
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#131b2e] group-hover:text-[#006b5d] transition-colors">
                    Join as Certified Supplier
                  </h2>
                  <p className="text-xs text-[#434655] leading-relaxed">
                    WHO-GMP/CDSCO certified API manufacturers, finished formulation firms, and authorized C&amp;F distributors.
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#eaedff]">
                  <span className="font-mono text-xs text-[#434655]">WHO-GMP / Form 20B/21B</span>
                  <button
                    onClick={onSelectSupplier}
                    className="px-3.5 py-1.5 bg-[#006b5d] text-white rounded-lg text-xs font-semibold hover:bg-[#005046] transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    <span>{currentUser?.role === 'supplier' ? 'Enter Supplier Command' : currentUser ? 'Switch to Supplier' : 'Sign In as Supplier'}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Assurance Badges */}
            <div className="flex flex-wrap items-center gap-5 pt-1 font-mono text-xs text-[#434655]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006b5d] text-base">verified</span>
                <span>Pre-screened Drug License (Form 20B/21B)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006b5d] text-base">ac_unit</span>
                <span>Real-time Cold Chain 2°C–8°C IoT log</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006b5d] text-base">contract</span>
                <span>Escrow settlement on COA release</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Exchange Data Mosaic / Dashboard Snapshot */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-[#eaedff] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f2f3ff] flex items-center justify-center text-[#0047c1]">
                    <span className="material-symbols-outlined text-xl">shield</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#131b2e]">Verified Settlement Node</div>
                    <div className="font-mono text-[11px] text-[#434655]">CDSCO LICENSE REPOSITORY ID #IN-88921</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#83f6e0] text-[#00201b] font-semibold text-[10px] uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006b5d]"></span>
                  Live Escrow
                </span>
              </div>

              {/* Laboratory Verification Graphic */}
              <div className="relative rounded-xl overflow-hidden h-48 bg-[#e2e7ff]">
                <img
                  className="w-full h-full object-cover"
                  alt="Quality control laboratory with testing equipment"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8U8FbnI_Y_i4ptdoHsp6H-RxuIykZRDq_fUFvbhp6lngj8hzt8zTaQwqXBfIh240PHNosmeaFeNyqrgGi0PGk4mifKP28h7BVZKSF6DKK0s42E_CAUdRGOq4_-3qKZMVu4oPx90_9v4bbryJj9zxCKzCjFEHgsbA54ZBbfS2BmJwSoHYNVEq1lqanO22KwrmBt7HzmmgSpqjrjEsbnHjZf0ivXVCUnkLDoFyPOYmRTXhukLso7lZ5"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/90 via-transparent to-transparent flex items-end p-4">
                  <div className="flex items-center justify-between w-full text-white">
                    <div>
                      <span className="text-[10px] block opacity-80 uppercase tracking-widest font-mono">
                        Active Lot Analysis
                      </span>
                      <span className="font-semibold text-xs sm:text-sm">
                        Cefixime 200mg USP Bulk Lot #CF-2024-819
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#006b5d] text-white font-mono text-xs rounded font-bold">
                      COA PASSED
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-Time Metrics Mini-Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-[#f2f3ff] p-3 rounded-xl flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-[#434655]">Cold Chain Integrity</span>
                  <span className="text-xl font-extrabold text-[#131b2e] mt-1 font-mono">99.98%</span>
                  <span className="text-xs text-[#006b5d] font-semibold mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">thermostat</span>
                    +4.2°C Continuous Avg
                  </span>
                </div>
                <div className="bg-[#f2f3ff] p-3 rounded-xl flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-[#434655]">Avg Dispense Dispatch</span>
                  <span className="text-xl font-extrabold text-[#131b2e] mt-1 font-mono">14.2 hrs</span>
                  <span className="text-xs text-[#0047c1] font-semibold mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">local_shipping</span>
                    Express Air Cargo
                  </span>
                </div>
              </div>

              {/* Inline Audit Certificate Verification Bar */}
              <div className="bg-[#eaedff] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0047c1] text-base">qr_code_scanner</span>
                  <span className="font-mono text-xs text-[#131b2e] font-semibold truncate">
                    GS1-128 / LOT-IN-4902-X
                  </span>
                </div>
                <button
                  onClick={() => setVerifiedBarcode(!verifiedBarcode)}
                  className={`text-xs uppercase font-bold px-2 py-1 rounded transition-colors ${
                    verifiedBarcode
                      ? 'bg-[#006b5d] text-white'
                      : 'text-[#0047c1] hover:underline'
                  }`}
                >
                  {verifiedBarcode ? '✓ GS1 Validated' : 'Verify Barcode'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Supply Chain KPI Counter Bar */}
      <section className="w-full bg-[#283044] text-[#eef0ff] py-10 px-4 sm:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d2d9f4]">
              Verified Batches Cleared
            </span>
            <div className="flex items-baseline gap-1 mt-1 font-mono">
              <span className="text-3xl sm:text-4xl text-white font-extrabold">45,000+</span>
            </div>
            <p className="text-xs text-[#d2d9f4] mt-1">GS1 Serialized &amp; QR Tracked</p>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d2d9f4]">
              Monthly Trade Turnover
            </span>
            <div className="flex items-baseline gap-1 mt-1 font-mono">
              <span className="text-3xl sm:text-4xl text-[#83f6e0] font-extrabold">₹180Cr+</span>
            </div>
            <p className="text-xs text-[#d2d9f4] mt-1">B2B Institutional Gross GMV</p>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d2d9f4]">
              Licensed Facilities
            </span>
            <div className="flex items-baseline gap-1 mt-1 font-mono">
              <span className="text-3xl sm:text-4xl text-white font-extrabold">12,000+</span>
            </div>
            <p className="text-xs text-[#d2d9f4] mt-1">NABH Hospitals &amp; Pharmacies</p>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d2d9f4]">
              Statutory Adherence
            </span>
            <div className="flex items-baseline gap-1 mt-1 font-mono">
              <span className="text-3xl sm:text-4xl text-[#b4c5ff] font-extrabold">100%</span>
            </div>
            <p className="text-xs text-[#d2d9f4] mt-1">CDSCO, Form 20B/21B &amp; GSTIN</p>
          </div>
        </div>
      </section>

      {/* Interactive Search & Live Verified Catalog Explorer */}
      <section className="w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header & Search Ribbon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase text-[#0047c1] font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#0047c1]"></span>
              Real-time Institutional Marketplace
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#131b2e] mt-1">
              Live Institutional Bulk Catalog
            </h2>
            <p className="text-sm text-[#434655] max-w-xl mt-1">
              Access manufacturer-direct allocations across critical therapeutic sectors. All shipments carry
              digital test reports (COA) and temperature logging sensors.
            </p>
          </div>

          {/* Role Toggle Preview Bar */}
          <div className="flex items-center bg-[#eaedff] p-1 rounded-xl self-start md:self-auto border border-[#dae2fd]">
            <button
              onClick={() => setCatalogRole('buyer')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                catalogRole === 'buyer'
                  ? 'bg-white text-[#131b2e] shadow-sm'
                  : 'text-[#434655] hover:text-[#131b2e]'
              }`}
            >
              Hospital / Buyer View
            </button>
            <button
              onClick={() => setCatalogRole('supplier')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                catalogRole === 'supplier'
                  ? 'bg-white text-[#131b2e] shadow-sm'
                  : 'text-[#434655] hover:text-[#131b2e]'
              }`}
            >
              Manufacturer / Supplier View
            </button>
          </div>
        </div>

        {/* Therapeutic Categories Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#0047c1]">filter_alt</span>
            <span>Therapeutic Category:</span>
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#0047c1] text-white shadow-xs'
                    : 'bg-[#eaedff] text-[#434655] hover:bg-[#e2e7ff]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Drug Products Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeds.slice(0, 6).map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      med.category.includes('Critical')
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : med.category.includes('Oncology')
                        ? 'bg-[#83f6e0] text-[#00201b]'
                        : 'bg-[#dbe1ff] text-[#00174b]'
                    }`}
                  >
                    {med.category}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#006b5d] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006b5d]"></span>
                    {med.storageCondition}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#131b2e] mt-3">{med.name}</h3>
                <p className="text-xs text-[#434655] mt-0.5">{med.genericName}</p>

                <div className="mt-4 p-3 bg-[#f2f3ff] rounded-xl space-y-1.5 font-mono text-xs text-[#131b2e]">
                  <div className="flex justify-between">
                    <span className="text-[#434655]">Batch ID:</span>
                    <span className="font-bold text-[#0047c1]">
                      {med.activeBatch?.batchNumber || '#LOT-BATCH'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#434655]">Mfg License:</span>
                    <span className="truncate max-w-[170px]">{med.mfgLicense || 'Form 20B/21B'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#434655]">Exp. Date:</span>
                    <span>
                      {med.activeBatch?.expiryDate || '12/2027'} ({med.activeBatch?.shelfLifeMonths || 24} Mo. Shelf Life)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#434655]">Packaging:</span>
                    <span className="truncate max-w-[170px]">{med.unitPack || 'Standard Pack'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#eaedff] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#434655] block uppercase">
                    Institutional MOQ
                  </span>
                  <span className="text-sm font-bold text-[#131b2e] font-mono">
                    {med.moq.toLocaleString()} Units
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onInspectCoa(med)}
                    className="p-2 rounded-lg bg-[#eaedff] text-[#131b2e] hover:bg-[#e2e7ff] transition-colors"
                    title="Inspect Certificate of Analysis"
                  >
                    <span className="material-symbols-outlined text-sm">description</span>
                  </button>
                  <button
                    onClick={() => onRequestAllocation(med)}
                    className="px-3.5 py-2 rounded-lg bg-[#0047c1] text-white text-xs font-semibold hover:bg-[#155eef] transition-colors shadow-sm"
                  >
                    Request Allocation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Verified Cold-Chain Assurance Banner */}
        <div className="bg-[#eaedff] p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-[#dae2fd]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#006b5d] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-2xl">device_thermostat</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-[#131b2e]">
                Automated Temp-Logger Handshake at Delivery
              </h4>
              <p className="text-xs sm:text-sm text-[#434655]">
                Every sensitive consignment includes an active Bluetooth/Cellular telemetry logger. If
                temperature deviates outside 2°C–8°C threshold for &gt;15 minutes, goods are quarantined
                automatically with instant escrow reimbursement.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectSupplier()}
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-white text-[#131b2e] text-xs font-bold shadow-sm hover:bg-[#faf8ff] transition-colors shrink-0 border border-[#c3c6d8]"
          >
            Review Cold-Chain SOP
          </button>
        </div>
      </section>

      {/* Dual Onboarding Pipeline Architecture Section */}
      <section className="w-full py-16 px-4 sm:px-8 bg-[#f2f3ff] border-y border-[#eaedff]">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase text-[#006b5d] tracking-wider font-mono">
              Statutory Verification Workflows
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mt-1">
              Dual-Sided Verification Gates
            </h2>
            <p className="text-sm sm:text-base text-[#434655] mt-2">
              Strict compliance filters protect hospital formularies and legitimate manufacturers from counterfeit or
              substandard batches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hospital & Buyer Onboarding */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#eaedff]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#0047c1]">
                    <span className="material-symbols-outlined">domain</span>
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-[#131b2e]">Hospital &amp; Pharmacy Intake</h3>
                    <span className="font-mono text-[11px] text-[#434655]">FORM 20 &amp; 21 REGISTRATION</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#eaedff] text-xs text-[#0047c1] font-bold">
                  24-Hour Approval
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#dbe1ff] text-[#0047c1] flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 font-bold">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#131b2e]">
                      Drug Retail / Institutional License Upload
                    </div>
                    <p className="text-xs text-[#434655]">
                      Provide State FDA Form 20 or Form 21 license details with valid Registered Pharmacist credentials.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#dbe1ff] text-[#0047c1] flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#131b2e]">
                      GSTIN &amp; PAN Automated Cross-Check
                    </div>
                    <p className="text-xs text-[#434655]">
                      Instant statutory clearance via GSTN API to confirm operational compliance and trade viability.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#dbe1ff] text-[#0047c1] flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 font-bold">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#131b2e]">Institutional Formulary Access</div>
                    <p className="text-xs text-[#434655]">
                      Unrestricted purchasing with Escrow payment holding, credit terms, and batch reservation privileges.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-[#eaedff] bg-[#f2f3ff] p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs text-[#434655]">Are you an authorized hospital procurement head?</span>
                <button
                  onClick={onSelectBuyer}
                  className="px-4 py-2 bg-[#0047c1] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#155eef] transition-colors"
                >
                  Begin Buyer KYC
                </button>
              </div>
            </div>

            {/* Supplier / Manufacturer Intake */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#eaedff]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#83f6e0] flex items-center justify-center text-[#006b5d]">
                    <span className="material-symbols-outlined">factory</span>
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-[#131b2e]">Manufacturer &amp; C&amp;F Intake</h3>
                    <span className="font-mono text-[11px] text-[#434655]">CDSCO / FORM 20B &amp; 21B CERTIFIED</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#80f3dd]/40 text-xs text-[#006b5d] font-bold">
                  Multi-tier Audit
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#83f6e0] text-[#006b5d] flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 font-bold">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#131b2e]">
                      Manufacturing License &amp; WHO-GMP Validation
                    </div>
                    <p className="text-xs text-[#434655]">
                      Submission of Form 25/28 manufacturing licenses, Schedule M audits, and stability test documentation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#83f6e0] text-[#006b5d] flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#131b2e]">
                      GS1 Barcode Serial Master Enrollment
                    </div>
                    <p className="text-xs text-[#434655]">
                      Registration of secondary and tertiary packaging data matrices to ensure tamper-proof downstream tracking.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#83f6e0] text-[#006b5d] flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 font-bold">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#131b2e]">
                      Nationwide Wholesale Distribution Node
                    </div>
                    <p className="text-xs text-[#434655]">
                      Direct listing to 12,000+ hospital procurement groups with guaranteed 48-hr escrow settlement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-[#eaedff] bg-[#f2f3ff] p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs text-[#434655]">Looking to liquidate lots or expand institutional reach?</span>
                <button
                  onClick={onSelectSupplier}
                  className="px-4 py-2 bg-[#006b5d] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#005046] transition-colors"
                >
                  Apply as Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Regulatory Traceability Showcase */}
      <section className="w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <span className="text-xs font-bold uppercase text-[#0047c1] tracking-wider font-mono">
            Zero Counterfeit Tolerance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
            Traceability from Formulation to Ward
          </h2>
          <p className="text-sm text-[#434655] leading-relaxed">
            In strict compliance with National Pharmaceutical Pricing Authority (NPPA) ceiling caps and CDSCO
            serial tracking directives, every batch transferred across PharmaConnect carries an immutable digital
            dossier.
          </p>

          <div className="space-y-3 mt-2">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-[#eaedff] flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#0047c1]">
                <span className="material-symbols-outlined text-lg">verified</span>
              </span>
              <div>
                <div className="text-xs font-bold text-[#131b2e]">Digital Certificate of Analysis (COA)</div>
                <div className="text-[11px] text-[#434655]">
                  Signed by Government Approved Testing Laboratory before dispatch.
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-sm border border-[#eaedff] flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#006b5d]">
                <span className="material-symbols-outlined text-lg">barcode_scanner</span>
              </span>
              <div>
                <div className="text-xs font-bold text-[#131b2e]">GS1 2D DataMatrix Tracking</div>
                <div className="text-[11px] text-[#434655]">
                  Complete carton-level visibility prevents diversion and counterfeit entry.
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-sm border border-[#eaedff] flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#131b2e]">
                <span className="material-symbols-outlined text-lg">lock</span>
              </span>
              <div>
                <div className="text-xs font-bold text-[#131b2e]">Regulatory Escrow System</div>
                <div className="text-[11px] text-[#434655]">
                  Funds are unlocked only upon physical receipt and quality verification.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {/* Visual Component: Traceability Dossier Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-[#0047c1] border-y border-r border-[#eaedff]">
            <div className="flex items-center justify-between pb-4 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0047c1]">lab_profile</span>
                <span className="font-bold text-sm text-[#131b2e]">Immutable Consignment Passport</span>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#e2e7ff] text-[#0047c1] font-semibold">
                HASH: e4f9810a9b
              </span>
            </div>

            {/* Flow Pipeline Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
              <div className="p-3 bg-[#f2f3ff] rounded-xl border border-[#eaedff]">
                <span className="text-[10px] font-mono text-[#006b5d] font-bold">1. ORIGIN</span>
                <div className="text-xs font-bold text-[#131b2e] mt-1">Sun Pharma Hazira Plant</div>
                <div className="font-mono text-[10px] text-[#434655] mt-0.5">DL: G/25/1109</div>
                <span className="mt-2 inline-block px-1.5 py-0.5 rounded bg-[#83f6e0] text-[10px] text-[#00201b] font-bold">
                  Passed Assay 99.8%
                </span>
              </div>

              <div className="p-3 bg-[#f2f3ff] rounded-xl border border-[#eaedff]">
                <span className="text-[10px] font-mono text-[#0047c1] font-bold">2. TRANSIT</span>
                <div className="text-xs font-bold text-[#131b2e] mt-1">Cold-Link Logix Reefer</div>
                <div className="font-mono text-[10px] text-[#434655] mt-0.5">Sensor ID #CL-4410</div>
                <span className="mt-2 inline-block px-1.5 py-0.5 rounded bg-[#dbe1ff] text-[10px] text-[#00174b] font-bold">
                  Steady 3.8°C (OK)
                </span>
              </div>

              <div className="p-3 bg-[#f2f3ff] rounded-xl border border-[#eaedff]">
                <span className="text-[10px] font-mono text-[#131b2e] font-bold">3. DESTINATION</span>
                <div className="text-xs font-bold text-[#131b2e] mt-1">Apollo Medics ICU Store</div>
                <div className="font-mono text-[10px] text-[#434655] mt-0.5">NABH #H-2018-091</div>
                <span className="mt-2 inline-block px-1.5 py-0.5 rounded bg-[#eaedff] text-[10px] text-[#434655] font-bold">
                  Awaiting Inward Check
                </span>
              </div>
            </div>

            {/* Laboratory Specimen Visual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#eaedff] p-4 rounded-xl">
              <div className="rounded-lg overflow-hidden h-28 bg-[#d2d9f4]">
                <img
                  className="w-full h-full object-cover"
                  alt="Vials in cold chain medical refrigeration"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3XSonp1fjKW5i251LGJggaVm9BDOkflIV5aJN7SOW_pJkTBkZ-jUKjA5xkMWdZjxLevvqlJN3NhEGG29DjVT2EzB509qZpdyEHEUSRhebr_bXvAQB7YLJU4kU6u7bXkxnynR-nWac8XKR6fwt7HLkn-WkW4nW7dRM9rT2NHuf1OXQQtufL5xDoHRMQHLkoI6PzQVobXjsgyQ0E_EoKqstY0uqwsWIhFQUfaW1HwYn7kPXhpVWlBN7"
                />
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <div className="font-bold text-xs text-[#131b2e]">USP/IP Testing Standards Confirmed</div>
                <p className="text-[11px] text-[#434655]">
                  Sterility, bacterial endotoxins, particulate matter, and pH limits meet CDSCO Schedule M protocols.
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-[#006b5d] text-base">check_circle</span>
                  <span className="font-mono text-[11px] text-[#131b2e] font-semibold">
                    Signed by Chief Analytical Chemist
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory & Procurement FAQ Accordion */}
      <section className="w-full py-16 px-4 sm:px-8 bg-[#f2f3ff] border-t border-[#eaedff]">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="text-center">
            <span className="text-xs uppercase font-bold text-[#0047c1] font-mono tracking-wider">
              Regulatory Advisory
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mt-1">
              Frequently Asked Institutional Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#434655] mt-1">
              Key legal, taxation, and logistics clarifications for healthcare administrators.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 shadow-sm border border-[#eaedff] transition-all"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <span className="font-bold text-sm text-[#131b2e] pr-4">{faq.q}</span>
                  <span className="material-symbols-outlined text-[#434655] transition-transform">
                    {activeFaq === idx ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
                {activeFaq === idx && (
                  <div className="mt-3 pt-3 border-t border-[#eaedff] text-[#434655] text-xs leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fast-Track Institutional Conversion Gate */}
      <section className="w-full py-16 px-4 sm:px-8 bg-[#dae2fd]">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-md border border-[#c3c6d8] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-xl">
            <span className="text-xs font-bold uppercase text-[#0047c1] font-mono tracking-wider">
              Fast-Track Verification Active
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
              Ready to upgrade your pharmaceutical supply chain?
            </h2>
            <p className="text-xs sm:text-sm text-[#434655]">
              Connect your organization to 12,000+ verified healthcare institutions and certified manufacturers today.
              Digital compliance review completed in &lt; 24 business hours.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="font-mono text-xs text-[#434655] flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[#006b5d] text-base">check_circle</span>
                No upfront listing fee
              </span>
              <span className="font-mono text-xs text-[#434655] flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[#006b5d] text-base">check_circle</span>
                100% GST compliant invoicing
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onSelectBuyer}
              className="px-6 py-3 bg-[#0047c1] text-white text-xs font-bold rounded-xl hover:bg-[#155eef] transition-colors shadow-md text-center"
            >
              Register as Licensed Buyer
            </button>
            <button
              onClick={onSelectSupplier}
              className="px-6 py-3 bg-[#eaedff] text-[#131b2e] text-xs font-bold rounded-xl hover:bg-[#dbe1ff] transition-colors text-center border border-[#c3c6d8]"
            >
              Join as Certified Supplier
            </button>
          </div>
        </div>
      </section>

      {/* Regulatory Footer Details */}
      <footer className="w-full bg-[#e2e7ff] text-[#131b2e] py-8 px-4 sm:px-8 border-t border-[#dae2fd]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#434655]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006b5d]"></span>
            <span>PharmaConnect Institutional Exchange • Registered under Drugs &amp; Cosmetics Act 1940</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-mono text-[11px]">
            <span>CDSCO REG: #IN-CDSCO-DEL-2023-B2B</span>
            <span>ISO 9001:2015 &amp; ISO 13485 CERTIFIED</span>
            <span>DATA ENCRYPTION: 256-BIT SSL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
