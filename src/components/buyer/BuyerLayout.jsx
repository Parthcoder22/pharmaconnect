import React, { useState } from 'react';
import { BuyerHeader } from './BuyerHeader';
import { BuyerSidebar } from './BuyerSidebar';

export const BuyerLayout = ({
  currentUser,
  businessInfo,
  activeView,
  onNavigate,
  onLogout,
  onSwitchRole,
  cartItemCount = 0,
  pendingOrdersCount = 0,
  savedMedicinesCount = 0,
  unreadChatCount = 0,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  children
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] font-sans antialiased">
      {/* 1. Sticky Buyer Header */}
      <BuyerHeader
        currentUser={currentUser}
        businessInfo={businessInfo}
        cartUnitCount={cartItemCount}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        notifications={notifications}
        onOpenCart={() => onNavigate('shopping-cart')}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onSwitchRole={onSwitchRole}
        onMarkNotificationRead={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
      />

      {/* 2. Main Body with Persistent Sidebar & Content */}
      <div className="flex-1 flex w-full">
        {/* Persistent Sidebar */}
        <BuyerSidebar
          activeView={activeView}
          onNavigate={onNavigate}
          cartItemCount={cartItemCount}
          pendingOrdersCount={pendingOrdersCount}
          savedMedicinesCount={savedMedicinesCount}
          unreadChatCount={unreadChatCount}
          currentUser={currentUser}
          businessInfo={businessInfo}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {/* Mobile Navigation Trigger Button */}
          <div className="lg:hidden mb-4 flex items-center justify-between p-3 bg-white rounded-xl border border-[#eaedff] shadow-2xs">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#131b2e] px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] transition-colors"
            >
              <span className="material-symbols-outlined text-base text-[#0047c1]">menu</span>
              <span>Buyer Menu</span>
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-[#006f61] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#006f61]" />
              <span>Verified Buyer</span>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};
