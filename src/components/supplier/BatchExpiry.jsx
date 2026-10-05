import React, { useState, useMemo, useEffect } from 'react';

export const BatchExpiry = ({
  medicines = [],
  onShowToast
}) => {
  // Derive realistic batch tracking data from actual supplier medicines
  const derivedBatchesFromMeds = useMemo(() => {
    if (!medicines || medicines.length === 0) return [];
    return medicines
      .filter((m) => m.activeBatch || m.batchNumber || (Array.isArray(m.batches) && m.batches.length > 0))
      .flatMap((m, idx) => {
        if (Array.isArray(m.batches) && m.batches.length > 0) {
          return m.batches.map((b, bIdx) => ({
            id: b.id || `batch-${m.id}-${bIdx}`,
            batchNumber: b.batchNumber || b.batch_number || `LOT-${m.name?.slice(0, 3).toUpperCase() || 'MED'}-${bIdx + 1}`,
            medicineName: m.name,
            mfgDate: b.manufacturingDate || b.manufacturing_date || '01 Jan 2025',
            expiryDate: b.expiryDate || b.expiry_date || '2027-12-31',
            quantity: b.quantity || m.stock || m.total_stock_available || 1000,
            location: b.vaultLocation || b.vault_location || 'Warehouse Bay 01',
            status: b.status || 'active'
          }));
        }
        const b = m.activeBatch || {};
        return [{
          id: b.id || `batch-${m.id || idx}`,
          batchNumber: b.batchNumber || b.batch_number || m.batchNumber || `LOT-${m.name?.slice(0, 3).toUpperCase() || 'MED'}-01`,
          medicineName: m.name,
          mfgDate: b.manufacturingDate || b.manufacturing_date || m.manufacturingDate || '01 Jan 2025',
          expiryDate: b.expiryDate || b.expiry_date || m.expiryDate || '2027-12-31',
          quantity: b.quantity || m.stock || m.total_stock_available || 1000,
          location: b.vaultLocation || b.vault_location || 'Warehouse Bay 01',
          status: b.status || 'active'
        }];
      });
  }, [medicines]);

  const [batches, setBatches] = useState(derivedBatchesFromMeds);

  // Sync batches whenever supplier medicines change
  useEffect(() => {
    setBatches(derivedBatchesFromMeds);
  }, [derivedBatchesFromMeds]);

  const [timeFilter, setTimeFilter] = useState('all'); // all, 30, 60, 90, expired
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);

  // New Batch Form State
  const [newBatch, setNewBatch] = useState({
    batchNumber: '',
    medicineName: medicines[0]?.name || '',
    mfgDate: '',
    expiryDate: '',
    quantity: '1000',
    location: 'Warehouse Storage'
  });

  useEffect(() => {
    if (medicines.length > 0 && !newBatch.medicineName) {
      setNewBatch((prev) => ({ ...prev, medicineName: medicines[0]?.name || '' }));
    }
  }, [medicines]);

  // Calculate days remaining helper
  const getDaysRemaining = (expDateStr) => {
    const exp = new Date(expDateStr);
    const now = new Date();
    const diffTime = exp - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Summary Metrics
  const summary = useMemo(() => {
    let near30 = 0;
    let expired = 0;
    let quarantined = 0;

    batches.forEach((b) => {
      const days = getDaysRemaining(b.expiryDate);
      if (b.status === 'quarantined' || b.status === 'blocked') quarantined++;
      if (days <= 0) expired++;
      else if (days <= 30) near30++;
    });

    return { total: batches.length, near30, expired, quarantined };
  }, [batches]);

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const days = getDaysRemaining(b.expiryDate);

      // Timeframe filter
      if (timeFilter === '30' && (days > 30 || days <= 0)) return false;
      if (timeFilter === '60' && (days > 60 || days <= 0)) return false;
      if (timeFilter === '90' && (days > 90 || days <= 0)) return false;
      if (timeFilter === 'expired' && days > 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesBatch = b.batchNumber.toLowerCase().includes(q);
        const matchesMed = b.medicineName.toLowerCase().includes(q);
        if (!matchesBatch && !matchesMed) return false;
      }

      return true;
    });
  }, [batches, timeFilter, searchQuery]);

  const handleToggleQuarantine = (id) => {
    setBatches(
      batches.map((b) => {
        if (b.id === id) {
          const isQuarantined = b.status === 'quarantined';
          const nextStatus = isQuarantined ? 'active' : 'quarantined';
          onShowToast?.(
            `Batch ${b.batchNumber} marked as ${nextStatus === 'quarantined' ? 'Quarantined / Blocked' : 'Active Stock'}`,
            'info'
          );
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
  };

  const handleAddBatchSubmit = (e) => {
    e.preventDefault();
    if (!newBatch.batchNumber.trim() || !newBatch.expiryDate) {
      onShowToast?.('Please specify Batch Number and Expiry Date', 'warning');
      return;
    }

    const created = {
      id: `batch-${Date.now()}`,
      batchNumber: newBatch.batchNumber.trim(),
      medicineName: newBatch.medicineName,
      mfgDate: newBatch.mfgDate || 'Recent',
      expiryDate: newBatch.expiryDate,
      quantity: parseInt(newBatch.quantity, 10) || 500,
      location: newBatch.location,
      status: 'active'
    };

    setBatches([created, ...batches]);
    onShowToast?.(`Batch ${created.batchNumber} added to physical tracking records`, 'check_circle');
    setIsAddBatchOpen(false);
    setNewBatch({
      batchNumber: '',
      medicineName: medicines[0]?.name || 'Azithromycin 500mg USP',
      mfgDate: '',
      expiryDate: '',
      quantity: '1000',
      location: 'Warehouse Storage'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Batch &amp; Expiry Alerts</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Monitor physical warehouse lots, track expiry schedules, and manage quarantine stock
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddBatchOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Register New Batch</span>
        </button>
      </div>

      {/* A. Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Tracked Batches</span>
          <div className="text-2xl font-bold text-[#131b2e] font-mono mt-2">
            {summary.total}
          </div>
          <span className="text-[11px] text-[#5e6b7f] mt-1 block">Active physical lots</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Expiring &lt;30 Days</span>
          <div className="text-2xl font-bold text-[#b37400] font-mono mt-2">
            {summary.near30}
          </div>
          <span className="text-[11px] text-[#b37400] mt-1 block">Require sales priority</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Expired Batches</span>
          <div className="text-2xl font-bold text-[#ba1a1a] font-mono mt-2">
            {summary.expired}
          </div>
          <span className="text-[11px] text-[#ba1a1a] mt-1 block">Withdrawn from catalog</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Quarantined / Blocked</span>
          <div className="text-2xl font-bold text-[#5e6b7f] font-mono mt-2">
            {summary.quarantined}
          </div>
          <span className="text-[11px] text-[#5e6b7f] mt-1 block">Manual hold</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5e6b7f] text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by batch number or medicine..."
            className="w-full pl-9 pr-4 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] placeholder:text-[#5e6b7f] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            type="button"
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              timeFilter === 'all'
                ? 'bg-[#0047c1] text-white'
                : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
            }`}
          >
            All Batches
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('30')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              timeFilter === '30'
                ? 'bg-[#b37400] text-white'
                : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
            }`}
          >
            &lt; 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('60')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              timeFilter === '60'
                ? 'bg-[#b37400] text-white'
                : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
            }`}
          >
            &lt; 60 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('90')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              timeFilter === '90'
                ? 'bg-[#b37400] text-white'
                : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
            }`}
          >
            &lt; 90 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('expired')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              timeFilter === 'expired'
                ? 'bg-[#ba1a1a] text-white'
                : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* B. Batch Table */}
      <div className="bg-white rounded-2xl border border-[#eaedff] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f8f9ff] text-[#5e6b7f] text-[11px] font-semibold border-b border-[#eaedff]">
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Formulation Name</th>
                <th className="py-3 px-4">Warehouse Location</th>
                <th className="py-3 px-4">Quantity on Hand</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Timeline Left</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#5e6b7f]">
                    No batches match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const days = getDaysRemaining(batch.expiryDate);
                  const isExpired = days <= 0;
                  const isNear = days > 0 && days <= 30;
                  const isQuarantined = batch.status === 'quarantined';

                  return (
                    <tr
                      key={batch.id}
                      className={`hover:bg-[#faf8ff] transition-colors ${
                        isQuarantined ? 'bg-[#fafafa]' : isExpired ? 'bg-[#fff5f5]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                        {batch.batchNumber}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#131b2e]">
                        {batch.medicineName}
                      </td>

                      <td className="py-3.5 px-4 text-[#5e6b7f]">
                        {batch.location}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                        {batch.quantity.toLocaleString()} units
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#434655]">
                        {batch.expiryDate}
                      </td>

                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fde8e8] text-[#c81e1e]">
                            Expired ({Math.abs(days)}d ago)
                          </span>
                        ) : isNear ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff8e6] text-[#b37400]">
                            {days} Days Left
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#006f61] font-semibold">
                            {days} Days Remaining
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isQuarantined ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f3f4f6] text-[#4b5563]">
                            Quarantined
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f8f3] text-[#006f61]">
                            Available
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleQuarantine(batch.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            isQuarantined
                              ? 'bg-[#e6f8f3] text-[#006f61] hover:bg-[#d0f2e8]'
                              : 'bg-[#eaedff] text-[#ba1a1a] hover:bg-[#fde8e8]'
                          }`}
                        >
                          {isQuarantined ? 'Release Hold' : 'Block / Quarantine'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Batch Modal */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <h3 className="text-base font-bold text-[#131b2e]">Register Physical Batch</h3>
              <button
                type="button"
                onClick={() => setIsAddBatchOpen(false)}
                className="p-1 rounded-lg text-[#5e6b7f] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddBatchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                  Batch Number / Lot Reference *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LOT-2024-8841"
                  value={newBatch.batchNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                  className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                  Associated Medicine Listing
                </label>
                <select
                  value={newBatch.medicineName}
                  onChange={(e) => setNewBatch({ ...newBatch, medicineName: e.target.value })}
                  className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                >
                  {medicines.length === 0 ? (
                    <option value="">No formulations in inventory (Add formulation first)</option>
                  ) : (
                    medicines.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Mfg Date
                  </label>
                  <input
                    type="date"
                    value={newBatch.mfgDate}
                    onChange={(e) => setNewBatch({ ...newBatch, mfgDate: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Lot Quantity
                  </label>
                  <input
                    type="number"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Warehouse Location
                  </label>
                  <input
                    type="text"
                    value={newBatch.location}
                    onChange={(e) => setNewBatch({ ...newBatch, location: e.target.value })}
                    placeholder="Shelf / Bay No."
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#eaedff] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBatchOpen(false)}
                  className="px-4 py-2 bg-[#eaedff] text-[#131b2e] rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl font-semibold"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
