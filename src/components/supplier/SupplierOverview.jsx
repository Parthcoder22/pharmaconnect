import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const SupplierOverview = ({
  medicines = [],
  orders = [],
  onNavigate,
  onOpenAddMedicine,
  onViewOrder
}) => {
  // 1. Calculate realistic KPIs
  const activeMedicinesCount = useMemo(() => {
    return medicines.filter((m) => m.status !== 'inactive' && m.status !== 'discontinued').length;
  }, [medicines]);

  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'requested' || o.status === 'pending' || o.status === 'processing'
    );
  }, [orders]);

  const lowStockMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const stock = m.stock ?? m.total_stock_available ?? 0;
      const minThreshold = m.minThreshold ?? 500;
      return stock <= minThreshold;
    });
  }, [medicines]);

  // Confirmed monthly sales: orders marked accepted, processing, dispatched, delivered, paid, or completed
  const monthlySales = useMemo(() => {
    const validOrders = orders.filter(
      (o) => o.status !== 'rejected' && o.status !== 'cancelled'
    );
    return validOrders.reduce((sum, o) => sum + (Number(o.netPayable) || 0), 0);
  }, [orders]);

  // 2. Recent 5 orders
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [orders]);

  // 3. Action Required items
  const actionItems = useMemo(() => {
    const items = [];

    // Pending orders
    if (pendingOrders.length > 0) {
      items.push({
        id: 'act-orders',
        title: `${pendingOrders.length} Order${pendingOrders.length > 1 ? 's' : ''} Awaiting Review`,
        description: 'Hospital and pharmacy purchase orders awaiting acceptance and confirmation.',
        urgency: 'high',
        actionLabel: 'Review Orders',
        targetView: 'purchase-orders',
        icon: 'shopping_cart_checkout'
      });
    }

    // Low stock
    if (lowStockMedicines.length > 0) {
      items.push({
        id: 'act-stock',
        title: `${lowStockMedicines.length} Medicine${lowStockMedicines.length > 1 ? 's' : ''} Running Low`,
        description: 'Stock has fallen below minimum buffer levels. Restock to prevent lost sales.',
        urgency: 'medium',
        actionLabel: 'Update Stock',
        targetView: 'medicine-inventory',
        icon: 'inventory_2'
      });
    }

    // Default action item if everything is caught up
    if (items.length === 0) {
      if (medicines.length === 0) {
        items.push({
          id: 'act-add-first-med',
          title: 'Add Your First Formulation',
          description: 'Your inventory catalog is currently empty. Add your pharmaceutical formulations to begin receiving purchase orders.',
          urgency: 'medium',
          actionLabel: 'Add Medicine',
          targetView: 'medicine-inventory',
          icon: 'add_circle'
        });
      } else {
        items.push({
          id: 'act-good',
          title: 'All Operations Clear',
          description: 'No urgent actions required. All purchase requests have been reviewed.',
          urgency: 'low',
          actionLabel: 'View Catalog',
          targetView: 'medicine-inventory',
          icon: 'check_circle'
        });
      }
    }

    return items;
  }, [pendingOrders, lowStockMedicines, medicines]);

  // 4. Sales Trend data for Recharts
  const salesChartData = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }
    // Group recent orders into a simple 7-day trend
    const dayMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    orders.forEach((o) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const d = o.createdAt ? days[new Date(o.createdAt).getDay()] || 'Mon' : 'Mon';
      if (dayMap[d] !== undefined) {
        dayMap[d] += Number(o.netPayable) || 0;
      }
    });
    return Object.entries(dayMap).map(([date, sales]) => ({ date, sales }));
  }, [orders]);

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'requested':
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff8e6] text-[#b37400]">
            Pending
          </span>
        );
      case 'accepted':
      case 'processing':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff4ff] text-[#0047c1]">
            Processing
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f8f3] text-[#006f61]">
            Dispatched
          </span>
        );
      case 'delivered':
      case 'completed':
      case 'paid':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f8f3] text-[#006f61]">
            Completed
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fde8e8] text-[#c81e1e]">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f3f4f6] text-[#4b5563]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Overview Dashboard</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Key operational metrics, incoming orders, and business inventory status
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAddMedicine}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* A. 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Listed Medicines */}
        <div
          onClick={() => onNavigate('medicine-inventory')}
          className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#5e6b7f]">Total Listed Medicines</span>
            <span className="p-2 rounded-xl bg-[#eff4ff] text-[#0047c1]">
              <span className="material-symbols-outlined text-lg">medication</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#131b2e] font-mono">
              {activeMedicinesCount}
            </div>
            <div className="text-[11px] text-[#006f61] font-medium mt-1 flex items-center gap-1">
              <span>Active catalog listings</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pending Orders */}
        <div
          onClick={() => onNavigate('purchase-orders')}
          className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#5e6b7f]">Pending Orders</span>
            <span className="p-2 rounded-xl bg-[#fff8e6] text-[#b37400]">
              <span className="material-symbols-outlined text-lg">pending_actions</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#131b2e] font-mono">
              {pendingOrders.length}
            </div>
            <div className="text-[11px] text-[#b37400] font-medium mt-1">
              Requires supplier response
            </div>
          </div>
        </div>

        {/* KPI 3: Monthly Sales */}
        <div
          onClick={() => onNavigate('analytics-reports')}
          className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#5e6b7f]">Confirmed Monthly Sales</span>
            <span className="p-2 rounded-xl bg-[#e6f8f3] text-[#006f61]">
              <span className="material-symbols-outlined text-lg">payments</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#131b2e] font-mono">
              ₹ {monthlySales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-[#5e6b7f] font-medium mt-1">
              Accepted &amp; fulfilled orders
            </div>
          </div>
        </div>

        {/* KPI 4: Low Stock Medicines */}
        <div
          onClick={() => onNavigate('medicine-inventory')}
          className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#5e6b7f]">Low Stock Medicines</span>
            <span className="p-2 rounded-xl bg-[#fff0eb] text-[#d9381e]">
              <span className="material-symbols-outlined text-lg">production_quantity_limits</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#131b2e] font-mono">
              {lowStockMedicines.length}
            </div>
            <div className="text-[11px] text-[#d9381e] font-medium mt-1">
              Below threshold (&lt;500 units)
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Recent Orders (B) + Action Required (C) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* B. Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <h2 className="text-sm font-bold text-[#131b2e]">Recent Orders</h2>
                <p className="text-[11px] text-[#5e6b7f]">Latest buyer purchase requests</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('purchase-orders')}
                className="text-xs font-semibold text-[#0047c1] hover:underline"
              >
                View All Orders →
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#5e6b7f] text-[11px] font-semibold border-b border-[#eaedff]">
                    <th className="pb-2.5 font-medium">Order ID</th>
                    <th className="pb-2.5 font-medium">Buyer</th>
                    <th className="pb-2.5 font-medium">Date</th>
                    <th className="pb-2.5 font-medium">Items</th>
                    <th className="pb-2.5 font-medium">Total</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-xs text-[#5e6b7f]">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const itemCount = order.items?.length || 1;
                      return (
                        <tr key={order.id} className="hover:bg-[#faf8ff] transition-colors">
                          <td className="py-3 font-mono font-semibold text-[#0047c1]">
                            {order.poReference || order.id}
                          </td>
                          <td className="py-3 font-medium text-[#131b2e] truncate max-w-[140px]">
                            {order.buyerName || 'Hospital Facility'}
                          </td>
                          <td className="py-3 text-[#5e6b7f]">
                            {order.createdAt || 'Today'}
                          </td>
                          <td className="py-3 text-[#5e6b7f]">
                            {itemCount} {itemCount > 1 ? 'items' : 'item'}
                          </td>
                          <td className="py-3 font-mono font-semibold text-[#131b2e]">
                            ₹ {Number(order.netPayable || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3">
                            {getOrderStatusBadge(order.status)}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (onViewOrder) onViewOrder(order);
                                else onNavigate('purchase-orders');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-[#0047c1] hover:bg-[#eff4ff] rounded-lg transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* C. Action Required (1 Col) */}
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
            <h2 className="text-sm font-bold text-[#131b2e]">Action Required</h2>
            <span className="text-[11px] font-semibold text-[#ba1a1a]">
              {actionItems.filter((a) => a.urgency !== 'low').length} Pending
            </span>
          </div>

          <div className="mt-3 space-y-3 flex-1">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#eaedff] bg-[#faf8ff] space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`material-symbols-outlined text-lg p-1 rounded-lg shrink-0 ${
                      item.urgency === 'high'
                        ? 'bg-[#fde8e8] text-[#c81e1e]'
                        : item.urgency === 'medium'
                        ? 'bg-[#fff0eb] text-[#d9381e]'
                        : 'bg-[#e6f8f3] text-[#006f61]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#131b2e] leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#5e6b7f] mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.targetView)}
                    className="text-xs font-semibold text-[#0047c1] hover:underline"
                  >
                    {item.actionLabel} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* D. Quick Actions */}
          <div className="pt-4 border-t border-[#eaedff] mt-4">
            <span className="text-[11px] font-bold uppercase text-[#5e6b7f] tracking-wider block mb-2">
              Quick Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenAddMedicine}
                className="p-2.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-semibold text-left flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#0047c1]">add_circle</span>
                <span>Add Medicine</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('purchase-orders')}
                className="p-2.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-semibold text-left flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#0047c1]">list_alt</span>
                <span>View Orders</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('medicine-inventory')}
                className="p-2.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-semibold text-left flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#0047c1]">inventory</span>
                <span>Update Stock</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('invoices-payments')}
                className="p-2.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-semibold text-left flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#0047c1]">receipt</span>
                <span>View Invoices</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* E. Clean Sales Trend Chart */}
      <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <div>
            <h2 className="text-sm font-bold text-[#131b2e]">Weekly Sales Trend</h2>
            <p className="text-[11px] text-[#5e6b7f]">
              Confirmed order value over the current period (₹ INR)
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('analytics-reports')}
            className="text-xs font-semibold text-[#0047c1] hover:underline"
          >
            Detailed Analytics →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#0047c1] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
            <h3 className="text-xs font-bold text-[#131b2e]">No Sales Analysis Available</h3>
            <p className="text-[11px] text-[#5e6b7f] max-w-sm mt-1">
              Sales performance trends will appear here once purchase orders are received and confirmed.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0047c1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0047c1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaedff" />
                <XAxis
                  dataKey="date"
                  stroke="#5e6b7f"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#eaedff' }}
                />
                <YAxis
                  stroke="#5e6b7f"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #eaedff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0047c1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
