import React, { useState, useRef, useEffect } from 'react';

export const SupplierHeader = ({
  currentUser,
  businessInfo,
  unreadCount = 0,
  notifications = [],
  onNavigate,
  onLogout,
  onOpenMobileMenu,
  onMarkNotificationRead,
  onMarkAllNotificationsRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const businessName = currentUser?.organization || businessInfo?.business_name || currentUser?.businessName || (currentUser?.name ? `${currentUser.name}'s Pharmaceuticals` : 'Novartis Bio-Pharma Ltd.');
  const verificationStatus = currentUser?.verificationStatus || businessInfo?.verification_status || currentUser?.verification_status || 'pending';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e6f8f3] text-[#006f61] border border-[#a6ebd8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006f61]"></span>
            Verified Supplier
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff8e6] text-[#b37400] border border-[#f5dc99]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b37400]"></span>
            Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fde8e8] text-[#c81e1e] border border-[#f8b4b4]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c81e1e]"></span>
            Action Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9ca3af]"></span>
            Unverified
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-[#eaedff] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-[#434655] hover:text-[#131b2e] rounded-lg hover:bg-[#f2f3ff]"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('overview-dashboard')}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0047c1] flex items-center justify-center text-white shadow-sm font-bold text-lg">
              P
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg text-[#131b2e] tracking-tight leading-none">
                PharmaConnect
              </div>
              <div className="text-[10px] text-[#434655] font-medium tracking-wide uppercase mt-0.5">
                Supplier Portal
              </div>
            </div>
          </button>
        </div>

        {/* Middle: Current Supplier's Business Name & Status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-[#131b2e] leading-snug">
              {businessName}
            </span>
            <span className="text-[11px] text-[#5e6b7f]">
              {currentUser?.email || 'supplier@pharmaconnect.in'}
            </span>
          </div>
          {getStatusBadge(verificationStatus)}
        </div>

        {/* Right: Notifications & Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-[#434655] hover:text-[#131b2e] rounded-xl hover:bg-[#f2f3ff] relative transition-colors"
              aria-label="View notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#eaedff] py-2 z-50">
                <div className="px-4 py-2.5 border-b border-[#eaedff] flex items-center justify-between">
                  <span className="font-bold text-xs text-[#131b2e]">Notifications</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#0047c1] font-semibold">
                      {unreadCount} Unread
                    </span>
                    {unreadCount > 0 && onMarkAllNotificationsRead && (
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
                  </div>
                </div>
                <div className="divide-y divide-[#eaedff] max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#737687]">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (onMarkNotificationRead && !notif.read) {
                            onMarkNotificationRead(notif.id);
                          }
                          if (notif.targetView) onNavigate(notif.targetView);
                        }}
                        className={`p-3.5 hover:bg-[#f2f3ff] transition-colors cursor-pointer text-xs ${
                          !notif.read ? 'bg-[#f8f9ff]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#131b2e] flex items-center gap-1.5">
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                            )}
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-[#737687]">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-[#434655] line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Supplier Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl hover:bg-[#f2f3ff] transition-colors text-left"
              aria-label="User profile menu"
            >
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-[#131b2e] leading-tight">
                  {currentUser?.name || 'Dr. Aris Thorne'}
                </div>
                <div className="text-[10px] text-[#5e6b7f]">Supplier Account</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0047c1]/10 text-[#0047c1] flex items-center justify-center font-bold text-xs">
                {(currentUser?.name || 'A')[0]}
              </div>
              <span className="material-symbols-outlined text-sm text-[#737687]">expand_more</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#eaedff] py-1.5 z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-[#eaedff]">
                  <div className="font-bold text-[#131b2e]">{currentUser?.name || 'Dr. Aris Thorne'}</div>
                  <div className="text-[11px] text-[#5e6b7f] truncate">{currentUser?.email || 'supplier@pharmaconnect.in'}</div>
                  <div className="mt-1.5">{getStatusBadge(verificationStatus)}</div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigate('settings');
                    }}
                    className="w-full px-4 py-2 text-left text-[#434655] hover:bg-[#f2f3ff] hover:text-[#131b2e] flex items-center gap-2.5"
                  >
                    <span className="material-symbols-outlined text-base">settings</span>
                    <span>Account Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigate('regulatory-kyc');
                    }}
                    className="w-full px-4 py-2 text-left text-[#434655] hover:bg-[#f2f3ff] hover:text-[#131b2e] flex items-center gap-2.5"
                  >
                    <span className="material-symbols-outlined text-base">verified_user</span>
                    <span>Business Verification</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#eaedff]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-[#ba1a1a] hover:bg-[#fff2f0] flex items-center gap-2.5 font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
