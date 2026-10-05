import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { AppError } from '../utils/AppError.js';
import { checkUserVerification } from '../utils/complianceValidator.js';

export class MedicineService {
  static async createMedicine(supplierUser, data) {
    const check = checkUserVerification(supplierUser.id, 'supplier');
    if (!check.isVerified) {
      throw new AppError(
        `Regulatory Compliance Restriction: Unverified suppliers cannot list or sell pharmaceutical formulations. All ${check.totalCount} statutory PDF documents must be uploaded under Security & Verification before certification. (${check.uploadedCount}/${check.totalCount} uploaded). Missing: ${check.missingDocs.join(', ')}`,
        403
      );
    }
    const medId = uuidv4();
    const initialStock = data.initialStock || (data.quantity || 12000);

    const newMed = {
      id: medId,
      supplier_id: supplierUser.id,
      name: data.name,
      brand: data.brand || data.name,
      generic_name: data.genericName || data.name,
      category: data.category || 'General Formulations',
      dosage_form: data.dosageForm || 'Tablets',
      description: data.description || '',
      indications: data.indications || '',
      product_image: data.productImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
      base_wholesale_price: Number(data.baseWholesalePrice),
      mrp: Number(data.mrp) || Number((Number(data.baseWholesalePrice) * 1.3).toFixed(2)),
      moq: Number(data.moq) || 100,
      unit_pack: data.unitPack,
      gst_rate: Number(data.gstRate || 12),
      manufacturer: data.manufacturer || supplierUser.organization || 'Licensed Manufacturer',
      mfg_license: data.mfgLicense || supplierUser.licenseNumber,
      regulatory_schedule: data.regulatorySchedule || 'Schedule H',
      storage_condition: data.storageCondition || 'Controlled Ambient 15°C–25°C',
      is_cold_chain: Boolean(data.isColdChain),
      is_who_gmp: Boolean(data.isWhoGmp),
      cdsco_verified: supplierUser.verification_status === 'verified',
      total_stock_available: initialStock,
      status: 'active',
      volume_tiers: [
        { minQty: Number(data.moq), maxQty: 500, unitPrice: Number(data.baseWholesalePrice), label: 'Standard MOQ' },
        { minQty: 501, maxQty: null, unitPrice: Number(data.baseWholesalePrice) * 0.9, label: '> 500 pk', discountNote: '10% Tier 1 Save' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.insert('medicines', newMed);

    // Always ensure initial batch record exists so buyers can order immediately
    const batchNumber = data.batchNumber || `LOT-${newMed.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'MED'}-${new Date().getFullYear()}-01`;
    const batch = {
      id: uuidv4(),
      medicine_id: medId,
      batch_number: batchNumber,
      manufacturing_date: data.manufacturingDate || new Date().toISOString().split('T')[0],
      expiry_date: data.expiryDate || '2027-12-31',
      shelf_life_months: 24,
      quantity: initialStock,
      status: 'active',
      storage_condition: newMed.storage_condition,
      vault_location: 'Zone A - Cleanroom',
      coa_signed: true,
      coa_signer: supplierUser.full_name || supplierUser.organization || 'Authorized Pharmacist',
      gs1_barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.insert('batches', batch);

      // Record inventory movement
      db.insert('inventory_movements', {
        id: uuidv4(),
        batch_id: batch.id,
        business_id: supplierUser.id,
        movement_type: 'initial_stock',
        quantity: initialStock,
        reference_type: 'batch_intake',
        reference_id: batch.batch_number,
        created_at: new Date().toISOString()
      });

    await recordAuditLog(supplierUser.id, 'MEDICINE_CREATED', 'medicine', medId, {
      name: newMed.name,
      batch_number: batch?.batch_number,
      stock: initialStock
    });

    return { medicine: newMed, batch };
  }

  static async listSupplierMedicines(supplierId) {
    const list = db.find('medicines', (m) => m.supplier_id === supplierId && m.status !== 'discontinued');
    return list.map((m) => {
      const activeBatch = db.findOne('batches', (b) => b.medicine_id === m.id && b.status === 'active');
      return {
        id: m.id,
        name: m.name,
        brand: m.brand,
        brandName: m.brand,
        genericName: m.generic_name,
        category: m.category,
        dosageForm: m.dosage_form,
        regulatorySchedule: m.regulatory_schedule,
        mrp: m.mrp,
        unitPrice: m.base_wholesale_price,
        baseWholesalePrice: m.base_wholesale_price,
        moq: m.moq,
        unitPack: m.unit_pack,
        packSize: m.unit_pack,
        gstRate: m.gst_rate,
        manufacturer: m.manufacturer,
        mfgLicense: m.mfg_license,
        storageCondition: m.storage_condition,
        isColdChain: m.is_cold_chain,
        isWhoGmp: m.is_who_gmp,
        cdscoVerified: m.cdsco_verified,
        stock: m.total_stock_available,
        totalStockAvailable: m.total_stock_available,
        status: m.status || 'active',
        activeBatch: activeBatch
          ? {
              id: activeBatch.id,
              medicineId: activeBatch.medicine_id,
              batchNumber: activeBatch.batch_number,
              manufacturingDate: activeBatch.manufacturing_date,
              expiryDate: activeBatch.expiry_date,
              shelfLifeMonths: activeBatch.shelf_life_months,
              quantity: activeBatch.quantity,
              status: activeBatch.status,
              temperatureRange: activeBatch.storage_condition,
              vaultLocation: activeBatch.vault_location,
              coaSigned: activeBatch.coa_signed,
              coaSigner: activeBatch.coa_signer,
              gs1Barcode: activeBatch.gs1_barcode
            }
          : null,
        volumeTiers: m.volume_tiers || []
      };
    });
  }

  static async getMedicineById(id) {
    const medicine = db.findOne('medicines', (m) => m.id === id);
    if (!medicine) return null;

    const batches = db.find('batches', (b) => b.medicine_id === id);
    const activeBatch = batches.find((b) => b.status === 'active') || batches[0] || null;

    return {
      ...medicine,
      batches,
      activeBatch
    };
  }

  static async updateMedicine(supplierId, medId, updates) {
    const medicine = db.findOne('medicines', (m) => m.id === medId);
    if (!medicine) {
      throw new Error('Medicine listing not found');
    }
    if (medicine.supplier_id !== supplierId) {
      throw new Error('Forbidden: You can only update medicines belonging to your organization');
    }

    const updated = db.update('medicines', (m) => m.id === medId, updates);
    await recordAuditLog(supplierId, 'MEDICINE_UPDATED', 'medicine', medId, updates);
    return updated;
  }

  static async deactivateMedicine(supplierId, medId) {
    const medicine = db.findOne('medicines', (m) => m.id === medId);
    if (!medicine) {
      throw new Error('Medicine listing not found');
    }
    if (medicine.supplier_id !== supplierId) {
      throw new Error('Forbidden: You can only manage your own listings');
    }

    // Soft-delete to preserve audit logs and historical purchase orders
    const deactivated = db.update('medicines', (m) => m.id === medId, { status: 'inactive' });
    await recordAuditLog(supplierId, 'MEDICINE_DEACTIVATED', 'medicine', medId);
    return deactivated;
  }

  static async addBatch(supplierId, medId, batchData) {
    const medicine = db.findOne('medicines', (m) => m.id === medId);
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    if (medicine.supplier_id !== supplierId) {
      throw new Error('Forbidden: You can only add batches to your own medicine listings');
    }

    const batch = {
      id: uuidv4(),
      medicine_id: medId,
      batch_number: batchData.batchNumber,
      manufacturing_date: batchData.manufacturingDate,
      expiry_date: batchData.expiryDate,
      shelf_life_months: batchData.shelfLifeMonths || 24,
      quantity: batchData.quantity,
      status: 'active',
      storage_condition: batchData.storageCondition || medicine.storage_condition,
      vault_location: batchData.vaultLocation || 'Zone A - Cleanroom',
      coa_signed: Boolean(batchData.coaSigned),
      coa_signer: batchData.coaSigner || 'Authorized Pharmacist',
      gs1_barcode: batchData.gs1Barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.insert('batches', batch);

    // Update total stock on medicine
    const newTotal = (medicine.total_stock_available || 0) + batchData.quantity;
    db.update('medicines', (m) => m.id === medId, { total_stock_available: newTotal });

    // Record movement
    db.insert('inventory_movements', {
      id: uuidv4(),
      batch_id: batch.id,
      business_id: supplierId,
      movement_type: 'stock_in',
      quantity: batchData.quantity,
      reference_type: 'batch_addition',
      reference_id: batch.batch_number,
      created_at: new Date().toISOString()
    });

    await recordAuditLog(supplierId, 'BATCH_CREATED', 'batch', batch.id, {
      medicine_id: medId,
      batch_number: batch.batch_number,
      quantity: batch.quantity
    });

    return batch;
  }

  static async searchMarketplace(filters = {}) {
    let results = db.find('medicines', (m) => m.status === 'active');

    // Filter by search query across name, brand, generic, manufacturer
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.generic_name.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'all') {
      results = results.filter((m) => m.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.dosageForm && filters.dosageForm !== 'all') {
      results = results.filter((m) => m.dosage_form.toLowerCase() === filters.dosageForm.toLowerCase());
    }

    if (filters.schedule && filters.schedule !== 'all') {
      results = results.filter((m) => m.regulatory_schedule === filters.schedule);
    }

    if (filters.minPrice) {
      results = results.filter((m) => m.base_wholesale_price >= Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      results = results.filter((m) => m.base_wholesale_price <= Number(filters.maxPrice));
    }

    if (filters.isColdChain !== undefined && filters.isColdChain !== '') {
      const isCold = filters.isColdChain === 'true' || filters.isColdChain === true;
      results = results.filter((m) => m.is_cold_chain === isCold);
    }

    if (filters.isWhoGmp !== undefined && filters.isWhoGmp !== '') {
      const isWho = filters.isWhoGmp === 'true' || filters.isWhoGmp === true;
      results = results.filter((m) => m.is_who_gmp === isWho);
    }

    // Attach active batch and format keys matching UI expectations
    const formatted = results.map((m) => {
      const activeBatch = db.findOne('batches', (b) => b.medicine_id === m.id && b.status === 'active');
      return {
        id: m.id,
        name: m.name,
        brand: m.brand,
        genericName: m.generic_name,
        category: m.category,
        dosageForm: m.dosage_form,
        regulatorySchedule: m.regulatory_schedule,
        mrp: m.mrp,
        baseWholesalePrice: m.base_wholesale_price,
        unitPrice: m.base_wholesale_price,
        moq: m.moq,
        unitPack: m.unit_pack,
        packSize: m.unit_pack,
        gstRate: m.gst_rate,
        manufacturer: m.manufacturer,
        mfgLicense: m.mfg_license,
        storageCondition: m.storage_condition,
        isColdChain: m.is_cold_chain,
        isWhoGmp: m.is_who_gmp,
        cdscoVerified: m.cdsco_verified,
        totalStockAvailable: m.total_stock_available,
        total_stock_available: m.total_stock_available,
        stock: m.total_stock_available,
        status: m.status || 'active',
        activeBatch: activeBatch
          ? {
              id: activeBatch.id,
              medicineId: activeBatch.medicine_id,
              batchNumber: activeBatch.batch_number,
              manufacturingDate: activeBatch.manufacturing_date,
              expiryDate: activeBatch.expiry_date,
              shelfLifeMonths: activeBatch.shelf_life_months,
              quantity: activeBatch.quantity,
              status: activeBatch.status,
              temperatureRange: activeBatch.storage_condition,
              vaultLocation: activeBatch.vault_location,
              coaSigned: activeBatch.coa_signed,
              coaSigner: activeBatch.coa_signer,
              gs1Barcode: activeBatch.gs1_barcode
            }
          : {
              id: `bat-${m.id}`,
              medicineId: m.id,
              batchNumber: '#LOT-2025-01',
              manufacturingDate: '2025-01-01',
              expiryDate: '2027-12-31',
              shelfLifeMonths: 24,
              quantity: m.total_stock_available || 10000,
              status: 'active',
              temperatureRange: m.storage_condition,
              vaultLocation: 'Zone A - Cleanroom',
              coaSigned: true,
              coaSigner: m.manufacturer || 'Authorized QA Pharmacist',
              gs1Barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`
            },
        volumeTiers: m.volume_tiers || []
      };
    });

    // Pagination
    const page = parseInt(filters.page || '1', 10);
    const limit = parseInt(filters.limit || '50', 10);
    const startIndex = (page - 1) * limit;
    const paginated = formatted.slice(startIndex, startIndex + limit);

    return {
      items: paginated,
      totalCount: formatted.length,
      page,
      limit,
      totalPages: Math.ceil(formatted.length / limit)
    };
  }

  static getCategories() {
    const medicines = db.getCollection('medicines');
    const categories = [...new Set(medicines.map((m) => m.category))];
    return categories;
  }
}
