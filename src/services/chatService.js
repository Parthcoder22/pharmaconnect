import { api } from './api';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';

export const normalizeMessage = (m) => {
  if (!m) return m;
  return {
    id: m.id || `msg-${Date.now()}-${Math.random()}`,
    orderId: m.orderId || m.order_id,
    order_id: m.order_id || m.orderId,
    senderId: m.senderId || m.sender_id,
    senderName: m.senderName || m.sender_name || 'Representative',
    senderRole: m.senderRole || m.sender_role || 'buyer',
    message: m.message || '',
    attachmentUrl: m.attachmentUrl || m.attachment_url || null,
    timestamp: m.timestamp || (m.createdAt || m.created_at ? new Date(m.createdAt || m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Recently'),
    createdAt: m.createdAt || m.created_at || new Date().toISOString()
  };
};

export const chatService = {
  async getAllMessages() {
    try {
      const res = await api.get('/chat/all-messages');
      if (res.success && Array.isArray(res.data)) {
        return res.data.map(normalizeMessage);
      }
    } catch (err) {
      console.warn('[chatService] getAllMessages failed:', err.message);
    }
    return [];
  },

  async getMessages(orderId) {
    try {
      const res = await api.get(`/chat/${orderId}/messages`);
      if (res.success && Array.isArray(res.data)) {
        return res.data.map(normalizeMessage);
      }
    } catch (err) {
      console.warn('[chatService] getMessages failed:', err.message);
    }
    return [];
  },

  async sendMessage(orderId, message) {
    try {
      const res = await api.post(`/chat/${orderId}/messages`, { message });
      if (res.success && res.data) {
        return normalizeMessage(res.data);
      }
    } catch (err) {
      console.warn('[chatService] sendMessage failed:', err.message);
    }
    return normalizeMessage({
      id: `msg-${Date.now()}`,
      orderId,
      senderName: 'Authorized Representative',
      senderRole: 'buyer',
      timestamp: 'Just now',
      message
    });
  }
};
