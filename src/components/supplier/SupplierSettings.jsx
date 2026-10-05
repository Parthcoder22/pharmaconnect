import React, { useState } from 'react';

export const SupplierSettings = ({
  currentUser,
  onLogout,
  onShowToast
}) => {
  const [profile, setProfile] = useState(() => ({
    name: currentUser?.name || currentUser?.full_name || 'Dr. Aris Thorne',
    email: currentUser?.email || 'a.thorne@novartis-pharma.in',
    phone: currentUser?.phone || '+91 98201 44810',
    businessName: currentUser?.organization || 'Novartis Lifesciences Bio-Pharma Ltd.',
    businessAddress: currentUser?.businessAddress || 'Plot 42-B, MIDC Industrial Area, Kurkumbh, Pune, MH - 413802'
  }));

  React.useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        businessName: currentUser.organization || '',
        businessAddress: currentUser.businessAddress || 'Registered Manufacturing Facility'
      });
    }
  }, [currentUser]);

  const [notifications, setNotifications] = useState({
    emailOnNewOrder: true,
    emailOnDispute: true,
    lowStockAlerts: true,
    marketingUpdates: false
  });

  const [passwordState, setPasswordState] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onShowToast?.('Account and business settings saved successfully', 'check_circle');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordState.current || !passwordState.newPass) {
      onShowToast?.('Please fill current and new password', 'warning');
      return;
    }
    if (passwordState.newPass !== passwordState.confirm) {
      onShowToast?.('New passwords do not match', 'warning');
      return;
    }
    setPasswordState({ current: '', newPass: '', confirm: '' });
    onShowToast?.('Password updated successfully', 'check_circle');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Supplier Settings</h1>
        <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
          Manage your personal credentials, enterprise details, and communication preferences
        </p>
      </div>

      {/* A & B. Account & Business Settings */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#131b2e] pb-3 border-b border-[#eaedff]">
          Account &amp; Business Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                Authorized Representative Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                Registered Email Address
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full h-9 px-3 bg-[#f3f4f6] text-[#737687] rounded-xl text-xs cursor-not-allowed"
              />
            </div>

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
                Registered Entity Trading Name
              </label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                Warehouse / Office Physical Address
              </label>
              <input
                type="text"
                value={profile.businessAddress}
                onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })}
                className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* C. Marketplace & Notification Preferences */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#131b2e] pb-3 border-b border-[#eaedff]">
          Marketplace &amp; Alert Preferences
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9ff] cursor-pointer">
            <div>
              <div className="font-semibold text-[#131b2e]">Incoming Purchase Order Notifications</div>
              <div className="text-[11px] text-[#5e6b7f]">Receive instant alerts whenever a hospital or pharmacy submits a PO</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailOnNewOrder}
              onChange={(e) => setNotifications({ ...notifications, emailOnNewOrder: e.target.checked })}
              className="w-4 h-4 text-[#0047c1] rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9ff] cursor-pointer">
            <div>
              <div className="font-semibold text-[#131b2e]">Low Stock &amp; Expiry Warnings</div>
              <div className="text-[11px] text-[#5e6b7f]">Notify when inventory falls below 500 units or batches expire within 30 days</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.lowStockAlerts}
              onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
              className="w-4 h-4 text-[#0047c1] rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9ff] cursor-pointer">
            <div>
              <div className="font-semibold text-[#131b2e]">Direct Order Chat Messages</div>
              <div className="text-[11px] text-[#5e6b7f]">Receive notifications for clarification messages sent by buyers on orders</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailOnDispute}
              onChange={(e) => setNotifications({ ...notifications, emailOnDispute: e.target.checked })}
              className="w-4 h-4 text-[#0047c1] rounded"
            />
          </label>
        </div>
      </div>

      {/* D. Security & Password Change */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#131b2e] pb-3 border-b border-[#eaedff]">
          Account Security
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordState.current}
                onChange={(e) => setPasswordState({ ...passwordState, current: e.target.value })}
                className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordState.newPass}
                onChange={(e) => setPasswordState({ ...passwordState, newPass: e.target.value })}
                className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordState.confirm}
                onChange={(e) => setPasswordState({ ...passwordState, confirm: e.target.value })}
                className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#0047c1] rounded-xl text-xs font-semibold"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* E. Logout and Support */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#131b2e]">Session &amp; Account Actions</h3>
          <p className="text-xs text-[#5e6b7f]">Log out of this browser or contact platform operations</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onShowToast?.('Support ticket created. Platform operations will respond within 4 business hours.', 'info')}
            className="px-3.5 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#434655] rounded-xl text-xs font-semibold"
          >
            Contact Support
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-2 bg-[#ba1a1a] hover:bg-[#991b1b] text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
