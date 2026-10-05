import { PaymentService } from '../services/paymentService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export class PaymentController {
  static async createOrder(req, res, next) {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return errorResponse(res, 'Order ID is required to initiate payment', [], 400);
      }
      const paymentIntent = await PaymentService.createPaymentOrder(req.user, orderId);
      return successResponse(res, 'Payment session initialized', paymentIntent);
    } catch (err) {
      next(err);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const updatedOrder = await PaymentService.verifyPaymentSignature(req.user, req.body);
      return successResponse(res, 'Payment successfully verified and settlement confirmed', updatedOrder);
    } catch (err) {
      next(err);
    }
  }

  static async webhook(req, res, next) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = JSON.stringify(req.body);
      const result = await PaymentService.handleWebhook(rawBody, signature);
      return successResponse(res, 'Webhook event processed', result);
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const history = PaymentService.getPaymentHistory(req.user.id, req.user.role);
      return successResponse(res, 'Payment history retrieved', history);
    } catch (err) {
      next(err);
    }
  }
}
