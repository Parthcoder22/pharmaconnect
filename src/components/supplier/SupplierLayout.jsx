import React, { useState } from 'react';
import { SupplierHeader } from './SupplierHeader';
import { SupplierSidebar } from './SupplierSidebar';

export const SupplierLayout = ({
  currentUser,
  businessInfo,
  activeView,
  onNavigate,
  onLogout,
  pendingOrdersCount = 0,
  lowStockCount = 0,
  expiringBatchesCount = 0,
  unreadChatCount = 0,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  children
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] font-sans">
      {/* Top Header */}
      <SupplierHeader
        currentUser={currentUser}
        businessInfo={businessInfo}
        unreadCount={notifications.filter((n) => !n.read).length}
        notifications={notifications}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onMarkNotificationRead={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
      />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <SupplierSidebar
          activeView={activeView}
          onNavigate={onNavigate}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          pendingOrdersCount={pendingOrdersCount}
          lowStockCount={lowStockCount}
          expiringBatchesCount={expiringBatchesCount}
          unreadChatCount={unreadChatCount}
          verificationStatus={currentUser?.verificationStatus || businessInfo?.verification_status || currentUser?.verification_status || 'pending'}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 xl:pl-72 w-full min-w-0 transition-all">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
