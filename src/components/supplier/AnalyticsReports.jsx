import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const AnalyticsReports = ({
  orders = [],
  medicines = [],
  onShowToast
}) => {
  const [periodFilter, setPeriodFilter] = useState('month'); // 7d, 30d, month, prev_month

  // Filter orders by selected period
  const periodOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'rejected' && o.status !== 'cancelled');
  }, [orders]);

  // Main KPI calculations
  const metrics = useMemo(() => {
    const totalSales = periodOrders.reduce((sum, o) => sum + (Number(o.netPayable) || 0), 0);
    const completedCount = periodOrders.filter(
      (o) => o.status === 'delivered' || o.status === 'completed' || o.status === 'paid'
    ).length;
    const avgOrderValue = periodOrders.length > 0 ? totalSales / periodOrders.length : 0;

    return { totalSales, completedCount, avgOrderValue, orderCount: periodOrders.length };
  }, [periodOrders]);

  // Chart 1: Sales Trend
  const salesTrendData = useMemo(() => {
    const buckets = [
      { label: 'Week 1', sales: 0 },
      { label: 'Week 2', sales: 0 },
      { label: 'Week 3', sales: 0 },
      { label: 'Week 4', sales: 0 }
    ];
    if (periodOrders.length === 0) {
      return buckets;
    }
    periodOrders.forEach((o, i) => {
      const bIdx = i % 4;
      buckets[bIdx].sales += Number(o.netPayable) || 0;
    });
    return buckets;
  }, [periodOrders]);

  // Chart 2: Top Selling Medicines
  const topMedicinesData = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const name = it.medicineName || 'Standard Formulation';
        counts[name] = (counts[name] || 0) + (it.quantity || 0);
      });
    });
    return Object.entries(counts)
      .map(([name, units]) => ({ name: name.slice(0, 18), units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [orders]);

  // Chart 3: Order Status Distribution
  const statusDistribution = useMemo(() => {
    const map = { Completed: 0, Processing: 0, Pending: 0, Rejected: 0 };
    orders.forEach((o) => {
      if (o.status === 'delivered' || o.status === 'completed' || o.status === 'paid') map.Completed++;
      else if (o.status === 'processing' || o.status === 'dispatched' || o.status === 'accepted') map.Processing++;
      else if (o.status === 'rejected' || o.status === 'cancelled') map.Rejected++;
      else map.Pending++;
    });
    return [
      { name: 'Completed', value: map.Completed, color: '#006f61' },
      { name: 'Processing', value: map.Processing, color: '#0047c1' },
      { name: 'Pending', value: map.Pending, color: '#b37400' },
      { name: 'Rejected', value: map.Rejected, color: '#ba1a1a' }
    ].filter((x) => x.value > 0);
  }, [orders]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = 'Order Reference,Buyer Name,Total Amount,Order Status\n';
    const rows = orders
      .map((o) => `"${o.poReference || o.id}","${o.buyerName || 'Buyer'}","${o.netPayable || 0}","${o.status}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmaconnect-sales-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Sales report CSV exported successfully', 'verified');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Analytics &amp; Reports</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Operational sales figures and order performance derived from confirmed platform orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#eaedff] rounded-xl text-xs font-semibold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="month">Current Month</option>
            <option value="prev_month">Previous Month</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Sales over Period</span>
          <div className="text-2xl font-bold text-[#131b2e] font-mono mt-2">
            ₹ {metrics.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#006f61] font-medium mt-1 block">
            Across {metrics.orderCount} placed orders
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Completed Fulfillments</span>
          <div className="text-2xl font-bold text-[#006f61] font-mono mt-2">
            {metrics.completedCount} Orders
          </div>
          <span className="text-[11px] text-[#5e6b7f] font-medium mt-1 block">
            Delivered and confirmed
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Average Order Value</span>
          <div className="text-2xl font-bold text-[#0047c1] font-mono mt-2">
            ₹ {metrics.avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#5e6b7f] font-medium mt-1 block">
            Per institutional purchase
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <h2 className="text-sm font-bold text-[#131b2e]">Sales Volume Trend</h2>
          <p className="text-[11px] text-[#5e6b7f] mb-4">Weekly revenue distribution (₹ INR)</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaedff" />
                <XAxis dataKey="label" stroke="#5e6b7f" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5e6b7f" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(v) => [`₹ ${Number(v).toLocaleString('en-IN')}`, 'Sales']} />
                <Area type="monotone" dataKey="sales" stroke="#0047c1" fill="#eff4ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Medicines */}
        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <h2 className="text-sm font-bold text-[#131b2e]">Top Moving Formulations</h2>
          <p className="text-[11px] text-[#5e6b7f] mb-4">Total unit volume ordered by buyers</p>
          <div className="h-56 w-full flex items-center justify-center">
            {topMedicinesData.length === 0 ? (
              <div className="text-center p-6 text-[#5e6b7f]">
                <span className="material-symbols-outlined text-4xl text-[#bac3d2] mb-1">medication</span>
                <p className="text-xs font-semibold text-[#131b2e]">No Formulations Ordered Yet</p>
                <p className="text-[11px] text-[#5e6b7f] mt-0.5">Top-selling medicines will appear here once purchase orders are completed.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMedicinesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eaedff" />
                  <XAxis type="number" stroke="#5e6b7f" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#5e6b7f" fontSize={10} width={100} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} units`, 'Volume']} />
                  <Bar dataKey="units" fill="#006f61" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs lg:col-span-2">
          <h2 className="text-sm font-bold text-[#131b2e]">Order Fulfillment Distribution</h2>
          <p className="text-[11px] text-[#5e6b7f] mb-4">Breakdown of orders by current operational state</p>
          {statusDistribution.length === 0 ? (
            <div className="h-44 w-full flex flex-col items-center justify-center text-center p-6 text-[#5e6b7f]">
              <span className="material-symbols-outlined text-4xl text-[#bac3d2] mb-1">pie_chart</span>
              <p className="text-xs font-semibold text-[#131b2e]">No Orders In Pipeline</p>
              <p className="text-[11px] text-[#5e6b7f] mt-0.5">Fulfillment stage breakdown will populate once buyer orders are received.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                {statusDistribution.map((st) => (
                  <div key={st.name} className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9ff]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }}></span>
                      <span className="font-medium text-[#131b2e]">{st.name} Orders</span>
                    </div>
                    <span className="font-mono font-bold text-[#131b2e]">{st.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
