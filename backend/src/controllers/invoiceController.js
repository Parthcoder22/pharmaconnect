import { db } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export class InvoiceController {
  static async listInvoices(req, res, next) {
    try {
      let invoices;
      if (req.user.role === 'supplier') {
        invoices = db.find('invoices', (inv) => inv.supplier_id === req.user.id);
      } else if (req.user.role === 'buyer') {
        invoices = db.find('invoices', (inv) => inv.buyer_id === req.user.id);
      } else {
        invoices = db.getCollection('invoices');
      }

      // Attach matching order info
      const enriched = invoices.map((inv) => {
        const order = db.findOne('purchase_orders', (o) => o.id === inv.order_id);
        return {
          ...inv,
          orderReference: order?.poReference,
          orderStatus: order?.status,
          buyerName: order?.buyerName,
          supplierName: order?.supplierName,
          items: order?.items || []
        };
      });

      return successResponse(res, 'Invoices retrieved successfully', enriched);
    } catch (err) {
      next(err);
    }
  }

  static async getInvoiceById(req, res, next) {
    try {
      const { id } = req.params;
      const invoice = db.findOne('invoices', (inv) => inv.id === id || inv.invoice_number === id || inv.order_id === id);
      if (!invoice) {
        return errorResponse(res, 'Tax invoice not found', [], 404);
      }

      const order = db.findOne('purchase_orders', (o) => o.id === invoice.order_id);
      const supplierBiz = db.findOne('businesses', (b) => b.user_id === invoice.supplier_id);
      const buyerBiz = db.findOne('businesses', (b) => b.user_id === invoice.buyer_id);

      return successResponse(res, 'Invoice details retrieved', {
        ...invoice,
        order,
        supplier: supplierBiz,
        buyer: buyerBiz
      });
    } catch (err) {
      next(err);
    }
  }
}
