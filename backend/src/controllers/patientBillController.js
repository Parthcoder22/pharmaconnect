import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export class PatientBillController {
  static async createBill(req, res, next) {
    try {
      const { patientName, patientId, doctorName, doctorRegNo, date, items } = req.body;

      // Calculate total server side
      const calculatedTotal = items.reduce((acc, item) => acc + item.quantity * item.mrp, 0);
      const billNumber = `PB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBill = {
        id: `pb-${Date.now()}`,
        buyer_id: req.user.id,
        billNumber,
        patientName,
        patientId,
        doctorName,
        doctorRegNo,
        date: date || new Date().toISOString().split('T')[0],
        totalAmount: Number(calculatedTotal.toFixed(2)),
        items: items.map((it) => ({
          ...it,
          amount: Number((it.quantity * it.mrp).toFixed(2))
        })),
        createdAt: new Date().toISOString()
      };

      db.insert('patient_bills', newBill);

      await recordAuditLog(req.user.id, 'PATIENT_BILL_GENERATED', 'patient_bill', newBill.id, {
        billNumber,
        patientId,
        doctorRegNo,
        totalAmount: newBill.totalAmount
      });

      return successResponse(res, `Patient dispense slip ${billNumber} generated successfully`, newBill, 201);
    } catch (err) {
      next(err);
    }
  }

  static async listBills(req, res, next) {
    try {
      const bills = db.find('patient_bills', (b) => b.buyer_id === req.user.id);
      return successResponse(res, 'Patient billing history retrieved', bills);
    } catch (err) {
      next(err);
    }
  }
}
