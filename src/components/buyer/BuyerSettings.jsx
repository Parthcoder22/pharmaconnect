import React, { useState } from 'react';

export const BuyerSettings = ({
  currentUser,
  onLogout,
  onShowToast
}) => {
  const [profile, setProfile] = useState(() => ({
    fullName: currentUser?.name || currentUser?.full_name || 'Dr. V. Sharma',
    email: currentUser?.email || 'v.sharma@apexhealth.org',
    phone: currentUser?.phone || '+91 98110 99420',
    organization: currentUser?.organization || 'Apex Multispeciality Healthcare Pvt. Ltd.',
    businessAddress: currentUser?.businessAddress || 'Plot 12-A, Healthcare City Phase II, Parel, Mumbai, MH - 400012',
    gstin: currentUser?.gstin || '27AABCA4820K1ZW',
    licenseNumber: currentUser?.licenseNumber || 'MH-MUM-20B-391827'
  }));

  React.useEffect(() => {
    if (currentUser) {
      setProfile({
        fullName: currentUser.name || currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        organization: currentUser.organization || '',
        businessAddress: currentUser.businessAddress || 'Registered Delivery Location',
        gstin: currentUser.gstin || '',
        licenseNumber: currentUser.licenseNumber || ''
      });
    }
  }, [currentUser]);

  const storageKey = `pharmaconnect_buyer_addresses_${currentUser?.id || 'default'}`;
  const isDemoBuyer = currentUser?.id === 'usr-buy-01' || currentUser?.email?.includes('sharma');

  const [addresses, setAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    if (isDemoBuyer) {
      return [
        {
          id: 'addr-1',
          title: 'Main Central Hospital Pharmacy Depot',
          line1: 'Plot 12-A, Healthcare City Phase II, KEM Hospital Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400012',
          isDefault: true
        },
        {
          id: 'addr-2',
          title: 'Apex Trauma & Emergency Formulary Store',
          line1: 'Building 4, Basement Level, Acute Care Centre, Parel',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400012',
          isDefault: false
        }
      ];
    }

    return [
      {
        id: 'addr-primary',
        title: `${currentUser?.organization || currentUser?.name || 'Main'} Receiving Depot`,
        line1: currentUser?.businessAddress || 'Registered Hospital & Clinical Store Address',
        city: currentUser?.city || 'Mumbai',
        state: currentUser?.state || 'Maharashtra',
        pincode: currentUser?.pincode || '400001',
        isDefault: true
      }
    ];
  });

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState({
    title: '',
    line1: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: ''
  });

  const saveAddressesToStorage = (updated) => {
    setAddresses(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  const [notificationsConfig, setNotificationsConfig] = useState({
    orderStatusUpdates: true,
    invoiceAlerts: true,
    supplierMessages: true,
    regulatoryExpiryAlerts: true
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onShowToast?.('Purchasing profile details saved successfully', 'check_circle');
  };

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));
    saveAddressesToStorage(updated);
    onShowToast?.('Default delivery destination updated', 'check_circle');
  };

  const handleDeleteAddress = (id) => {
    if (addresses.length <= 1) {
      onShowToast?.('Must keep at least one registered delivery destination', 'warning');
      return;
    }
    const updated = addresses.filter((a) => a.id !== id);
    if (!updated.some((a) => a.isDefault) && updated.length > 0) {
      updated[0].isDefault = true;
    }
    saveAddressesToStorage(updated);
    onShowToast?.('Delivery destination removed', 'info');
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddressInput.title.trim() || !newAddressInput.line1.trim()) return;
    const newAddr = {
      id: `addr-${Date.now()}`,
      title: newAddressInput.title.trim(),
      line1: newAddressInput.line1.trim(),
      city: newAddressInput.city || 'Mumbai',
      state: newAddressInput.state || 'Maharashtra',
      pincode: newAddressInput.pincode || '400001',
      isDefault: addresses.length === 0
    };
    const updated = [...addresses, newAddr];
    saveAddressesToStorage(updated);
    setNewAddressInput({ title: '', line1: '', city: 'Mumbai', state: 'Maharashtra', pincode: '' });
    setIsAddingAddress(false);
    onShowToast?.('New delivery depot added successfully', 'check_circle');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Buyer Settings &amp; Preferences</h1>
        <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
          Manage your hospital procurement profile, saved delivery addresses, and notification channels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Account & Business */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Profile Card */}
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-[#131b2e] pb-2 border-b border-[#eaedff]">
              1. Purchasing Officer Account
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Officer Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Direct Contact Phone
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Healthcare Establishment
                  </label>
                  <input
                    type="text"
                    value={profile.organization}
                    onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                  Registered Institutional Physical Address
                </label>
                <input
                  type="text"
                  value={profile.businessAddress}
                  onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })}
                  className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Delivery Addresses Management */}
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div>
                <h2 className="text-xs font-bold text-[#131b2e]">2. Saved Pharmacy Delivery Docks</h2>
                <p className="text-[11px] text-[#5e6b7f]">Receiving depots verified for pharmaceutical delivery</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="text-xs font-bold text-[#0047c1] hover:underline"
              >
                {isAddingAddress ? 'Cancel' : '+ Add New Dock'}
              </button>
            </div>

            {isAddingAddress && (
              <form onSubmit={handleAddAddressSubmit} className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#eaedff] space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#131b2e] mb-1">Dock / Store Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Central Pharmacy Store"
                      value={newAddressInput.title}
                      onChange={(e) => setNewAddressInput({ ...newAddressInput, title: e.target.value })}
                      className="w-full h-8 px-2.5 bg-white rounded-lg border border-[#eaedff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#131b2e] mb-1">City / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={newAddressInput.city}
                      onChange={(e) => setNewAddressInput({ ...newAddressInput, city: e.target.value })}
                      className="w-full h-8 px-2.5 bg-white rounded-lg border border-[#eaedff]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#131b2e] mb-1">Premises Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Building 2, Ground Floor, Gate 4"
                    value={newAddressInput.line1}
                    onChange={(e) => setNewAddressInput({ ...newAddressInput, line1: e.target.value })}
                    className="w-full h-8 px-2.5 bg-white rounded-lg border border-[#eaedff]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-3 py-1 bg-white border border-[#eaedff] rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#0047c1] text-white rounded-lg text-xs font-bold"
                  >
                    Save Dock Address
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3 text-xs">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    addr.isDefault ? 'border-[#0047c1] bg-[#eef2ff]' : 'border-[#eaedff] bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#131b2e]">{addr.title}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-[#0047c1] bg-white px-2 py-0.5 rounded shadow-2xs">
                          Default Destination
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5e6b7f] mt-0.5">
                      {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#0047c1] hover:bg-white rounded-lg transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 text-[#ba1a1a] hover:bg-[#ffebee] rounded-lg transition-colors"
                      title="Delete Address"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Notifications & Security */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-[#131b2e] pb-2 border-b border-[#eaedff]">
              Notification Preferences
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#131b2e]">Order Status Dispatch Alerts</span>
                <input
                  type="checkbox"
                  checked={notificationsConfig.orderStatusUpdates}
                  onChange={(e) =>
                    setNotificationsConfig({ ...notificationsConfig, orderStatusUpdates: e.target.checked })
                  }
                  className="rounded text-[#0047c1] focus:ring-[#0047c1]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#131b2e]">Invoices &amp; Payment Reminders</span>
                <input
                  type="checkbox"
                  checked={notificationsConfig.invoiceAlerts}
                  onChange={(e) =>
                    setNotificationsConfig({ ...notificationsConfig, invoiceAlerts: e.target.checked })
                  }
                  className="rounded text-[#0047c1] focus:ring-[#0047c1]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#131b2e]">Supplier Chat Inquiries</span>
                <input
                  type="checkbox"
                  checked={notificationsConfig.supplierMessages}
                  onChange={(e) =>
                    setNotificationsConfig({ ...notificationsConfig, supplierMessages: e.target.checked })
                  }
                  className="rounded text-[#0047c1] focus:ring-[#0047c1]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#131b2e]">Regulatory License Alerts</span>
                <input
                  type="checkbox"
                  checked={notificationsConfig.regulatoryExpiryAlerts}
                  onChange={(e) =>
                    setNotificationsConfig({
                      ...notificationsConfig,
                      regulatoryExpiryAlerts: e.target.checked
                    })
                  }
                  className="rounded text-[#0047c1] focus:ring-[#0047c1]"
                />
              </label>
            </div>
          </div>

          {/* Session & Sign Out */}
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-[#131b2e]">Account Session</h2>
            <p className="text-xs text-[#5e6b7f]">
              Logged in as institutional procurement officer for {profile.organization}.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2 bg-[#ffebee] hover:bg-[#fed7d7] text-[#ba1a1a] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out from Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
