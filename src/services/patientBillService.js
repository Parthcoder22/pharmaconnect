import { api } from './api';
import { INITIAL_PATIENT_BILLS } from '../data/mockData';

export const patientBillService = {
  async getBills() {
    try {
      const res = await api.get('/patient-bills');
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('[patientBillService] getBills failed:', err.message);
    }
    return [];
  },

  async createBill(billData) {
    try {
      const res = await api.post('/patient-bills', billData);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('[patientBillService] createBill failed:', err.message);
    }
    return {
      id: `pb-${Date.now()}`,
      billNumber: `PB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ...billData,
      totalAmount: billData.items.reduce((acc, it) => acc + it.quantity * it.mrp, 0)
    };
  }
};
