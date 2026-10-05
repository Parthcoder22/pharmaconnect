import { errorResponse } from '../utils/responseFormatter.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Zod validation error handling
  if (err.name === 'ZodError') {
    const errorDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return errorResponse(res, 'Validation failed', errorDetails, 422);
  }

  // JWT authentication error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Invalid or expired authentication token', [err.message], 401);
  }

  // Syntax or bad JSON payload
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Malformed JSON payload received', [err.message], 400);
  }

  // Default internal server error (never leak raw stack traces in production)
  const message = err.message || 'Internal server error';
  const errors = env.NODE_ENV === 'development' ? [err.stack] : [];

  const statusCode = err.statusCode || 500;
  return errorResponse(res, message, errors, statusCode);
};
