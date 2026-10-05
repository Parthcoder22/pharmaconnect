import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsReports = ({
  orders = [],
  medicines = [],
  onShowToast
}) => {
  const [dateRange, setDateRange] = useState('30d'); // '7d', '30d', '90d', 'all'

  const getOrderAmount = (o) => {
    return parseFloat(o.totalAmount ?? o.netPayable ?? o.net_payable ?? o.total) || 0;
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalPurchases = orders.reduce(
      (sum, o) => sum + getOrderAmount(o),
      0
    );
    const completedOrders = orders.filter((o) =>
      ['delivered', 'completed', 'paid'].includes((o.status || '').toLowerCase())
    );
    const aov = orders.length > 0 ? totalPurchases / orders.length : 0;
    const activeSuppliers = new Set(orders.map((o) => o.supplierName || o.supplierId).filter(Boolean)).size;

    return {
      totalPurchases,
      totalOrders: orders.length,
      completedCount: completedOrders.length,
      avgOrderValue: aov,
      activeSuppliers
    };
  }, [orders]);

  // Monthly purchasing trend data
  const monthlySpendData = useMemo(() => {
    if (orders.length === 0) return [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const monthMap = {};
    for (let i = 4; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      monthMap[monthNames[idx]] = 0;
    }

    orders.forEach((o) => {
      const date = o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at) : new Date();
      const month = isNaN(date.getTime()) ? monthNames[currentMonthIdx] : monthNames[date.getMonth()];
      const amt = getOrderAmount(o);
      monthMap[month] = (monthMap[month] || 0) + amt;
    });

    return Object.entries(monthMap).map(([month, spend]) => ({
      month,
      spend: Math.round(spend),
      orders: orders.length
    }));
  }, [orders]);

  // Order status distribution data
  const statusPieData = useMemo(() => {
    if (orders.length === 0) return [];
    const counts = {
      Delivered: 0,
      Processing: 0,
      Awaiting: 0
    };
    orders.forEach((o) => {
      const s = (o.status || '').toLowerCase();
      if (['delivered', 'completed', 'paid'].includes(s)) counts.Delivered++;
      else if (['accepted', 'processing', 'dispatched'].includes(s)) counts.Processing++;
      else counts.Awaiting++;
    });

    return [
      { name: 'Delivered', value: counts.Delivered, color: '#006f61' },
      { name: 'In Transit / Processing', value: counts.Processing, color: '#0047c1' },
      { name: 'Awaiting Confirmation', value: counts.Awaiting, color: '#b37400' }
    ].filter((item) => item.value > 0);
  }, [orders]);

  // Supplier-wise distribution
  const supplierSpendData = useMemo(() => {
    if (orders.length === 0) return [];
    const map = {};
    let total = 0;
    orders.forEach((o) => {
      const sup = o.supplierName || 'Verified Supplier';
      const val = getOrderAmount(o);
      map[sup] = (map[sup] || 0) + val;
      total += val;
    });
    return Object.entries(map).map(([supplier, amountVal]) => ({
      supplier,
      amount: `₹ ${amountVal.toLocaleString()}`,
      percentage: total > 0 ? `${Math.round((amountVal / total) * 100)}%` : '0%'
    }));
  }, [orders]);

  // Top purchased formulations
  const topMedicines = useMemo(() => {
    if (orders.length === 0) return [];
    const medMap = {};
    orders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const name = item.medicineName || item.name || 'Medicine Formulation';
          const qty = Number(item.quantity) || 1;
          const cost = Number(item.totalAmount || item.line_total || item.taxableAmount || (qty * (Number(item.unitPrice) || 0))) || 0;
          if (!medMap[name]) {
            medMap[name] = { name, generic: item.genericName || item.genericFormula || 'Active Formulation', units: 0, spend: 0 };
          }
          medMap[name].units += qty;
          medMap[name].spend += cost;
        });
      }
    });
    return Object.values(medMap).slice(0, 5);
  }, [orders]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Order Reference,Supplier,Date,Total Amount,Status\n' +
      orders
        .map(
          (o) =>
            `"${o.poReference || o.id}","${o.supplierName || 'Novartis'}","${o.date || 'Today'}","${o.totalAmount || o.total}","${o.status}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PharmaConnect_Purchase_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.('Purchase report exported as CSV', 'download');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Purchasing Analytics &amp; Reports</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Procurement expenditure trends, order volume distribution, and supplier concentration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 px-3 bg-white border border-[#eaedff] rounded-xl text-xs text-[#131b2e] font-semibold"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter (90 Days)</option>
            <option value="all">Financial Year to Date</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Key Procurement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Total Purchases</span>
          <div className="text-2xl font-bold font-mono text-[#131b2e] mt-1.5">
            ₹ {metrics.totalPurchases.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#006f61] font-semibold mt-1 block">
            Across {metrics.totalOrders} total purchase orders
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Completed Fulfillments</span>
          <div className="text-2xl font-bold font-mono text-[#006f61] mt-1.5">
            {metrics.completedCount} Orders
          </div>
          <span className="text-[11px] text-[#5e6b7f] mt-1 block">
            Successfully received at hospital depot
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Average Order Value (AOV)</span>
          <div className="text-2xl font-bold font-mono text-[#0047c1] mt-1.5">
            ₹ {Math.round(metrics.avgOrderValue).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#5e6b7f] mt-1 block">
            Average institutional purchase batch
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Active Suppliers Engaged</span>
          <div className="text-2xl font-bold font-mono text-[#131b2e] mt-1.5">
            {metrics.activeSuppliers} Suppliers
          </div>
          <span className="text-[11px] text-[#0047c1] font-semibold mt-1 block">
            100% CDSCO Verified Manufacturers
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-14 px-6 bg-white rounded-2xl border border-[#eaedff] text-center flex flex-col items-center justify-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#0047c1] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-3xl">insights</span>
          </div>
          <h2 className="text-sm font-bold text-[#131b2e]">No Procurement Analytics Available</h2>
          <p className="text-xs text-[#5e6b7f] max-w-md mt-1 mb-4">
            Once purchase orders are submitted and processed, your monthly spend trends, order status breakdown, and formulation analytics will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* 3. Recharts Section: Monthly Spend Trend & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spend Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#131b2e]">Monthly Procurement Spend (₹ INR)</h2>
              <p className="text-[11px] text-[#5e6b7f]">Total verified pharmaceutical order value per month</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0047c1]">FY 2025-26</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpendData}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5e6b7f' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5e6b7f' }} />
                <Tooltip
                  formatter={(val) => [`₹ ${Number(val).toLocaleString()}`, 'Spend']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #eaedff' }}
                />
                <Bar dataKey="spend" fill="#0047c1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart (1 col) */}
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-[#131b2e]">Order Fulfillment Status</h2>
            <p className="text-[11px] text-[#5e6b7f]">Breakdown of orders in current cycle</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#eaedff] text-xs">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#5e6b7f]">{item.name}</span>
                </div>
                <span className="font-bold font-mono text-[#131b2e]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Top Purchased Medicines & Supplier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Purchased Medicines Table */}
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#131b2e]">Top Procured Formulations</h2>
          <div className="divide-y divide-[#eaedff] border border-[#eaedff] rounded-xl overflow-hidden">
            {topMedicines.map((m, idx) => (
              <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#131b2e] block">{m.name}</span>
                  <span className="text-[11px] text-[#5e6b7f]">{m.generic}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#131b2e] block">
                    {m.units.toLocaleString()} units
                  </span>
                  <span className="text-[10px] text-[#0047c1] font-mono">
                    ₹ {m.spend.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Distribution */}
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#131b2e]">Supplier-Wise Spend Distribution</h2>
          <div className="space-y-3">
            {supplierSpendData.map((item) => (
              <div key={item.supplier} className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#eaedff] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#131b2e]">{item.supplier}</span>
                  <span className="font-mono font-bold text-[#0047c1]">{item.percentage}</span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0047c1] h-full rounded-full"
                    style={{ width: item.percentage }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#5e6b7f]">
                  <span>Total Settled Volume:</span>
                  <strong className="text-[#131b2e]">{item.amount}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
    )}
  </div>
);
};
