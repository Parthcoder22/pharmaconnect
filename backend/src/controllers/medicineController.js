import { MedicineService } from '../services/medicineService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export class MedicineController {
  // Public / Buyer Marketplace
  static async searchMarketplace(req, res, next) {
    try {
      const result = await MedicineService.searchMarketplace(req.query);
      return successResponse(res, 'Marketplace catalog retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async getMedicineById(req, res, next) {
    try {
      const medicine = await MedicineService.getMedicineById(req.params.id);
      if (!medicine) {
        return errorResponse(res, 'Medicine not found', [], 404);
      }
      return successResponse(res, 'Medicine details retrieved', medicine);
    } catch (err) {
      next(err);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = MedicineService.getCategories();
      return successResponse(res, 'Medicine categories retrieved', categories);
    } catch (err) {
      next(err);
    }
  }

  // Supplier Management
  static async createMedicine(req, res, next) {
    try {
      const result = await MedicineService.createMedicine(req.user, req.body);
      return successResponse(res, 'Medicine created successfully', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async listSupplierMedicines(req, res, next) {
    try {
      const medicines = await MedicineService.listSupplierMedicines(req.user.id);
      return successResponse(res, 'Supplier medicines retrieved', medicines);
    } catch (err) {
      next(err);
    }
  }

  static async updateMedicine(req, res, next) {
    try {
      const updated = await MedicineService.updateMedicine(req.user.id, req.params.id, req.body);
      return successResponse(res, 'Medicine updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  static async deactivateMedicine(req, res, next) {
    try {
      const deactivated = await MedicineService.deactivateMedicine(req.user.id, req.params.id);
      return successResponse(res, 'Medicine deactivated successfully', deactivated);
    } catch (err) {
      next(err);
    }
  }

  static async addBatch(req, res, next) {
    try {
      const batch = await MedicineService.addBatch(req.user.id, req.params.id, req.body);
      return successResponse(res, 'Medicine batch added successfully', batch, 201);
    } catch (err) {
      next(err);
    }
  }
}
