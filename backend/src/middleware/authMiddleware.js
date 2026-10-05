import { AuthService } from '../services/authService.js';
import { db } from '../config/db.js';
import { errorResponse } from '../utils/responseFormatter.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid', ['Authorization Bearer token required'], 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = AuthService.verifyToken(token);
    } catch (err) {
      return errorResponse(res, 'Invalid or expired session token', [err.message], 401);
    }

    const user = db.findOne('users', (u) => u.id === decoded.sub);
    if (!user) {
      return errorResponse(res, 'User record not found or account deactivated', [], 401);
    }

    const business = db.findOne('businesses', (b) => b.user_id === user.id);

    const safeUser = { ...user };
    delete safeUser.password_hash;

    req.user = safeUser;
    req.business = business;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed', [error.message], 401);
  }
};
