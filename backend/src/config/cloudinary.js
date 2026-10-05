import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

const isCloudinaryConfigured =
  env.CLOUDINARY_CLOUD_NAME &&
  !env.CLOUDINARY_CLOUD_NAME.includes('placeholder') &&
  env.CLOUDINARY_API_KEY &&
  !env.CLOUDINARY_API_KEY.includes('placeholder');

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('[Cloudinary] Initialized with live configuration');
} else {
  console.log('[Cloudinary] Cloudinary using simulated/placeholder configuration');
}

export { cloudinary, isCloudinaryConfigured };
