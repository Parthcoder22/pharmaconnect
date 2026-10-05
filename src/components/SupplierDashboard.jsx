import React, { useState } from 'react';

export const SupplierDashboard = ({
  orders,
  coldChainLogs,
  onAcceptOrder,
  onRejectOrder,
  onAddSku,
  onQuarantineBatch,
  onViewOrderDetails,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState('dispatch');
  const [tableFilter, setTableFilter] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // SKU Form state
  const [skuForm, setSkuForm] = useState({
    genericName: '',
    brandName: '',
    dosageForm: 'inj',
    strength: '',
    batchNumber: '',
    expiryDate: '',
    storageCondition: 'cold',
    unitPrice: '',
    moq: '',
    gstRate: '12'
  });


  const handleCreateSku = (e) => {
    e.preventDefault();
    if (!skuForm.genericName || !skuForm.brandName || !skuForm.batchNumber) {
      onShowToast('Please fill all mandatory SKU details', 'priority_high');
      return;
    }
    onAddSku(skuForm);
    setIsDrawerOpen(false);
    onShowToast(`SKU ${skuForm.brandName} added and broadcasted to exchange catalog`, 'verified');
    setSkuForm({
      genericName: '',
      brandName: '',
      dosageForm: 'inj',
      strength: '',
      batchNumber: '',
      expiryDate: '',
      storageCondition: 'cold',
      unitPrice: '',
      moq: '',
      gstRate: '12'
    });
  };

  return (
    <div className="flex flex-col w-full bg-[#faf8ff] pb-16">
      {/* Compliance & System Live Health Bar */}
      <div className="w-full bg-[#f2f3ff] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-[#eaedff]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-xs border border-[#eaedff]">
            <span className="w-2 h-2 rounded-full bg-[#006b5d] animate-ping"></span>
            <span className="text-[11px] font-bold text-[#006b5d] uppercase font-mono">
              GS1 Track &amp; Trace: Synced
            </span>
          </div>
          <span className="hidden sm:inline-block font-mono text-xs text-[#434655]">
            CDSCO / FDA Node ID: <strong>IND-MH-40194</strong>
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-xs text-[#434655]">
            <span className="material-symbols-outlined text-sm text-[#006b5d]">thermostat</span>
            Active Cold Chain Loggers:{' '}
            <strong className="text-[#131b2e] font-semibold">28 Real-time Probes Active</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0047c1] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:bg-[#155eef] transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-base">add_box</span>
            <span>Quick Add SKU Listing</span>
          </button>
          <button
            onClick={() =>
              onShowToast('Exporting FDA/cGMP compliant inventory manifest (CSV)...', 'description')
            }
            className="inline-flex items-center gap-2 bg-white text-[#131b2e] border border-[#eaedff] px-3 py-2 rounded-lg text-xs font-medium shadow-xs hover:bg-[#f2f3ff] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-base text-[#434655]">download</span>
            <span className="hidden md:inline">Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="px-4 sm:px-8 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Header / Context Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#00174b] uppercase bg-[#dbe1ff] px-2 py-0.5 rounded">
                Authorized Manufacturer Tier 1
              </span>
              <span className="font-mono text-xs text-[#434655]">Updated: Today, 14:32 IST</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
              Supplier Enterprise Command
            </h1>
            <p className="text-xs sm:text-sm text-[#434655] mt-0.5">
              Biopharma formulation inventory, Cold-chain transit logs, and CDSCO Form 20B/21B order authorizations
            </p>
          </div>

          {/* Quick Operational Indicators */}
          <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl shadow-sm border border-[#eaedff]">
            <div className="px-3 py-1 flex flex-col text-right">
              <span className="text-[10px] font-bold text-[#434655] uppercase">Settlement Cycle</span>
              <span className="font-mono text-xs text-[#006b5d] font-bold">T+1 Auto-NEFT Active</span>
            </div>
            <div className="h-8 w-px bg-[#eaedff]"></div>
            <div className="px-3 py-1 flex flex-col text-right">
              <span className="text-[10px] font-bold text-[#434655] uppercase">Tax Verification</span>
              <span className="font-mono text-xs text-[#0047c1] font-bold">GSTIN 27AAACR1209Q1ZM</span>
            </div>
          </div>
        </div>

        {/* Primary Mission-Critical KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Active SKUs */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">Active SKUs</span>
              <span className="material-symbols-outlined text-[#0047c1] text-lg bg-[#f2f3ff] p-1.5 rounded-lg">
                inventory_2
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] font-mono">1,482</div>
              <div className="flex items-center gap-1 text-xs text-[#006b5d] font-semibold mt-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+38 active this month</span>
              </div>
            </div>
            <div className="w-full bg-[#eaedff] mt-3 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0047c1] h-full rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>

          {/* Metric 2: Dispatched In Transit */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">In Cold Transit</span>
              <span className="material-symbols-outlined text-[#006b5d] text-lg bg-[#80f3dd]/40 p-1.5 rounded-lg">
                local_shipping
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] font-mono">42</div>
              <div className="flex items-center gap-1 text-xs text-[#006b5d] font-semibold mt-1">
                <span className="material-symbols-outlined text-sm">ac_unit</span>
                <span>100% telemetry locked</span>
              </div>
            </div>
            <div className="w-full bg-[#eaedff] mt-3 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#006b5d] h-full rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>

          {/* Metric 4: Monthly Net Revenue */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">Monthly Net Rev</span>
              <span className="material-symbols-outlined text-[#0047c1] text-lg bg-[#f2f3ff] p-1.5 rounded-lg">
                payments
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] font-mono">₹2.48 Cr</div>
              <div className="flex items-center gap-1 text-xs text-[#006b5d] font-semibold mt-1">
                <span className="material-symbols-outlined text-sm">north_east</span>
                <span>+14.2% MoM</span>
              </div>
            </div>
            {/* Micro Sparkline SVG */}
            <svg className="w-full h-4 mt-2 text-[#0047c1]" fill="none" viewBox="0 0 100 20">
              <path
                d="M0 16 L20 12 L40 14 L60 8 L80 10 L100 2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </div>

          {/* Metric 5: Critical Low Stock */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">Low Stock Alert</span>
              <span className="material-symbols-outlined text-[#465366] text-lg bg-[#e2e7ff] p-1.5 rounded-lg">
                warning
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] font-mono">
                6 <span className="text-sm font-normal text-[#434655]">SKUs</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#434655] font-medium mt-1">
                <span className="material-symbols-outlined text-sm">production_quantity_limits</span>
                <span>Below buffer threshold</span>
              </div>
            </div>
            <div className="w-full bg-[#eaedff] mt-3 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#5e6b7f] h-full rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

        </div>

        {/* Central Interactive Workspace with Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#eaedff] overflow-hidden">
          {/* Navigation Tabs Bar */}
          <div className="px-4 sm:px-6 pt-3 bg-[#f2f3ff] flex flex-wrap items-center justify-between gap-4 border-b border-[#eaedff]">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('dispatch')}
                className={`px-4 py-3 text-xs sm:text-sm font-bold relative transition-colors flex items-center gap-2 ${
                  activeTab === 'dispatch' ? 'text-[#0047c1]' : 'text-[#434655] hover:text-[#131b2e]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-base">ac_unit</span>
                <span>Live Dispatch &amp; Logistics</span>
                <span className="bg-[#80f3dd] text-[#006f61] font-mono px-2 py-0.5 rounded-full text-[10px]">
                  {coldChainLogs.length} Active
                </span>
                {activeTab === 'dispatch' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0047c1] rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('top_skus')}
                className={`px-4 py-3 text-xs sm:text-sm font-bold relative transition-colors flex items-center gap-2 ${
                  activeTab === 'top_skus' ? 'text-[#0047c1]' : 'text-[#434655] hover:text-[#131b2e]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-base">insights</span>
                <span>Top Moving Formulations</span>
                {activeTab === 'top_skus' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0047c1] rounded-full"></span>
                )}
              </button>
            </div>

            {/* Filter & Search Quick Tools */}
            <div className="flex items-center gap-2 pb-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#737687] text-sm">
                  filter_list
                </span>
                <input
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="h-8 pl-8 pr-3 bg-white rounded-lg text-xs text-[#131b2e] placeholder:text-[#737687] focus:outline-none focus:ring-1 focus:ring-[#0047c1] border border-[#eaedff]"
                  placeholder="Filter current view..."
                  type="text"
                />
              </div>
              <button
                onClick={() => onShowToast('Synced with CDSCO wholesale repository node.', 'refresh')}
                className="p-1.5 bg-white border border-[#eaedff] rounded-lg text-[#434655] hover:text-[#131b2e]"
                title="Refresh Live Data"
                type="button"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
            </div>
          </div>

          {/* TAB 2: Live Dispatch & Logistics */}
          {activeTab === 'dispatch' && (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dispatch Transit List */}
                <div className="lg:col-span-2 space-y-3">
                  {coldChainLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 bg-[#f2f3ff] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#eaedff] hover:bg-[#eaedff]/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-[#0047c1] font-bold">
                            {log.shipmentId}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              log.status === 'optimal'
                                ? 'bg-[#006b5d] text-white'
                                : 'bg-[#ba1a1a] text-white'
                            }`}
                          >
                            Temp: {log.currentTemp}°C
                          </span>
                          <span className="font-mono text-[11px] text-[#434655]">{log.beaconId}</span>
                        </div>
                        <div className="font-bold text-sm text-[#131b2e]">{log.productName}</div>
                        <div className="text-xs text-[#434655]">
                          Destination: {log.destination} • Carrier: {log.carrier}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-1 shrink-0">
                        <span className="text-xs font-bold text-[#006b5d]">In Transit: ETA {log.eta}</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-[#434655]">Range: 2.0°C - 8.0°C</span>
                          <button
                            onClick={() =>
                              onShowToast(`Downloading verified thermal log for ${log.shipmentId}...`, 'ac_unit')
                            }
                            className="text-[#0047c1] hover:underline font-mono text-[11px] font-semibold"
                            type="button"
                          >
                            View Audit Log
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real-Time Telemetry Curve Card */}
                <div className="bg-[#f2f3ff] p-5 rounded-2xl flex flex-col justify-between border border-[#eaedff]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">
                        Active Thermal Telemetry
                      </span>
                      <span className="font-mono text-xs text-[#006b5d] font-bold">Shipment #9942</span>
                    </div>
                    <p className="text-xs text-[#434655] mt-1">Real-time Bluetooth probe feed every 180s</p>

                    {/* Scaled SVG Thermal Chart */}
                    <div className="my-4 p-3 bg-white rounded-xl border border-[#eaedff]">
                      <svg className="w-full h-32" fill="none" viewBox="0 0 300 120">
                        {/* Permissible Zone (2°C - 8°C) */}
                        <rect fill="rgba(0, 107, 93, 0.08)" height="80" rx="4" width="300" x="0" y="20"></rect>
                        <line
                          stroke="#006b5d"
                          strokeDasharray="3,3"
                          strokeWidth="1"
                          x1="0"
                          x2="300"
                          y1="20"
                          y2="20"
                        ></line>
                        <line
                          stroke="#006b5d"
                          strokeDasharray="3,3"
                          strokeWidth="1"
                          x1="0"
                          x2="300"
                          y1="100"
                          y2="100"
                        ></line>
                        <text fill="#006b5d" fontFamily="JetBrains Mono" fontSize="9" x="5" y="16">
                          Max Target 8°C
                        </text>
                        <text fill="#006b5d" fontFamily="JetBrains Mono" fontSize="9" x="5" y="115">
                          Min Target 2°C
                        </text>
                        {/* Live Reading Curve */}
                        <path
                          d="M 10,65 Q 60,60 110,50 T 190,55 T 250,52 T 290,48"
                          fill="none"
                          stroke="#155eef"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                        ></path>
                        {/* Current Ping Marker */}
                        <circle cx="290" cy="48" fill="#155eef" r="4"></circle>
                        <circle cx="290" cy="48" fill="#155eef" opacity="0.3" r="8"></circle>
                      </svg>
                      <div className="flex items-center justify-between font-mono text-[10px] text-[#434655] mt-2">
                        <span>Start (Pune)</span>
                        <span>Satara Hub</span>
                        <span>Belgaum Check</span>
                        <span className="font-bold text-[#0047c1]">Bengaluru (4.2°C)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl flex items-center justify-between border border-[#eaedff]">
                    <span className="text-xs font-medium text-[#131b2e]">WHO TRS 961 Annex 9 Guidelines</span>
                    <span className="font-mono text-xs text-[#006b5d] font-bold">Compliant ✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TAB 4: Top Moving Formulations */}
          {activeTab === 'top_skus' && (
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#f2f3ff] p-4 rounded-2xl border border-[#eaedff] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#0047c1]">Rank #1 Volume</span>
                  <span className="font-mono text-xs text-[#006b5d] font-bold">+22.4%</span>
                </div>
                <div className="text-sm font-bold text-[#131b2e]">Amoxicillin + Clavulanate 625mg</div>
                <p className="text-xs text-[#434655]">Sold this month: 142,000 strips</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#eaedff]">
                  <span className="font-mono text-xs font-bold text-[#131b2e]">Rev: ₹46.8 Lakh</span>
                  <span className="bg-[#80f3dd]/50 text-[#006f61] font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                    Margin: 19.4%
                  </span>
                </div>
              </div>

              <div className="bg-[#f2f3ff] p-4 rounded-2xl border border-[#eaedff] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#0047c1]">Rank #2 Volume</span>
                  <span className="font-mono text-xs text-[#006b5d] font-bold">+18.1%</span>
                </div>
                <div className="text-sm font-bold text-[#131b2e]">Telmisartan 40mg + Amlodipine 5mg</div>
                <p className="text-xs text-[#434655]">Sold this month: 98,500 strips</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#eaedff]">
                  <span className="font-mono text-xs font-bold text-[#131b2e]">Rev: ₹31.2 Lakh</span>
                  <span className="bg-[#80f3dd]/50 text-[#006f61] font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                    Margin: 24.0%
                  </span>
                </div>
              </div>

              <div className="bg-[#f2f3ff] p-4 rounded-2xl border border-[#eaedff] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#0047c1]">Rank #3 Volume</span>
                  <span className="font-mono text-xs text-[#006b5d] font-bold">+15.7%</span>
                </div>
                <div className="text-sm font-bold text-[#131b2e]">Metformin HCl 500mg ER</div>
                <p className="text-xs text-[#434655]">Sold this month: 185,000 strips</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#eaedff]">
                  <span className="font-mono text-xs font-bold text-[#131b2e]">Rev: ₹28.5 Lakh</span>
                  <span className="bg-[#80f3dd]/50 text-[#006f61] font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                    Margin: 14.8%
                  </span>
                </div>
              </div>

              <div className="bg-[#f2f3ff] p-4 rounded-2xl border border-[#eaedff] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#0047c1]">Rank #4 Volume</span>
                  <span className="font-mono text-xs text-[#006b5d] font-bold">+31.2%</span>
                </div>
                <div className="text-sm font-bold text-[#131b2e]">Atorvastatin Calcium 20mg</div>
                <p className="text-xs text-[#434655]">Sold this month: 84,200 strips</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#eaedff]">
                  <span className="font-mono text-xs font-bold text-[#131b2e]">Rev: ₹25.3 Lakh</span>
                  <span className="bg-[#80f3dd]/50 text-[#006f61] font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                    Margin: 22.1%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secondary Split: Warehouse Activity Stream & Quality Assurance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Dispensing Activity Stream */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#131b2e]">cGMP Cleanroom &amp; Dispatch Stream</h2>
                <p className="text-xs text-[#434655]">Automated barcode scanning logs and release certificates</p>
              </div>
              <span className="font-mono text-[10px] bg-[#eaedff] text-[#434655] px-2.5 py-1 rounded font-semibold">
                21 CFR Part 11 Audit Trail
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-[#f2f3ff] rounded-xl border border-[#eaedff]">
                <div className="p-2 bg-[#006b5d] text-white rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-base">verified</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#131b2e]">
                      CoA Digitally Signed for Batch #CFL-9021
                    </span>
                    <span className="font-mono text-[11px] text-[#434655]">8 mins ago</span>
                  </div>
                  <p className="text-xs text-[#434655] mt-0.5">
                    Ciprofloxacin 500mg Tablets passed dissolution and microbiological purity assay test.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#f2f3ff] rounded-xl border border-[#eaedff]">
                <div className="p-2 bg-[#0047c1] text-white rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#131b2e]">
                      Pallet Aggregation Complete (SSCC Serialized)
                    </span>
                    <span className="font-mono text-[11px] text-[#434655]">24 mins ago</span>
                  </div>
                  <p className="text-xs text-[#434655] mt-0.5">
                    Dispatched 60 Master Shippers of Omeprazole 20mg under Invoice #INV-2025-8812.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#f2f3ff] rounded-xl border border-[#eaedff]">
                <div className="p-2 bg-[#80f3dd] text-[#006f61] rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-base">fact_check</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#131b2e]">Buyer KYC Auto-Validated</span>
                    <span className="font-mono text-[11px] text-[#434655]">1 hour ago</span>
                  </div>
                  <p className="text-xs text-[#434655] mt-0.5">
                    Manipal Hospitals Procurement Node successfully checked against Central Drugs Licensing Portal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Inspection Readiness Gauge */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-[#131b2e]">Regulatory Audit Score</h2>
                <span className="bg-[#80f3dd]/40 text-[#006f61] font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  Zero Defect Tier
                </span>
              </div>
              <p className="text-xs text-[#434655]">
                System-calculated inspection readiness index across all formulation batches.
              </p>

              {/* Donut Score Indicator */}
              <div className="flex items-center justify-center my-6">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="transparent" r="40" stroke="#eaedff" strokeWidth="8"></circle>
                    <circle
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      stroke="#006b5d"
                      strokeDasharray="251.2"
                      strokeDashoffset="12.5"
                      strokeLinecap="round"
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold text-[#131b2e] leading-none font-mono">95%</span>
                    <span className="font-mono text-[#006b5d] font-bold text-[10px] mt-1">Audit Ready</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#434655]">Batch Manufacturing Records (BMR)</span>
                  <span className="font-mono font-bold text-[#006b5d]">99.2% Filed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434655]">Certificate of Analysis (CoA)</span>
                  <span className="font-mono font-bold text-[#006b5d]">100% Signed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434655]">Cold Chain Continuity Ratio</span>
                  <span className="font-mono font-bold text-[#006b5d]">98.8% Nominal</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onShowToast('Compiling Form 20B audit dossier with e-signatures... Download ready.', 'download')
              }
              className="w-full mt-6 py-2.5 bg-[#eaedff] text-[#0047c1] text-xs font-bold rounded-xl hover:bg-[#dbe1ff] transition-colors flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-base">description</span>
              <span>Generate CDSCO Inspection Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Over Drawer: Quick Add Medicine Listing */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-[#283044]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          ></div>
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="p-6 bg-[#f2f3ff] flex items-center justify-between border-b border-[#eaedff]">
                <div>
                  <h3 className="text-base font-bold text-[#131b2e]">Add Medicine Listing</h3>
                  <p className="text-xs text-[#434655]">Publish high-grade pharmaceutical SKU to exchange</p>
                </div>
                <button
                  className="p-1.5 text-[#434655] hover:text-[#131b2e] rounded-lg"
                  onClick={() => setIsDrawerOpen(false)}
                  type="button"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateSku} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                    Generic / API Name *
                  </label>
                  <input
                    value={skuForm.genericName}
                    onChange={(e) => setSkuForm({ ...skuForm, genericName: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-lg text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    placeholder="e.g. Meropenem Trihydrate IP"
                    required
                    type="text"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                    Brand / Trade Name *
                  </label>
                  <input
                    value={skuForm.brandName}
                    onChange={(e) => setSkuForm({ ...skuForm, brandName: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-lg text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    placeholder="e.g. MEROFAST 1000 IV"
                    required
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                      Dosage Form *
                    </label>
                    <select
                      value={skuForm.dosageForm}
                      onChange={(e) => setSkuForm({ ...skuForm, dosageForm: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-lg text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    >
                      <option value="inj">Injection / IV Vial</option>
                      <option value="tab">Tablet / Film-coated</option>
                      <option value="cap">Capsule / Softgel</option>
                      <option value="syr">Syrup / Suspension</option>
                      <option value="inf">Infusion Bottle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                      Strength *
                    </label>
                    <input
                      value={skuForm.strength}
                      onChange={(e) => setSkuForm({ ...skuForm, strength: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-lg text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                      placeholder="e.g. 1000 mg"
                      required
                      type="text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                      Batch Number *
                    </label>
                    <input
                      value={skuForm.batchNumber}
                      onChange={(e) => setSkuForm({ ...skuForm, batchNumber: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-lg text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                      placeholder="e.g. B-99824"
                      required
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                      Expiry Date *
                    </label>
                    <input
                      value={skuForm.expiryDate}
                      onChange={(e) => setSkuForm({ ...skuForm, expiryDate: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-lg text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                      required
                      type="date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                    Storage Condition *
                  </label>
                  <select
                    value={skuForm.storageCondition}
                    onChange={(e) => setSkuForm({ ...skuForm, storageCondition: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-lg text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  >
                    <option value="cold">Cold Chain (2°C to 8°C) - Regulated Transit</option>
                    <option value="controlled">Controlled Room Temp (15°C to 25°C)</option>
                    <option value="frozen">Deep Freeze (-20°C)</option>
                    <option value="dry">Dry Ambient &lt; 30°C</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                      Wholesale Unit Price (INR)
                    </label>
                    <input
                      value={skuForm.unitPrice}
                      onChange={(e) => setSkuForm({ ...skuForm, unitPrice: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-lg text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                      placeholder="₹ 290.00"
                      required
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                      Min Order Qty (MOQ)
                    </label>
                    <input
                      value={skuForm.moq}
                      onChange={(e) => setSkuForm({ ...skuForm, moq: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-lg text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                      placeholder="100 units"
                      required
                      type="number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
                    GST Slab Rate
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        checked={skuForm.gstRate === '5'}
                        onChange={() => setSkuForm({ ...skuForm, gstRate: '5' })}
                        name="gst"
                        type="radio"
                        className="text-[#0047c1]"
                      />
                      <span>5% (Life Saving)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        checked={skuForm.gstRate === '12'}
                        onChange={() => setSkuForm({ ...skuForm, gstRate: '12' })}
                        name="gst"
                        type="radio"
                        className="text-[#0047c1]"
                      />
                      <span>12% (Standard)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        checked={skuForm.gstRate === '18'}
                        onChange={() => setSkuForm({ ...skuForm, gstRate: '18' })}
                        name="gst"
                        type="radio"
                        className="text-[#0047c1]"
                      />
                      <span>18% (Devices)</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-[#f2f3ff] rounded-xl text-center border-dashed border-2 border-[#c3c6d8]">
                  <span className="material-symbols-outlined text-[#465366] text-2xl">cloud_upload</span>
                  <div className="text-xs text-[#131b2e] font-bold mt-1">Attach Signed CoA / Test Report</div>
                  <div className="font-mono text-[10px] text-[#434655]">PDF format strictly under 5MB (Attached)</div>
                </div>

                <div className="pt-4 border-t border-[#eaedff] flex items-center justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-[#eaedff] text-[#131b2e] rounded-lg hover:bg-[#dae2fd] transition-colors"
                    onClick={() => setIsDrawerOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-[#0047c1] text-white rounded-lg font-bold shadow-xs hover:bg-[#155eef] transition-colors"
                    type="submit"
                  >
                    Verify &amp; Publish SKU
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};
