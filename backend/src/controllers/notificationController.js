import { db } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export class NotificationController {
  static listNotifications(req, res, next) {
    try {
      const notifications = db.find('notifications', (n) => n.user_id === req.user.id);
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return successResponse(res, 'Notifications retrieved', {
        notifications,
        unreadCount
      });
    } catch (err) {
      next(err);
    }
  }

  static markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const updated = db.update('notifications', (n) => n.id === id && n.user_id === req.user.id, { is_read: true });
      if (!updated) {
        return errorResponse(res, 'Notification not found', [], 404);
      }
      return successResponse(res, 'Notification marked as read', updated);
    } catch (err) {
      next(err);
    }
  }

  static markAllAsRead(req, res, next) {
    try {
      const notifications = db.find('notifications', (n) => n.user_id === req.user.id);
      for (const n of notifications) {
        db.update('notifications', (item) => item.id === n.id, { is_read: true });
      }
      return successResponse(res, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
}
