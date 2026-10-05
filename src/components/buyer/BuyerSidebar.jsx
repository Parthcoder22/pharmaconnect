import React from 'react';

export const BuyerSidebar = ({
  activeView,
  onNavigate,
  cartItemCount = 0,
  pendingOrdersCount = 0,
  savedMedicinesCount = 0,
  unreadChatCount = 0,
  currentUser,
  businessInfo = {
    business_name: 'Apex Multispeciality Healthcare',
    verification_status: 'verified'
  },
  isMobileOpen = false,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'buyer-overview',
      label: 'Buyer Overview',
      icon: 'dashboard',
      description: 'Activity & quick actions'
    },
    {
      id: 'browse-medicines',
      label: 'Browse Medicines',
      icon: 'medication',
      description: 'Discover & compare offers'
    },
    {
      id: 'shopping-cart',
      label: 'Shopping Cart',
      icon: 'shopping_cart',
      count: cartItemCount,
      badgeColor: 'bg-[#0047c1] text-white',
      description: 'Review & place orders'
    },
    {
      id: 'my-orders',
      label: 'My Orders',
      icon: 'receipt_long',
      count: pendingOrdersCount,
      badgeColor: 'bg-[#fff8e6] text-[#b37400]',
      description: 'Track purchase orders'
    },
    {
      id: 'saved-medicines',
      label: 'Saved Medicines',
      icon: 'bookmark',
      count: savedMedicinesCount,
      badgeColor: 'bg-[#f2f3ff] text-[#0047c1]',
      description: 'Favorites & reorder lists'
    },
    {
      id: 'invoices-payments',
      label: 'Invoices & Payments',
      icon: 'payments',
      description: 'Billing & payment ledger'
    },
    {
      id: 'supplier-directory',
      label: 'Supplier Directory',
      icon: 'storefront',
      description: 'Verified pharma suppliers'
    },
    {
      id: 'order-chat',
      label: 'Order Chat',
      icon: 'chat',
      count: unreadChatCount,
      badgeColor: 'bg-[#0047c1] text-white',
      description: 'Supplier communication'
    },
    {
      id: 'analytics-reports',
      label: 'Analytics & Reports',
      icon: 'bar_chart',
      description: 'Purchasing spend trends'
    },
    {
      id: 'business-verification',
      label: 'Security & Verification',
      icon: 'verified_user',
      description: 'Drug license & KYC'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      description: 'Account & addresses'
    }
  ];

  const sidebarContent = (
    <aside className="w-64 xl:w-72 bg-white border-r border-[#eaedff] flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#5e6b7f]">
          Procurement Portal
        </div>

        {navItems.map((item) => {
          const isActive =
            activeView === item.id ||
            (item.id === 'browse-medicines' && activeView === 'medicine-catalog') ||
            (item.id === 'my-orders' && activeView === 'order-details') ||
            (item.id === 'shopping-cart' && activeView === 'checkout') ||
            (item.id === 'business-verification' &&
              ['security', 'security-verification', 'security-and-verification', 'regulatory-kyc', 'statutory-kyc'].includes(activeView));

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-[#eef2ff] text-[#0047c1] font-bold shadow-2xs'
                  : 'text-[#434655] hover:bg-[#faf8ff] hover:text-[#131b2e] font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`material-symbols-outlined text-lg shrink-0 ${
                    isActive ? 'text-[#0047c1]' : 'text-[#5e6b7f]'
                  }`}
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <span className="block text-xs truncate leading-snug">{item.label}</span>
                </div>
              </div>

              {item.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                    item.badgeColor || 'bg-[#f2f3ff] text-[#0047c1]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Business Card & Verification */}
      <div className="p-3 border-t border-[#eaedff] bg-[#f8f9ff]">
        <div
          onClick={() => {
            onNavigate('business-verification');
            onCloseMobile?.();
          }}
          className="p-3 bg-white rounded-xl border border-[#eaedff] hover:border-[#0047c1] cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-[#131b2e] truncate">
              {currentUser?.organization || businessInfo?.business_name}
            </span>
            <span className="material-symbols-outlined text-[#006f61] text-base shrink-0">
              verified
            </span>
          </div>
          <span className="block text-[11px] text-[#5e6b7f] truncate mt-0.5">
            DL: {currentUser?.licenseNumber || 'MH-MUM-20B-391827'}
          </span>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#0047c1] font-semibold">
            <span>Manage License</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0">{sidebarContent}</div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#131b2e]/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
