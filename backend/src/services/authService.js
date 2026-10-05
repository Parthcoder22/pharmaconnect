import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { checkUserVerification } from '../utils/complianceValidator.js';

export class AuthService {
  static generateToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      verification_status: user.verification_status
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  }

  static verifyToken(token) {
    return jwt.verify(token, env.JWT_SECRET);
  }

  static async register({ email, password, fullName, role, phone, organization, licenseNumber, licenseType, gstin }) {
    // Check if user already exists
    const existing = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = uuidv4();
    const newUser = {
      id: userId,
      auth_user_id: uuidv4(),
      full_name: fullName,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      phone: phone || '',
      role,
      verification_status: 'pending', // strict server default; users cannot self-verify
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0047c1&color=fff`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.insert('users', newUser);

    // Create business profile
    const newBiz = {
      id: uuidv4(),
      user_id: userId,
      business_name: organization,
      business_type: role === 'supplier' ? 'manufacturer' : 'hospital',
      business_address: 'Registered Address Pending Verification',
      state: 'Maharashtra',
      city: 'Mumbai',
      gstin: (gstin || '27AAACN0192Q1ZV').toUpperCase(),
      license_number: licenseNumber,
      license_type: licenseType || (role === 'supplier' ? 'Form 20B/21B' : 'Form 20/21'),
      verification_status: 'pending',
      created_at: new Date().toISOString()
    };

    db.insert('businesses', newBiz);

    await recordAuditLog(userId, 'USER_REGISTERED', 'user', userId, {
      email,
      role,
      organization,
      gstin
    });

    const token = this.generateToken(newUser);

    const safeUser = { ...newUser };
    delete safeUser.password_hash;

    return { user: safeUser, business: newBiz, token };
  }

  static async login({ email, password, role }) {
    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.statusCode = 400;
      throw err;
    }

    const user = db.findOne('users', (u) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // Strictly verify password using bcrypt
    if (!user.password_hash) {
      const err = new Error('Invalid account configuration');
      err.statusCode = 401;
      throw err;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // Role check: verify that account's registered role matches the login portal/role requested
    if (role && user.role && user.role.toLowerCase() !== role.toLowerCase()) {
      const expectedRole = role.toLowerCase() === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer';
      const actualRole = user.role.toLowerCase() === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer';
      const err = new Error(
        `Role Mismatch: This account is registered as a ${actualRole}. You cannot log in as a ${expectedRole}. Please select '${actualRole}' to sign in.`
      );
      err.statusCode = 403;
      err.actualRole = user.role;
      throw err;
    }

    const check = checkUserVerification(user.id, user.role);
    const business = db.findOne('businesses', (b) => b.user_id === user.id);
    const token = this.generateToken({
      ...user,
      verification_status: check.isVerified ? 'verified' : 'pending'
    });

    await recordAuditLog(user.id, 'USER_LOGIN', 'user', user.id, { email, role: user.role });

    const safeUser = { 
      ...user, 
      verification_status: check.isVerified ? 'verified' : 'pending',
      allDocsUploaded: check.allPdfsUploaded,
      uploadedCount: check.uploadedCount,
      totalRequiredDocs: check.totalCount
    };
    delete safeUser.password_hash;

    if (business) {
      business.verification_status = check.isVerified ? 'verified' : 'pending';
    }

    return { user: safeUser, business, token };
  }

  static async getUserProfile(userId) {
    const user = db.findOne('users', (u) => u.id === userId);
    if (!user) return null;
    const check = checkUserVerification(user.id, user.role);
    const business = db.findOne('businesses', (b) => b.user_id === userId);
    const documents = db.find('verification_documents', (d) => d.user_id === userId);

    const safeUser = { 
      ...user, 
      verification_status: check.isVerified ? 'verified' : 'pending',
      allDocsUploaded: check.allPdfsUploaded,
      uploadedCount: check.uploadedCount,
      totalRequiredDocs: check.totalCount
    };
    delete safeUser.password_hash;

    if (business) {
      business.verification_status = check.isVerified ? 'verified' : 'pending';
    }

    return { user: safeUser, business, documents };
  }
}
