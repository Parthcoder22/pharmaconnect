import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export class ChatController {
  static getAllUserMessages(req, res, next) {
    try {
      const orders = db.find(
        'purchase_orders',
        (o) => o.buyerId === req.user.id || o.buyer_id === req.user.id || o.supplierId === req.user.id || o.supplier_id === req.user.id
      );

      const orderIds = new Set();
      orders.forEach((o) => {
        if (o.id) orderIds.add(o.id);
        if (o.poReference) orderIds.add(o.poReference);
        if (o.po_reference) orderIds.add(o.po_reference);
      });

      const messages = db.find('messages', (m) => 
        orderIds.has(m.orderId) || orderIds.has(m.order_id)
      );

      const formatted = messages.map((m) => ({
        id: m.id,
        orderId: m.orderId || m.order_id,
        order_id: m.order_id || m.orderId,
        senderId: m.senderId || m.sender_id,
        senderName: m.senderName || m.sender_name || 'Representative',
        senderRole: m.senderRole || m.sender_role || 'buyer',
        message: m.message,
        attachmentUrl: m.attachmentUrl || m.attachment_url || null,
        timestamp: m.timestamp || (m.createdAt || m.created_at ? new Date(m.createdAt || m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Recently'),
        createdAt: m.createdAt || m.created_at || new Date().toISOString()
      }));

      return successResponse(res, 'All accessible order messages retrieved', formatted);
    } catch (err) {
      next(err);
    }
  }

  static getConversations(req, res, next) {
    try {
      const orders = db.find(
        'purchase_orders',
        (o) => o.buyerId === req.user.id || o.buyer_id === req.user.id || o.supplierId === req.user.id || o.supplier_id === req.user.id
      );

      const conversations = orders.map((o) => {
        const poRef = o.poReference || o.po_reference || o.id;
        const msgs = db.find('messages', (m) => 
          m.orderId === o.id || m.order_id === o.id || m.orderId === poRef || m.order_id === poRef
        );
        return {
          orderId: o.id,
          poReference: poRef,
          buyerName: o.buyerName || o.buyer_name || 'Hospital Buyer',
          supplierName: o.supplierName || o.supplier_name || 'Novartis Bio-Pharma Ltd.',
          status: o.status,
          messageCount: msgs.length,
          lastMessage: msgs[msgs.length - 1] || null
        };
      });

      return successResponse(res, 'Order conversations retrieved', conversations);
    } catch (err) {
      next(err);
    }
  }

  static getMessages(req, res, next) {
    try {
      const { orderId } = req.params;
      const order = db.findOne('purchase_orders', (o) => 
        o.id === orderId || o.poReference === orderId || o.po_reference === orderId
      );
      if (!order) {
        return errorResponse(res, 'Order not found', [], 404);
      }

      const isBuyer = order.buyerId === req.user.id || order.buyer_id === req.user.id;
      const isSupplier = order.supplierId === req.user.id || order.supplier_id === req.user.id;

      // Check access permission
      if (req.user.role !== 'admin' && !isBuyer && !isSupplier) {
        return errorResponse(res, 'Forbidden: You do not have permission to access this order chat', [], 403);
      }

      const poRef = order.poReference || order.po_reference || order.id;
      const messages = db.find('messages', (m) => 
        m.orderId === order.id || m.order_id === order.id || 
        m.orderId === orderId || m.order_id === orderId || 
        m.orderId === poRef || m.order_id === poRef
      );

      const formatted = messages.map((m) => ({
        id: m.id,
        orderId: order.id,
        order_id: order.id,
        senderId: m.senderId || m.sender_id,
        senderName: m.senderName || m.sender_name || 'Authorized Representative',
        senderRole: m.senderRole || m.sender_role || 'buyer',
        message: m.message,
        attachmentUrl: m.attachmentUrl || m.attachment_url || null,
        timestamp: m.timestamp || (m.createdAt || m.created_at ? new Date(m.createdAt || m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Recently'),
        createdAt: m.createdAt || m.created_at || new Date().toISOString()
      }));

      return successResponse(res, 'Messages retrieved', formatted);
    } catch (err) {
      next(err);
    }
  }

  static sendMessage(req, res, next) {
    try {
      const { orderId } = req.params;
      const { message, attachmentUrl } = req.body;

      if (!message || message.trim() === '') {
        return errorResponse(res, 'Message text cannot be empty', [], 400);
      }

      const order = db.findOne('purchase_orders', (o) => 
        o.id === orderId || o.poReference === orderId || o.po_reference === orderId
      );
      if (!order) {
        return errorResponse(res, 'Order not found', [], 404);
      }

      const isBuyer = order.buyerId === req.user.id || order.buyer_id === req.user.id;
      const isSupplier = order.supplierId === req.user.id || order.supplier_id === req.user.id;

      if (req.user.role !== 'admin' && !isBuyer && !isSupplier) {
        return errorResponse(res, 'Forbidden: You do not have permission to send messages for this order', [], 403);
      }

      const poRef = order.poReference || order.po_reference || order.id;
      const newMsg = {
        id: `msg-${Date.now()}`,
        orderId: order.id,
        order_id: order.id,
        senderId: req.user.id,
        senderName: req.user.full_name || req.user.organization || req.user.name || 'User',
        senderRole: req.user.role,
        message: message.trim(),
        attachmentUrl: attachmentUrl || null,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };

      db.insert('messages', newMsg);

      // Create notification for counterparty
      const buyerId = order.buyerId || order.buyer_id;
      const supplierId = order.supplierId || order.supplier_id;
      const recipientId = req.user.id === buyerId ? supplierId : buyerId;

      if (recipientId) {
        db.insert('notifications', {
          id: uuidv4(),
          user_id: recipientId,
          type: 'NEW_CHAT_MESSAGE',
          title: `New Message regarding ${poRef}`,
          message: `${req.user.full_name || 'Partner'}: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      return successResponse(res, 'Message sent successfully', newMsg, 201);
    } catch (err) {
      next(err);
    }
  }
}
