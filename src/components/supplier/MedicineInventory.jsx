import React, { useState, useMemo, useEffect } from 'react';

export const MedicineInventory = ({
  medicines = [],
  currentUser = null,
  onAddMedicine,
  onUpdateMedicine,
  onDeactivateMedicine,
  onShowToast,
  isAddModalOpen = false,
  onCloseAddModal,
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, low_stock, out_of_stock
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Edit State
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [quickStockModal, setQuickStockModal] = useState(null); // { id, name, currentStock }
  const [newStockVal, setNewStockVal] = useState('');

  // Initial Form Template
  const initialFormState = useMemo(() => ({
    name: '',
    brandName: '',
    genericName: '',
    strength: '',
    dosageForm: 'Tablet',
    packSize: '10x10 Strips',
    category: 'Antimicrobial & Antibiotics',
    description: '',
    unitPrice: '',
    moq: '100',
    stock: '1000',
    gstRate: '12',
    storageCondition: 'Ambient (15°C - 25°C)',
    status: 'active',
    regulatorySchedule: 'Schedule H',
    batchNumber: '',
    expiryDate: '',
    manufacturer: currentUser?.organization || currentUser?.name || 'Licensed Manufacturer'
  }), [currentUser?.organization, currentUser?.name]);

  // Form State for Add / Edit
  const [formData, setFormData] = useState(initialFormState);

  // Sync form state when modal opens or user changes
  useEffect(() => {
    if (isAddModalOpen && !editingMedicine) {
      setFormData(initialFormState);
    }
  }, [isAddModalOpen, initialFormState]);

  // Calculate Summary metrics
  const summary = useMemo(() => {
    const total = medicines.length;
    let active = 0;
    let outOfStock = 0;
    let lowStock = 0;

    medicines.forEach((m) => {
      const stock = m.stock ?? m.total_stock_available ?? m.totalStockAvailable ?? 0;
      if (m.status !== 'inactive' && m.status !== 'discontinued') active++;
      if (stock === 0) outOfStock++;
      else if (stock < (m.minThreshold ?? 500)) lowStock++;
    });

    return { total, active, outOfStock, lowStock };
  }, [medicines]);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set();
    medicines.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [medicines]);

  // Filter & Search Logic
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const stock = med.stock ?? med.total_stock_available ?? med.totalStockAvailable ?? 0;
      const isLow = stock > 0 && stock < (med.minThreshold ?? 500);
      const isOut = stock === 0;
      const isActive = med.status !== 'inactive' && med.status !== 'discontinued';

      // Status filter
      if (statusFilter === 'active' && !isActive) return false;
      if (statusFilter === 'inactive' && isActive) return false;
      if (statusFilter === 'low_stock' && !isLow) return false;
      if (statusFilter === 'out_of_stock' && !isOut) return false;

      // Category filter
      if (categoryFilter !== 'all' && med.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (med.name || '').toLowerCase().includes(q);
        const matchesBrand = (med.brand || med.brandName || '').toLowerCase().includes(q);
        const matchesGeneric = (med.genericName || med.generic_name || '').toLowerCase().includes(q);
        const matchesCat = (med.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesGeneric && !matchesCat) return false;
      }

      return true;
    });
  }, [medicines, statusFilter, categoryFilter, searchQuery]);

  const isSupplierVerified = currentUser ? (currentUser.verificationStatus === 'verified' || currentUser.verification_status === 'verified') : false;

  const handleOpenAdd = () => {
    if (!isSupplierVerified) {
      onShowToast?.('Statutory Compliance Restriction: You must upload all 5 required statutory PDF documents and verify under Security & Verification before adding medicines.', 'warning');
      return;
    }
    setEditingMedicine(null);
    setFormData(initialFormState);
    onOpenAddModal?.();
  };

  const handleCloseModal = () => {
    setEditingMedicine(null);
    setFormData(initialFormState);
    onCloseAddModal?.();
  };

  const handleOpenEdit = (med) => {
    setEditingMedicine(med);
    const stockVal = med.stock ?? med.total_stock_available ?? med.totalStockAvailable ?? 1000;
    const priceVal = med.unitPrice ?? med.baseWholesalePrice ?? '';
    setFormData({
      name: med.name || med.brandName || med.brand || '',
      brandName: med.brand || med.brandName || med.name || '',
      genericName: med.genericName || med.generic_name || '',
      strength: med.strength || '',
      dosageForm: med.dosageForm || med.dosage_form || 'Tablet',
      packSize: med.packSize || med.unitPack || med.unit_pack || '10x10 Strips',
      category: med.category || 'General Formulations',
      description: med.description || '',
      unitPrice: priceVal ? String(priceVal) : '',
      moq: String(med.moq || 100),
      stock: String(stockVal),
      gstRate: String(med.gstRate ?? med.gst_rate ?? 12),
      storageCondition: med.storageCondition || med.storage_condition || 'Ambient (15°C - 25°C)',
      status: med.status || 'active',
      regulatorySchedule: med.regulatorySchedule || med.regulatory_schedule || 'Schedule H',
      batchNumber: med.activeBatch?.batchNumber || '',
      expiryDate: med.activeBatch?.expiryDate || '',
      manufacturer: med.manufacturer || 'Novartis Lifesciences Bio-Pharma Ltd.'
    });
    onOpenAddModal?.();
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!isSupplierVerified && !editingMedicine) {
      onShowToast?.('Statutory Compliance Restriction: Unverified suppliers cannot list formulations. Please upload all required PDF licenses first.', 'warning');
      return;
    }
    const trimmedName = formData.name.trim();
    if (!trimmedName || !formData.unitPrice || !formData.moq) {
      onShowToast?.('Please fill required formulation fields (Product Name, Unit Price, MOQ)', 'warning');
      return;
    }

    const price = parseFloat(formData.unitPrice) || 0;
    const moqVal = parseInt(formData.moq, 10) || 100;
    const stockVal = parseInt(formData.stock, 10) || 0;

    const payload = {
      ...formData,
      name: trimmedName,
      brand: trimmedName,
      brandName: trimmedName,
      genericName: (formData.genericName || trimmedName).trim(),
      strength: formData.strength?.trim() || 'Standard',
      unitPrice: price,
      baseWholesalePrice: price,
      mrp: price * 1.3,
      moq: moqVal,
      stock: stockVal,
      total_stock_available: stockVal,
      totalStockAvailable: stockVal,
      packSize: formData.packSize || '10x10 Strips',
      unitPack: formData.packSize || '10x10 Strips',
      gstRate: parseInt(formData.gstRate, 10) || 12,
      category: formData.category || 'General Formulations',
      dosageForm: formData.dosageForm || 'Tablets',
      storageCondition: formData.storageCondition || 'Ambient (15°C - 25°C)',
      status: formData.status || 'active',
      regulatorySchedule: formData.regulatorySchedule || 'Schedule H',
      manufacturer: formData.manufacturer || 'Novartis Lifesciences Bio-Pharma Ltd.',
      batchNumber: formData.batchNumber?.trim() || `LOT-${trimmedName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'MED'}-${new Date().getFullYear()}-01`,
      expiryDate: formData.expiryDate || '2027-12-31'
    };

    if (editingMedicine) {
      onUpdateMedicine?.(editingMedicine.id, payload);
      onShowToast?.(`Medicine ${trimmedName} updated successfully`, 'check_circle');
    } else {
      onAddMedicine?.(payload);
    }
    handleCloseModal();
  };

  const handleSaveQuickStock = () => {
    if (!quickStockModal) return;
    const num = parseInt(newStockVal, 10);
    if (isNaN(num) || num < 0) {
      onShowToast?.('Please enter a valid stock quantity', 'warning');
      return;
    }
    onUpdateMedicine?.(quickStockModal.id, { 
      stock: num, 
      total_stock_available: num, 
      totalStockAvailable: num 
    });
    onShowToast?.(`Stock for ${quickStockModal.name} updated to ${num} units`, 'check_circle');
    setQuickStockModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Medicine Inventory</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Manage your pharmaceutical catalog, stock availability, and commercial terms
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Statutory Manufacturer Verification Advisory Banner */}
      {!isSupplierVerified && (
        <div className="bg-[#fff8e6] border border-[#f5dc99] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#b37400] flex items-center justify-center shrink-0 border border-[#f5dc99] shadow-2xs">
              <span className="material-symbols-outlined text-xl">gavel</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b37400] bg-white px-2 py-0.5 rounded border border-[#f5dc99]">
                  WHO-GMP Verification Pending
                </span>
              </div>
              <p className="text-xs text-[#131b2e] font-medium mt-0.5">
                Under CDSCO Form 20B/21B and WHO-GMP rules, unverified suppliers cannot list or sell prescription formulations. Complete statutory verification in Security &amp; Verification to activate full catalog selling.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* A. Inventory Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Total Listed</span>
          <div className="text-2xl font-bold text-[#131b2e] font-mono mt-2">
            {summary.total}
          </div>
          <span className="text-[11px] text-[#5e6b7f] mt-1 block">Registered formulations</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Active Listings</span>
          <div className="text-2xl font-bold text-[#006f61] font-mono mt-2">
            {summary.active}
          </div>
          <span className="text-[11px] text-[#006f61] mt-1 block">Live in buyer search</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Low Stock Items</span>
          <div className="text-2xl font-bold text-[#b37400] font-mono mt-2">
            {summary.lowStock}
          </div>
          <span className="text-[11px] text-[#b37400] mt-1 block">&lt; 500 units left</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Out of Stock</span>
          <div className="text-2xl font-bold text-[#ba1a1a] font-mono mt-2">
            {summary.outOfStock}
          </div>
          <span className="text-[11px] text-[#ba1a1a] mt-1 block">Restocking required</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5e6b7f] text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand or generic name..."
              className="w-full pl-9 pr-4 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] placeholder:text-[#5e6b7f] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#f2f3ff] rounded-xl text-xs font-medium text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Listings</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-[#f2f3ff] rounded-xl text-xs font-medium text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* B. Medicine Table */}
      <div className="bg-white rounded-2xl border border-[#eaedff] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f8f9ff] text-[#5e6b7f] text-[11px] font-semibold border-b border-[#eaedff]">
                <th className="py-3 px-4">Medicine &amp; Generic</th>
                <th className="py-3 px-4">Strength &amp; Form</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">MOQ</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-xs text-[#5e6b7f]">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#0047c1] flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-2xl">medication</span>
                      </div>
                      <span className="font-bold text-[#131b2e] text-sm">No formulations in your inventory yet</span>
                      <span className="text-xs text-[#5e6b7f] mt-1 max-w-sm">
                        {medicines.length === 0
                          ? 'Add your pharmaceutical formulations to make them discoverable to verified institutional buyers.'
                          : 'No medicines match the selected filter criteria.'}
                      </span>
                      {medicines.length === 0 && (
                        <button
                          type="button"
                          onClick={onOpenAddModal}
                          className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          <span>Add First Medicine</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const stock = med.stock ?? med.total_stock_available ?? med.totalStockAvailable ?? 0;
                  const isLow = stock > 0 && stock < (med.minThreshold ?? 500);
                  const isOut = stock === 0;
                  const isActive = med.status !== 'inactive' && med.status !== 'discontinued';
                  const price = med.unitPrice ?? med.baseWholesalePrice ?? med.price ?? 0;

                  return (
                    <tr key={med.id} className="hover:bg-[#faf8ff] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-xs text-[#131b2e]">
                          {med.name || med.brand || med.brandName || 'Unnamed Formulation'}
                        </div>
                        <div className="text-[11px] text-[#5e6b7f]">
                          {med.genericName || med.generic_name || 'Standard formulation'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#434655]">
                        <span className="font-medium">{med.strength || 'Standard'}</span>
                        <span className="block text-[11px] text-[#5e6b7f]">
                          {med.dosageForm || med.dosage_form || 'Tablet'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#434655]">
                        <span className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[11px] font-medium">
                          {med.category || 'General Formulations'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              isOut
                                ? 'text-[#ba1a1a]'
                                : isLow
                                ? 'text-[#b37400]'
                                : 'text-[#131b2e]'
                            }`}
                          >
                            {stock.toLocaleString()} units
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickStockModal({ id: med.id, name: med.name || med.brand || 'Medicine', currentStock: stock });
                              setNewStockVal(String(stock));
                            }}
                            className="p-1 hover:bg-[#eff4ff] rounded text-[#0047c1]"
                            title="Quick Stock Update"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                        ₹ {Number(price).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#434655]">
                        {med.moq || 100} units
                      </td>

                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fde8e8] text-[#c81e1e]">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff8e6] text-[#b37400]">
                            Low Stock
                          </span>
                        ) : isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f8f3] text-[#006f61]">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f3f4f6] text-[#4b5563]">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(med)}
                            className="p-1.5 text-[#0047c1] hover:bg-[#eff4ff] rounded-lg transition-colors"
                            title="Edit Medicine"
                          >
                            <span className="material-symbols-outlined text-base">edit_note</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${med.name}?`)) {
                                if (isActive) {
                                  onDeactivateMedicine?.(med.id);
                                  onShowToast?.(`${med.name} deactivated`, 'info');
                                } else {
                                  onUpdateMedicine?.(med.id, { status: 'active' });
                                  onShowToast?.(`${med.name} activated`, 'check_circle');
                                }
                              }
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'text-[#ba1a1a] hover:bg-[#fde8e8]'
                                : 'text-[#006f61] hover:bg-[#e6f8f3]'
                            }`}
                            title={isActive ? 'Deactivate Listing' : 'Activate Listing'}
                          >
                            <span className="material-symbols-outlined text-base">
                              {isActive ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* C. Add / Edit Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-[#eaedff] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#eaedff]">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">
                  {editingMedicine ? 'Edit Formulation Details' : 'Add New Medicine Formulation'}
                </h3>
                <p className="text-xs text-[#5e6b7f]">
                  Publish institutional medicine listings directly to buyer pharmacies
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-[#5e6b7f] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4 text-xs">
              {/* Product Information */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase text-[#5e6b7f] tracking-wider block">
                  1. Product Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Brand / Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Augmentin 625 Duo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Generic Active Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amoxicillin + Clavulanate"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Strength
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg + 125mg"
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Dosage Form
                    </label>
                    <select
                      value={formData.dosageForm}
                      onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Injection">Injection</option>
                      <option value="Syrup / Liquid">Syrup / Liquid</option>
                      <option value="Ointment / Gel">Ointment / Gel</option>
                      <option value="IV Infusion">IV Infusion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Antibiotics, Cardiology"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Packaging / Pack Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10 x 10 Strips per Box"
                      value={formData.packSize}
                      onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="space-y-3 pt-2 border-t border-[#eaedff]">
                <span className="text-[11px] font-bold uppercase text-[#5e6b7f] tracking-wider block">
                  2. Commercial &amp; Pricing Terms
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Selling Unit Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 14.50"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Min Order Qty (MOQ) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="100"
                      value={formData.moq}
                      onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Initial Available Stock
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Applicable GST Slab
                    </label>
                    <select
                      value={formData.gstRate}
                      onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    >
                      <option value="5">5% (Life Saving)</option>
                      <option value="12">12% (Standard Formulation)</option>
                      <option value="18">18% (Medical Supplies)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Storage Instruction
                    </label>
                    <select
                      value={formData.storageCondition}
                      onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    >
                      <option value="Ambient (15°C - 25°C)">Ambient Dry Storage (15°C - 25°C)</option>
                      <option value="Cold Storage (2°C - 8°C)">Cold Chain Refrigeration (2°C - 8°C)</option>
                      <option value="Controlled Below 30°C">Controlled Room Temp (&lt;30°C)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Batch & Statutory Compliance (Optional) */}
              <div className="space-y-3 pt-2 border-t border-[#eaedff]">
                <span className="text-[11px] font-bold uppercase text-[#5e6b7f] tracking-wider block">
                  3. Batch &amp; Statutory Compliance (Optional)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Initial Batch #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LOT-AUG-2025-01"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                      Regulatory Schedule
                    </label>
                    <select
                      value={formData.regulatorySchedule}
                      onChange={(e) => setFormData({ ...formData, regulatorySchedule: e.target.value })}
                      className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                    >
                      <option value="Schedule H">Schedule H (Prescription)</option>
                      <option value="Schedule H1">Schedule H1 (High Alert / Antibiotic)</option>
                      <option value="Schedule X">Schedule X (Psychotropic)</option>
                      <option value="OTC / Non-Scheduled">OTC / Non-Scheduled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-[#eaedff] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-[#eaedff] text-[#131b2e] rounded-xl hover:bg-[#dae2fd] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl font-semibold shadow-xs"
                >
                  {editingMedicine ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Modal */}
      {quickStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-[#eaedff] space-y-4">
            <h3 className="text-sm font-bold text-[#131b2e]">
              Update Available Stock
            </h3>
            <p className="text-xs text-[#5e6b7f]">
              Medicine: <strong>{quickStockModal.name}</strong>
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-[#5e6b7f] mb-1">
                New Available Units
              </label>
              <input
                type="number"
                value={newStockVal}
                onChange={(e) => setNewStockVal(e.target.value)}
                className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono font-bold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickStockModal(null)}
                className="px-3 py-1.5 bg-[#eaedff] text-[#131b2e] rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickStock}
                className="px-3 py-1.5 bg-[#0047c1] text-white rounded-lg text-xs font-semibold hover:bg-[#155eef]"
              >
                Save Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
