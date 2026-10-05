import { api } from './api';

export const notificationService = {
  async getNotifications() {
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('[notificationService] getNotifications failed:', err.message);
    }
    return {
      notifications: [],
      unreadCount: 0
    };
  },

  async markAsRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.warn('[notificationService] markAsRead failed:', err.message);
    }
  },

  async markAllAsRead() {
    try {
      await api.post('/notifications/read-all');
    } catch (err) {
      console.warn('[notificationService] markAllAsRead failed:', err.message);
    }
  }
};
