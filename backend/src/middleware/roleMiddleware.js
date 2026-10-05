import { errorResponse } from '../utils/responseFormatter.js';

export const requireSupplier = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', [], 401);
  }
  if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
    return errorResponse(res, 'Access denied: Supplier role required for this resource', [], 403);
  }
  next();
};

export const requireBuyer = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', [], 401);
  }
  if (req.user.role !== 'buyer' && req.user.role !== 'admin') {
    return errorResponse(res, 'Access denied: Hospital / Buyer role required for this resource', [], 403);
  }
  next();
};

import { checkUserVerification } from '../utils/complianceValidator.js';

export const requireVerifiedBusiness = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', [], 401);
  }
  if (req.user.role === 'admin') {
    return next();
  }

  const check = checkUserVerification(req.user.id, req.user.role);
  if (!check.isVerified) {
    const isSupplier = req.user.role === 'supplier';
    const actionDesc = isSupplier ? 'list or sell pharmaceutical formulations' : 'procure or place purchase orders for medicines';
    return errorResponse(
      res,
      `Statutory Compliance Restriction: Unverified accounts cannot ${actionDesc}. All ${check.totalCount} required statutory PDF documents must be uploaded under Security & Verification before certification. (${check.uploadedCount}/${check.totalCount} uploaded). Missing: ${check.missingDocs.join(', ')}`,
      check.missingDocs,
      403
    );
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', [], 401);
  }
  if (req.user.role !== 'admin') {
    return errorResponse(res, 'Access denied: Administrative privileges required', [], 403);
  }
  next();
};
