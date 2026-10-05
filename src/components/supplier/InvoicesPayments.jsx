import React, { useState, useMemo } from 'react';

export const InvoicesPayments = ({
  orders = [],
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState('invoices'); // invoices, payments
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate realistic invoices from orders
  const invoices = useMemo(() => {
    return orders.map((order, index) => {
      const isPaid = order.status === 'paid' || order.status === 'completed';
      const isProcessing = order.status === 'processing' || order.status === 'dispatched';
      const status = isPaid ? 'paid' : isProcessing ? 'pending' : 'issued';
      const invoiceNumber = order.invoiceNumber || `INV-2025-${9000 + index}`;
      const amount = Number(order.netPayable || order.totalAmount || 0);
      const taxable = Number(order.taxableTotal) || (amount > 0 ? amount / 1.12 : 0);
      const cgst = Number(order.cgstTotal) || (taxable * 0.06);
      const sgst = Number(order.sgstTotal) || (taxable * 0.06);

      return {
        id: `inv-${order.id}`,
        invoiceNumber,
        orderId: order.poReference || order.id,
        buyerName: order.buyerName || 'Institutional Hospital Buyer',
        buyerGstin: order.buyerGstin || 'Pending Registration',
        date: order.invoiceDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : 'Recently'),
        dueDate: 'Net 15 Days',
        taxableAmount: taxable,
        cgst,
        sgst,
        totalAmount: amount,
        paymentStatus: status,
        items: (order.items || []).map((it) => ({
          medicineName: it.medicineName || it.name || 'Pharmaceutical Formulation',
          quantity: it.quantity || 100,
          unitPrice: it.unitPrice || 10
        }))
      };
    });
  }, [orders]);

  // Payment Records
  const paymentRecords = useMemo(() => {
    return invoices
      .filter((inv) => inv.paymentStatus === 'paid' || inv.paymentStatus === 'pending')
      .map((inv, idx) => ({
        id: `pay-${inv.id}`,
        paymentRef: `RZP-PAY-${982140 + idx}`,
        invoiceNumber: inv.invoiceNumber,
        orderId: inv.orderId,
        buyerName: inv.buyerName,
        amount: inv.totalAmount,
        date: inv.date,
        method: idx % 2 === 0 ? 'Razorpay Standard Escrow' : 'Corporate RTGS / NEFT',
        status: inv.paymentStatus === 'paid' ? 'Captured' : 'Processing Settlement'
      }));
  }, [invoices]);

  // Summary counts
  const summary = useMemo(() => {
    const total = invoices.length;
    let paid = 0;
    let unpaid = 0;
    let totalValue = 0;

    invoices.forEach((inv) => {
      totalValue += inv.totalAmount;
      if (inv.paymentStatus === 'paid') paid++;
      else unpaid++;
    });

    return { total, paid, unpaid, totalValue };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.buyerName.toLowerCase().includes(q) ||
        inv.orderId.toLowerCase().includes(q)
      );
    });
  }, [invoices, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Invoices &amp; Payments</h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            Institutional GST tax invoices, order settlements, and payment transaction logs
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Total Invoices</span>
          <div className="text-2xl font-bold text-[#131b2e] font-mono mt-2">
            {summary.total}
          </div>
          <span className="text-[11px] text-[#5e6b7f] mt-1 block">Issued order billings</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Settled &amp; Paid</span>
          <div className="text-2xl font-bold text-[#006f61] font-mono mt-2">
            {summary.paid}
          </div>
          <span className="text-[11px] text-[#006f61] mt-1 block">Cleared transactions</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Unpaid / Pending</span>
          <div className="text-2xl font-bold text-[#b37400] font-mono mt-2">
            {summary.unpaid}
          </div>
          <span className="text-[11px] text-[#b37400] mt-1 block">Within credit terms</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-2xs">
          <span className="text-xs font-semibold text-[#5e6b7f]">Total Billed Value</span>
          <div className="text-2xl font-bold text-[#0047c1] font-mono mt-2">
            ₹ {(summary.totalValue / 100000).toFixed(2)} L
          </div>
          <span className="text-[11px] text-[#5e6b7f] mt-1 block">Cumulative turnover</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-3 border-b border-[#eaedff] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-[#0047c1] text-white'
              : 'text-[#5e6b7f] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-base">receipt</span>
          <span>GST Tax Invoices</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-[#0047c1] text-white'
              : 'text-[#5e6b7f] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-base">payments</span>
          <span>Settlement Records</span>
        </button>
      </div>

      {/* Invoices View */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#eaedff] p-4 shadow-2xs flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5e6b7f] text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice number, buyer, or PO..."
                className="w-full pl-9 pr-4 py-2 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] placeholder:text-[#5e6b7f] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#eaedff] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8f9ff] text-[#5e6b7f] text-[11px] font-semibold border-b border-[#eaedff]">
                    <th className="py-3 px-4">Invoice Number</th>
                    <th className="py-3 px-4">Order Reference</th>
                    <th className="py-3 px-4">Procuring Entity</th>
                    <th className="py-3 px-4">Billing Date</th>
                    <th className="py-3 px-4">Taxable Value</th>
                    <th className="py-3 px-4">Invoice Total (GST)</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-[#5e6b7f]">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#faf8ff] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0047c1]">
                          {inv.invoiceNumber}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#131b2e]">
                          {inv.orderId}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-[#131b2e]">
                          {inv.buyerName}
                        </td>

                        <td className="py-3.5 px-4 text-[#5e6b7f]">
                          {inv.date}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#5e6b7f]">
                          ₹ {inv.taxableAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                          ₹ {inv.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>

                        <td className="py-3.5 px-4">
                          {inv.paymentStatus === 'paid' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f8f3] text-[#006f61]">
                              Paid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff8e6] text-[#b37400]">
                              Pending Settlement
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#0047c1] hover:bg-[#eff4ff] rounded-lg transition-colors"
                          >
                            Inspect Tax Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payments View */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#5e6b7f] text-[11px] font-semibold border-b border-[#eaedff]">
                  <th className="py-3 px-4">Payment Reference</th>
                  <th className="py-3 px-4">Associated Invoice</th>
                  <th className="py-3 px-4">Buyer Entity</th>
                  <th className="py-3 px-4">Settlement Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff]">
                {paymentRecords.map((pay) => (
                  <tr key={pay.id} className="hover:bg-[#faf8ff] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0047c1]">
                      {pay.paymentRef}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#131b2e]">
                      {pay.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#131b2e]">
                      {pay.buyerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#131b2e]">
                      ₹ {pay.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3.5 px-4 text-[#5e6b7f]">
                      {pay.method}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f8f3] text-[#006f61]">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-xl border border-[#eaedff] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">
                  Tax Invoice: {selectedInvoice.invoiceNumber}
                </h3>
                <span className="text-xs text-[#5e6b7f]">
                  Order: {selectedInvoice.orderId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-[#5e6b7f] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#eaedff] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5e6b7f]">Buyer Name:</span>
                <span className="font-bold text-[#131b2e]">{selectedInvoice.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5e6b7f]">Buyer GSTIN:</span>
                <span className="font-mono text-[#131b2e]">{selectedInvoice.buyerGstin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5e6b7f]">Payment Terms:</span>
                <span className="font-medium text-[#131b2e]">{selectedInvoice.dueDate}</span>
              </div>
            </div>

            <div className="border border-[#eaedff] rounded-xl overflow-hidden text-xs">
              <div className="bg-[#f8f9ff] p-2.5 font-bold text-[#131b2e] border-b border-[#eaedff]">
                Consignment Breakdown
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-[#5e6b7f]">
                  <span>Taxable Assessment Value:</span>
                  <span className="font-mono">₹ {selectedInvoice.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5e6b7f]">
                  <span>CGST (6%):</span>
                  <span className="font-mono">₹ {selectedInvoice.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5e6b7f]">
                  <span>SGST (6%):</span>
                  <span className="font-mono">₹ {selectedInvoice.sgst.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-[#eaedff] flex justify-between font-bold text-sm text-[#131b2e]">
                  <span>Net Invoice Payable:</span>
                  <span className="font-mono text-[#0047c1]">
                    ₹ {selectedInvoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  onShowToast?.(`Generating printable PDF for ${selectedInvoice.invoiceNumber}`, 'verified');
                  window.print?.();
                }}
                className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Print / Download Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
