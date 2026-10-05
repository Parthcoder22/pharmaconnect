import { db } from '../config/db.js';

export class ReportService {
  static getSupplierOverview(supplierId) {
    const orders = db.find('purchase_orders', (o) => o.supplierId === supplierId);
    const medicines = db.find('medicines', (m) => m.supplier_id === supplierId && m.status !== 'discontinued');
    const batches = db.find('batches', (b) => {
      const med = medicines.find((m) => m.id === b.medicine_id);
      return Boolean(med);
    });

    const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'paid' || o.status === 'completed');
    const pendingOrders = orders.filter((o) => o.status === 'requested' || o.status === 'processing');
    const totalSales = completedOrders.reduce((acc, o) => acc + (o.netPayable || 0), 0);

    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000);

    const expiringBatches = batches.filter((b) => {
      const exp = new Date(b.expiry_date);
      return exp <= thirtyDaysFromNow && b.quantity > 0;
    });

    const lowStockItems = medicines.filter((m) => (m.total_stock_available || 0) < 5000);

    // Sales by category
    const categoryMap = {};
    for (const order of completedOrders) {
      for (const item of order.items || []) {
        const med = medicines.find((m) => m.id === item.medicineId);
        const cat = med?.category || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + (item.taxableAmount || 0);
      }
    }

    const categoryDistribution = Object.entries(categoryMap).map(([category, value]) => ({
      category,
      revenue: Number(value.toFixed(2))
    }));

    return {
      kpis: {
        activeSkus: medicines.length,
        pendingReviewCount: pendingOrders.length,
        inTransitCount: orders.filter((o) => o.status === 'dispatched').length,
        monthlyNetRevenue: totalSales,
        lowStockAlertCount: lowStockItems.length,
        expiringBatchesCount: expiringBatches.length
      },
      categoryDistribution,
      expiringBatches,
      lowStockItems
    };
  }

  static getBuyerOverview(buyerId) {
    const orders = db.find('purchase_orders', (o) => o.buyerId === buyerId);
    const totalSpend = orders
      .filter((o) => o.status !== 'rejected' && o.status !== 'cancelled')
      .reduce((acc, o) => acc + (o.netPayable || 0), 0);

    const activeOrders = orders.filter((o) => o.status === 'processing' || o.status === 'dispatched');
    const deliveredOrders = orders.filter((o) => o.status === 'delivered');
    const bills = db.find('patient_bills', (b) => b.buyer_id === buyerId);

    return {
      totalPurchasesAmount: totalSpend,
      totalOrdersCount: orders.length,
      activeShipmentsCount: activeOrders.length,
      deliveredPendingSettlement: deliveredOrders.length,
      patientBillsCount: bills.length,
      recentOrders: orders.slice(0, 10)
    };
  }

  static getBatchSurveillance() {
    const allBatches = db.getCollection('batches');
    const allMeds = db.getCollection('medicines');
    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000);

    return allBatches.map((b) => {
      const med = allMeds.find((m) => m.id === b.medicine_id);
      const exp = new Date(b.expiry_date);
      const diffTime = exp - now;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let alertLevel = 'normal';
      if (daysRemaining <= 0) alertLevel = 'expired';
      else if (daysRemaining <= 30) alertLevel = 'critical';
      else if (daysRemaining <= 90) alertLevel = 'warning';

      return {
        ...b,
        medicineName: med?.name || 'Pharmaceutical Formulation',
        category: med?.category || 'General',
        manufacturer: med?.manufacturer || 'Certified Manufacturer',
        daysRemaining,
        alertLevel
      };
    });
  }
}
