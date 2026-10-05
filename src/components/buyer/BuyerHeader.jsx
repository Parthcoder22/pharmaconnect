import React, { useState, useRef, useEffect } from 'react';

export const BuyerHeader = ({
  currentUser,
  businessInfo = {
    business_name: 'Apex Multispeciality Healthcare',
    verification_status: 'verified'
  },
  cartUnitCount = 0,
  unreadNotificationsCount = 0,
  notifications = [],
  onOpenCart,
  onNavigate,
  onLogout,
  onSwitchRole,
  onMarkNotificationRead,
  onMarkAllNotificationsRead
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isVerified = (currentUser?.verificationStatus || businessInfo?.verification_status) === 'verified';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#eaedff] px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Branding & Role Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('buyer-overview')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0047c1] to-[#155eef] flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-xl">local_pharmacy</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#131b2e]">PharmaConnect</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e6f0ff] text-[#0047c1] uppercase tracking-wider">
                Buyer
              </span>
            </div>
            <p className="text-[11px] text-[#5e6b7f] hidden sm:block truncate max-w-[200px] md:max-w-xs">
              {currentUser?.organization || businessInfo?.business_name}
            </p>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 ml-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f8f3] text-[#006f61] border border-[#a2ecd8]">
              <span className="material-symbols-outlined text-xs">verified</span>
              Verified Purchaser
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff8e6] text-[#b37400] border border-[#ffe082]">
              <span className="material-symbols-outlined text-xs">pending</span>
              KYC Under Review
            </span>
          )}
        </div>
      </div>

      {/* Center Search Shortcut (Optional / Quick Jump) */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <button
          type="button"
          onClick={() => onNavigate('browse-medicines')}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] rounded-xl text-xs text-[#5e6b7f] transition-colors border border-[#eaedff]"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#0047c1]">search</span>
            <span>Search medicines, active salts, suppliers...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-[#eaedff] text-[#5e6b7f]">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Cart, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Shopping Cart Button */}
        <button
          type="button"
          onClick={onOpenCart || (() => onNavigate('shopping-cart'))}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] transition-colors border border-[#eaedff]"
          title="Shopping Cart"
        >
          <span className="material-symbols-outlined text-xl text-[#0047c1]">shopping_cart</span>
          <span className="text-xs font-bold hidden sm:inline">Cart</span>
          {cartUnitCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-[#0047c1] text-white text-[11px] font-bold">
              {cartUnitCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-[#5e6b7f] hover:bg-[#f2f3ff] hover:text-[#131b2e] transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#eaedff] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#131b2e]">Buyer Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e6f0ff] text-[#0047c1]">
                      {unreadNotificationsCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadNotificationsCount > 0 && onMarkAllNotificationsRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAllNotificationsRead();
                      }}
                      className="text-[11px] text-[#5e6b7f] hover:text-[#0047c1] underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate('my-orders')}
                    className="text-[11px] text-[#0047c1] hover:underline font-medium"
                  >
                    View Orders
                  </button>
                </div>
              </div>

              <div className="mt-2 divide-y divide-[#eaedff] max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#5e6b7f]">
                    No notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        if (onMarkNotificationRead && !n.read) {
                          onMarkNotificationRead(n.id);
                        }
                        if (n.targetView) onNavigate(n.targetView);
                      }}
                      className={`py-2.5 px-2 hover:bg-[#faf8ff] rounded-xl cursor-pointer transition-colors ${
                        !n.read ? 'bg-[#f4f7ff]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#131b2e] flex items-center gap-1.5">
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0047c1]" />
                          )}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-[#5e6b7f] shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#5e6b7f] mt-0.5 line-clamp-2">{n.message || n.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#f2f3ff] transition-colors"
          >
            <img
              src={
                currentUser?.avatarUrl ||
                'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256'
              }
              alt="Buyer Avatar"
              className="w-8 h-8 rounded-lg object-cover border border-[#eaedff]"
            />
            <div className="text-left hidden md:block">
              <span className="block text-xs font-bold text-[#131b2e] leading-tight">
                {currentUser?.name || 'Institutional Buyer'}
              </span>
              <span className="block text-[10px] text-[#5e6b7f] font-mono leading-tight">
                Hospital Buyer
              </span>
            </div>
            <span className="material-symbols-outlined text-[#5e6b7f] text-base hidden md:block">
              expand_more
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#eaedff] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-[#f8f9ff] rounded-xl mb-2">
                <span className="block text-xs font-bold text-[#131b2e]">
                  {currentUser?.organization || businessInfo?.business_name || 'Healthcare Establishment'}
                </span>
                <span className="block text-[11px] text-[#5e6b7f]">
                  {currentUser?.email || 'procurement@hospital.org'}
                </span>
                <span className="block text-[10px] font-mono text-[#0047c1] mt-1">
                  DL: {currentUser?.licenseNumber || 'Form 20/21 Pending'}
                </span>
              </div>

              <div className="space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('business-verification');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[#131b2e] hover:bg-[#f2f3ff] rounded-lg transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-base text-[#0047c1]">verified_user</span>
                  <span>Drug License &amp; KYC</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[#131b2e] hover:bg-[#f2f3ff] rounded-lg transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-base text-[#0047c1]">tune</span>
                  <span>Purchasing Settings</span>
                </button>

                <div className="pt-1.5 border-t border-[#eaedff]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[#ba1a1a] hover:bg-[#ffebee] rounded-lg transition-colors text-left font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
