import React from 'react';

export const SupplierSidebar = ({
  activeView,
  onNavigate,
  isMobileOpen = false,
  onCloseMobile,
  pendingOrdersCount = 0,
  lowStockCount = 0,
  expiringBatchesCount = 0,
  unreadChatCount = 0,
  verificationStatus = 'verified'
}) => {
  const navItems = [
    {
      id: 'overview-dashboard',
      label: 'Overview Dashboard',
      icon: 'dashboard'
    },
    {
      id: 'medicine-inventory',
      label: 'Medicine Inventory',
      icon: 'medication',
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-[#fff0eb] text-[#d9381e]'
    },
    {
      id: 'purchase-orders',
      label: 'Purchase Orders',
      icon: 'shopping_cart_checkout',
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Pending` : undefined,
      badgeColor: 'bg-[#eff4ff] text-[#0047c1]'
    },
    {
      id: 'batch-expiry-alerts',
      label: 'Batch & Expiry Alerts',
      icon: 'notification_important',
      badge: expiringBatchesCount > 0 ? `${expiringBatchesCount} Expiring` : undefined,
      badgeColor: 'bg-[#fef2f2] text-[#b91c1c]'
    },
    {
      id: 'invoices-payments',
      label: 'Invoices & Payments',
      icon: 'receipt_long'
    },
    {
      id: 'analytics-reports',
      label: 'Analytics & Reports',
      icon: 'insights'
    },
    {
      id: 'order-chat',
      label: 'Order Chat',
      icon: 'forum',
      badge: unreadChatCount > 0 ? `${unreadChatCount}` : undefined,
      badgeColor: 'bg-[#0047c1] text-white'
    },
    {
      id: 'regulatory-kyc',
      label: 'Regulatory & Business Verification',
      icon: 'verified_user',
      badge: verificationStatus === 'verified' ? 'Verified' : 'Required',
      badgeColor: verificationStatus === 'verified' ? 'bg-[#e6f8f3] text-[#006f61]' : 'bg-[#fff8e6] text-[#b37400]'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#131b2e]/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Persistent Aside */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 xl:w-72 bg-white border-r border-[#eaedff] z-30 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3.5 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase text-[#5e6b7f] tracking-wider">
            Supplier Operations
          </div>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                activeView === item.id ||
                (item.id === 'purchase-orders' && activeView === 'purchase-requests-orders') ||
                (item.id === 'medicine-inventory' && activeView === 'medicine-catalog') ||
                (item.id === 'invoices-payments' && activeView === 'invoices-gst');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors ${
                    isActive
                      ? 'bg-[#0047c1] text-white font-semibold shadow-xs'
                      : 'text-[#434655] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[19px] shrink-0 ${
                        isActive ? 'text-white' : 'text-[#5e6b7f]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate text-left">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
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

        {/* Bottom Account & Marketplace Status */}
        <div className="p-4 border-t border-[#eaedff] bg-[#faf8ff] space-y-3">
          <div className="p-3 rounded-xl bg-white border border-[#eaedff] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#131b2e]">Business Status</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#006f61]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006f61]"></span>
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#5e6b7f] mt-1">
              Wholesale catalog visible to verified hospital buyers and retail pharmacies.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('medicine-inventory')}
              className="mt-2.5 w-full text-center text-xs font-semibold text-[#0047c1] hover:text-[#155eef] hover:underline"
            >
              View Marketplace Catalog →
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
