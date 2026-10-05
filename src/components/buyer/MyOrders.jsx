import React, { useState, useMemo } from 'react';

export const MyOrders = ({
  orders = [],
  onCancelOrder,
  onReorder,
  onOpenChat,
  onViewInvoice,
  onPayOrder,
  onShowToast,
  onNavigate
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status Summary Tabs calculation
  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      accepted: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach((o) => {
      const s = (o.status || '').toLowerCase();
      if (['requested', 'pending'].includes(s)) counts.pending++;
      else if (['accepted', 'processing'].includes(s)) counts.accepted++;
      else if (['dispatched', 'shipped'].includes(s)) counts.dispatched++;
      else if (['delivered', 'completed', 'paid'].includes(s)) counts.delivered++;
      else if (['rejected', 'cancelled'].includes(s)) counts.cancelled++;
    });

    return counts;
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = (o.status || '').toLowerCase();

      // Tab filter
      if (selectedStatusTab === 'pending' && !['requested', 'pending'].includes(s)) return false;
      if (selectedStatusTab === 'accepted' && !['accepted', 'processing'].includes(s)) return false;
      if (selectedStatusTab === 'dispatched' && !['dispatched', 'shipped'].includes(s)) return false;
      if (selectedStatusTab === 'delivered' && !['delivered', 'completed', 'paid'].includes(s)) return false;
      if (selectedStatusTab === 'cancelled' && !['rejected', 'cancelled'].includes(s)) return false;

      // Search filter (Order ID, Supplier, Medicine name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const poMatch = (o.poReference || o.id || '').toLowerCase().includes(q);
        const suppMatch = (o.supplierName || '').toLowerCase().includes(q);
        const medMatch = (o.items || []).some((item) => (item.name || '').toLowerCase().includes(q));
        if (!poMatch && !suppMatch && !medMatch) return false;
      }

      return true;
    });
  }, [orders, selectedStatusTab, searchQuery]);

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
          Accepted / Processing
        </span>
      );
    }
    if (['requested', 'pending'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fff8e6] text-[#b37400]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b37400]" />
          Awaiting Supplier
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
        {status}
      </span>
    );
  };

  // Timeline step active helper
  const getTimelineSteps = (status = '') => {
    const s = status.toLowerCase();
    const isCancelled = ['rejected', 'cancelled'].includes(s);

    return [
      { id: 1, label: 'Order Placed', completed: true, active: false },
      {
        id: 2,
        label: 'Awaiting Supplier Response',
        completed: ['accepted', 'processing', 'dispatched', 'delivered', 'completed'].includes(s),
        active: ['requested', 'pending'].includes(s),
        rejected: isCancelled
      },
      {
        id: 3,
        label: 'Accepted & Processing',
        completed: ['dispatched', 'delivered', 'completed'].includes(s),
        active: ['accepted', 'processing'].includes(s)
      },
      {
        id: 4,
        label: 'Dispatched from Depot',
        completed: ['delivered', 'completed'].includes(s),
        active: ['dispatched', 'shipped'].includes(s)
      },
      {
        id: 5,
        label: 'Delivered & Received',
        completed: ['delivered', 'completed'].includes(s),
        active: false
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">My Purchase Orders</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Complete procurement record, supplier confirmation status, and statutory shipment tracking
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('browse-medicines')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* 2. Status Summary Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Orders', count: statusCounts.all },
          { id: 'pending', label: 'Awaiting Confirmation', count: statusCounts.pending },
          { id: 'accepted', label: 'In Processing', count: statusCounts.accepted },
          { id: 'dispatched', label: 'Dispatched', count: statusCounts.dispatched },
          { id: 'delivered', label: 'Delivered', count: statusCounts.delivered },
          { id: 'cancelled', label: 'Cancelled / Rejected', count: statusCounts.cancelled }
        ].map((tab) => {
          const isActive = selectedStatusTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0047c1] text-white shadow-xs'
                  : 'bg-white text-[#5e6b7f] hover:bg-[#f2f3ff] hover:text-[#131b2e] border border-[#eaedff]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#f2f3ff] text-[#5e6b7f]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5e6b7f] text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by PO reference, supplier name, or medicine..."
            className="w-full pl-9 pr-4 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
          />
        </div>
        <span className="text-xs text-[#5e6b7f] hidden sm:block">
          Showing <strong className="text-[#131b2e]">{filteredOrders.length}</strong> orders
        </span>
      </div>

      {/* 4. Orders Table */}
      <div className="bg-white rounded-2xl border border-[#eaedff] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f8f9ff] text-[#5e6b7f] text-[11px] font-semibold border-b border-[#eaedff]">
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#5e6b7f]">
                    No purchase orders found matching this view.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const s = (order.status || '').toLowerCase();
                  const isCancelable = ['requested', 'pending'].includes(s);
                  const itemCount =
                    order.itemCount ||
                    (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

                  return (
                    <tr key={order.id} className="hover:bg-[#faf8ff] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0047c1]">
                        {order.poReference || order.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#131b2e]">
                        {order.supplierName || 'Novartis Bio-Pharma Ltd.'}
                      </td>
                      <td className="py-3.5 px-4 text-[#5e6b7f]">
                        {order.date || order.createdAt?.slice(0, 10) || 'Today'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#434655]">
                        {itemCount} units
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                        ₹ {(parseFloat(order.totalAmount ?? order.netPayable ?? order.net_payable ?? order.total) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            order.paymentStatus === 'paid' || order.status === 'paid' || order.status === 'completed'
                              ? 'bg-[#e6f8f3] text-[#006f61]'
                              : 'bg-[#fff8e6] text-[#b37400]'
                          }`}
                        >
                          {order.paymentStatus === 'paid' || order.status === 'paid' || order.status === 'completed' ? 'Paid' : (order.paymentStatus || 'Pending')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#0047c1] hover:bg-[#eef2ff] rounded-lg transition-colors"
                          >
                            Details
                          </button>

                          {!(order.paymentStatus === 'paid' || order.status === 'paid' || order.status === 'completed' || order.status === 'rejected' || order.status === 'cancelled') && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onPayOrder) {
                                  onPayOrder(order.id);
                                } else if (onViewInvoice) {
                                  onViewInvoice(order.id);
                                } else {
                                  onNavigate?.('invoices-payments');
                                }
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-[#0047c1] hover:bg-[#155eef] rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <span className="material-symbols-outlined text-[13px]">payments</span>
                              <span>Pay</span>
                            </button>
                          )}

                          {isCancelable && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Cancel Purchase Order ${order.poReference || order.id}?`)) {
                                  onCancelOrder?.(order.id);
                                  onShowToast?.(`Order ${order.poReference || order.id} cancelled`, 'info');
                                }
                              }}
                              className="px-2 py-1 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffebee] rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Comprehensive Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-[#eaedff] my-8 space-y-5 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <span className="text-[10px] font-bold text-[#0047c1] uppercase bg-[#eef2ff] px-2 py-0.5 rounded">
                  Purchase Order Record
                </span>
                <h3 className="text-base font-bold text-[#131b2e] mt-1">
                  {selectedOrder.poReference || selectedOrder.id}
                </h3>
                <p className="text-xs text-[#5e6b7f]">
                  Submitted to {selectedOrder.supplierName || 'Novartis Bio-Pharma Ltd.'} • {selectedOrder.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-[#5e6b7f] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* E. Order Timeline */}
            <div className="p-4 bg-[#f8f9ff] rounded-2xl border border-[#eaedff] space-y-3">
              <span className="text-xs font-bold text-[#131b2e] block">Fulfillment Progression Timeline</span>
              <div className="space-y-2">
                {getTimelineSteps(selectedOrder.status).map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-3 text-xs">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.completed
                          ? 'bg-[#006f61] text-white'
                          : step.active
                          ? 'bg-[#0047c1] text-white ring-2 ring-[#0047c1]/30'
                          : step.rejected
                          ? 'bg-[#ba1a1a] text-white'
                          : 'bg-[#eaedff] text-[#5e6b7f]'
                      }`}
                    >
                      {step.completed ? '✓' : step.rejected ? '✕' : idx + 1}
                    </span>
                    <span
                      className={`font-semibold ${
                        step.active
                          ? 'text-[#0047c1]'
                          : step.completed
                          ? 'text-[#131b2e]'
                          : 'text-[#5e6b7f]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ordered Formulations List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#131b2e] block">Ordered Medicines</span>
              <div className="divide-y divide-[#eaedff] border border-[#eaedff] rounded-xl overflow-hidden">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#131b2e] block">{item.name}</span>
                      <span className="text-[11px] text-[#5e6b7f]">
                        {item.genericName || 'Standard'} • Batch: {item.batchNumber || '#LOT-PENDING'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#131b2e] block">
                        {item.quantity} units @ ₹ {Number(item.unitPrice || 0).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[#5e6b7f]">
                        ₹ {Number(item.totalPrice || item.quantity * item.unitPrice || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">Delivery Facility Destination</span>
                <span className="font-semibold text-[#131b2e] mt-0.5 block">
                  {selectedOrder.buyerAddress || 'Apex Multispeciality Hospital Main Central Store'}
                </span>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl">
                <span className="text-[10px] text-[#5e6b7f] block">Commercial Settlement</span>
                <span className="font-semibold text-[#131b2e] mt-0.5 block">
                  Payment: {selectedOrder.paymentStatus === 'paid' || selectedOrder.status === 'paid' || selectedOrder.status === 'completed' ? 'Paid' : (selectedOrder.paymentStatus || 'Pending')} • Method: {selectedOrder.paymentMethod || 'Online Gateway (Escrow)'}
                </span>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-[#eaedff] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenChat) onOpenChat(selectedOrder.id);
                  else onNavigate('order-chat');
                  setSelectedOrder(null);
                }}
                className="px-3 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#0047c1] font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>Contact Supplier</span>
              </button>

              <div className="flex items-center gap-2">
                {!(selectedOrder.paymentStatus === 'paid' || selectedOrder.status === 'paid' || selectedOrder.status === 'completed' || selectedOrder.status === 'rejected' || selectedOrder.status === 'cancelled') && (
                  <button
                    type="button"
                    onClick={() => {
                      const oid = selectedOrder.id;
                      setSelectedOrder(null);
                      if (onPayOrder) {
                        onPayOrder(oid);
                      } else if (onViewInvoice) {
                        onViewInvoice(oid);
                      } else {
                        onNavigate?.('invoices-payments');
                      }
                    }}
                    className="px-3.5 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">payments</span>
                    <span>Pay Invoice</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (onReorder) onReorder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-2 bg-[#e6f8f3] hover:bg-[#cbf5ea] text-[#006f61] font-semibold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">replay</span>
                  <span>Reorder Formulation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-[#eaedff] hover:bg-[#dde2ff] text-[#131b2e] font-bold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
