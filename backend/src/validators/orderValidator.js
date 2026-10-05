import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    destinationHub: z.string().min(3, 'Destination medical center / hospital hub is required'),
    deliveryAddress: z.string().optional(),
    items: z
      .array(
        z.object({
          medicineId: z.string().min(1, 'Medicine ID is required'),
          quantity: z.number().int().positive('Quantity must be greater than 0'),
          unitPrice: z.number().positive().optional() // Ignored for calculation; re-verified from db
        })
      )
      .min(1, 'Purchase order must contain at least 1 line item')
  })
});

export const rejectOrderSchema = z.object({
  body: z.object({
    reason: z.string().min(2, 'Regulatory rejection reason is mandatory under CDSCO audit rules'),
    notes: z.string().optional()
  })
});

export const dispatchOrderSchema = z.object({
  body: z.object({
    eWayBillNo: z.string().min(4, 'NIC e-Way bill number is required'),
    carrierName: z.string().min(2, 'Carrier / logistics provider is required'),
    trackingNo: z.string().optional(),
    vehicleNo: z.string().optional(),
    coldChainTemp: z.string().optional()
  })
});

export const confirmDeliverySchema = z.object({
  body: z.object({
    tamperSealsIntact: z.boolean().default(true),
    receivedNotes: z.string().optional(),
    receivingPharmacist: z.string().optional()
  })
});
