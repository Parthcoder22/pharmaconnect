import { z } from 'zod';

export const createPatientBillSchema = z.object({
  body: z.object({
    patientName: z.string().min(2, 'Patient name is required'),
    patientId: z.string().min(2, 'Patient ID / UHID is required'),
    doctorName: z.string().min(2, 'Prescribing doctor name is required'),
    doctorRegNo: z.string().min(3, 'Doctor MCI / State Medical Council registration number is required'),
    date: z.string().optional(),
    items: z
      .array(
        z.object({
          medicineName: z.string().min(1, 'Medicine name is required'),
          batchNumber: z.string().min(1, 'Dispensed batch number is required'),
          expDate: z.string().optional(),
          quantity: z.number().int().positive('Quantity must be greater than 0'),
          mrp: z.number().positive('MRP is required'),
          amount: z.number().positive().optional()
        })
      )
      .min(1, 'At least one medicine must be added to the dispense slip')
  })
});
