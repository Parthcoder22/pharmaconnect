import { api } from './api';
import { INITIAL_ORDERS } from '../data/mockData';

export const normalizeOrder = (o) => {
  if (!o) return o;
  const net = Number(o.totalAmount ?? o.netPayable ?? o.net_payable ?? o.total ?? 0);
  const status = (o.status || 'requested').toLowerCase();
  const isPaid = status === 'paid' || status === 'completed' || o.paymentStatus === 'paid' || o.payment_status === 'paid';
  const poRef = o.poReference || o.po_reference || o.id;

  const items = (Array.isArray(o.items) ? o.items : []).map((it) => ({
    ...it,
    name: it.name || it.medicineName || it.medicine_name || 'Pharmaceutical Formulation',
    medicineName: it.medicineName || it.medicine_name || it.name || 'Pharmaceutical Formulation',
    quantity: Number(it.quantity) || 1,
    unitPrice: Number(it.unitPrice ?? it.unit_price ?? 0)
  }));

  const itemCount = o.itemCount || items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);

  return {
    ...o,
    id: o.id,
    poReference: poRef,
    po_reference: poRef,
    buyerId: o.buyerId || o.buyer_id,
    buyer_id: o.buyerId || o.buyer_id,
    supplierId: o.supplierId || o.supplier_id,
    supplier_id: o.supplierId || o.supplier_id,
    supplierName: o.supplierName || o.supplier_name || 'Novartis Bio-Pharma Ltd.',
    buyerName: o.buyerName || o.buyer_name || 'Hospital Buyer',
    status,
    totalAmount: net,
    total: net,
    netPayable: net,
    net_payable: net,
    taxableTotal: Number(o.taxableTotal ?? o.taxable_total ?? (net * 0.88)),
    taxable_total: Number(o.taxableTotal ?? o.taxable_total ?? (net * 0.88)),
    paymentStatus: isPaid ? 'paid' : (o.paymentStatus || o.payment_status || 'pending'),
    payment_status: isPaid ? 'paid' : (o.paymentStatus || o.payment_status || 'pending'),
    createdAt: o.createdAt || o.created_at || new Date().toISOString(),
    created_at: o.createdAt || o.created_at || new Date().toISOString(),
    date: o.date || (o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at).toLocaleDateString('en-GB') : 'Today'),
    items,
    itemCount: itemCount > 0 ? itemCount : 1
  };
};

export const orderService = {
  async getOrders() {
    try {
      const res = await api.get('/orders');
      if (res.success && Array.isArray(res.data)) {
        return res.data.map(normalizeOrder);
      }
    } catch (err) {
      console.warn('[orderService] getOrders failed:', err.message);
    }
    return [];
  },

  async createOrder(orderData) {
    try {
      const destinationHub = orderData.destinationHub || orderData.deliveryAddress?.title || 'Main Hospital Depot';
      const items = (orderData.items || []).map((ci) => ({
        medicineId: ci.medicineId || ci.medicine?.id || ci.id,
        quantity: Number(ci.quantity) || 1,
        unitPrice: Number(ci.unitPrice ?? ci.medicine?.unitPrice ?? ci.baseWholesalePrice ?? 100)
      }));

      const res = await api.post('/orders', {
        destinationHub,
        deliveryAddress: orderData.buyerAddress || (orderData.deliveryAddress ? `${orderData.deliveryAddress.line1}, ${orderData.deliveryAddress.city}` : undefined),
        supplierId: orderData.supplierId,
        supplierName: orderData.supplierName,
        items
      });
      if (res.success && res.data) {
        return normalizeOrder(res.data);
      }
    } catch (err) {
      console.warn('[orderService] createOrder failed:', err.message);
      throw err;
    }
  },

  async createPurchaseOrder(destinationHub, cartItems) {
    try {
      const payload = {
        destinationHub,
        items: cartItems.map((ci) => ({
          medicineId: ci.medicineId || ci.medicine?.id || ci.id,
          quantity: Number(ci.quantity) || 1,
          unitPrice: Number(ci.unitPrice ?? ci.medicine?.unitPrice ?? ci.baseWholesalePrice ?? 100)
        }))
      };

      const res = await api.post('/orders', payload);
      if (res.success && res.data) {
        return normalizeOrder(res.data);
      }
    } catch (err) {
      console.warn('[orderService] createPurchaseOrder API failed:', err.message);
      throw err;
    }
  },

  async acceptOrder(poRefOrId) {
    try {
      const res = await api.post(`/supplier/orders/${poRefOrId}/accept`);
      if (res.success && res.data) {
        return normalizeOrder(res.data);
      }
    } catch (err) {
      console.warn('[orderService] acceptOrder failed:', err.message);
      throw err;
    }
  },

  async rejectOrder(poRefOrId, reason, notes) {
    try {
      const res = await api.post(`/supplier/orders/${poRefOrId}/reject`, { reason, notes });
      if (res.success && res.data) {
        return normalizeOrder(res.data);
      }
    } catch (err) {
      console.warn('[orderService] rejectOrder failed:', err.message);
      throw err;
    }
  },

  async dispatchOrder(poRefOrId, dispatchData) {
    try {
      const res = await api.patch(`/supplier/orders/${poRefOrId}/dispatch`, dispatchData);
      if (res.success && res.data) {
        return normalizeOrder(res.data);
      }
    } catch (err) {
      console.warn('[orderService] dispatchOrder failed:', err.message);
      throw err;
    }
  },

  async confirmDelivery(poRefOrId, deliveryData = { tamperSealsIntact: true }) {
    try {
      const res = await api.post(`/orders/${poRefOrId}/confirm-delivery`, deliveryData);
      if (res.success && res.data) {
        return normalizeOrder(res.data);
      }
    } catch (err) {
      console.warn('[orderService] confirmDelivery failed:', err.message);
      throw err;
    }
  }
};
