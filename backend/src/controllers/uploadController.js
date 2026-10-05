import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { db } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { recordAuditLog } from '../utils/auditLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/documents');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class UploadController {
  static getUploadSignature(req, res, next) {
    try {
      const { folder = 'pharmaconnect/medicines', publicId } = req.body;
      const timestamp = Math.round(new Date().getTime() / 1000);

      if (!isCloudinaryConfigured) {
        return successResponse(res, 'Development upload simulation signature', {
          signature: 'simulated_sig_' + timestamp,
          timestamp,
          apiKey: 'simulated_api_key',
          cloudName: 'simulated_cloud',
          folder,
          uploadUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
          mode: 'simulation'
        });
      }

      const paramsToSign = { timestamp, folder };
      if (publicId) paramsToSign.public_id = publicId;

      const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);

      return successResponse(res, 'Signed upload parameters generated', {
        signature,
        timestamp,
        apiKey: env.CLOUDINARY_API_KEY,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        folder
      });
    } catch (err) {
      next(err);
    }
  }

  static async uploadDocument(req, res, next) {
    try {
      const { documentType, fileName, fileData } = req.body;

      if (!documentType || !fileName || !fileData) {
        return errorResponse(res, 'documentType, fileName, and fileData are required', [], 400);
      }

      // Sanitize filename
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueName = `${req.user.id}_${Date.now()}_${cleanFileName}`;
      const filePath = path.join(UPLOAD_DIR, uniqueName);

      // Write file data (handles both base64 data URL and raw base64)
      const base64Data = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

      const documentUrl = `/uploads/documents/${uniqueName}`;

      const existingDoc = db.findOne(
        'verification_documents',
        (d) => d.user_id === req.user.id && (d.document_type === documentType || d.id === documentType)
      );

      let docRecord;
      if (existingDoc) {
        docRecord = db.update(
          'verification_documents',
          (d) => d.id === existingDoc.id,
          {
            document_type: documentType,
            document_url: documentUrl,
            file_name: cleanFileName,
            verification_status: 'under_review',
            reviewer_notes: 'Uploaded for CDSCO / State FDA regulatory audit',
            submitted_at: new Date().toISOString()
          }
        );
      } else {
        docRecord = {
          id: uuidv4(),
          user_id: req.user.id,
          document_type: documentType,
          document_url: documentUrl,
          file_name: cleanFileName,
          verification_status: 'under_review',
          reviewer_notes: 'Uploaded for CDSCO / State FDA regulatory audit',
          submitted_at: new Date().toISOString()
        };
        db.insert('verification_documents', docRecord);
      }

      // Update business status to under_review if currently pending
      db.update(
        'users',
        (u) => u.id === req.user.id && u.verification_status === 'pending',
        { verification_status: 'under_review' }
      );
      db.update(
        'businesses',
        (b) => b.user_id === req.user.id && b.verification_status === 'pending',
        { verification_status: 'under_review' }
      );

      // Send audit confirmation notification
      db.insert('notifications', {
        id: uuidv4(),
        user_id: req.user.id,
        type: 'KYC_DOCUMENT_SUBMITTED',
        title: 'Regulatory Document Received',
        message: `Submitted "${cleanFileName}" (${documentType}) for CDSCO regulatory compliance review.`,
        is_read: false,
        created_at: new Date().toISOString()
      });

      await recordAuditLog(req.user.id, 'DOCUMENT_SUBMITTED', 'verification_document', docRecord.id, {
        documentType,
        cleanFileName
      });

      return successResponse(res, 'Document uploaded and submitted for verification', docRecord, 201);
    } catch (err) {
      next(err);
    }
  }

  static getDocuments(req, res, next) {
    try {
      const documents = db.find('verification_documents', (d) => d.user_id === req.user.id);
      return successResponse(res, 'Verification documents retrieved', documents);
    } catch (err) {
      next(err);
    }
  }
}

