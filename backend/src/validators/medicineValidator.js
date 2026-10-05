import { z } from 'zod';

export const createMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Medicine name is required'),
    brand: z.string().optional(),
    genericName: z.string().optional(),
    category: z.string().optional().default('General Formulations'),
    dosageForm: z.string().optional().default('Tablets'),
    description: z.string().optional(),
    indications: z.string().optional(),
    productImage: z.string().url().optional(),
    baseWholesalePrice: z.number().positive('Wholesale price must be greater than 0'),
    mrp: z.number().positive().optional(),
    moq: z.number().int().min(1, 'Minimum order quantity must be at least 1').default(100),
    unitPack: z.string().optional().default('Standard Institutional Pack'),
    manufacturer: z.string().optional(),
    regulatorySchedule: z.string().optional().default('Schedule H'),
    storageCondition: z.string().optional().default('Controlled Ambient 15°C–25°C'),
    isColdChain: z.boolean().optional().default(false),
    isWhoGmp: z.boolean().optional().default(true),
    // Initial batch details if supplied simultaneously
    batchNumber: z.string().optional(),
    manufacturingDate: z.string().optional(),
    expiryDate: z.string().optional(),
    initialStock: z.number().int().nonnegative().optional()
  })
});

export const updateMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    brand: z.string().min(2).optional(),
    genericName: z.string().min(2).optional(),
    category: z.string().optional(),
    dosageForm: z.string().optional(),
    description: z.string().optional(),
    indications: z.string().optional(),
    productImage: z.string().url().optional(),
    baseWholesalePrice: z.number().positive().optional(),
    mrp: z.number().positive().optional(),
    moq: z.number().int().min(1).optional(),
    unitPack: z.string().optional(),
    gstRate: z.number().nonnegative().optional(),
    storageCondition: z.string().optional(),
    isColdChain: z.boolean().optional(),
    status: z.enum(['active', 'inactive', 'discontinued']).optional()
  })
});

export const createBatchSchema = z.object({
  body: z.object({
    batchNumber: z.string().min(2, 'Batch number is required'),
    manufacturingDate: z.string().min(4, 'Manufacturing date is required'),
    expiryDate: z.string().min(4, 'Expiry date is required'),
    shelfLifeMonths: z.number().int().positive().optional(),
    quantity: z.number().int().positive('Batch quantity must be greater than 0'),
    storageCondition: z.string().optional(),
    vaultLocation: z.string().optional(),
    coaSigned: z.boolean().default(false),
    coaSigner: z.string().optional(),
    gs1Barcode: z.string().optional()
  })
});

export const medicineQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    dosageForm: z.string().optional(),
    schedule: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    isColdChain: z.string().optional(),
    isWhoGmp: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.enum(['name', 'price_asc', 'price_desc', 'stock', 'created_at']).optional()
  })
});
