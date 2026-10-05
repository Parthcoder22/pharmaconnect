import React, { useState } from 'react';

export const BuyerDashboard = ({
  orders,
  medicines,
  patientBills,
  onGeneratePatientBill,
  onNavigateToCatalog,
  onNavigateToInvoice,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState('inventory');

  // Patient Dispense Form state
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. V. Sharma, MD');
  const [doctorRegNo, setDoctorRegNo] = useState('MCI-19948');
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [dispenseQty, setDispenseQty] = useState(1);

  const selectedMed = medicines.find((m) => m.id === selectedMedId) || medicines[0];

  const handleDispenseSubmit = (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      onShowToast('Please provide patient name', 'priority_high');
      return;
    }

    const itemPrice = selectedMed ? selectedMed.mrp * 10 : 250;
    const itemTotal = itemPrice * dispenseQty;

    const newBill = {
      id: `pb-${Date.now()}`,
      billNumber: `PB-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      patientId: patientId || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
      doctorName,
      doctorRegNo,
      date: new Date().toLocaleDateString('en-GB'),
      items: [
        {
          medicineName: selectedMed?.name || 'Amoxicillin 500mg',
          batchNumber: selectedMed?.activeBatch?.batchNumber || '#LOT-9921',
          expDate: selectedMed?.activeBatch?.expiryDate || '10/2026',
          quantity: dispenseQty,
          mrp: itemPrice,
          amount: itemTotal
        }
      ],
      totalAmount: itemTotal
    };

    onGeneratePatientBill(newBill);
    onShowToast(`Patient Dispense Bill ${newBill.billNumber} created with Form 20/21 compliance`, 'prescriptions');
    setPatientName('');
    setPatientId('');
    setDispenseQty(1);
  };

  return (
    <div className="flex flex-col w-full bg-[#faf8ff] pb-16">
      <div className="p-4 sm:p-8 max-w-[1540px] mx-auto w-full space-y-6">
        {/* Buyer Header Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#0047c1] uppercase bg-[#dbe1ff] px-2.5 py-0.5 rounded font-mono">
                NABH ACCREDITED • HOSPITAL PHARMACY CENTRAL STORE
              </span>
              <span className="font-mono text-xs text-[#006b5d] font-bold">DL: MH-MUM-20B-391827</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
              Apex Multispeciality Procurement &amp; Formulary
            </h1>
            <p className="text-xs sm:text-sm text-[#434655] mt-0.5">
              Form 20/21 Institutional Inventory, Temperature Log Handshakes, and Patient Bedside Dispensing
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToCatalog}
              className="px-4 py-2.5 bg-[#0047c1] hover:bg-[#155eef] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-base">add_shopping_cart</span>
              <span>Procure New Stocks</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff]">
            <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">
              Formulary Stock Value
            </span>
            <div className="text-2xl font-extrabold text-[#131b2e] font-mono mt-2">₹ 42.8 Lakh</div>
            <p className="text-xs text-[#006b5d] font-semibold mt-1">100% Inward COA Verified</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff]">
            <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">
              Active Inward Consignments
            </span>
            <div className="text-2xl font-extrabold text-[#0047c1] font-mono mt-2">
              {orders.filter((o) => o.status !== 'completed').length} Orders
            </div>
            <p className="text-xs text-[#434655] mt-1">1 In Cold Transit (4.2°C)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff]">
            <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">
              Monthly Patient Bills
            </span>
            <div className="text-2xl font-extrabold text-[#131b2e] font-mono mt-2">
              {patientBills.length + 184} Bills
            </div>
            <p className="text-xs text-[#006b5d] font-semibold mt-1">Batch-traceable to ward</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#eaedff]">
            <span className="text-[10px] font-bold uppercase text-[#434655] tracking-wider">
              Pending Escrow Settlements
            </span>
            <div className="text-2xl font-extrabold text-[#ba1a1a] font-mono mt-2">₹ 4,30,080</div>
            <p className="text-xs text-[#ba1a1a] font-semibold mt-1">Net-15 terms active</p>
          </div>
        </div>

        {/* Workspace Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#eaedff] overflow-hidden">
          <div className="px-6 pt-4 bg-[#f2f3ff] flex items-center gap-3 border-b border-[#eaedff]">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold relative transition-colors flex items-center gap-2 ${
                activeTab === 'inventory' ? 'text-[#0047c1]' : 'text-[#434655] hover:text-[#131b2e]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-base">inventory_2</span>
              <span>Hospital Formulary Stock</span>
              {activeTab === 'inventory' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0047c1] rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold relative transition-colors flex items-center gap-2 ${
                activeTab === 'orders' ? 'text-[#0047c1]' : 'text-[#434655] hover:text-[#131b2e]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-base">local_shipping</span>
              <span>Purchase Orders &amp; Inward Checks</span>
              {activeTab === 'orders' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0047c1] rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dispense')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold relative transition-colors flex items-center gap-2 ${
                activeTab === 'dispense' ? 'text-[#0047c1]' : 'text-[#434655] hover:text-[#131b2e]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-base">prescriptions</span>
              <span>Patient Billing Generator</span>
              {activeTab === 'dispense' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0047c1] rounded-full"></span>
              )}
            </button>
          </div>

          {/* TAB 1: Inventory Table */}
          {activeTab === 'inventory' && (
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-xs text-[#131b2e]">
                <thead className="bg-[#f2f3ff] text-[#434655] font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Medicine Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Allocated Lot</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Storage Zone</th>
                    <th className="py-3 px-4">Stock on Hand</th>
                    <th className="py-3 px-4 text-right">Inward Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {medicines.map((m) => (
                    <tr key={m.id} className="hover:bg-[#f2f3ff]/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#131b2e]">
                        {m.name}
                        <span className="block font-mono text-[10px] text-[#434655] font-normal">
                          {m.genericName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#434655]">{m.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0047c1]">
                        {m.activeBatch?.batchNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#006b5d]">
                        {m.activeBatch?.expiryDate}
                      </td>
                      <td className="py-3.5 px-4 text-[#434655]">{m.activeBatch?.vaultLocation}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                        {m.totalStockAvailable?.toLocaleString()} {m.unitPack}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() =>
                            onShowToast(`Verified COA for ${m.name} (${m.activeBatch?.batchNumber})`, 'verified')
                          }
                          className="px-2.5 py-1 bg-[#eaedff] text-[#0047c1] hover:bg-[#dbe1ff] rounded-lg text-xs font-semibold"
                          type="button"
                        >
                          View COA
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Purchase Orders */}
          {activeTab === 'orders' && (
            <div className="p-6 space-y-4">
              {orders.map((po) => (
                <div
                  key={po.id}
                  className="p-5 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0047c1]">{po.poReference}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-bold uppercase">
                        {po.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#131b2e]">{po.supplierName}</div>
                    <div className="text-xs text-[#434655]">
                      Delivery Node: {po.destinationHub} • Value:{' '}
                      <strong className="text-[#131b2e] font-mono">
                        ₹ {po.netPayable.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onNavigateToInvoice(po.id)}
                      className="px-4 py-2 bg-[#0047c1] text-white rounded-xl text-xs font-bold hover:bg-[#155eef] transition-colors"
                      type="button"
                    >
                      Audit Invoice &amp; Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Patient Dispense Tool */}
          {activeTab === 'dispense' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form */}
              <form onSubmit={handleDispenseSubmit} className="lg:col-span-6 space-y-4 text-xs">
                <div className="border-b border-[#eaedff] pb-3">
                  <h3 className="text-base font-bold text-[#131b2e]">Patient Bedside Dispense Slip</h3>
                  <p className="text-xs text-[#434655]">
                    Authorized under State Drug Rules Form 20/21. Requires Registered Medical Practitioner details.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#434655] mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:ring-2 focus:ring-[#0047c1]"
                      placeholder="e.g. Ramesh Patel"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#434655] mb-1">
                      Hospital Patient UHID
                    </label>
                    <input
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:ring-2 focus:ring-[#0047c1]"
                      placeholder="e.g. PT-89412"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#434655] mb-1">
                      Prescribing Doctor
                    </label>
                    <input
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#434655] mb-1">
                      Medical Council Reg No
                    </label>
                    <input
                      value={doctorRegNo}
                      onChange={(e) => setDoctorRegNo(e.target.value)}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#434655] mb-1">
                    Select Medicine Formulation From Hospital Vault
                  </label>
                  <select
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#eaedff]"
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (LOT: {m.activeBatch?.batchNumber} • Exp {m.activeBatch?.expiryDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#434655] mb-1">
                      Dispense Quantity (Packs)
                    </label>
                    <input
                      value={dispenseQty}
                      onChange={(e) => setDispenseQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      type="number"
                      min={1}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#434655] mb-1">
                      Patient Bill Amount
                    </label>
                    <div className="w-full h-9 px-3 bg-[#eaedff] rounded-xl text-xs font-mono font-bold flex items-center text-[#0047c1]">
                      ₹ {((selectedMed ? selectedMed.mrp * 10 : 250) * dispenseQty).toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0047c1] hover:bg-[#155eef] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Generate E-Prescription Dispense Slip
                </button>
              </form>

              {/* Past Patient Bills */}
              <div className="lg:col-span-6 bg-[#f2f3ff] p-5 rounded-2xl border border-[#eaedff] space-y-3">
                <span className="text-xs font-bold text-[#131b2e] block">Recent Ward Dispense Bills</span>
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {patientBills.map((pb) => (
                    <div
                      key={pb.id}
                      className="bg-white p-3.5 rounded-xl border border-[#eaedff] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#131b2e]">
                          {pb.patientName} ({pb.patientId})
                        </div>
                        <div className="text-[11px] text-[#434655] font-mono mt-0.5">
                          Bill: {pb.billNumber} • Dr: {pb.doctorName}
                        </div>
                        <div className="text-[10px] text-[#006b5d] font-semibold mt-0.5">
                          {pb.items[0]?.medicineName} (x{pb.items[0]?.quantity}) • Lot {pb.items[0]?.batchNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-[#0047c1]">
                          ₹ {pb.totalAmount.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-[#737687]">{pb.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
