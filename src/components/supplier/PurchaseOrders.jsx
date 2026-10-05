import React, { useState, useMemo } from 'react';

export const PurchaseOrders = ({
  orders = [],
  onAcceptOrder,
  onRejectOrder,
  onUpdateOrderStatus,
  onViewInvoice,
  onShowToast,
  initialFilter = 'all'
}) => {
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Rejection Dialog State
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('Stock unavailable for required batch volume');
  const [rejectNotes, setRejectNotes] = useState('');

  const getOrderTotal = (order) => {
    if (!order) return 0;
    if (order.netPayable && Number(order.netPayable) > 0) return Number(order.netPayable);
    if (order.totalAmount && Number(order.totalAmount) > 0) return Number(order.totalAmount);
    if (order.total && Number(order.total) > 0) return Number(order.total);
    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items.reduce(
        (sum, it) => sum + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
        0
      );
    }
    return 0;
  };

  const activeOrder = selectedOrder
    ? orders.find(
        (o) =>
          o.id === selectedOrder.id ||
          (o.poReference && o.poReference === selectedOrder.poReference)
      ) || selectedOrder
    : null;

  // Summary Counts
  const summary = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let processing = 0;
    let dispatched = 0;
    let completed = 0;
    let rejected = 0;

    orders.forEach((o) => {
      switch (o.status) {
        case 'requested':
        case 'pending':
          pending++;
          break;
        case 'accepted':
          accepted++;
          break;
        case 'processing':
          processing++;
          break;
        case 'dispatched':
          dispatched++;
          break;
        case 'delivered':
        case 'completed':
        case 'paid':
          completed++;
          break;
        case 'rejected':
        case 'cancelled':
          rejected++;
          break;
        default:
          break;
      }
    });

    return { total: orders.length, pending, accepted, processing, dispatched, completed, rejected };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && order.status !== 'requested' && order.status !== 'pending') return false;
        if (statusFilter === 'accepted' && order.status !== 'accepted') return false;
        if (statusFilter === 'processing' && order.status !== 'processing') return false;
        if (statusFilter === 'dispatched' && order.status !== 'dispatched') return false;
        if (statusFilter === 'completed' && order.status !== 'delivered' && order.status !== 'completed' && order.status !== 'paid') return false;
        if (statusFilter === 'rejected' && order.status !== 'rejected' && order.status !== 'cancelled') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = (order.poReference || order.id || '').toLowerCase().includes(q);
        const matchesBuyer = (order.buyerName || '').toLowerCase().includes(q);
        if (!matchesRef && !matchesBuyer) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleConfirmRejection = () => {
    if (!rejectingOrder) return;
    onRejectOrder?.(rejectingOrder.poReference || rejectingOrder.id, rejectReason, rejectNotes);
    onShowToast?.(`Order ${rejectingOrder.poReference || rejectingOrder.id} marked as rejected`, 'info');
    setRejectingOrder(null);
    setRejectNotes('');
    if (selectedOrder?.id === rejectingOrder.id) {
      setSelectedOrder(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff8e6] text-[#b37400]">
            Pending Approval
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff4ff] text-[#0047c1]">
            Accepted
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff4ff] text-[#0047c1]">
            Processing
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f8f3] text-[#006f61]">
            Dispatched
          </span>
        );
      case 'delivered':
      case 'completed':
      case 'paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f8f3] text-[#006f61]">
            Completed
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fde8e8] text-[#c81e1e]">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f3f4f6] text-[#4b5563]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Purchase Orders</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Review buyer procurement requests, accept orders, and manage fulfillment status
          </p>
        </div>
      </div>

      {/* A. Order Summary Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-[#0047c1] text-white border-[#0047c1] shadow-xs'
              : 'bg-white text-[#434655] border-[#eaedff] hover:bg-[#f2f3ff]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-80">All Orders</span>
          <span className="text-xl font-bold font-mono mt-1 block">{summary.total}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'pending'
              ? 'bg-[#0047c1] text-white border-[#0047c1] shadow-xs'
              : 'bg-white text-[#434655] border-[#eaedff] hover:bg-[#f2f3ff]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block text-[#b37400]">Pending</span>
          <span className="text-xl font-bold font-mono mt-1 block">{summary.pending}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('accepted')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'accepted'
              ? 'bg-[#0047c1] text-white border-[#0047c1] shadow-xs'
              : 'bg-white text-[#434655] border-[#eaedff] hover:bg-[#f2f3ff]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block text-[#0047c1]">Accepted</span>
          <span className="text-xl font-bold font-mono mt-1 block">{summary.accepted}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('processing')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'processing'
              ? 'bg-[#0047c1] text-white border-[#0047c1] shadow-xs'
              : 'bg-white text-[#434655] border-[#eaedff] hover:bg-[#f2f3ff]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block text-[#0047c1]">Processing</span>
          <span className="text-xl font-bold font-mono mt-1 block">{summary.processing}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('dispatched')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'dispatched'
              ? 'bg-[#0047c1] text-white border-[#0047c1] shadow-xs'
              : 'bg-white text-[#434655] border-[#eaedff] hover:bg-[#f2f3ff]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block text-[#006f61]">Dispatched</span>
          <span className="text-xl font-bold font-mono mt-1 block">{summary.dispatched}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'completed'
              ? 'bg-[#0047c1] text-white border-[#0047c1] shadow-xs'
              : 'bg-white text-[#434655] border-[#eaedff] hover:bg-[#f2f3ff]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block text-[#006f61]">Completed</span>
          <span className="text-xl font-bold font-mono mt-1 block">{summary.completed}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('rejected')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'rejected'
              ? 'bg-[#0047c1] text-white border-[#0047c1] shadow-xs'
              : 'bg-white text-[#434655] border-[#eaedff] hover:bg-[#f2f3ff]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block text-[#ba1a1a]">Rejected</span>
          <span className="text-xl font-bold font-mono mt-1 block">{summary.rejected}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#eaedff] p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5e6b7f] text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by PO reference or buyer..."
            className="w-full pl-9 pr-4 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] placeholder:text-[#5e6b7f] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
          />
        </div>
      </div>

      {/* B. Order List Table */}
      <div className="bg-white rounded-2xl border border-[#eaedff] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f8f9ff] text-[#5e6b7f] text-[11px] font-semibold border-b border-[#eaedff]">
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Buyer Business</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Items Ordered</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#5e6b7f]">
                    No purchase orders found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = order.items?.length || 1;
                  const isPending = order.status === 'requested' || order.status === 'pending';

                  return (
                    <tr key={order.id} className="hover:bg-[#faf8ff] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0047c1]">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="hover:underline text-left block"
                        >
                          {order.poReference || order.id}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-xs text-[#131b2e]">
                          {order.buyerName || 'Hospital / Pharmacy Entity'}
                        </div>
                        <div className="text-[11px] text-[#5e6b7f]">
                          {order.destinationHub || 'Central Warehouse'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#434655]">
                        {order.createdAt || 'Recent'}
                      </td>

                      <td className="py-3.5 px-4 text-[#434655]">
                        <div className="font-medium">
                          {order.items?.[0]?.medicineName || 'Pharmaceutical Supplies'}
                        </div>
                        <div className="text-[11px] text-[#5e6b7f]">
                          {itemCount} formulation{itemCount > 1 ? 's' : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                        ₹ {getOrderTotal(order).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#0047c1] hover:bg-[#eff4ff] rounded-lg transition-colors"
                          >
                            Details
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onAcceptOrder?.(order.poReference || order.id);
                                  onShowToast?.(`Order ${order.poReference || order.id} accepted`, 'check_circle');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold bg-[#006f61] hover:bg-[#00574c] text-white rounded-lg transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingOrder(order)}
                                className="px-2.5 py-1 text-xs font-semibold bg-[#eaedff] text-[#ba1a1a] hover:bg-[#fde8e8] rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </>
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

      {/* C. Order Details Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-[#eaedff] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">
                  Purchase Order #{activeOrder.poReference || activeOrder.id}
                </h3>
                <span className="text-xs text-[#5e6b7f]">
                  Placed on: {activeOrder.createdAt || 'Recent'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-[#5e6b7f] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Buyer & Destination Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#f8f9ff] p-4 rounded-2xl border border-[#eaedff]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5e6b7f] block">
                  Procuring Buyer
                </span>
                <span className="font-bold text-[#131b2e] block text-sm mt-0.5">
                  {activeOrder.buyerName}
                </span>
                <span className="text-[#5e6b7f] block text-[11px] mt-0.5">
                  License: {activeOrder.buyerLicense || 'Verified Wholesale 20B'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5e6b7f] block">
                  Delivery Destination
                </span>
                <span className="font-medium text-[#131b2e] block mt-0.5">
                  {activeOrder.destinationHub || 'Main Hospital Depot'}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#131b2e]">Ordered Medicines</span>
              <div className="border border-[#eaedff] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8f9ff] text-[#5e6b7f] text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Formulation</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaedff]">
                    {(activeOrder.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-medium text-[#131b2e]">
                          {it.medicineName || it.name || it.brand || 'Pharmaceutical Formulation'}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{it.quantity} units</td>
                        <td className="py-2.5 px-3 font-mono">₹ {Number(it.unitPrice || 0).toFixed(2)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-right">
                          ₹ {Number((it.quantity || 1) * (it.unitPrice || 0)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5e6b7f]">
                <span>Total Consignment Value:</span>
                <span className="font-mono font-bold text-[#131b2e]">
                  ₹ {getOrderTotal(activeOrder).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[#5e6b7f]">
                <span>Current Lifecycle Status:</span>
                <div>{getStatusBadge(activeOrder.status)}</div>
              </div>
            </div>

            {/* Actions for current status */}
            <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const targetId = activeOrder.id;
                  setSelectedOrder(null);
                  onViewInvoice?.(targetId);
                }}
                className="text-xs font-semibold text-[#0047c1] hover:underline"
              >
                Inspect Associated Invoice →
              </button>

              <div className="flex items-center gap-2">
                {(activeOrder.status === 'requested' || activeOrder.status === 'pending') && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const ref = activeOrder.poReference || activeOrder.id;
                        onAcceptOrder?.(ref);
                        onShowToast?.(`Order ${ref} accepted`, 'check_circle');
                        setSelectedOrder((prev) => prev ? { ...prev, status: 'accepted' } : null);
                      }}
                      className="px-3.5 py-2 bg-[#006f61] hover:bg-[#00574c] text-white rounded-xl text-xs font-semibold"
                    >
                      Accept Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingOrder(activeOrder)}
                      className="px-3.5 py-2 bg-[#eaedff] text-[#ba1a1a] hover:bg-[#fde8e8] rounded-xl text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </>
                )}

                {activeOrder.status === 'accepted' && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateOrderStatus?.(activeOrder.id, 'processing');
                      onShowToast?.('Order marked as in packaging & processing', 'check_circle');
                      setSelectedOrder((prev) => prev ? { ...prev, status: 'processing' } : null);
                    }}
                    className="px-3.5 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold"
                  >
                    Confirm Processing &amp; Packing
                  </button>
                )}

                {activeOrder.status === 'processing' && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateOrderStatus?.(activeOrder.id, 'dispatched');
                      onShowToast?.('Order marked as dispatched', 'check_circle');
                      setSelectedOrder((prev) => prev ? { ...prev, status: 'dispatched' } : null);
                    }}
                    className="px-3.5 py-2 bg-[#006f61] hover:bg-[#00574c] text-white rounded-xl text-xs font-semibold"
                  >
                    Mark Dispatched
                  </button>
                )}

                {activeOrder.status === 'dispatched' && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateOrderStatus?.(activeOrder.id, 'delivered');
                      onShowToast?.('Order marked as delivered', 'check_circle');
                      setSelectedOrder((prev) => prev ? { ...prev, status: 'delivered' } : null);
                    }}
                    className="px-3.5 py-2 bg-[#006f61] hover:bg-[#00574c] text-white rounded-xl text-xs font-semibold"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#eaedff] space-y-4">
            <h3 className="text-sm font-bold text-[#ba1a1a]">
              Reject Purchase Order #{rejectingOrder.poReference || rejectingOrder.id}
            </h3>
            <p className="text-xs text-[#5e6b7f]">
              Please state the business reason for rejecting this purchase request:
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-[#5e6b7f] mb-1">
                Primary Reason
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              >
                <option value="Stock unavailable for required batch volume">Stock unavailable for required batch volume</option>
                <option value="Buyer license verification issue">Buyer license verification issue</option>
                <option value="Minimum order quantity threshold unmet">Minimum order quantity threshold unmet</option>
                <option value="Delivery destination out of commercial service radius">Delivery destination out of commercial service radius</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5e6b7f] mb-1">
                Optional Notes for Buyer
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Provide further clarification for buyer..."
                rows={2}
                className="w-full p-2.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-3.5 py-2 bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-3.5 py-2 bg-[#ba1a1a] text-white rounded-xl text-xs font-semibold hover:bg-[#991b1b]"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
