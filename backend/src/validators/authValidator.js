import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: z.string().min(2, 'Full name is required'),
    role: z.enum(['supplier', 'buyer'], {
      errorMap: () => ({ message: "Role must be either 'supplier' or 'buyer'" })
    }),
    phone: z.string().optional(),
    organization: z.string().min(2, 'Organization / Hospital name is required'),
    licenseNumber: z.string().min(3, 'Drug license number is required'),
    licenseType: z.string().optional(),
    gstin: z.string().regex(/^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}[Zz][0-9A-Za-z]{1}$/, 'Invalid Indian GSTIN format (e.g. 27AAACN0192Q1ZV)').optional().or(z.literal(''))
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['supplier', 'buyer']).optional()
  })
});

export const businessProfileSchema = z.object({
  body: z.object({
    businessName: z.string().min(2, 'Business name is required'),
    businessType: z.enum(['manufacturer', 'hospital', 'wholesale_distributor', 'pharmacy_chain', 'clinical_depot']).optional(),
    businessAddress: z.string().min(5, 'Address is required'),
    state: z.string().min(2, 'State is required'),
    city: z.string().min(2, 'City is required'),
    pincode: z.string().min(6, 'Valid 6-digit pincode is required'),
    gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid Indian GSTIN format'),
    licenseNumber: z.string().min(3, 'License number is required'),
    licenseType: z.string().min(2, 'License type is required')
  })
});

export const documentUploadSchema = z.object({
  body: z.object({
    documentType: z.enum(['drug_license', 'gst_certificate', 'who_gmp', 'schedule_m', 'iso_certificate', 'pharmacist_reg']),
    documentUrl: z.string().url('A valid document URL is required')
  })
});

export const adminReviewSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    reviewerNotes: z.string().optional()
  })
});
