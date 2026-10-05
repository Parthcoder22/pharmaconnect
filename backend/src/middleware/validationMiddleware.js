import { errorResponse } from '../utils/responseFormatter.js';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    
    // Replace parsed/sanitized fields onto req
    if (validated.body) req.body = validated.body;
    if (validated.query) req.query = validated.query;
    if (validated.params) req.params = validated.params;

    next();
  } catch (error) {
    if (error.errors) {
      const errorList = error.errors.map((err) => ({
        field: err.path.join('.').replace(/^(body|query|params)\.?/, ''),
        message: err.message
      }));
      return errorResponse(res, 'Validation failed', errorList, 422);
    }
    return errorResponse(res, error.message || 'Validation error', [], 422);
  }
};
