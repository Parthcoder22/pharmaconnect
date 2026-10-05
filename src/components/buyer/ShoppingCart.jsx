import React, { useState, useMemo } from 'react';

export const ShoppingCart = ({
  cartItems = [],
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onCreateOrder,
  onNavigate,
  onShowToast,
  currentUser
}) => {
  // Checkout flow state: 'cart' | 'checkout' | 'order-success'
  const [step, setStep] = useState('cart');
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  // Delivery Address Form
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const storageKey = `pharmaconnect_buyer_addresses_${currentUser?.id || 'default'}`;
  const isDemoBuyer = currentUser?.id === 'usr-buy-01' || currentUser?.email?.includes('sharma');

  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    if (isDemoBuyer) {
      return [
        {
          id: 'addr-1',
          title: 'Main Central Hospital Pharmacy Depot',
          line1: 'Plot 12-A, Healthcare City Phase II, KEM Hospital Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400012',
          contactPerson: 'Dr. V. Sharma (Chief Pharmacist)',
          contactPhone: '+91 98110 99420'
        },
        {
          id: 'addr-2',
          title: 'Apex Trauma & Emergency Formulary Store',
          line1: 'Building 4, Basement Level, Acute Care Centre, Parel',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400012',
          contactPerson: 'Mr. Rajesh Kadam (Store Officer)',
          contactPhone: '+91 98200 11928'
        }
      ];
    }

    return [
      {
        id: 'addr-primary',
        title: `${currentUser?.organization || currentUser?.name || 'Main'} Receiving Depot`,
        line1: currentUser?.businessAddress || 'Registered Hospital & Clinical Store Address',
        city: currentUser?.city || 'Mumbai',
        state: currentUser?.state || 'Maharashtra',
        pincode: currentUser?.pincode || '400001',
        contactPerson: currentUser?.name || 'Store Pharmacist In-Charge',
        contactPhone: currentUser?.phone || ''
      }
    ];
  });

  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    line1: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',
    contactPerson: '',
    contactPhone: ''
  });

  // Commercial terms & notes
  const [paymentOption, setPaymentOption] = useState('online'); // 'online' (Razorpay), 'credit' (Net 30), 'bank' (NEFT/RTGS)
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Group cart items by supplier
  const supplierGroups = useMemo(() => {
    const groups = {};
    cartItems.forEach((item) => {
      const supplier = item.supplierName || item.manufacturer || 'Novartis Lifesciences Bio-Pharma Ltd.';
      if (!groups[supplier]) {
        groups[supplier] = {
          supplierName: supplier,
          items: [],
          subtotal: 0,
          gstTotal: 0
        };
      }
      const lineTotal = item.quantity * item.unitPrice;
      const gstRate = item.gstRate || 12;
      const lineGst = (lineTotal * gstRate) / 100;

      groups[supplier].items.push(item);
      groups[supplier].subtotal += lineTotal;
      groups[supplier].gstTotal += lineGst;
    });
    return Object.values(groups);
  }, [cartItems]);

  // Total summary calculations
  const totals = useMemo(() => {
    let subtotal = 0;
    let gst = 0;
    cartItems.forEach((ci) => {
      const line = ci.quantity * ci.unitPrice;
      subtotal += line;
      gst += (line * (ci.gstRate || 12)) / 100;
    });
    const shipping = subtotal > 10000 ? 0 : 500;
    const grandTotal = subtotal + gst + shipping;

    return { subtotal, gst, shipping, grandTotal };
  }, [cartItems]);

  // Quantity handlers
  const handleQtyChange = (itemId, newQty, moq) => {
    const num = parseInt(newQty, 10);
    if (isNaN(num)) return;
    if (num < moq) {
      onShowToast?.(`Minimum order quantity for this item is ${moq} units`, 'warning');
      onUpdateQuantity?.(itemId, moq);
      return;
    }
    onUpdateQuantity?.(itemId, num);
  };

  const handleAddNewAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.contactPerson) {
      onShowToast?.('Please fill required delivery address fields', 'warning');
      return;
    }
    const created = {
      ...newAddress,
      id: `addr-${Date.now()}`,
      title: newAddress.title || 'Secondary Pharmacy Branch'
    };
    const updated = [...savedAddresses, created];
    setSavedAddresses(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
    setSelectedAddressIndex(savedAddresses.length);
    setIsAddingNewAddress(false);
    onShowToast?.('New delivery destination added', 'check_circle');
  };

  const handleDeleteAddress = (e, addrId) => {
    e.stopPropagation();
    if (savedAddresses.length <= 1) {
      onShowToast?.('Must keep at least one registered delivery destination', 'warning');
      return;
    }
    const updated = savedAddresses.filter((a) => a.id !== addrId);
    setSavedAddresses(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
    if (selectedAddressIndex >= updated.length) {
      setSelectedAddressIndex(0);
    }
    onShowToast?.('Delivery destination deleted', 'info');
  };

  const isBuyerVerified = currentUser?.verificationStatus === 'verified' || currentUser?.verification_status === 'verified';

  // Submit Purchase Order to Backend
  const handlePlaceOrderSubmit = async () => {
    if (cartItems.length === 0) return;

    if (!isBuyerVerified) {
      onShowToast?.('CDSCO Statutory Buyer Verification required to submit purchase orders', 'warning');
      onNavigate?.('business-verification');
      return;
    }

    setIsSubmitting(true);

    try {
      const deliveryAddress = savedAddresses[selectedAddressIndex] || savedAddresses[0];

      // Build structured order payload
      const subtotal = totals.subtotal;
      const gstTotal = totals.gst;
      const grandTotal = totals.grandTotal;

      const activeSupplier = cartItems[0]?.supplierName || cartItems[0]?.manufacturer || 'Novartis Lifesciences Bio-Pharma Ltd.';
      const activeSupplierId = cartItems[0]?.supplierId || cartItems[0]?.medicine?.supplier_id || 'usr-supp-01';

      const orderData = {
        id: `po-${Date.now()}`,
        poReference: `PO-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        supplierId: activeSupplierId,
        supplierName: activeSupplier,
        buyerName: currentUser?.organization || 'Apex Multispeciality Healthcare Trust',
        buyerAddress: `${deliveryAddress.line1}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`,
        destinationHub: deliveryAddress.title || `${deliveryAddress.city} Central Depot`,
        deliveryAddress,
        contactPerson: deliveryAddress.contactPerson,
        contactPhone: deliveryAddress.contactPhone,
        items: cartItems.map((ci) => ({
          medicineId: ci.id || ci.medicineId,
          name: ci.name || ci.brand || ci.medicine?.name || 'Pharmaceutical Formulation',
          medicineName: ci.name || ci.brand || ci.medicine?.name || 'Pharmaceutical Formulation',
          brand: ci.brand || ci.name || ci.medicine?.brand || 'Generic',
          genericName: ci.genericName || ci.medicine?.genericName || '',
          quantity: ci.quantity,
          unitPrice: ci.unitPrice,
          totalPrice: ci.quantity * ci.unitPrice,
          totalAmount: ci.quantity * ci.unitPrice,
          batchNumber: ci.activeBatch?.batchNumber || '#LOT-PENDING',
          gstRate: ci.gstRate || 12
        })),
        itemCount: cartItems.reduce((acc, ci) => acc + ci.quantity, 0),
        subtotal: subtotal,
        taxableTotal: subtotal,
        gstTotal: gstTotal,
        cgstTotal: gstTotal / 2,
        sgstTotal: gstTotal / 2,
        shippingFee: totals.shipping,
        netPayable: grandTotal,
        totalAmount: grandTotal,
        total: grandTotal,
        status: 'requested',
        paymentMethod: paymentOption,
        paymentStatus: paymentOption === 'credit' ? 'due' : 'pending',
        orderNotes: orderNotes.trim() || 'Institutional procurement for immediate clinical formulary stock.',
        createdAt: 'Just now'
      };

      let created = null;
      if (onCreateOrder) {
        created = await onCreateOrder(orderData);
      }

      setLastPlacedOrder(created || orderData);
      setStep('order-success');
      onClearCart?.();
      onShowToast?.(`Purchase Order ${orderData.poReference} submitted to supplier`, 'verified');
    } catch (err) {
      onShowToast?.(`Failed to create order: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty Cart State
  if (cartItems.length === 0 && step !== 'order-success') {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-[#eaedff] space-y-4 max-w-lg mx-auto my-8 shadow-2xs">
        <div className="w-16 h-16 rounded-2xl bg-[#f2f3ff] flex items-center justify-center mx-auto text-[#0047c1]">
          <span className="material-symbols-outlined text-3xl">shopping_cart</span>
        </div>
        <h2 className="text-base font-bold text-[#131b2e]">Your Procurement Cart is Empty</h2>
        <p className="text-xs text-[#5e6b7f]">
          You have not added any medicines to your purchase order yet. Search and discover verified pharmaceutical suppliers in the catalog.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('browse-medicines')}
          className="px-5 py-2.5 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-xs"
        >
          <span className="material-symbols-outlined text-base">medication</span>
          <span>Browse Medicines Catalog</span>
        </button>
      </div>
    );
  }

  // Order Placement Success Screen
  if (step === 'order-success' && lastPlacedOrder) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-3xl border border-[#eaedff] shadow-xl text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-[#e6f8f3] text-[#006f61] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#006f61] bg-[#e6f8f3] px-3 py-1 rounded-full">
            Purchase Order Submitted
          </span>
          <h2 className="text-xl font-bold text-[#131b2e] mt-2">
            Order Reference: {lastPlacedOrder.poReference || lastPlacedOrder.id}
          </h2>
          <p className="text-xs text-[#5e6b7f] mt-1 max-w-md mx-auto">
            Your purchase order has been generated and dispatched to the supplier's allocation desk for statutory review and dispatch.
          </p>
        </div>

        <div className="p-4 bg-[#f8f9ff] rounded-2xl border border-[#eaedff] text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#5e6b7f]">Status:</span>
            <span className="font-bold text-[#b37400] bg-[#fff8e6] px-2 py-0.5 rounded">
              Awaiting Supplier Confirmation
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5e6b7f]">Total Payable Amount:</span>
            <span className="font-mono font-bold text-[#131b2e]">
              ₹ {(parseFloat(lastPlacedOrder.totalAmount) || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5e6b7f]">Payment Method:</span>
            <span className="font-semibold text-[#131b2e] uppercase">
              {lastPlacedOrder.paymentMethod === 'online' ? 'Online Gateway (Razorpay)' : lastPlacedOrder.paymentMethod}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5e6b7f]">Delivery Destination:</span>
            <span className="font-medium text-[#131b2e] truncate max-w-xs">
              {lastPlacedOrder.buyerAddress || 'Apex Hospital Main Depot'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('my-orders')}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Track Order in My Orders
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('cart');
              onNavigate('browse-medicines');
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-semibold transition-colors"
          >
            Continue Purchasing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">
            {step === 'cart' ? 'Procurement Shopping Cart' : 'Checkout & Order Confirmation'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
            {step === 'cart'
              ? 'Review quantities, minimum order rules, and supplier breakdowns before submission'
              : 'Specify destination depot, billing options, and submit purchase requisition'}
          </p>
        </div>

        {step === 'checkout' && (
          <button
            type="button"
            onClick={() => setStep('cart')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-xs font-semibold text-[#131b2e]"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to Cart</span>
          </button>
        )}
      </div>

      {/* Grid: Main Column (2 cols) & Summary Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-5">
          {step === 'cart' ? (
            <>
              {/* Single Manufacturer Assurance Banner */}
              <div className="bg-[#e6f8f3] border border-[#a2ecd9] rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-white text-[#006f61] flex items-center justify-center shrink-0 border border-[#a2ecd9]">
                  <span className="material-symbols-outlined text-xl">shield_check</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#006f61] bg-white px-2 py-0.5 rounded border border-[#a2ecd9]">
                      Single-Manufacturer Order Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#006f61] font-medium mt-0.5">
                    All line items belong to <strong className="font-bold">{supplierGroups[0]?.supplierName || 'Verified Manufacturer'}</strong>. Unified CDSCO Form 20B/21B invoice and single escrow payment guaranteed.
                  </p>
                </div>
              </div>

              {/* STEP 1: CART ITEMS GROUPED BY SUPPLIER */}
              {supplierGroups.map((group) => (
                <div
                  key={group.supplierName}
                  className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4"
                >
                {/* Supplier Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0047c1] text-lg">storefront</span>
                    <div>
                      <h2 className="text-xs font-bold text-[#131b2e]">{group.supplierName}</h2>
                      <span className="text-[10px] text-[#006f61] font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">verified</span>
                        Verified Direct Manufacturer / Depot
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#5e6b7f]">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items in this supplier group */}
                <div className="divide-y divide-[#eaedff]">
                  {group.items.map((item) => {
                    const price = item.unitPrice;
                    const lineTotal = item.quantity * price;
                    const moq = item.moq || 100;

                    return (
                      <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-[#131b2e]">{item.name || item.brand}</h3>
                          <p className="text-[11px] text-[#5e6b7f]">{item.genericName}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-[#5e6b7f]">
                            <span className="bg-[#f2f3ff] px-2 py-0.5 rounded font-medium text-[#131b2e]">
                              {item.unitPack || item.packSize || '10x10 Strips'}
                            </span>
                            <span>MOQ: <strong>{moq} units</strong></span>
                            <span>GST: <strong>{item.gstRate || 12}%</strong></span>
                          </div>
                        </div>

                        {/* Quantity Stepper & Price */}
                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                          {/* Stepper */}
                          <div className="flex items-center border border-[#eaedff] rounded-xl bg-[#f2f3ff] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.quantity - 50, moq)}
                              className="w-7 h-8 flex items-center justify-center text-[#5e6b7f] hover:text-[#131b2e] hover:bg-[#eaedff]"
                            >
                              <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <input
                              type="number"
                              min={moq}
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.id, e.target.value, moq)}
                              className="w-14 h-8 text-center text-xs font-mono font-bold text-[#131b2e] bg-transparent focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.quantity + 50, moq)}
                              className="w-7 h-8 flex items-center justify-center text-[#5e6b7f] hover:text-[#131b2e] hover:bg-[#eaedff]"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[90px]">
                            <span className="font-mono font-bold text-xs text-[#131b2e] block">
                              ₹ {lineTotal.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#5e6b7f] block font-mono">
                              ₹ {price.toFixed(2)} / pk
                            </span>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => onRemoveFromCart?.(item.id)}
                            className="p-1 text-[#ba1a1a] hover:bg-[#ffebee] rounded-lg transition-colors"
                            title="Remove from Cart"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
          ) : (
            /* STEP 2: CHECKOUT DETAILS */
            <div className="space-y-5">
              {/* Delivery Address Card */}
              <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
                  <div>
                    <h2 className="text-xs font-bold text-[#131b2e]">1. Delivery Facility Destination</h2>
                    <p className="text-[11px] text-[#5e6b7f]">Select registered pharmacy warehouse or central hospital store</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="text-xs font-bold text-[#0047c1] hover:underline"
                  >
                    {isAddingNewAddress ? 'Cancel' : '+ Add Address'}
                  </button>
                </div>

                {isAddingNewAddress ? (
                  <form onSubmit={handleAddNewAddressSubmit} className="space-y-3 pt-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                          Facility / Store Label *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. South Wing Emergency Formulary"
                          value={newAddress.title}
                          onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                          className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                          Contact Person *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. A. Patil (Chief Pharmacist)"
                          value={newAddress.contactPerson}
                          onChange={(e) => setNewAddress({ ...newAddress, contactPerson: e.target.value })}
                          className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                        Street Address / Premises *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Plot No, Building, Road"
                        value={newAddress.line1}
                        onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                        className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">PIN Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="400012"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="px-3 py-1.5 bg-[#f2f3ff] rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#0047c1] text-white rounded-xl text-xs font-bold"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2.5">
                    {savedAddresses.map((addr, index) => {
                      const isSelected = selectedAddressIndex === index;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressIndex(index)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#0047c1] bg-[#eef2ff]'
                              : 'border-[#eaedff] hover:bg-[#faf8ff]'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2.5">
                              <span
                                className={`material-symbols-outlined text-base mt-0.5 ${
                                  isSelected ? 'text-[#0047c1]' : 'text-[#5e6b7f]'
                                }`}
                              >
                                {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                              </span>
                              <div>
                                <span className="font-bold text-xs text-[#131b2e] block">{addr.title}</span>
                                <p className="text-[11px] text-[#5e6b7f] mt-0.5">{addr.line1}</p>
                                <span className="text-[10px] text-[#5e6b7f] block">
                                  {addr.city}, {addr.state} - {addr.pincode} • Contact: {addr.contactPerson} ({addr.contactPhone})
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <span className="text-[10px] font-bold text-[#0047c1] bg-white px-2 py-0.5 rounded shadow-2xs">
                                  Selected
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteAddress(e, addr.id)}
                                className="p-1 text-[#ba1a1a] hover:bg-white rounded-lg transition-colors"
                                title="Delete Address"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Mode Selection */}
              <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
                <div className="pb-2 border-b border-[#eaedff]">
                  <h2 className="text-xs font-bold text-[#131b2e]">2. Commercial Terms &amp; Settlement</h2>
                  <p className="text-[11px] text-[#5e6b7f]">Select institutional credit terms or payment gateway</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setPaymentOption('online')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentOption === 'online'
                        ? 'border-[#0047c1] bg-[#eef2ff]'
                        : 'border-[#eaedff] hover:bg-[#faf8ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0047c1] text-base">credit_card</span>
                      <span className="font-bold text-xs text-[#131b2e]">Razorpay Online</span>
                    </div>
                    <p className="text-[10px] text-[#5e6b7f] mt-1">UPI, Corporate Cards, NetBanking</p>
                  </div>

                  <div
                    onClick={() => setPaymentOption('credit')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentOption === 'credit'
                        ? 'border-[#0047c1] bg-[#eef2ff]'
                        : 'border-[#eaedff] hover:bg-[#faf8ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006f61] text-base">assignment</span>
                      <span className="font-bold text-xs text-[#131b2e]">Net 30 Credit</span>
                    </div>
                    <p className="text-[10px] text-[#5e6b7f] mt-1">Institutional Credit Term Invoice</p>
                  </div>

                  <div
                    onClick={() => setPaymentOption('bank')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentOption === 'bank'
                        ? 'border-[#0047c1] bg-[#eef2ff]'
                        : 'border-[#eaedff] hover:bg-[#faf8ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#b37400] text-base">account_balance</span>
                      <span className="font-bold text-xs text-[#131b2e]">NEFT / RTGS</span>
                    </div>
                    <p className="text-[10px] text-[#5e6b7f] mt-1">Direct Bank Escrow Transfer</p>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-[#131b2e] mb-1">
                    Special Receiving Instructions / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Deliver to Cold-Chain Receiving Dock between 9 AM and 4 PM..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full p-2.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Order Financial Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-[#131b2e] pb-2 border-b border-[#eaedff]">
              Commercial Order Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#5e6b7f]">
                <span>Items Subtotal:</span>
                <span className="font-mono text-[#131b2e]">₹ {totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[#5e6b7f]">
                <span>Applicable GST (Calculated):</span>
                <span className="font-mono text-[#131b2e]">₹ {totals.gst.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[#5e6b7f]">
                <span>Institutional Transport / Freight:</span>
                <span className="font-mono text-[#131b2e]">
                  {totals.shipping === 0 ? 'FREE (Institutional)' : `₹ ${totals.shipping}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between text-sm font-bold text-[#131b2e]">
                <span>Total Payable:</span>
                <span className="font-mono text-base text-[#0047c1]">
                  ₹ {totals.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Verification Barrier for Uncertified Buyers */}
            {!isBuyerVerified && (
              <div className="p-3 bg-[#fff8e6] border border-[#f5dc99] rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-[#b37400] font-bold">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>CDSCO Certification Required</span>
                </div>
                <p className="text-[11px] text-[#5e6b7f]">
                  Under Form 20/21 regulations, unverified buyers cannot purchase pharmaceuticals.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate?.('business-verification')}
                  className="w-full py-1.5 bg-[#b37400] hover:bg-[#8f5d00] text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Verify in Security &amp; Verification
                </button>
              </div>
            )}

            {/* Step Action Button */}
            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => {
                  if (!isBuyerVerified) {
                    onShowToast?.('CDSCO Statutory Buyer Verification required to proceed to checkout', 'warning');
                    onNavigate?.('business-verification');
                    return;
                  }
                  setStep('checkout');
                }}
                className="w-full py-2.5 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Checkout</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            ) : !isBuyerVerified ? (
              <button
                type="button"
                onClick={() => onNavigate?.('business-verification')}
                className="w-full py-2.5 bg-[#b37400] hover:bg-[#8f5d00] text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">security</span>
                <span>Verify Account to Place Order</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceOrderSubmit}
                className="w-full py-2.5 bg-[#0047c1] hover:bg-[#155eef] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Submitting Purchase Order...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">task_alt</span>
                    <span>Submit Purchase Order</span>
                  </>
                )}
              </button>
            )}

            {/* Clear Cart Action */}
            {step === 'cart' && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-[11px] text-[#ba1a1a] hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Statutory Notice */}
          <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#eaedff] text-[11px] text-[#5e6b7f] space-y-1">
            <span className="font-bold text-[#131b2e] block">CDSCO Statutory Compliance</span>
            <p>
              Purchase orders placed via PharmaConnect are strictly processed between verified pharmaceutical licensees with valid statutory Drug License Form 20B/21B.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
