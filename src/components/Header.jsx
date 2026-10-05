import React, { useState } from 'react';

export const Header = ({
  currentUser,
  activeView,
  onNavigate,
  onSwitchUser,
  onOpenAuth,
  onLogout,
  unreadNotificationsCount = 0,
  notifications = [],
  onMarkNotificationRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      {/* Top Regulatory Verification Notice Ribbon */}
      <div className="w-full bg-[#e2e7ff] text-[#131b2e] py-1.5 px-4 sm:px-8 flex items-center justify-between text-xs border-b border-[#dae2fd] z-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#83f6e0] text-[#00201b] font-semibold text-[10px] tracking-wider uppercase">
            CDSCO &amp; State FDA Compliant
          </span>
          <span className="text-[#434655] truncate text-[11px]">
            Digital verification mandatory under Drug &amp; Cosmetics Rules Form 20B/21B and Schedule M cGMP regulations.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[#434655] font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006b5d] animate-pulse"></span>
            GATEWAY NODE: MH-CENTRAL-01
          </span>
          <span className="opacity-40">|</span>
          <span>GSTIN &amp; DL REAL-TIME VALIDATION: ACTIVE</span>
        </div>
      </div>

      {/* Main Persistent Header */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#eaedff]">
        <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Primary Navigation */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => {
                if (currentUser) {
                  onNavigate(currentUser.role === 'supplier' ? 'overview-dashboard' : 'buyer-overview');
                } else {
                  onNavigate('landing');
                }
              }}
              className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
            >
              <img
                alt="PharmaConnect Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1UO5_tyDRPaj7nyvc1dDCQgK0vlMqv9_N8BbwwCcOZs3sUU18Dx_zExBvTGjIbc_RrB-6VX6Ylb9XiISp4v1yl9VPYb2PHBhV_0gCqCLcDHLWQcA7WSl85l4y9TPEP4QS17xJp_nxoz1CsH2e_CjtXJT427MbT9noJfef7JS8zq42Ggv6LQavt4flL5lu_kBiQ8kssK5AEy0FSIsHm4AVoSylQdThCMh4l7ZAe0pij366-wQ9hMWwOKVp4"
              />
              <span className="font-bold text-lg sm:text-xl text-[#131b2e] tracking-tight font-sans">
                PharmaConnect
              </span>
              <span className="text-[11px] font-semibold bg-[#e2e7ff] text-[#003da9] px-2 py-0.5 rounded uppercase">
                B2B Core
              </span>
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate(currentUser.role === 'supplier' ? 'overview-dashboard' : 'buyer-overview')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0047c1] text-white hover:bg-[#155eef] transition-colors shadow-xs ml-1"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                <span>{currentUser.role === 'supplier' ? 'Supplier Portal' : 'Buyer Hub'}</span>
              </button>
            )}
          </div>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <>
                {/* License Verified Chip */}
                <div className="hidden xl:flex items-center gap-1.5 bg-[#80f3dd]/30 text-[#006f61] px-3 py-1 rounded-full border border-[#006b5d]/20 shadow-sm text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#006b5d] shrink-0 animate-pulse"></span>
                  <span>Drug License: Verified</span>
                </div>

                {/* Notifications Button */}
                <div className="relative">
                  <button
                    aria-label="Notifications"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-[#434655] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors relative flex items-center justify-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#eaedff] py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2.5 border-b border-[#eaedff] flex items-center justify-between">
                        <span className="font-bold text-sm text-[#131b2e]">Statutory Alerts &amp; Audits</span>
                        {unreadNotificationsCount > 0 ? (
                          <span className="text-[11px] font-mono text-[#006b5d] bg-[#80f3dd]/40 px-2 py-0.5 rounded-full font-semibold">
                            {unreadNotificationsCount} New
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-[#737687] bg-[#eaedff] px-2 py-0.5 rounded-full font-semibold">
                            0 New
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-[#eaedff] max-h-80 overflow-y-auto">
                        {!notifications || notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-[#737687]">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="p-3 hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                              onClick={() => {
                                setShowNotifications(false);
                                if (onMarkNotificationRead && !notif.read) {
                                  onMarkNotificationRead(notif.id);
                                }
                                if (notif.targetView) onNavigate(notif.targetView);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#0047c1]">{notif.title}</span>
                                <span className="text-[10px] text-[#737687]">{notif.time || 'Recently'}</span>
                              </div>
                              <p className="text-xs text-[#434655] mt-0.5">
                                {notif.message || notif.description}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-[#eaedff] text-center">
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            onNavigate('overview-dashboard');
                          }}
                          className="text-xs font-semibold text-[#0047c1] hover:underline"
                        >
                          View All Compliance Logs
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-6 w-px bg-[#c3c6d8]/40"></div>

                {/* Profile Pill with Avatar */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 pl-1 hover:bg-[#f2f3ff] p-1.5 rounded-lg transition-colors"
                    type="button"
                  >
                    <img
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-[#c3c6d8]"
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}
                    />
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-semibold text-[#131b2e] leading-none">
                        {currentUser.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#434655] leading-tight mt-0.5">
                        {currentUser.role === 'supplier' ? 'Supplier Auth' : 'Buyer Auth'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-base text-[#434655]">
                      keyboard_arrow_down
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#eaedff] py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-3 border-b border-[#eaedff]">
                        <p className="text-sm font-bold text-[#131b2e]">{currentUser.name}</p>
                        <p className="text-xs text-[#434655] truncate">{currentUser.organization}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-block font-mono text-[10px] bg-[#f2f3ff] text-[#0047c1] px-2 py-0.5 rounded font-semibold">
                            {currentUser.gstin || '27AAACN0192Q1ZV'}
                          </span>
                          <span className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                            currentUser.role === 'supplier' ? 'bg-[#80f3dd]/40 text-[#006b5d]' : 'bg-[#e2e7ff] text-[#003da9]'
                          }`}>
                            {currentUser.role === 'supplier' ? 'Supplier' : 'Buyer'}
                          </span>
                        </div>
                      </div>

                      {/* Real User Navigation Shortcuts */}
                      <div className="px-3 py-2 space-y-1">
                        <div className="text-[11px] font-semibold text-[#737687] uppercase tracking-wider px-2 py-1">
                          Account Portal
                        </div>
                        {currentUser.role === 'supplier' ? (
                          <>
                            <button
                              onClick={() => {
                                onNavigate('overview-dashboard');
                                setShowProfileMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
                            >
                              <span className="material-symbols-outlined text-base text-[#0047c1]">dashboard</span>
                              <span className="font-semibold">Supplier Dashboard</span>
                            </button>
                            <button
                              onClick={() => {
                                onNavigate('medicine-inventory');
                                setShowProfileMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
                            >
                              <span className="material-symbols-outlined text-base text-[#0047c1]">medication</span>
                              <span>Medicine Inventory</span>
                            </button>
                            <button
                              onClick={() => {
                                onNavigate('purchase-orders');
                                setShowProfileMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
                            >
                              <span className="material-symbols-outlined text-base text-[#0047c1]">receipt_long</span>
                              <span>Orders &amp; Dispatches</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                onNavigate('buyer-overview');
                                setShowProfileMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
                            >
                              <span className="material-symbols-outlined text-base text-[#0047c1]">dashboard</span>
                              <span className="font-semibold">Procurement Hub</span>
                            </button>
                            <button
                              onClick={() => {
                                onNavigate('medicine-catalog');
                                setShowProfileMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
                            >
                              <span className="material-symbols-outlined text-base text-[#0047c1]">search</span>
                              <span>Browse Marketplace</span>
                            </button>
                            <button
                              onClick={() => {
                                onNavigate('my-orders');
                                setShowProfileMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
                            >
                              <span className="material-symbols-outlined text-base text-[#0047c1]">receipt_long</span>
                              <span>My Purchase Orders</span>
                            </button>
                          </>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#eaedff] px-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onNavigate('regulatory-kyc');
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#434655] hover:bg-[#f2f3ff] rounded-lg flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">verified_user</span>
                          <span>License &amp; Statutory KYC</span>
                        </button>
                        
                        {/* Logout Button in Dropdown */}
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            if (onLogout) onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-[#ba1a1a] font-bold hover:bg-[#ffdad6]/40 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">logout</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Header Logout Button */}
                <button
                  onClick={onLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors border border-transparent hover:border-[#ffdad6]"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              /* Logged Out Buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('supplier', 'signin')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('buyer', 'register')}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0047c1] text-white hover:bg-[#155eef] transition-colors shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
