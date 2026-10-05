import React from 'react';

export const AnalyticsReports = ({ onShowToast }) => {
  return (
    <div className="flex flex-col w-full bg-[#faf8ff] pb-16">
      <div className="p-4 sm:p-8 max-w-[1540px] mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#0047c1] uppercase bg-[#dbe1ff] px-2.5 py-0.5 rounded font-mono">
                INSTITUTIONAL COMMERCE INTELLIGENCE
              </span>
              <span className="font-mono text-xs text-[#006b5d] font-bold">MONTHLY FISCAL PERIOD: OCT 2025</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
              Institutional Sales &amp; Procurement Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#434655] mt-0.5">
              Wholesale trading volume, SKU turnover velocity, cold-chain SLA continuity, and GST tax ledger
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShowToast('Generating Consolidated CDSCO B2B Analytics Dossier (PDF)...', 'download')}
              className="px-4 py-2 bg-[#0047c1] text-white rounded-xl text-xs font-bold hover:bg-[#155eef] transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export Executive Report</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff]">
            <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">Gross Trade Volume</span>
            <div className="text-2xl font-extrabold text-[#131b2e] font-mono mt-1">₹ 2.48 Cr</div>
            <div className="flex items-center gap-1 text-xs text-[#006b5d] font-bold mt-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+14.2% MoM growth</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff]">
            <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">Cold-Chain SLA Met</span>
            <div className="text-2xl font-extrabold text-[#006b5d] font-mono mt-1">99.98%</div>
            <p className="text-xs text-[#434655] mt-1">Zero thermal breach refunds</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff]">
            <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">Total Consignments</span>
            <div className="text-2xl font-extrabold text-[#0047c1] font-mono mt-1">428 Shipments</div>
            <p className="text-xs text-[#434655] mt-1">Avg 14.2 hrs dispatch time</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff]">
            <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">Average Bulk Margin</span>
            <div className="text-2xl font-extrabold text-[#131b2e] font-mono mt-1">21.8%</div>
            <p className="text-xs text-[#006b5d] font-bold mt-1">+2.4% vs state tender</p>
          </div>
        </div>

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown by Therapeutic Class */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#131b2e]">Volume by Therapeutic Class</h2>
              <span className="font-mono text-xs text-[#0047c1] font-bold">Oct 2025</span>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-[#131b2e]">Antimicrobial &amp; Antibiotics</span>
                  <span className="font-mono font-bold text-[#0047c1]">₹ 92.4 Lakh (37%)</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0047c1] h-full rounded-full" style={{ width: '37%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-[#131b2e]">Cardiovascular &amp; Lipid</span>
                  <span className="font-mono font-bold text-[#006b5d]">₹ 64.2 Lakh (26%)</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#006b5d] h-full rounded-full" style={{ width: '26%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-[#131b2e]">Critical Care &amp; ICU Injectables</span>
                  <span className="font-mono font-bold text-[#155eef]">₹ 48.6 Lakh (20%)</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#155eef] h-full rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-[#131b2e]">Oncology Biologics</span>
                  <span className="font-mono font-bold text-[#ba1a1a]">₹ 28.5 Lakh (11%)</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: '11%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-[#131b2e]">Anti-Diabetic &amp; General</span>
                  <span className="font-mono font-bold text-[#737687]">₹ 14.3 Lakh (6%)</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#737687] h-full rounded-full" style={{ width: '6%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Temperature Log SLA Compliance Graph */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eaedff] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#131b2e]">Cold-Chain Continuous SLA Monitor</h2>
                <span className="bg-[#80f3dd]/40 text-[#006f61] font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                  2°C–8°C Window
                </span>
              </div>
              <p className="text-xs text-[#434655] mt-1">Real-time telemetry integrity across 42 active transit reefers</p>

              <div className="my-6 p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff]">
                <svg className="w-full h-32" fill="none" viewBox="0 0 300 100">
                  <rect fill="rgba(0, 107, 93, 0.08)" height="60" rx="4" width="300" x="0" y="20"></rect>
                  <line stroke="#006b5d" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="300" y1="20" y2="20"></line>
                  <line stroke="#006b5d" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="300" y1="80" y2="80"></line>
                  <path
                    d="M 5,50 Q 50,45 100,52 T 180,48 T 240,50 T 295,47"
                    fill="none"
                    stroke="#006b5d"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  ></path>
                  <circle cx="295" cy="47" fill="#006b5d" r="4"></circle>
                </svg>
                <div className="flex justify-between font-mono text-[10px] text-[#434655] mt-2">
                  <span>01 Oct</span>
                  <span>08 Oct</span>
                  <span>15 Oct</span>
                  <span>22 Oct</span>
                  <span className="font-bold text-[#006b5d]">30 Oct (Current +4.2°C)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#f2f3ff] rounded-2xl flex items-center justify-between text-xs">
              <span className="text-[#434655]">Regulatory Escrow Release SLA:</span>
              <span className="font-mono font-bold text-[#0047c1]">100% Cleared within 24 Hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
