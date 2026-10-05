import { AuthService } from '../services/authService.js';
import { db } from '../config/db.js';

export const setupChatSocket = (io) => {
  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = AuthService.verifyToken(token);
      const user = db.findOne('users', (u) => u.id === decoded.sub);
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user.full_name} (${socket.user.role})`);

    // Join order room
    socket.on('join_order_room', ({ orderId }) => {
      const order = db.findOne('purchase_orders', (o) => o.id === orderId || o.poReference === orderId);
      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }

      // Authorize participant
      if (socket.user.role !== 'admin' && order.buyerId !== socket.user.id && order.supplierId !== socket.user.id) {
        return socket.emit('error', { message: 'Unauthorized access to this order conversation' });
      }

      const room = `order:${order.id}`;
      socket.join(room);
      socket.emit('joined_room', { orderId: order.id, room });
      console.log(`[Socket] User ${socket.user.full_name} joined ${room}`);
    });

    // Send real-time message
    socket.on('send_message', ({ orderId, message, attachmentUrl }) => {
      const order = db.findOne('purchase_orders', (o) => o.id === orderId || o.poReference === orderId);
      if (!order) return;

      if (socket.user.role !== 'admin' && order.buyerId !== socket.user.id && order.supplierId !== socket.user.id) {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      const newMsg = {
        id: `msg-${Date.now()}`,
        orderId: order.id,
        senderId: socket.user.id,
        senderName: socket.user.full_name,
        senderRole: socket.user.role,
        message: message.trim(),
        attachmentUrl: attachmentUrl || null,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };

      db.insert('messages', newMsg);

      const room = `order:${order.id}`;
      io.to(room).emit('new_message', newMsg);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user.full_name}`);
    });
  });
};
