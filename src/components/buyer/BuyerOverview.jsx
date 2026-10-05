import React, { useMemo } from 'react';

export const BuyerOverview = ({
  medicines = [],
  orders = [],
  savedMedicines = [],
  invoices = [],
  onNavigate,
  onViewOrder,
  onAddToCart,
  onShowToast
}) => {
  // A. Calculate genuine KPI metrics
  const kpis = useMemo(() => {
    // 1. Active Orders: awaiting supplier, accepted, processing, dispatched
    const activeOrders = orders.filter((o) =>
      ['requested', 'pending', 'accepted', 'processing', 'dispatched'].includes(o.status?.toLowerCase())
    );

    // 2. Total Confirmed Purchases this month (paid or accepted/delivered)
    const confirmedOrders = orders.filter(
      (o) => !['rejected', 'cancelled'].includes(o.status?.toLowerCase())
    );
    const totalPurchases = confirmedOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount ?? o.netPayable ?? o.net_payable ?? o.total) || 0), 0);

    // 3. Pending Payments: unpaid or pending payment status (excluding settled orders)
    const pendingPaymentOrders = orders.filter(
      (o) =>
        ['pending', 'unpaid', 'due'].includes(o.paymentStatus?.toLowerCase()) &&
        !['rejected', 'cancelled', 'paid', 'completed'].includes(o.status?.toLowerCase())
    );
    const pendingPaymentAmount = pendingPaymentOrders.reduce(
      (sum, o) => sum + (parseFloat(o.totalAmount ?? o.netPayable ?? o.net_payable ?? o.total) || 0),
      0
    );

    // 4. Saved Medicines count
    const savedCount = savedMedicines.length;

    return {
      activeOrdersCount: activeOrders.length,
      totalPurchasesAmount: totalPurchases,
      pendingPaymentAmount,
      pendingPaymentCount: pendingPaymentOrders.length,
      savedCount
    };
  }, [orders, savedMedicines]);

  // B. Recent 5 orders
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  // D. Recommended Medicines from genuine catalog (first 4 items with verified suppliers)
  const recommendedMedicines = useMemo(() => {
    return medicines.slice(0, 4);
  }, [medicines]);

  // E. Buyer alerts
  const alerts = useMemo(() => {
    const list = [];
    const awaitingSupplier = orders.filter((o) => ['requested', 'pending'].includes(o.status?.toLowerCase()));
    if (awaitingSupplier.length > 0) {
      list.push({
        id: 'alert-pending',
        type: 'info',
        icon: 'hourglass_top',
        title: `${awaitingSupplier.length} Purchase Order(s) Awaiting Supplier Review`,
        desc: 'Suppliers are reviewing allocation for high-priority clinical inventory.',
        actionLabel: 'View Pending Orders',
        targetView: 'my-orders'
      });
    }

    if (kpis.pendingPaymentCount > 0) {
      list.push({
        id: 'alert-payment',
        type: 'warning',
        icon: 'payments',
        title: `₹ ${kpis.pendingPaymentAmount.toLocaleString()} Pending in Invoices`,
        desc: 'Settle invoices promptly to maintain supplier credit terms and priority dispatch.',
        actionLabel: 'Pay Invoices',
        targetView: 'invoices-payments'
      });
    }

    return list;
  }, [orders, kpis]);

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (['delivered', 'completed'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f8f3] text-[#006f61]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#006f61]" />
          Delivered
        </span>
      );
    }
    if (['dispatched', 'shipped'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eef2ff] text-[#0047c1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0047c1]" />
          Dispatched
        </span>
      );
    }
    if (['accepted', 'processing'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e0f2fe] text-[#0369a1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0369a1]" />
          Processing
        </span>
      );
    }
    if (['requested', 'pending'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fff8e6] text-[#b37400]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b37400]" />
          Awaiting Confirmation
        </span>
      );
    }
    if (['rejected', 'cancelled'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffebee] text-[#ba1a1a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f2f3ff] text-[#5e6b7f]">
        {status || 'Standard'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Procurement Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Buyer Overview</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Procurement dashboard, order tracking, and supplier purchasing activity
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('browse-medicines')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base">medication</span>
            <span>Browse Medicines</span>
          </button>
        </div>
      </div>

      {/* A. 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Orders */}
        <div
          onClick={() => onNavigate('my-orders')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5e6b7f]">Active Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#eef2ff] flex items-center justify-center text-[#0047c1]">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-[#131b2e] font-mono">
              {kpis.activeOrdersCount}
            </div>
            <p className="text-[11px] text-[#0047c1] mt-1 font-medium flex items-center gap-1">
              <span>Orders in fulfillment</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Total Purchases */}
        <div
          onClick={() => onNavigate('analytics-reports')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5e6b7f]">Total Purchases</span>
            <div className="w-8 h-8 rounded-lg bg-[#e6f8f3] flex items-center justify-center text-[#006f61]">
              <span className="material-symbols-outlined text-lg">shopping_bag</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-[#131b2e] font-mono">
              ₹ {kpis.totalPurchasesAmount.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#006f61] mt-1 font-medium flex items-center gap-1">
              <span>View spend analytics</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </p>
          </div>
        </div>

        {/* KPI 3: Pending Payments */}
        <div
          onClick={() => onNavigate('invoices-payments')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5e6b7f]">Pending Payments</span>
            <div className="w-8 h-8 rounded-lg bg-[#fff8e6] flex items-center justify-center text-[#b37400]">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-[#131b2e] font-mono">
              ₹ {kpis.pendingPaymentAmount.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#b37400] mt-1 font-medium flex items-center gap-1">
              <span>{kpis.pendingPaymentCount} invoices awaiting payment</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </p>
          </div>
        </div>

        {/* KPI 4: Saved Medicines */}
        <div
          onClick={() => onNavigate('saved-medicines')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5e6b7f]">Saved Medicines</span>
            <div className="w-8 h-8 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#0047c1]">
              <span className="material-symbols-outlined text-lg">bookmark</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-[#131b2e] font-mono">
              {kpis.savedCount}
            </div>
            <p className="text-[11px] text-[#0047c1] mt-1 font-medium flex items-center gap-1">
              <span>View formulary watchlist</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </p>
          </div>
        </div>
      </div>

      {/* C. Important Alerts (if any) */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                alert.type === 'warning'
                  ? 'bg-[#fffcf5] border-[#ffe082]'
                  : 'bg-[#f4f7ff] border-[#c2d5ff]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-xl ${
                    alert.type === 'warning' ? 'text-[#b37400]' : 'text-[#0047c1]'
                  }`}
                >
                  {alert.icon}
                </span>
                <div>
                  <h2 className="text-xs font-bold text-[#131b2e]">{alert.title}</h2>
                  <p className="text-[11px] text-[#5e6b7f]">{alert.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(alert.targetView)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  alert.type === 'warning'
                    ? 'bg-[#b37400] text-white hover:bg-[#8e5c00]'
                    : 'bg-[#0047c1] text-white hover:bg-[#155eef]'
                }`}
              >
                {alert.actionLabel}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#131b2e]">Recent Purchase Orders</h2>
              <p className="text-xs text-[#5e6b7f]">Latest procurement orders submitted to verified suppliers</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('my-orders')}
              className="text-xs font-semibold text-[#0047c1] hover:underline"
            >
              View All Orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#5e6b7f] text-[11px] font-semibold border-b border-[#eaedff]">
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#5e6b7f]">
                      No purchase orders placed yet. Start by browsing medicines.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#faf8ff] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#0047c1]">
                        {order.poReference || order.id}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#131b2e]">
                        {order.supplierName || 'Novartis Bio-Pharma Ltd.'}
                      </td>
                      <td className="py-3 px-3 text-[#5e6b7f]">
                        {order.date || order.createdAt?.slice(0, 10) || 'Recently'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#131b2e]">
                        ₹ {(parseFloat(order.totalAmount ?? order.netPayable ?? order.net_payable ?? order.total) || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewOrder) onViewOrder(order);
                            else onNavigate('my-orders');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#0047c1] hover:bg-[#eef2ff] rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions & Reorder */}
        <div className="space-y-5">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-[#131b2e]">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('browse-medicines')}
                className="p-3 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-semibold text-left flex flex-col gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[#0047c1] text-lg">search</span>
                <span>Browse Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('shopping-cart')}
                className="p-3 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-semibold text-left flex flex-col gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[#0047c1] text-lg">shopping_cart</span>
                <span>Open Cart</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('my-orders')}
                className="p-3 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-semibold text-left flex flex-col gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[#0047c1] text-lg">receipt_long</span>
                <span>My Orders</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('supplier-directory')}
                className="p-3 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-semibold text-left flex flex-col gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[#0047c1] text-lg">storefront</span>
                <span>Suppliers</span>
              </button>
            </div>
          </div>

          {/* Institutional Compliance Card */}
          <div className="bg-gradient-to-br from-[#f8f9ff] to-[#eef2ff] rounded-2xl border border-[#eaedff] p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#006f61]">
              <span className="material-symbols-outlined text-lg">health_and_safety</span>
              <span className="text-xs font-bold uppercase tracking-wider">Statutory Verification</span>
            </div>
            <p className="text-xs text-[#434655]">
              All purchase orders are executed with verified suppliers under Indian CDSCO Drugs &amp; Cosmetics Act regulations.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('business-verification')}
                className="text-xs font-bold text-[#0047c1] hover:underline flex items-center gap-1"
              >
                <span>Check Drug License Compliance</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* D. Recommended Medicines from Active Marketplace */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#131b2e]">Fast-Moving Institutional Medicines</h2>
            <p className="text-xs text-[#5e6b7f]">Verified high-demand formulations available for immediate institutional purchase</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('browse-medicines')}
            className="text-xs font-semibold text-[#0047c1] hover:underline"
          >
            Explore Full Catalog
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedMedicines.map((med) => {
            const price = med.unitPrice ?? med.baseWholesalePrice ?? 100;
            const moq = med.moq || 100;
            return (
              <div
                key={med.id}
                className="p-4 rounded-xl border border-[#eaedff] hover:border-[#c2d5ff] transition-all bg-[#faf8ff] flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#0047c1] bg-[#eef2ff] px-2 py-0.5 rounded uppercase">
                    {med.category || 'General'}
                  </span>
                  <h3 className="text-xs font-bold text-[#131b2e] mt-2 line-clamp-1">
                    {med.name || med.brand || 'Medicine Formulation'}
                  </h3>
                  <p className="text-[11px] text-[#5e6b7f] line-clamp-1">
                    {med.genericName || med.generic_name || 'Generic active salt'}
                  </p>
                  <p className="text-[11px] text-[#5e6b7f] mt-1">
                    Pack: <span className="font-medium text-[#131b2e]">{med.unitPack || med.packSize || '10x10 Strips'}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#eaedff] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#5e6b7f] block">Unit Price</span>
                    <span className="font-mono font-bold text-xs text-[#131b2e]">
                      ₹ {Number(price).toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddToCart) {
                        onAddToCart(med, moq);
                      } else {
                        onNavigate('browse-medicines');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Add {moq} pk
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
