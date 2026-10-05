import React, { useState, useMemo } from 'react';

export const InvoicesPayments = ({
  orders = [],
  invoices = [],
  onPayInvoice,
  onShowToast
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'unpaid', 'due'

  // Build realistic unified invoices from orders
  const allInvoices = useMemo(() => {
    return orders.map((o, idx) => {
      const subtotal = Number(o.taxableTotal || o.subtotal) || Number(parseFloat(o.totalAmount || o.netPayable || o.total || 0) * 0.88) || 0;
      const gst = Number((o.cgstTotal || 0) + (o.sgstTotal || 0) || o.gstTotal) || Number(parseFloat(o.totalAmount || o.netPayable || o.total || 0) * 0.12) || 0;
      const total = Number(o.netPayable || o.totalAmount || o.total) || (subtotal + gst);
      const isPaid = o.paymentStatus === 'paid' || o.status === 'paid';

      return {
        id: `INV-${o.id || `2025-00${idx + 1}`}`,
        invoiceNumber: o.invoiceNumber || `TAX-INV-2025-${8800 + idx}`,
        orderId: o.poReference || o.id,
        supplierName: o.supplierName || 'Verified Supplier',
        date: o.invoiceDate || (o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : 'Recently'),
        dueDate: isPaid ? 'Settled' : (o.paymentDueDate ? new Date(o.paymentDueDate).toLocaleDateString('en-GB') : 'Upon Receipt'),
        subtotal: subtotal,
        gstTotal: gst,
        totalAmount: total,
        status: isPaid ? 'paid' : 'unpaid',
        items: (o.items || []).map((it) => ({
          name: it.medicineName || it.name || 'Pharmaceutical Formulation',
          quantity: it.quantity || 100,
          unitPrice: it.unitPrice || 10,
          amount: it.totalAmount || it.taxableAmount || ((it.quantity || 0) * (it.unitPrice || 0)) || 0
        })),
        paymentReference: isPaid ? (o.paymentReference || `pay_live_${Math.random().toString(36).substring(7)}`) : null
      };
    });
  }, [orders]);

  // Financial summary
  const summary = useMemo(() => {
    const totalCount = allInvoices.length;
    const paidList = allInvoices.filter((i) => i.status === 'paid');
    const unpaidList = allInvoices.filter((i) => i.status === 'unpaid');

    const totalValue = allInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const paidValue = paidList.reduce((sum, i) => sum + i.totalAmount, 0);
    const unpaidValue = unpaidList.reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalCount,
      paidCount: paidList.length,
      unpaidCount: unpaidList.length,
      totalValue,
      paidValue,
      unpaidValue
    };
  }, [allInvoices]);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return allInvoices;
    return allInvoices.filter((i) => i.status === statusFilter);
  }, [allInvoices, statusFilter]);

  const handlePayClick = (inv) => {
    if (onPayInvoice) {
      onPayInvoice(inv.orderId, inv.totalAmount);
    } else {
      onShowToast?.(`Initiating Razorpay checkout for Invoice ${inv.invoiceNumber}`, 'payments');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Invoices &amp; Payments</h1>
        <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
          Tax invoices, statutory GST breakdowns, and commercial payment settlements
        </p>
      </div>

      {/* 2. Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Total Billed Value</span>
          <div className="text-2xl font-bold font-mono text-[#131b2e] mt-1.5">
            ₹ {summary.totalValue.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#5e6b7f] mt-1 block">
            {summary.totalCount} generated tax invoices
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Settled &amp; Paid</span>
          <div className="text-2xl font-bold font-mono text-[#006f61] mt-1.5">
            ₹ {summary.paidValue.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#006f61] mt-1 block">
            {summary.paidCount} invoices cleared
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Outstanding Due</span>
          <div className="text-2xl font-bold font-mono text-[#b37400] mt-1.5">
            ₹ {summary.unpaidValue.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#b37400] mt-1 block">
            {summary.unpaidCount} invoices awaiting payment
          </span>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            statusFilter === 'all'
              ? 'bg-[#0047c1] text-white'
              : 'bg-white text-[#5e6b7f] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          All Invoices ({allInvoices.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('unpaid')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            statusFilter === 'unpaid'
              ? 'bg-[#0047c1] text-white'
              : 'bg-white text-[#5e6b7f] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          Unpaid / Due ({summary.unpaidCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('paid')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            statusFilter === 'paid'
              ? 'bg-[#0047c1] text-white'
              : 'bg-white text-[#5e6b7f] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          Paid &amp; Settled ({summary.paidCount})
        </button>
      </div>

      {/* 4. Invoices Table */}
      <div className="bg-white rounded-2xl border border-[#eaedff] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f8f9ff] text-[#5e6b7f] text-[11px] font-semibold border-b border-[#eaedff]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-[#5e6b7f]">
                    No invoices matching this filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  return (
                    <tr key={inv.id} className="hover:bg-[#faf8ff] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0047c1]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#5e6b7f]">{inv.orderId}</td>
                      <td className="py-3.5 px-4 font-medium text-[#131b2e]">{inv.supplierName}</td>
                      <td className="py-3.5 px-4 text-[#5e6b7f]">{inv.date}</td>
                      <td className="py-3.5 px-4 text-[#5e6b7f]">{inv.dueDate}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                        ₹ {inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isPaid ? 'bg-[#e6f8f3] text-[#006f61]' : 'bg-[#fff8e6] text-[#b37400]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-[#006f61]' : 'bg-[#b37400]'}`} />
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#0047c1] hover:bg-[#eef2ff] rounded-lg transition-colors"
                          >
                            View
                          </button>
                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => handlePayClick(inv)}
                              className="px-3 py-1 bg-[#0047c1] hover:bg-[#155eef] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                            >
                              Pay Now
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

      {/* 5. Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-[#eaedff] my-8 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <span className="text-[10px] font-bold text-[#0047c1] uppercase bg-[#eef2ff] px-2 py-0.5 rounded">
                  Statutory GST Tax Invoice
                </span>
                <h3 className="text-base font-bold text-[#131b2e] mt-1">
                  {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-[#5e6b7f]">
                  Related Purchase Order: {selectedInvoice.orderId} • Date: {selectedInvoice.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-lg text-[#5e6b7f] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Supplier & Buyer Bilateral Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#f8f9ff] rounded-2xl border border-[#eaedff] text-xs">
              <div>
                <span className="text-[10px] text-[#5e6b7f] block uppercase font-bold">Issued By (Supplier):</span>
                <span className="font-bold text-[#131b2e] block mt-0.5">{selectedInvoice.supplierName}</span>
                <span className="text-[11px] text-[#5e6b7f] block font-mono">GSTIN: 27AAACN0192Q1ZV</span>
                <span className="text-[11px] text-[#5e6b7f] block">Mfg License: MH-PUN-20B-184920</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5e6b7f] block uppercase font-bold">Billed To (Buyer):</span>
                <span className="font-bold text-[#131b2e] block mt-0.5">Apex Multispeciality Healthcare</span>
                <span className="text-[11px] text-[#5e6b7f] block font-mono">GSTIN: 27AABCA4820K1ZW</span>
                <span className="text-[11px] text-[#5e6b7f] block">Pharmacy License: MH-MUM-20B-391827</span>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#131b2e] block">Billed Pharmaceutical Formulations</span>
              <div className="border border-[#eaedff] rounded-xl overflow-hidden divide-y divide-[#eaedff]">
                {(selectedInvoice.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#131b2e]">{item.name}</span>
                      <span className="block text-[11px] text-[#5e6b7f]">
                        Quantity: {item.quantity} units @ ₹ {Number(item.unitPrice).toFixed(2)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#131b2e]">
                      ₹ {Number(item.amount || item.quantity * item.unitPrice).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 bg-[#faf8ff] rounded-2xl border border-[#eaedff] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#5e6b7f]">
                <span>Taxable Subtotal:</span>
                <span className="font-mono text-[#131b2e]">₹ {selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[#5e6b7f]">
                <span>Integrated GST (IGST 12%):</span>
                <span className="font-mono text-[#131b2e]">₹ {selectedInvoice.gstTotal.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between text-sm font-bold text-[#131b2e]">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-base text-[#0047c1]">
                  ₹ {selectedInvoice.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  onShowToast?.('Printing GST Tax Invoice...', 'print');
                }}
                className="px-3.5 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">print</span>
                <span>Print / Download PDF</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-[#eaedff] text-[#131b2e] text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
                {selectedInvoice.status !== 'paid' && (
                  <button
                    type="button"
                    onClick={() => {
                      handlePayClick(selectedInvoice);
                      setSelectedInvoice(null);
                    }}
                    className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Pay Invoice Online
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
