import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';

export const InvoiceAuditTrail = ({
  order,
  chatMessages,
  onSendMessage,
  onPaymentSuccess,
  onShowToast
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(order?.status === 'paid' ? 6 : 4); // 6: Paid, 4: Delivered
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessUTR, setPaymentSuccessUTR] = useState(null);

  const stages = [
    { label: 'Requested', time: '12 Oct 09:14', width: '7%' },
    { label: 'Accepted', time: '12 Oct 11:30', width: '21%' },
    { label: 'Processing', time: '13 Oct 14:00', width: '35%' },
    { label: 'Dispatched', time: '14 Oct 06:10', width: '49%' },
    { label: 'Delivered', time: '15 Oct 15:45', width: '63%' },
    { label: 'Payment Due', time: 'Net 15 Days', width: '77%' },
    { label: 'Paid', time: 'Razorpay/NEFT', width: '91%' },
    { label: 'Completed', time: 'COA Audited', width: '100%' }
  ];

  const handleAuthorizeRazorpay = async () => {
    setIsProcessingPayment(true);
    try {
      await paymentService.launchRazorpayCheckout({
        order,
        onVerified: (resp) => {
          setIsProcessingPayment(false);
          const paymentId = resp.razorpay_payment_id || `RZP-${Date.now()}`;
          setPaymentSuccessUTR(paymentId);
          setCurrentStepIndex(6); // Step 6 = Paid
          onPaymentSuccess(order.id, paymentId);
          onShowToast(`Razorpay Settlement Verified! Ref: ${paymentId}`, 'verified');

          setTimeout(() => {
            setIsRazorpayOpen(false);
          }, 1800);
        },
        onError: (err) => {
          setIsProcessingPayment(false);
          onShowToast(`Payment error: ${err.message}`, 'priority_high');
        },
        onDismiss: () => {
          setIsProcessingPayment(false);
          onShowToast('Razorpay checkout window closed', 'info');
        }
      });
    } catch (err) {
      setIsProcessingPayment(false);
      onShowToast(`Razorpay error: ${err.message}`, 'priority_high');
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(order.id, chatInput);
    setChatInput('');
    onShowToast('Audit message posted to regulatory order ledger', 'forum');
  };

  return (
    <div className="flex flex-col w-full bg-[#faf8ff] pb-16">
      <div className="p-4 sm:p-8 max-w-[1540px] mx-auto w-full space-y-6">
        {/* Top Action Ribbon & Status Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#eaedff] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#155eef]/10 text-[#0047c1] px-3 py-1.5 rounded-xl border border-[#0047c1]/20">
              <span className="material-symbols-outlined text-lg">inventory_2</span>
              <span className="font-mono text-xs font-bold tracking-tight">{order.poReference}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006b5d] animate-pulse"></span>
              <span className="text-base sm:text-lg font-extrabold text-[#131b2e]">
                Ciprofloxacin &amp; Amoxicillin Bulk Lot Consignment
              </span>
            </div>

            <span className="text-[11px] font-mono font-bold bg-[#80f3dd]/40 text-[#006f61] px-3 py-1 rounded-full">
              e-Way Bill #{order.eWayBillNo || 'EW-9821-4190'} Valid
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-bold transition-colors shadow-xs border border-[#eaedff]"
              type="button"
            >
              <span className="material-symbols-outlined text-base text-[#0047c1]">forum</span>
              <span>Dispute &amp; Audit Chat</span>
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a] ml-0.5"></span>
            </button>

            <button
              onClick={() => onShowToast('Preparing NIC E-Way Bill Barcode Slip for print...', 'print')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-bold transition-colors shadow-xs border border-[#eaedff]"
              type="button"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Print E-Way Slip</span>
            </button>

            <button
              onClick={() =>
                onShowToast('Generating Digitally Signed Form GST INV-01 PDF...', 'download')
              }
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] text-xs font-bold transition-colors shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-base text-[#006b5d]">verified</span>
              <span>Signed GST Invoice (PDF)</span>
            </button>

            <button
              onClick={() => {
                setPaymentSuccessUTR(null);
                handleAuthorizeRazorpay();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0047c1] hover:bg-[#155eef] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-base">payments</span>
              <span>Pay via Razorpay</span>
              <span className="bg-[#80f3dd] text-[#006f61] px-1.5 py-0.5 rounded text-[10px] font-mono">rzp_test</span>
            </button>
          </div>
        </div>

        {/* Multi-Stage Lifecycle Tracker Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff]">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#eaedff] gap-2">
            <div>
              <span className="text-[10px] font-bold font-mono text-[#434655] uppercase tracking-wider">
                GS1 Validated Pipeline
              </span>
              <h2 className="text-xl font-extrabold text-[#131b2e] mt-0.5">Order Lifecycle Audit Trail</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-mono text-xs text-[#434655] block">
                  Cold-Chain Temp: <strong>+4.2°C (OK)</strong>
                </span>
                <span className="text-xs text-[#006b5d] font-bold font-mono">
                  20B/21B Wholesale Compliance Locked
                </span>
              </div>
              <span className="p-2.5 rounded-xl bg-[#80f3dd]/40 text-[#006b5d]">
                <span className="material-symbols-outlined text-xl">ac_unit</span>
              </span>
            </div>
          </div>

          {/* 8-Step Interactive Progress Bar */}
          <div className="relative py-6 overflow-x-auto">
            <div className="min-w-[880px]">
              <div className="relative flex items-center justify-between">
                {/* Continuous track background */}
                <div className="absolute left-6 right-6 top-5 h-1.5 bg-[#eaedff] -translate-y-1/2 z-0"></div>

                {/* Progress fill */}
                <div
                  className="absolute left-6 top-5 h-1.5 bg-[#155eef] -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: stages[currentStepIndex].width }}
                ></div>

                {stages.map((stage, idx) => {
                  const isPassed = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={stage.label}
                      className="relative z-10 flex flex-col items-center group cursor-pointer"
                      onClick={() => {
                        setCurrentStepIndex(idx);
                        onShowToast(`Milestone jumped to Step ${idx + 1}: ${stage.label}`);
                      }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                          isPassed
                            ? 'bg-[#155eef] text-white'
                            : isCurrent
                            ? 'bg-[#0047c1] text-white ring-4 ring-[#155eef]/30'
                            : 'bg-[#f2f3ff] text-[#434655] border border-[#eaedff]'
                        }`}
                      >
                        {isPassed ? (
                          <span className="material-symbols-outlined text-sm">check</span>
                        ) : isCurrent ? (
                          <span className="material-symbols-outlined text-sm">
                            {idx === 4 ? 'local_shipping' : idx === 6 ? 'payments' : 'hourglass_top'}
                          </span>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`font-mono text-xs font-bold mt-2 ${
                          isCurrent ? 'text-[#0047c1]' : isPassed ? 'text-[#131b2e]' : 'text-[#737687]'
                        }`}
                      >
                        {stage.label}
                      </span>
                      <span className="text-[11px] text-[#434655] mt-0.5">{stage.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stage Detail Callout Panel */}
          <div className="bg-[#f2f3ff] rounded-2xl p-5 mt-4 grid grid-cols-1 md:grid-cols-4 gap-5 border border-[#eaedff]">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#434655] uppercase tracking-wider font-mono">
                Current Stage
              </span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006b5d] text-base">check_circle</span>
                <span className="text-sm font-bold text-[#131b2e]">
                  {currentStepIndex >= 6 ? 'Paid & Verified' : 'Delivered & Scanned'}
                </span>
              </div>
              <p className="text-xs text-[#434655]">Consignment received at Mumbai Central Depot bay 4.</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#434655] uppercase tracking-wider font-mono">
                Carrier &amp; E-Way Tracking
              </span>
              <div className="font-mono text-xs text-[#131b2e] font-bold">TCI ColdChain • TRK-849102-IN</div>
              <p className="text-xs text-[#434655]">GPS Vehicle: MH-04-AZ-4180 (Continuous Telemetry)</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#434655] uppercase tracking-wider font-mono">
                Batch Integrity Status
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-mono text-[10px] font-bold">
                  Tamper Seals Intact
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#155eef]/15 text-[#0047c1] font-mono text-[10px] font-bold">
                  GS1-128 Verified
                </span>
              </div>
              <p className="text-xs text-[#434655]">COA e-signed by Quality Lead Dr. P. Mehta</p>
            </div>

            <div className="flex flex-col justify-center items-start md:items-end">
              <span className="text-[10px] font-bold text-[#434655] uppercase tracking-wider font-mono">
                Outstanding Settlement
              </span>
              <div className="text-2xl font-extrabold text-[#0047c1] font-mono">
                ₹ {order.netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="font-mono text-xs text-[#ba1a1a] font-semibold">
                {currentStepIndex >= 6 ? '✓ Settled via Escrow' : 'Due in 14 days (30 Oct 2025)'}
              </span>
            </div>
          </div>
        </div>

        {/* Lower Section: Comprehensive B2B Tax Invoice & E-Way Bill Viewer */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-[#eaedff] space-y-6 relative overflow-hidden">
          {/* Regulatory Watermark Tag */}
          <div className="absolute right-8 top-8 hidden lg:flex items-center gap-2 bg-[#80f3dd]/30 text-[#006f61] px-3.5 py-1.5 rounded-full border border-[#006b5d]/20">
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span className="font-mono text-xs font-bold">GST Form INV-01 Compliant • Drug Rules 65/66</span>
          </div>

          {/* Invoice Title and Header Metadata */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6 pb-6 border-b border-[#eaedff]">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                  TAX INVOICE
                </span>
                <span className="px-2.5 py-1 bg-[#eaedff] rounded-lg text-[#0047c1] font-mono text-[10px] font-bold uppercase">
                  Original for Recipient
                </span>
              </div>
              <p className="text-xs text-[#434655] mt-1">
                Pursuant to Section 31 of CGST Act, 2017 &amp; Drugs and Cosmetics Act 1940
              </p>
            </div>

            <div className="bg-[#f2f3ff] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 w-full lg:w-auto border border-[#eaedff]">
              <div>
                <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">Invoice Number</span>
                <span className="font-mono text-xs font-bold text-[#131b2e]">{order.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">Invoice Date</span>
                <span className="font-mono text-xs text-[#131b2e]">{order.invoiceDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">Reverse Charge</span>
                <span className="font-mono text-xs text-[#131b2e]">NO</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">E-Way Bill No.</span>
                <span className="font-mono text-xs font-bold text-[#006b5d]">{order.eWayBillNo}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">Dispatch Date</span>
                <span className="font-mono text-xs text-[#131b2e]">14-Oct-2025 06:10</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">Place of Supply</span>
                <span className="font-mono text-xs text-[#131b2e]">27-Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Bilateral Entity Verification Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Card */}
            <div className="bg-[#f2f3ff] rounded-2xl p-6 space-y-3 border border-[#eaedff]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#006b5d] tracking-wider font-mono">
                  Supplier (Consignor)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-mono text-[10px] font-bold">
                  Verified Manufacturer
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">{order.supplierName}</h3>
                <p className="text-xs text-[#434655] mt-0.5">{order.supplierAddress}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#eaedff] font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#434655]">GSTIN / UIN:</span>
                  <span className="font-bold text-[#131b2e]">{order.supplierGstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#434655]">Drug License 20B (Wholesale):</span>
                  <span className="font-bold text-[#0047c1]">MH-PUN-20B-184920</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#434655]">Drug License 21B (Biologicals):</span>
                  <span className="font-bold text-[#0047c1]">MH-PUN-21B-184921</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#434655]">PAN / Corporate CIN:</span>
                  <span className="text-[#131b2e]">AAACN0192Q • L24239MH1998PLC0481</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#434655]">State &amp; State Code:</span>
                  <span className="text-[#131b2e]">Maharashtra (Code: 27)</span>
                </div>
              </div>
            </div>

            {/* Buyer Card */}
            <div className="bg-[#f2f3ff] rounded-2xl p-6 space-y-3 border border-[#eaedff]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#0047c1] tracking-wider font-mono">
                  Billed To / Shipped To (Buyer)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#155eef]/10 text-[#0047c1] font-mono text-[10px] font-bold">
                  Institutional Hospital
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">{order.buyerName}</h3>
                <p className="text-xs text-[#434655] mt-0.5">{order.buyerAddress}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#eaedff] font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#434655]">GSTIN / UIN:</span>
                  <span className="font-bold text-[#131b2e]">{order.buyerGstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#434655]">Buyer Drug License 20B:</span>
                  <span className="font-bold text-[#0047c1]">MH-MUM-20B-391827</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#434655]">Buyer Drug License 21B:</span>
                  <span className="font-bold text-[#0047c1]">MH-MUM-21B-391828</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#434655]">Purchase Order Ref:</span>
                  <span className="text-[#131b2e]">PO-APX-88219 (Dt. 11-Oct-2025)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#434655]">Delivery Terms &amp; Depot:</span>
                  <span className="text-[#131b2e]">F.O.R Destination • Bay 4 Cold Store</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Pharmaceutical Goods Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#eaedff]">
            <table className="w-full text-left text-xs text-[#131b2e]">
              <thead className="bg-[#f2f3ff] text-[#434655] font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Medicine Formulation &amp; Strength</th>
                  <th className="p-3.5">HSN Code</th>
                  <th className="p-3.5">Batch / Lot No.</th>
                  <th className="p-3.5">Mfg Date</th>
                  <th className="p-3.5">Exp Date</th>
                  <th className="p-3.5 text-right">Pack Size / Qty</th>
                  <th className="p-3.5 text-right">Unit Rate (₹)</th>
                  <th className="p-3.5 text-right">Taxable Amt (₹)</th>
                  <th className="p-3.5 text-right">CGST (6%)</th>
                  <th className="p-3.5 text-right">SGST (6%)</th>
                  <th className="p-3.5 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff]">
                {order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f2f3ff]/50 transition-colors">
                    <td className="p-3.5 font-mono text-[#737687]">0{index + 1}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#131b2e]">{item.medicineName}</div>
                      <div className="font-mono text-[10px] text-[#434655]">{item.genericFormula}</div>
                    </td>
                    <td className="p-3.5 font-mono font-semibold">{item.hsnCode}</td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold bg-[#eaedff] px-2 py-0.5 rounded text-[#0047c1]">
                        {item.batchNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[#434655]">{item.mfgDate}</td>
                    <td className="p-3.5 font-mono font-bold text-[#006b5d]">{item.expDate}</td>
                    <td className="p-3.5 font-mono text-right">{item.packSize}</td>
                    <td className="p-3.5 font-mono text-right">{item.unitPrice.toFixed(2)}</td>
                    <td className="p-3.5 font-mono text-right font-medium">
                      {item.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 font-mono text-right text-[#434655]">
                      {item.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 font-mono text-right text-[#434655]">
                      {item.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 font-mono text-right font-bold text-[#131b2e]">
                      {item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Recap & Calculation Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
            {/* Left Column: Bank Details & Regulatory Declarations */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#f2f3ff] rounded-2xl p-4 sm:p-5 border border-[#eaedff]">
                <span className="text-xs font-bold uppercase text-[#434655] tracking-wider block mb-2 font-mono">
                  Electronic Bank Settlement Details (RTGS/NEFT/e-Mandate)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 font-mono text-xs">
                  <span className="text-[#434655]">Beneficiary Bank:</span>
                  <span className="text-[#131b2e] font-bold">HDFC Bank Ltd., Fort Mumbai</span>
                  <span className="text-[#434655]">Account Name:</span>
                  <span className="text-[#131b2e] font-bold">Novartis BioPharma Wholesale Escrow</span>
                  <span className="text-[#434655]">Current A/C No:</span>
                  <span className="text-[#131b2e] font-bold tracking-wider">5020 0098 4410 29</span>
                  <span className="text-[#434655]">IFSC Code:</span>
                  <span className="text-[#131b2e] font-bold">HDFC0000060</span>
                  <span className="text-[#434655]">Razorpay Virtual VPA:</span>
                  <span className="text-[#0047c1] font-bold">novartis.b2b.8841@hdfcbank</span>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#f2f3ff] space-y-2 border border-[#eaedff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006b5d] text-base">policy</span>
                  <span className="text-xs font-bold uppercase text-[#006b5d] font-mono">
                    Statutory Quality Certification
                  </span>
                </div>
                <p className="text-xs text-[#434655] leading-relaxed">
                  We hereby certify that the drugs specified in this tax invoice do not contravene the provisions
                  of Section 18 of the Drugs and Cosmetics Act, 1940. Consignment meets all USP/BP monograph limits.
                  Controlled cold chain distribution observed at 2°C - 8°C throughout transit.
                </p>
              </div>
            </div>

            {/* Right Column: GST Accounting Summary */}
            <div className="lg:col-span-5 bg-[#f2f3ff] rounded-2xl p-6 space-y-3 border border-[#eaedff]">
              <span className="text-xs font-bold uppercase text-[#434655] tracking-wider block font-mono">
                Tax Computation Summary (INR)
              </span>

              <div className="flex justify-between text-xs text-[#131b2e]">
                <span>Total Taxable Value:</span>
                <span className="font-mono font-bold">
                  ₹ {order.taxableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#434655]">
                <span>Central GST (CGST @ 6.0%):</span>
                <span className="font-mono font-bold text-[#131b2e]">
                  ₹ {order.cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#434655]">
                <span>State GST (SGST @ 6.0%):</span>
                <span className="font-mono font-bold text-[#131b2e]">
                  ₹ {order.sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#434655]">
                <span>Integrated Tax (IGST @ 0%):</span>
                <span className="font-mono text-[#131b2e]">₹ 0.00</span>
              </div>
              <div className="flex justify-between text-xs text-[#434655]">
                <span>Round-off Delta:</span>
                <span className="font-mono text-[#131b2e]">₹ 0.00</span>
              </div>

              <div className="pt-3 border-t border-[#eaedff] flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-[#131b2e]">Net Payable Amount:</span>
                <span className="text-2xl font-extrabold text-[#0047c1] font-mono">
                  ₹ {order.netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <p className="font-mono text-[11px] text-[#434655] pt-1">
                Amount in words: <span className="font-bold text-[#131b2e]">{order.amountInWords}</span>
              </p>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsRazorpayOpen(true)}
                  className="w-full py-3 rounded-xl bg-[#155eef] hover:bg-[#0047c1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                  <span>Initiate B2B Razorpay Checkout</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[#434655] font-mono text-[11px]">
                  <span className="material-symbols-outlined text-xs text-[#006b5d]">security</span>
                  <span>256-bit Encrypted Wholesale Escrow Clearing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Signature Block */}
          <div className="pt-4 border-t border-[#eaedff] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#434655] font-mono text-xs">
            <div>
              <span>Digital Signature Token: </span>
              <span className="text-[#131b2e] font-bold">DSC/2025/NOV/84920/SHA256</span>
              <div className="text-[10px] text-[#737687]">Signed at 14-Oct-2025 06:14:02 UTC+05:30</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="font-bold text-xs text-[#131b2e]">For Novartis Lifesciences Bio-Pharma Ltd.</div>
              <span className="text-[11px] text-[#006b5d] font-bold">✓ Authorized Signatory (e-Signed Verified)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Razorpay Modal Overlay */}
      {isRazorpayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283044]/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-[#eaedff]">
            {/* Header */}
            <div className="bg-[#0c2340] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#155eef] flex items-center justify-center text-white font-bold text-xl">
                  ₹
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#80f3dd] uppercase tracking-wider block font-mono">
                    Razorpay B2B Checkout
                  </span>
                  <h4 className="text-base font-bold text-white">PharmaConnect Escrow</h4>
                </div>
              </div>
              <button
                onClick={() => setIsRazorpayOpen(false)}
                className="text-[#d2d9f4] hover:text-white"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-[#f2f3ff] p-4 rounded-2xl space-y-1 border border-[#eaedff]">
                <div className="flex justify-between font-mono text-[#434655]">
                  <span>Invoice Reference:</span>
                  <span className="font-bold text-[#131b2e]">{order.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#131b2e] pt-1 border-t border-[#eaedff]">
                  <span>Total Payable:</span>
                  <span className="font-mono text-lg text-[#0047c1]">
                    ₹ {order.netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-[#434655] font-mono">
                  Select Institutional Settlement Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-[#f2f3ff] cursor-pointer hover:bg-[#eaedff] border border-[#eaedff]">
                    <input defaultChecked name="pay-mode" type="radio" className="text-[#0047c1]" />
                    <span className="font-semibold text-xs text-[#131b2e]">Corporate NetBanking</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-[#f2f3ff] cursor-pointer hover:bg-[#eaedff] border border-[#eaedff]">
                    <input name="pay-mode" type="radio" className="text-[#0047c1]" />
                    <span className="font-semibold text-xs text-[#131b2e]">NEFT / RTGS Challan</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#434655] font-mono">
                  Wholesale Bank Account
                </label>
                <select className="w-full bg-[#f2f3ff] text-[#131b2e] rounded-xl p-2.5 text-xs font-medium border border-[#eaedff] focus:outline-none focus:ring-2 focus:ring-[#0047c1]">
                  <option>HDFC Bank Corporate - Account ending 4410</option>
                  <option>State Bank of India (Commercial) - ending 0192</option>
                  <option>ICICI Bank Corporate Clearing - ending 9931</option>
                </select>
              </div>

              {paymentSuccessUTR && (
                <div className="p-3 rounded-xl bg-[#80f3dd]/40 text-[#006f61] text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Settlement Authorized! UTR: {paymentSuccessUTR}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsRazorpayOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-[#eaedff] text-[#131b2e] font-bold hover:bg-[#dae2fd]"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAuthorizeRazorpay}
                  disabled={isProcessingPayment}
                  className="w-2/3 py-2.5 rounded-xl bg-[#155eef] hover:bg-[#0047c1] text-white font-bold shadow-md flex items-center justify-center gap-2 transition-all"
                  type="button"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">lock</span>
                      <span>Authorize ₹ {order.netPayable.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Chat Sliding Panel */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-[#283044]/30 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#eaedff]">
            {/* Chat Header */}
            <div className="p-4 sm:p-5 bg-[#f2f3ff] flex items-center justify-between border-b border-[#eaedff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#155eef]/10 text-[#0047c1] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">medical_services</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#131b2e]">Order Compliance Desk</h4>
                  <span className="font-mono text-[11px] text-[#434655]">Audit thread • {order.poReference}</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#eaedff] text-[#434655]"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {chatMessages.map((msg) => {
                const isSupplier = msg.senderRole === 'supplier';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isSupplier ? 'ml-auto items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl ${
                        isSupplier
                          ? 'bg-[#155eef] text-white rounded-tr-none'
                          : 'bg-[#f2f3ff] text-[#131b2e] rounded-tl-none border border-[#eaedff]'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="font-mono text-[10px] text-[#434655] mt-1">
                      {msg.senderName} • {msg.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-4 bg-[#f2f3ff] flex items-center gap-2 border-t border-[#eaedff]">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white rounded-xl px-4 py-2.5 text-xs text-[#131b2e] placeholder:text-[#737687] focus:outline-none focus:ring-2 focus:ring-[#0047c1] border border-[#eaedff]"
                placeholder="Post regulatory audit query..."
                type="text"
              />
              <button
                className="p-2.5 rounded-xl bg-[#155eef] text-white hover:bg-[#0047c1] transition-colors shrink-0"
                type="submit"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
