import React from 'react';

export const Sidebar = ({
  activeView,
  onNavigate,
  userRole,
  isMobileOpen = false,
  onCloseMobile,
  onLogout
}) => {
  const navItems = [
    {
      id: 'overview-dashboard',
      label: userRole === 'buyer' ? 'Buyer Overview' : 'Overview Dashboard',
      icon: 'dashboard',
      badge: userRole === 'supplier' ? '18 POs' : undefined
    },
    {
      id: 'medicine-catalog',
      label: 'Medicine Inventory',
      icon: 'medication',
      badge: '320'
    },
    {
      id: 'purchase-requests-orders',
      label: 'Purchase Orders',
      icon: 'shopping_cart_checkout',
      badge: 'Active'
    },
    {
      id: 'batch-expiry-alerts',
      label: 'Batch & Expiry Alerts',
      icon: 'notification_important',
      badge: '3 Critical',
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      id: 'invoices-gst',
      label: 'Invoices & GST',
      icon: 'receipt_long',
      badge: 'E-Way'
    },
    ...(userRole === 'buyer'
      ? [
          {
            id: 'patient-billing',
            label: 'Patient Dispense Bill',
            icon: 'prescriptions',
            badge: 'Rx'
          }
        ]
      : []),
    {
      id: 'analytics-reports',
      label: 'Analytics Reports',
      icon: 'insights'
    },
    {
      id: 'order-chat',
      label: 'Order Chat',
      icon: 'forum',
      badge: 'Live'
    },
    {
      id: 'regulatory-kyc',
      label: 'Regulatory Audit',
      icon: 'verified_user'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#283044]/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Persistent Aside */}
      <aside
        className={`fixed left-0 top-[96px] bottom-0 w-64 xl:w-72 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#eaedff] z-30 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-2">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#434655] tracking-wider font-sans">
              Procurement Suite
            </span>
            <span className="text-[10px] font-mono text-[#0047c1] bg-[#e2e7ff] px-2 py-0.5 rounded font-semibold">
              {userRole === 'supplier' ? 'Tier 1 C&F' : 'NABH Hosp'}
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                activeView === item.id ||
                (item.id === 'purchase-requests-orders' && activeView === 'purchase-orders') ||
                (item.id === 'medicine-catalog' && activeView === 'medicine-inventory');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#155eef] text-white font-semibold shadow-sm'
                      : 'text-[#434655] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isActive ? 'text-white' : 'text-[#737687]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-[#eaedff] text-[#003da9]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Audit Readiness Status Box & Quick Actions */}
        <div className="p-4 border-t border-[#eaedff] bg-[#f2f3ff]/50 space-y-3">
          <div className="p-3 rounded-lg bg-white shadow-sm border border-[#eaedff]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-[#006b5d] font-bold uppercase tracking-wider">
                FDA / cGMP Active
              </span>
              <span className="material-symbols-outlined text-[#006b5d] text-base">
                check_circle
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#434655]">
              Next statutory audit: <strong>18 Nov 2025</strong>
            </p>
            <div className="w-full bg-[#eaedff] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#006b5d] h-full rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onNavigate('landing');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-[#0047c1] hover:bg-[#eaedff] rounded-xl transition-all border border-[#eaedff]"
            >
              <span className="material-symbols-outlined text-base">home</span>
              <span>Back to Homepage</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-all border border-[#ffdad6]/50"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
