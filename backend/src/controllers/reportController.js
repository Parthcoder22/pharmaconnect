import { ReportService } from '../services/reportService.js';
import { successResponse } from '../utils/responseFormatter.js';

export class ReportController {
  static getSupplierOverview(req, res, next) {
    try {
      const data = ReportService.getSupplierOverview(req.user.id);
      return successResponse(res, 'Supplier operational overview retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  static getBuyerOverview(req, res, next) {
    try {
      const data = ReportService.getBuyerOverview(req.user.id);
      return successResponse(res, 'Buyer hospital overview retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  static getBatchSurveillance(req, res, next) {
    try {
      const surveillance = ReportService.getBatchSurveillance();
      return successResponse(res, 'Batch surveillance and FEFO tracking data retrieved', surveillance);
    } catch (err) {
      next(err);
    }
  }
}
