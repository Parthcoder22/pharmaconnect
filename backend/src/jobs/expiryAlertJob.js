import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { mailTransporter } from '../config/email.js';
import { env } from '../config/env.js';

export class ExpiryAlertJob {
  static async scanAndTriggerAlerts() {
    const batches = db.getCollection('batches');
    const medicines = db.getCollection('medicines');
    const now = new Date();
    const alertsGenerated = [];

    for (const batch of batches) {
      if (batch.quantity <= 0 || batch.status === 'depleted') continue;

      const med = medicines.find((m) => m.id === batch.medicine_id);
      if (!med) continue;

      const expDate = new Date(batch.expiry_date);
      const diffMs = expDate - now;
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let threshold = null;
      if (daysRemaining <= 0) {
        threshold = 'ALREADY_EXPIRED';
      } else if (daysRemaining <= 7) {
        threshold = 'EXPIRES_IN_7_DAYS';
      } else if (daysRemaining <= 30) {
        threshold = 'EXPIRES_IN_30_DAYS';
      }

      if (!threshold) continue;

      // Prevent duplicate notification for same batch and threshold within 7 days
      const existing = db.findOne(
        'notifications',
        (n) =>
          n.user_id === med.supplier_id &&
          n.type === `EXPIRY_${threshold}` &&
          n.message.includes(batch.batch_number)
      );

      if (existing) continue;

      const title =
        threshold === 'ALREADY_EXPIRED'
          ? `CRITICAL CDSCO ALERT: Batch ${batch.batch_number} Expired`
          : `Expiry Warning: Batch ${batch.batch_number} expires in ${daysRemaining} days`;

      const message = `Formulation ${med.name} (Batch ${batch.batch_number}, Qty: ${batch.quantity}) has hit threshold ${threshold}. Vault location: ${batch.vault_location || 'Zone A'}. Immediate quarantine or return required.`;

      // 1. In-app notification
      const notif = {
        id: uuidv4(),
        user_id: med.supplier_id,
        type: `EXPIRY_${threshold}`,
        title,
        message,
        is_read: false,
        created_at: new Date().toISOString()
      };
      db.insert('notifications', notif);

      // 2. Email alert via Nodemailer
      const supplierUser = db.findOne('users', (u) => u.id === med.supplier_id);
      if (supplierUser?.email) {
        try {
          await mailTransporter.sendMail({
            from: env.EMAIL_FROM,
            to: supplierUser.email,
            subject: title,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #131b2e;">
                <h2 style="color: #ba1a1a;">${title}</h2>
                <p>${message}</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  <tr><td style="padding: 6px; font-weight: bold;">Medicine:</td><td>${med.name}</td></tr>
                  <tr><td style="padding: 6px; font-weight: bold;">Batch Number:</td><td>${batch.batch_number}</td></tr>
                  <tr><td style="padding: 6px; font-weight: bold;">Expiry Date:</td><td>${batch.expiry_date}</td></tr>
                  <tr><td style="padding: 6px; font-weight: bold;">Active Stock:</td><td>${batch.quantity} units</td></tr>
                </table>
                <p style="font-size: 11px; color: #74777f; margin-top: 20px;">PharmaConnect B2B Compliance Surveillance Engine</p>
              </div>
            `
          });
        } catch (mailErr) {
          console.error('[ExpiryAlertJob] Email dispatch error:', mailErr.message);
        }
      }

      alertsGenerated.push({
        batchNumber: batch.batch_number,
        medicineName: med.name,
        threshold,
        daysRemaining
      });
    }

    return alertsGenerated;
  }
}
