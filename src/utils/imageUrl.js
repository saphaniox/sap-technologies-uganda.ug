import apiService from '../services/api';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL (Cloudinary, external), use it directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, it's a local path - prepend the API base URL
  return `${apiService.baseURL}${imagePath}`;
};

export const getImageUrlWithFallback = (imagePath, placeholder) => {
  return getImageUrl(imagePath) || placeholder;
};

export const isCloudinaryUrl = (path) => {
  return path && typeof path === 'string' && path.includes('cloudinary.com');
};

/**
 * SVG placeholders for missing images
 */
export const PLACEHOLDERS = {
  product: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext fill='%236b7280' font-family='Arial' font-size='20' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E",
  
  avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext fill='%239ca3af' font-family='Arial' font-size='16' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Photo%3C/text%3E%3C/svg%3E",
  
  logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f9fafb' width='200' height='200'/%3E%3Ctext fill='%236b7280' font-family='Arial' font-size='16' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Logo%3C/text%3E%3C/svg%3E",
  
  error: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23fee2e2' width='400' height='300'/%3E%3Ctext fill='%23dc2626' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImage Error%3C/text%3E%3C/svg%3E"
};

export default getImageUrl;
