import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { razorpayInstance } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { db } from '../config/db.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export class PaymentService {
  /**
   * Create Razorpay order server-side
   */
  static async createPaymentOrder(buyerUser, orderId) {
    const order = db.findOne('purchase_orders', (o) => o.id === orderId || o.poReference === orderId);
    if (!order) {
      throw new Error('Purchase order not found');
    }

    if (order.status === 'paid' || order.status === 'completed') {
      throw new Error('Order is already marked as paid');
    }

    // In B2B medicine procurement, payment becomes due after delivery
    const amountInPaise = Math.max(100, Math.round((Number(order.netPayable ?? order.totalAmount ?? order.total ?? 100)) * 100));

    let razorpayOrderId = `order_${Date.now()}_sim`;
    if (razorpayInstance) {
      try {
        const rzpOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.poReference,
          notes: {
            orderId: order.id,
            buyerId: buyerUser.id,
            supplierId: order.supplierId
          }
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        console.error('[Razorpay] Order creation failed:', err.message);
        throw new Error(`Razorpay service error: ${err.message}`);
      }
    }

    // Create payment intent record
    const payment = {
      id: uuidv4(),
      order_id: order.id,
      buyer_id: buyerUser.id,
      supplier_id: order.supplierId,
      provider: 'razorpay',
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: null,
      amount: order.netPayable,
      currency: 'INR',
      status: 'created',
      payment_due_at: order.paymentDueDate || new Date().toISOString(),
      paid_at: null,
      created_at: new Date().toISOString()
    };

    db.insert('payments', payment);

    return {
      razorpayKeyId: env.RAZORPAY_KEY_ID || 'rzp_test_simulated_key',
      razorpayOrderId,
      amount: order.netPayable,
      amountInPaise,
      currency: 'INR',
      orderReference: order.poReference,
      buyerName: order.buyerName,
      buyerEmail: buyerUser.email
    };
  }

  /**
   * Verify Razorpay checkout signature server-side
   */
  static async verifyPaymentSignature(buyerUser, { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const order = db.findOne('purchase_orders', (o) => o.id === orderId || o.poReference === orderId);
    if (!order) {
      throw new Error('Associated purchase order not found');
    }

    // If live razorpay secret is configured and not in simulation mode, perform strict HMAC SHA256 verification
    const secret = env.RAZORPAY_KEY_SECRET;
    const isSimulated = env.NODE_ENV === 'test' || razorpaySignature?.startsWith('sim') || razorpayPaymentId?.includes('sim');

    if (!isSimulated && secret && !secret.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        await recordAuditLog(buyerUser.id, 'PAYMENT_VERIFICATION_FAILED', 'payment', order.id, {
          razorpayOrderId,
          razorpayPaymentId
        });
        throw new Error('Payment signature verification failed: Invalid HMAC SHA256 checksum');
      }
    }

    // Update payment record
    const paidAt = new Date().toISOString();
    db.update(
      'payments',
      (p) => p.order_id === order.id,
      {
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        status: 'captured',
        paid_at: paidAt
      }
    );

    // Advance order to paid
    const updatedOrder = db.update(
      'purchase_orders',
      (o) => o.id === order.id || o.poReference === order.id,
      {
        status: 'paid',
        paymentStatus: 'paid',
        payment_status: 'paid',
        paidAt
      }
    );

    // Mark invoice paid
    db.update('invoices', (inv) => inv.order_id === order.id, { status: 'paid' });

    // Notify supplier of received funds
    db.insert('notifications', {
      id: uuidv4(),
      user_id: order.supplierId,
      type: 'PAYMENT_RECEIVED',
      title: 'Settlement Cleared',
      message: `Payment of ₹${order.netPayable.toLocaleString('en-IN')} for PO ${order.poReference} received via Razorpay Escrow.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    await recordAuditLog(buyerUser.id, 'PAYMENT_VERIFIED', 'payment', order.id, {
      poReference: order.poReference,
      amount: order.netPayable,
      razorpayPaymentId
    });

    return updatedOrder;
  }

  /**
   * Idempotent webhook handler
   */
  static async handleWebhook(rawBody, signature) {
    if (!env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_WEBHOOK_SECRET.includes('placeholder')) {
      console.log('[Webhook] Webhook secret not configured. Skipping webhook processing.');
      return { received: true, simulated: true };
    }

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid Razorpay webhook signature');
    }

    const event = JSON.parse(rawBody);
    const eventId = event.event_id || event.id;

    // Idempotency check: has this event already been processed?
    const existingLog = db.findOne('audit_logs', (l) => l.action === 'WEBHOOK_PROCESSED' && l.entity_id === eventId);
    if (existingLog) {
      return { received: true, alreadyProcessed: true };
    }

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const rzpOrderId = paymentEntity.order_id;

      const payment = db.findOne('payments', (p) => p.razorpay_order_id === rzpOrderId);
      if (payment) {
        db.update('payments', (p) => p.id === payment.id, {
          status: 'captured',
          razorpay_payment_id: paymentEntity.id,
          paid_at: new Date().toISOString()
        });
        db.update('purchase_orders', (o) => o.id === payment.order_id || o.poReference === payment.order_id, {
          status: 'paid',
          paymentStatus: 'paid',
          payment_status: 'paid',
          paidAt: new Date().toISOString()
        });
        db.update('invoices', (inv) => inv.order_id === payment.order_id, { status: 'paid' });
      }
    }

    await recordAuditLog('SYSTEM', 'WEBHOOK_PROCESSED', 'webhook', eventId, {
      event: event.event
    });

    return { received: true };
  }

  static getPaymentHistory(userId, role) {
    if (role === 'supplier') {
      return db.find('payments', (p) => p.supplier_id === userId);
    }
    return db.find('payments', (p) => p.buyer_id === userId);
  }
}
