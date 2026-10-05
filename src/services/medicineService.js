import { api } from './api';
import { INITIAL_MEDICINES } from '../data/mockData';

export const medicineService = {
  async getMarketplaceMedicines(filters = {}) {
    try {
      const res = await api.get('/medicines', filters);
      if (res.success && res.data?.items) {
        return res.data.items;
      }
    } catch (err) {
      console.warn('[medicineService] Marketplace API failed:', err.message);
    }
    return [];
  },

  async getSupplierMedicines() {
    try {
      const res = await api.get('/supplier/medicines');
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('[medicineService] Supplier medicines API failed:', err.message);
    }
    return [];
  },

  async getCategories() {
    try {
      const res = await api.get('/medicines/categories');
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('[medicineService] Categories API failed:', err.message);
    }
    return ['Antimicrobial & Antibiotics', 'Cardiovascular', 'Critical Care & ICU', 'Anti-diabetic & Glycemic', 'Oncology & Cytotoxic'];
  },

  async addMedicineSku(skuData) {
    const medName = (skuData.name || skuData.brandName || skuData.brand || 'New Formulation').trim();
    const brand = (skuData.brand || skuData.brandName || skuData.name || medName).trim();
    const generic = (skuData.genericName || medName).trim();
    const unitPrice = parseFloat(skuData.unitPrice || skuData.baseWholesalePrice) || 100;
    const mrp = parseFloat(skuData.mrp) || Number((unitPrice * 1.3).toFixed(2));
    const moq = parseInt(skuData.moq, 10) || 100;
    const stock = parseInt(skuData.stock ?? skuData.totalStockAvailable ?? skuData.total_stock_available ?? skuData.initialStock, 10) || 1000;
    const pack = skuData.packSize || skuData.unitPack || '10x10 Strips';
    const category = skuData.category || 'General Formulations';
    const dosageForm = skuData.dosageForm || 'Tablets';
    const storageCondition = skuData.storageCondition || 'Controlled Ambient 15°C–25°C';
    const isCold = storageCondition.toLowerCase().includes('cold');
    const gstRate = parseInt(skuData.gstRate, 10) || 12;
    const mfg = (skuData.manufacturer || skuData.supplierName || '').trim();
    const batchNum = skuData.batchNumber || `LOT-${medName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'MED'}-${new Date().getFullYear()}-01`;
    const expDate = skuData.expiryDate || '2027-12-31';

    const payload = {
      name: medName,
      brand: brand,
      genericName: generic,
      category: category,
      dosageForm: dosageForm,
      regulatorySchedule: skuData.regulatorySchedule || 'Schedule H',
      baseWholesalePrice: unitPrice,
      mrp: mrp,
      moq: moq,
      unitPack: pack,
      gstRate: gstRate,
      manufacturer: mfg,
      storageCondition: storageCondition,
      isColdChain: isCold,
      isWhoGmp: true,
      batchNumber: batchNum,
      expiryDate: expDate,
      initialStock: stock
    };

    try {
      const res = await api.post('/supplier/medicines', payload);
      if (res.success && res.data?.medicine) {
        const m = res.data.medicine;
        return {
          ...m,
          id: m.id || `med-${Date.now()}`,
          name: m.name || medName,
          brand: m.brand || brand,
          brandName: m.brand || brand,
          genericName: m.generic_name || generic,
          strength: skuData.strength || m.strength || 'Standard',
          category: m.category || category,
          dosageForm: m.dosage_form || dosageForm,
          unitPrice: m.base_wholesale_price ?? unitPrice,
          baseWholesalePrice: m.base_wholesale_price ?? unitPrice,
          mrp: m.mrp || mrp,
          moq: m.moq || moq,
          stock: m.total_stock_available ?? stock,
          total_stock_available: m.total_stock_available ?? stock,
          totalStockAvailable: m.total_stock_available ?? stock,
          unitPack: m.unit_pack || pack,
          packSize: m.unit_pack || pack,
          gstRate: m.gst_rate ?? gstRate,
          storageCondition: m.storage_condition || storageCondition,
          status: m.status || 'active',
          isColdChain: m.is_cold_chain ?? isCold,
          isWhoGmp: m.is_who_gmp ?? true,
          cdscoVerified: m.cdsco_verified ?? true,
          manufacturer: m.manufacturer || mfg,
          mfgLicense: m.mfg_license || 'MH-PUN-20B-184920',
          activeBatch: res.data.batch
            ? {
                id: res.data.batch.id,
                medicineId: res.data.batch.medicine_id,
                batchNumber: res.data.batch.batch_number,
                manufacturingDate: res.data.batch.manufacturing_date,
                expiryDate: res.data.batch.expiry_date,
                quantity: res.data.batch.quantity,
                status: res.data.batch.status || 'active',
                temperatureRange: res.data.batch.storage_condition,
                vaultLocation: res.data.batch.vault_location || 'Zone A - Cleanroom',
                coaSigned: res.data.batch.coa_signed ?? true,
                coaSigner: res.data.batch.coa_signer || 'Dr. Aris Thorne',
                gs1Barcode: res.data.batch.gs1_barcode
              }
            : null,
          volumeTiers: m.volume_tiers || [
            { minQty: moq, maxQty: 500, unitPrice: unitPrice, label: 'Standard MOQ' }
          ]
        };
      }
    } catch (err) {
      console.warn('[medicineService] addMedicineSku fallback to local state:', err.message);
    }

    // Local fallback object
    return {
      id: `med-${Date.now()}`,
      name: medName,
      brand: brand,
      brandName: brand,
      genericName: generic,
      strength: skuData.strength || 'Standard',
      category: category,
      dosageForm: dosageForm,
      regulatorySchedule: 'Schedule H',
      mrp: mrp,
      unitPrice: unitPrice,
      baseWholesalePrice: unitPrice,
      moq: moq,
      stock: stock,
      total_stock_available: stock,
      totalStockAvailable: stock,
      packSize: pack,
      unitPack: pack,
      gstRate: gstRate,
      manufacturer: mfg,
      mfgLicense: 'MH-PUN-20B-184920',
      storageCondition: storageCondition,
      isColdChain: isCold,
      isWhoGmp: true,
      cdscoVerified: true,
      status: 'active',
      activeBatch: {
        id: `bat-${Date.now()}`,
        medicineId: `med-${Date.now()}`,
        batchNumber: batchNum,
        manufacturingDate: '2025-01-01',
        expiryDate: expDate,
        shelfLifeMonths: 24,
        quantity: stock,
        status: 'active',
        temperatureRange: storageCondition,
        vaultLocation: 'Zone A - Cleanroom',
        coaSigned: true,
        coaSigner: 'Dr. Aris Thorne',
        gs1Barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`
      },
      volumeTiers: [
        { minQty: moq, maxQty: 500, unitPrice: unitPrice, label: 'Standard MOQ' }
      ]
    };
  },

  async updateMedicine(id, updates) {
    try {
      const res = await api.patch(`/supplier/medicines/${id}`, updates);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('[medicineService] updateMedicine API failed:', err.message);
      throw err;
    }
  },

  async deactivateMedicine(id, permanent = false) {
    try {
      const res = await api.delete(`/supplier/medicines/${id}${permanent ? '?permanent=true' : ''}`);
      if (res.success) {
        return res.data;
      }
    } catch (err) {
      console.warn('[medicineService] deactivateMedicine API failed:', err.message);
      throw err;
    }
  }
};

