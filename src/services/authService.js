import { api } from './api';
import { CURRENT_SUPPLIER_USER, CURRENT_BUYER_USER } from '../data/mockData';

export const authService = {
  async login(email, password, role) {
    const payload = { email, password };
    if (role) payload.role = role;
    const res = await api.post('/auth/login', payload);
    if (res.success && res.data.token) {
      api.setToken(res.data.token);
      const mappedUser = {
        ...res.data.user,
        name: res.data.user.full_name,
        organization: res.data.business?.business_name || res.data.user.full_name,
        licenseNumber: res.data.business?.license_number || 'Pending Submission',
        licenseType: res.data.business?.license_type || (res.data.user.role === 'supplier' ? 'Form 20B/21B' : 'Form 20/21'),
        gstin: res.data.business?.gstin || 'Pending Registration',
        verificationStatus: res.data.user.verification_status || 'pending',
        avatarUrl: res.data.user.avatar_url
      };

      if (role && mappedUser.role && mappedUser.role.toLowerCase() !== role.toLowerCase()) {
        const expectedRole = role.toLowerCase() === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer';
        const actualRole = mappedUser.role.toLowerCase() === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer';
        const err = new Error(
          `Role Mismatch: This account is registered as a ${actualRole}. Please select '${actualRole}' to sign in.`
        );
        err.actualRole = mappedUser.role;
        throw err;
      }

      return mappedUser;
    }
    throw new Error(res.message || 'Invalid email or password');
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.success && res.data.token) {
      api.setToken(res.data.token);
      return {
        ...res.data.user,
        name: res.data.user.full_name,
        organization: res.data.business?.business_name || data.organization || res.data.user.full_name,
        licenseNumber: res.data.business?.license_number || data.licenseNumber,
        licenseType: res.data.business?.license_type || data.licenseType || (res.data.user.role === 'supplier' ? 'Form 20B/21B' : 'Form 20/21'),
        gstin: res.data.business?.gstin || data.gstin,
        verificationStatus: res.data.user.verification_status || 'pending',
        avatarUrl: res.data.user.avatar_url
      };
    }
    throw new Error(res.message || 'Registration failed');
  },

  async getDemoPersona(role) {
    try {
      const res = await api.get(`/auth/demo-token/${role}`);
      if (res.success && res.data.token) {
        api.setToken(res.data.token);
        return {
          ...res.data.user,
          name: res.data.user.full_name,
          organization: res.data.business?.business_name || (role === 'supplier' ? 'Novartis Lifesciences' : 'Apex Hospital'),
          licenseNumber: res.data.business?.license_number || 'DL-94821',
          licenseType: res.data.business?.license_type || 'Form 20B/21B',
          gstin: res.data.business?.gstin || '27AAACN0192Q1ZV',
          verificationStatus: res.data.user.verification_status,
          avatarUrl: res.data.user.avatar_url
        };
      }
    } catch (err) {
      console.warn('[authService] Using mock demo persona:', err.message);
    }
    return role === 'supplier' ? CURRENT_SUPPLIER_USER : CURRENT_BUYER_USER;
  },

  async getMe() {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data.user) {
        return {
          ...res.data.user,
          name: res.data.user.full_name,
          organization: res.data.business?.business_name,
          licenseNumber: res.data.business?.license_number,
          gstin: res.data.business?.gstin,
          avatarUrl: res.data.user.avatar_url
        };
      }
    } catch (err) {
      console.warn('[authService] getMe failed:', err.message);
    }
    return null;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
    api.setToken(null);
  },

  async verifySelf() {
    const res = await api.post('/auth/verify-self');
    if (res.success && res.data) {
      return {
        ...res.data.user,
        name: res.data.user.full_name,
        organization: res.data.business?.business_name || res.data.user.full_name,
        licenseNumber: res.data.business?.license_number,
        licenseType: res.data.business?.license_type,
        gstin: res.data.business?.gstin,
        verificationStatus: 'verified',
        verification_status: 'verified',
        avatarUrl: res.data.user.avatar_url
      };
    }
    throw new Error(res.message || 'Verification failed');
  }
};
