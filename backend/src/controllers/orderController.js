import { OrderStateService } from '../services/orderStateService.js';
import { db } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

const formatOrder = (o) => {
  if (!o) return null;
  const net = Number(o.netPayable ?? o.net_payable ?? o.totalAmount ?? o.total ?? 0);
  const taxable = Number(o.taxableTotal ?? o.taxable_total ?? (net * 0.88));
  const cgst = Number(o.cgstTotal ?? o.cgst_total ?? (net * 0.06));
  const sgst = Number(o.sgstTotal ?? o.sgst_total ?? (net * 0.06));
  const status = (o.status || 'requested').toLowerCase();
  const isPaid = status === 'paid' || status === 'completed' || o.paymentStatus === 'paid' || o.payment_status === 'paid';
  
  // Find line items if missing
  let items = Array.isArray(o.items) && o.items.length > 0 ? o.items : [];
  if (items.length === 0) {
    const dbItems = db.find('order_items', (oi) => oi.order_id === o.id || oi.orderId === o.id);
    if (Array.isArray(dbItems) && dbItems.length > 0) {
      items = dbItems.map((it) => ({
        id: it.id,
        medicineId: it.medicine_id || it.medicineId,
        medicineName: it.medicine_name || it.medicineName || 'Pharmaceutical Formulation',
        name: it.medicine_name || it.medicineName || 'Pharmaceutical Formulation',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unit_price || it.unitPrice) || 0,
        taxableAmount: Number(it.taxable_amount || it.taxableAmount) || 0,
        totalAmount: Number(it.line_total || it.totalAmount) || 0,
        batchNumber: it.batch_number || it.batchNumber || '#LOT-BATCH'
      }));
    }
  }

  const itemCount = items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);

  // Supplier and Buyer names
  let supplierName = o.supplierName || o.supplier_name;
  if (!supplierName && (o.supplierId || o.supplier_id)) {
    const sId = o.supplierId || o.supplier_id;
    const sBiz = db.findOne('businesses', (b) => b.user_id === sId);
    const sUser = db.findOne('users', (u) => u.id === sId);
    supplierName = sBiz?.business_name || sUser?.organization || sUser?.full_name || 'Novartis Bio-Pharma Ltd.';
  }

  let buyerName = o.buyerName || o.buyer_name;
  if (!buyerName && (o.buyerId || o.buyer_id)) {
    const bId = o.buyerId || o.buyer_id;
    const bBiz = db.findOne('businesses', (b) => b.user_id === bId);
    const bUser = db.findOne('users', (u) => u.id === bId);
    buyerName = bBiz?.business_name || bUser?.organization || bUser?.full_name || 'Apex Multispeciality Healthcare';
  }

  const poReference = o.poReference || o.po_reference || o.id;

  return {
    ...o,
    id: o.id,
    poReference,
    po_reference: poReference,
    buyerId: o.buyerId || o.buyer_id,
    buyer_id: o.buyerId || o.buyer_id,
    buyerName: buyerName || 'Hospital Buyer',
    supplierId: o.supplierId || o.supplier_id,
    supplier_id: o.supplierId || o.supplier_id,
    supplierName: supplierName || 'Novartis Bio-Pharma Ltd.',
    status,
    totalAmount: net,
    total: net,
    netPayable: net,
    net_payable: net,
    taxableTotal: taxable,
    taxable_total: taxable,
    cgstTotal: cgst,
    sgstTotal: sgst,
    taxTotal: cgst + sgst,
    paymentStatus: isPaid ? 'paid' : (o.paymentStatus || o.payment_status || 'pending'),
    payment_status: isPaid ? 'paid' : (o.paymentStatus || o.payment_status || 'pending'),
    createdAt: o.createdAt || o.created_at || new Date().toISOString(),
    created_at: o.createdAt || o.created_at || new Date().toISOString(),
    date: o.date || (o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at).toLocaleDateString('en-GB') : 'Today'),
    items,
    itemCount: itemCount > 0 ? itemCount : 1
  };
};

export class OrderController {
  // Buyer creates PO
  static async createOrder(req, res, next) {
    try {
      const newOrder = await OrderStateService.createOrder(req.user, req.business, req.body);
      return successResponse(res, `Purchase Order ${newOrder.poReference} placed successfully`, formatOrder(newOrder), 201);
    } catch (err) {
      next(err);
    }
  }

  // Get orders list (scoped to user role: buyer sees their purchases, supplier sees incoming POs)
  static async listOrders(req, res, next) {
    try {
      let orders;
      if (req.user.role === 'supplier') {
        orders = db.find('purchase_orders', (o) => o.supplierId === req.user.id || o.supplier_id === req.user.id);
      } else if (req.user.role === 'buyer') {
        orders = db.find('purchase_orders', (o) => o.buyerId === req.user.id || o.buyer_id === req.user.id);
      } else {
        orders = db.getCollection('purchase_orders');
      }

      const formatted = (orders || []).map(formatOrder);
      return successResponse(res, 'Orders retrieved successfully', formatted);
    } catch (err) {
      next(err);
    }
  }

  // Get single order detail
  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = db.findOne('purchase_orders', (o) => o.id === id || o.poReference === id || o.po_reference === id);
      if (!order) {
        return errorResponse(res, 'Purchase order not found', [], 404);
      }

      const isBuyer = order.buyerId === req.user.id || order.buyer_id === req.user.id;
      const isSupplier = order.supplierId === req.user.id || order.supplier_id === req.user.id;

      // Check ownership
      if (req.user.role !== 'admin' && !isBuyer && !isSupplier) {
        return errorResponse(res, 'Forbidden: You do not have permission to view this order', [], 403);
      }

      // Attach invoice if exists
      const invoice = db.findOne('invoices', (inv) => inv.order_id === order.id);

      return successResponse(res, 'Order details retrieved', {
        ...formatOrder(order),
        invoice: invoice || null
      });
    } catch (err) {
      next(err);
    }
  }

  // Supplier accepts PO
  static async acceptOrder(req, res, next) {
    try {
      const updated = await OrderStateService.acceptOrder(req.user.id, req.params.id);
      return successResponse(res, `Order ${updated.poReference} accepted and queued for packaging`, updated);
    } catch (err) {
      next(err);
    }
  }

  // Supplier rejects PO
  static async rejectOrder(req, res, next) {
    try {
      const { reason, notes } = req.body;
      const updated = await OrderStateService.rejectOrder(req.user.id, req.params.id, reason, notes);
      return successResponse(res, `Order ${updated.poReference} rejected. Reason logged in compliance register.`, updated);
    } catch (err) {
      next(err);
    }
  }

  // Supplier dispatches PO
  static async dispatchOrder(req, res, next) {
    try {
      const updated = await OrderStateService.dispatchOrder(req.user.id, req.params.id, req.body);
      return successResponse(res, `Order ${updated.poReference} dispatched with e-Way Bill generated`, updated);
    } catch (err) {
      next(err);
    }
  }

  // Record delivery
  static async confirmDelivery(req, res, next) {
    try {
      const updated = await OrderStateService.confirmDelivery(req.user, req.params.id, req.body);
      return successResponse(res, `Order ${updated.poReference} delivery confirmed at hospital depot`, updated);
    } catch (err) {
      next(err);
    }
  }

  // Buyer cancels PO
  static async cancelOrder(req, res, next) {
    try {
      const updated = await OrderStateService.cancelOrder(req.user.id, req.params.id);
      return successResponse(res, `Order ${updated.poReference} cancelled`, updated);
    } catch (err) {
      next(err);
    }
  }
}
