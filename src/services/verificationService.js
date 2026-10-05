import { api } from './api';

export const verificationService = {
  async uploadDocument(documentType, file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileData = reader.result;
          const res = await api.post('/uploads/document', {
            documentType,
            fileName: file.name,
            fileData
          });
          if (res.success && res.data) {
            resolve(res.data);
          } else {
            reject(new Error(res.message || 'Document upload failed'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (e) => reject(new Error('Failed to read file for upload'));
      reader.readAsDataURL(file);
    });
  },

  async getMyDocuments() {
    try {
      const res = await api.get('/uploads/documents');
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('[verificationService] getMyDocuments error:', err.message);
    }
    return [];
  }
};
