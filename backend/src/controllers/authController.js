import { AuthService } from '../services/authService.js';
import { db } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { v4 as uuidv4 } from 'uuid';

import { checkUserVerification } from '../utils/complianceValidator.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return successResponse(res, 'Institutional account registered successfully. Verification pending.', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return successResponse(res, 'Authentication successful', result);
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const profile = await AuthService.getUserProfile(req.user.id);
      return successResponse(res, 'Current profile retrieved', profile);
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res) {
    if (req.user) {
      await recordAuditLog(req.user.id, 'USER_LOGOUT', 'user', req.user.id);
    }
    return successResponse(res, 'Logged out successfully');
  }

  static async getDemoToken(req, res) {
    const { role } = req.params;
    let targetUser;

    if (role === 'supplier') {
      targetUser = db.findOne('users', (u) => u.id === 'usr-supp-01');
    } else if (role === 'buyer') {
      targetUser = db.findOne('users', (u) => u.id === 'usr-buy-01');
    } else if (role === 'admin') {
      targetUser = db.findOne('users', (u) => u.id === 'usr-admin-01');
    }

    if (!targetUser) {
      return errorResponse(res, 'Demo persona not found', [], 404);
    }

    const check = checkUserVerification(targetUser.id, targetUser.role);
    const token = AuthService.generateToken({
      ...targetUser,
      verification_status: check.isVerified ? 'verified' : 'pending'
    });
    const business = db.findOne('businesses', (b) => b.user_id === targetUser.id);

    const safeUser = { 
      ...targetUser,
      verification_status: check.isVerified ? 'verified' : 'pending',
      allDocsUploaded: check.allPdfsUploaded,
      uploadedCount: check.uploadedCount,
      totalRequiredDocs: check.totalCount
    };
    delete safeUser.password_hash;

    if (business) {
      business.verification_status = check.isVerified ? 'verified' : 'pending';
    }

    return successResponse(res, `Demo token issued for ${targetUser.full_name}`, {
      user: safeUser,
      business,
      token
    });
  }

  static async updateBusiness(req, res, next) {
    try {
      let biz = db.findOne('businesses', (b) => b.user_id === req.user.id);
      const updates = {
        business_name: req.body.businessName,
        business_type: req.body.businessType || biz?.business_type,
        business_address: req.body.businessAddress,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
        gstin: req.body.gstin,
        license_number: req.body.licenseNumber,
        license_type: req.body.licenseType
      };

      if (biz) {
        biz = db.update('businesses', (b) => b.id === biz.id, updates);
      } else {
        biz = db.insert('businesses', {
          id: uuidv4(),
          user_id: req.user.id,
          ...updates,
          verification_status: 'pending'
        });
      }

      await recordAuditLog(req.user.id, 'BUSINESS_PROFILE_UPDATED', 'business', biz.id, updates);

      return successResponse(res, 'Business details updated successfully', biz);
    } catch (err) {
      next(err);
    }
  }

  static async submitDocument(req, res, next) {
    try {
      const doc = {
        id: uuidv4(),
        user_id: req.user.id,
        document_type: req.body.documentType,
        document_url: req.body.documentUrl,
        verification_status: 'pending',
        reviewer_notes: null,
        submitted_at: new Date().toISOString()
      };

      db.insert('verification_documents', doc);
      await recordAuditLog(req.user.id, 'DOCUMENT_SUBMITTED', 'verification_document', doc.id, {
        document_type: doc.document_type
      });

      return successResponse(res, 'Verification document submitted for CDSCO/FDA review', doc, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getDocuments(req, res, next) {
    try {
      const docs = db.find('verification_documents', (d) => d.user_id === req.user.id);
      return successResponse(res, 'Verification documents retrieved', docs);
    } catch (err) {
      next(err);
    }
  }

  static async reviewDocument(req, res, next) {
    try {
      const { docId } = req.params;
      const { status, reviewerNotes } = req.body;

      const doc = db.findOne('verification_documents', (d) => d.id === docId);
      if (!doc) {
        return errorResponse(res, 'Document not found', [], 404);
      }

      const updatedDoc = db.update('verification_documents', (d) => d.id === docId, {
        verification_status: status,
        reviewer_notes: reviewerNotes || '',
        reviewed_at: new Date().toISOString()
      });

      // If document approved, check whether all user requirements are verified
      if (status === 'approved') {
        db.update('users', (u) => u.id === doc.user_id, { verification_status: 'verified' });
        db.update('businesses', (b) => b.user_id === doc.user_id, { verification_status: 'verified' });
      }

      await recordAuditLog(req.user.id, 'DOCUMENT_REVIEWED', 'verification_document', docId, {
        status,
        reviewerNotes,
        target_user: doc.user_id
      });

      return successResponse(res, `Document review status updated to ${status}`, updatedDoc);
    } catch (err) {
      next(err);
    }
  }

  static async verifySelf(req, res, next) {
    try {
      const user = db.findOne('users', (u) => u.id === req.user.id);
      if (!user) {
        return errorResponse(res, 'User not found', [], 404);
      }

      // Check required statutory documents for certification
      const isSupplier = user.role === 'supplier';
      const userDocs = db.find('verification_documents', (d) => d.user_id === req.user.id);

      const requiredBuyerDocs = [
        { id: 'doc-1', title: 'State FDA Drug License (Form 20 / 21)', keywords: ['form 20', 'drug license', 'drug_license', 'fda', 'doc-1'] },
        { id: 'doc-2', title: 'GSTIN Registration Certificate', keywords: ['gst', 'gstin', 'doc-2'] },
        { id: 'doc-3', title: 'Registered Qualified Pharmacist Council Certificate', keywords: ['pharmacist', 'council', 'doc-3'] },
        { id: 'doc-4', title: 'Hospital NABH Accreditation / Clinical Establishment Act Certificate', keywords: ['nabh', 'clinical establishment', 'accreditation', 'doc-4'] }
      ];

      const requiredSupplierDocs = [
        { id: 'doc-01', title: 'Wholesale Drug License (Form 20B & 21B)', keywords: ['form 20b', 'drug license', 'drug_license', 'doc-01', 'wholesale'] },
        { id: 'doc-02', title: 'GST Registration Certificate (REG-06)', keywords: ['gst', 'reg-06', 'doc-02'] },
        { id: 'doc-03', title: 'Certificate of Incorporation / Partnership Deed', keywords: ['incorporation', 'partnership', 'mca', 'doc-03'] },
        { id: 'doc-04', title: 'WHO-GMP Manufacturing Compliance Certificate', keywords: ['who-gmp', 'who_gmp', 'manufacturing', 'gmp', 'doc-04'] },
        { id: 'doc-05', title: 'FSSAI Wholesale Nutraceutical Permit', keywords: ['fssai', 'nutraceutical', 'doc-05'] }
      ];

      const requiredList = isSupplier ? requiredSupplierDocs : requiredBuyerDocs;
      const missingDocs = [];

      for (const reqDoc of requiredList) {
        const found = userDocs.some((d) => {
          const docType = (d.document_type || '').toLowerCase();
          const matchesKeyword = reqDoc.keywords.some((k) => docType.includes(k.toLowerCase())) || docType === reqDoc.title.toLowerCase();
          const hasFile = Boolean(d.file_name || d.document_url);
          return matchesKeyword && hasFile;
        });

        if (!found) {
          missingDocs.push(reqDoc.title);
        }
      }

      if (missingDocs.length > 0) {
        return errorResponse(
          res,
          `Statutory Verification Denied: All ${requiredList.length} required PDF documents must be uploaded before certification. Missing (${missingDocs.length}): ${missingDocs.join(', ')}`,
          missingDocs,
          400
        );
      }

      // Mark user and business as verified
      const updatedUser = db.update('users', (u) => u.id === req.user.id, {
        verification_status: 'verified',
        updated_at: new Date().toISOString()
      });
      const updatedBiz = db.update('businesses', (b) => b.user_id === req.user.id, {
        verification_status: 'verified'
      });

      // Mark existing documents as approved
      db.update(
        'verification_documents',
        (d) => d.user_id === req.user.id,
        { verification_status: 'approved', reviewed_at: new Date().toISOString(), reviewer_notes: 'Statutory CDSCO verification completed' }
      );

      const certTitle = isSupplier ? 'WHO-GMP Certified Manufacturer & Seller' : 'CDSCO Certified Institutional Buyer';

      db.insert('notifications', {
        id: uuidv4(),
        user_id: req.user.id,
        type: 'ACCOUNT_VERIFIED',
        title: `Account Certified: ${certTitle}`,
        message: `Your account has been verified in Security & Verification. You are now authorized to ${isSupplier ? 'list and sell pharmaceutical formulations' : 'place purchase orders and procure Schedule H/H1 medicines'}.`,
        is_read: false,
        created_at: new Date().toISOString()
      });

      await recordAuditLog(req.user.id, 'ACCOUNT_SELF_VERIFIED', 'user', req.user.id, {
        role: user.role,
        certification: certTitle
      });

      const safeUser = { ...updatedUser };
      delete safeUser.password_hash;

      return successResponse(res, `Account successfully verified as ${certTitle}`, {
        user: safeUser,
        business: updatedBiz
      });
    } catch (err) {
      next(err);
    }
  }
}
