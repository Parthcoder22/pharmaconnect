import React, { useState } from 'react';

export const ExpiryAlerts = ({ onShowToast }) => {
  const [filterState, setFilterState] = useState('all');

  const [alerts, setAlerts] = useState([
    {
      id: 'exp-1',
      batch: 'LOT-AZM-2023-01',
      medName: 'Azithromycin 500mg USP',
      manufacturer: 'Aurobindo Pharma',
      stock: '1,400 Strips',
      vault: 'Zone B, Bay 14 (Dry Ambient)',
      expDate: '12 Nov 2025',
      daysLeft: 8,
      status: 'critical',
      quarantined: false
    },
    {
      id: 'exp-2',
      batch: 'LOT-CEF-2023-99',
      medName: 'Ceftriaxone Sodium 1g Inj',
      manufacturer: 'Lupin Lifesciences',
      stock: '820 Vials',
      vault: 'Vault Cold-03 (Chilled 4°C)',
      expDate: '22 Nov 2025',
      daysLeft: 18,
      status: 'critical',
      quarantined: false
    },
    {
      id: 'exp-3',
      batch: 'LOT-PAN-2023-45',
      medName: 'Pantoprazole Gastro-Resistant 40mg',
      manufacturer: 'Dr. Reddy Laboratories',
      stock: '3,100 Strips',
      vault: 'Zone A, Shelf 09',
      expDate: '30 Nov 2025',
      daysLeft: 26,
      status: 'critical',
      quarantined: false
    },
    {
      id: 'exp-4',
      batch: 'LOT-AMX-2024-11',
      medName: 'Amoxicillin 250mg Suspension',
      manufacturer: 'Cipla Critical Care',
      stock: '2,200 Bottles',
      vault: 'Vault Ambient-02',
      expDate: '15 Jan 2026',
      daysLeft: 72,
      status: 'warning',
      quarantined: false
    },
    {
      id: 'exp-5',
      batch: 'LOT-MET-2024-88',
      medName: 'Metoprolol Succinate 50mg XL',
      manufacturer: 'Sun Pharma Hazira Plant',
      stock: '5,400 Strips',
      vault: 'Zone C, Bay 05',
      expDate: '28 Feb 2026',
      daysLeft: 115,
      status: 'normal',
      quarantined: false
    }
  ]);

  const handleQuarantine = (id, batch) => {
    setAlerts(
      alerts.map((a) =>
        a.id === id ? { ...a, quarantined: true, status: 'quarantined' } : a
      )
    );
    onShowToast(`Batch ${batch} transferred to CDSCO Form 483 Quarantine Holding Vault`, 'warning');
  };

  const handleLiquidation = (batch) => {
    onShowToast(`Batch ${batch} listed in Fast-Track Liquidation Exchange at 45% discount`, 'local_offer');
  };

  const displayedAlerts = alerts.filter((a) => {
    if (filterState === 'critical') return a.daysLeft <= 30 && !a.quarantined;
    if (filterState === 'quarantined') return a.quarantined;
    return true;
  });

  return (
    <div className="flex flex-col w-full bg-[#faf8ff] pb-16">
      <div className="p-4 sm:p-8 max-w-[1540px] mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#ba1a1a] uppercase bg-[#ffdad6] px-2.5 py-0.5 rounded font-mono">
                CDSCO COMPLIANCE PROTOCOL • FORM 483 QUARANTINE
              </span>
              <span className="font-mono text-xs text-[#0047c1] font-bold">FEFO Automated Algorithm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
              Batch &amp; Expiry Surveillance Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#434655] mt-0.5">
              Automated First-Expiry-First-Out (FEFO) alerts, near-expiry liquidation tenders, and statutory recall governance
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#f2f3ff] p-1.5 rounded-xl border border-[#eaedff]">
            <button
              onClick={() => setFilterState('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterState === 'all' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#434655]'
              }`}
            >
              All Batches ({alerts.length})
            </button>
            <button
              onClick={() => setFilterState('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterState === 'critical' ? 'bg-[#ba1a1a] text-white shadow-xs' : 'text-[#ba1a1a]'
              }`}
            >
              Critical &lt;30d
            </button>
            <button
              onClick={() => setFilterState('quarantined')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterState === 'quarantined' ? 'bg-[#5e6b7f] text-white shadow-xs' : 'text-[#434655]'
              }`}
            >
              Quarantine Zone
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#ba1a1a] tracking-wider">
                Critical Expiring (&lt;30d)
              </span>
              <div className="text-3xl font-extrabold text-[#ba1a1a] font-mono mt-1">3 Batches</div>
              <p className="text-xs text-[#434655] mt-0.5">Total stock: 5,320 units</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">event_busy</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">
                Under 90 Days Warning
              </span>
              <div className="text-3xl font-extrabold text-[#131b2e] font-mono mt-1">1 Batch</div>
              <p className="text-xs text-[#006b5d] mt-0.5">Fast-track clearance ready</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#eaedff] text-[#0047c1] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">timelapse</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#006b5d] tracking-wider">
                Zero Recall Record
              </span>
              <div className="text-3xl font-extrabold text-[#006b5d] font-mono mt-1">100%</div>
              <p className="text-xs text-[#434655] mt-0.5">Full batch traceability audit</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#80f3dd]/40 text-[#006b5d] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#eaedff] overflow-hidden">
          <div className="p-6 border-b border-[#eaedff] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#131b2e]">Batch Expiry Tracking Roster</h2>
            <button
              onClick={() => onShowToast('Exporting Batch Life Cycle Audit Report (PDF)...', 'download')}
              className="text-xs font-bold text-[#0047c1] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export Audit Schedule</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#131b2e]">
              <thead className="bg-[#f2f3ff] text-[#434655] font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Medicine &amp; Formulation</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4">Stock on Hand</th>
                  <th className="py-3 px-4">Storage Vault</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Regulatory Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff]">
                {displayedAlerts.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f2f3ff]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#ba1a1a]">{item.batch}</td>
                    <td className="py-3.5 px-4 font-bold text-[#131b2e]">{item.medName}</td>
                    <td className="py-3.5 px-4 text-[#434655]">{item.manufacturer}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">{item.stock}</td>
                    <td className="py-3.5 px-4 text-[#434655]">{item.vault}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">{item.expDate}</td>
                    <td className="py-3.5 px-4">
                      {item.quarantined ? (
                        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-mono text-[10px] font-bold">
                          Quarantined
                        </span>
                      ) : item.daysLeft <= 30 ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#ba1a1a] text-white font-mono text-[10px] font-bold">
                          {item.daysLeft} Days Left
                        </span>
                      ) : item.daysLeft <= 90 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">
                          {item.daysLeft} Days Left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-mono text-[10px] font-bold">
                          Optimal ({item.daysLeft}d)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!item.quarantined ? (
                          <>
                            <button
                              onClick={() => handleLiquidation(item.batch)}
                              className="px-2.5 py-1 bg-[#eaedff] text-[#0047c1] hover:bg-[#dbe1ff] rounded-lg text-xs font-semibold"
                            >
                              Liquidate
                            </button>
                            <button
                              onClick={() => handleQuarantine(item.id, item.batch)}
                              className="px-2.5 py-1 bg-[#ba1a1a] text-white hover:bg-[#93000a] rounded-lg text-xs font-semibold"
                            >
                              Quarantine
                            </button>
                          </>
                        ) : (
                          <span className="font-mono text-[11px] text-[#434655] font-semibold">
                            Form 483 Active
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
