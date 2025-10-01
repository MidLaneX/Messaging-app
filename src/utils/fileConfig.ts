/**
 * Configuration utilities for secure credential management
 */

export interface R2Config {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  region: string;
}

/**
 * Get R2 configuration from environment variables
 * Throws error if required credentials are missing
 */
export const getR2Config = (): R2Config => {
  const config = {
    endpoint: process.env.REACT_APP_R2_ENDPOINT,
    accessKey: process.env.REACT_APP_R2_ACCESS_KEY,
    secretKey: process.env.REACT_APP_R2_SECRET_KEY,
    bucketName: process.env.REACT_APP_R2_BUCKET_NAME,
    region: process.env.REACT_APP_R2_REGION,
  };

  // Validate that all required config values are present
  const missingKeys = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required R2 configuration: ${missingKeys.join(', ')}. ` +
      'Please check your environment variables.'
    );
  }

  return config as R2Config;
};

/**
 * Validate file for upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Maximum file size: 50MB
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  
  // Allowed file types
  const ALLOWED_TYPES = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Audio
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
    // Video
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'
  ];

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size too large. Maximum allowed size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed.`
    };
  }

  return { valid: true };
};

/**
 * Generate secure filename for storage
 */
export const generateSecureFilename = (originalName: string, userId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || '';
  
  return `${userId}/${timestamp}_${random}.${extension}`;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type category for UI display
 */
export const getFileCategory = (mimeType: string): 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'file' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  return 'file';
};

/**
 * Get appropriate icon for file type
 */
export const getFileIcon = (mimeType: string): string => {
  const category = getFileCategory(mimeType);
  
  switch (category) {
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'audio': return '🎵';
    case 'pdf': return '📕';
    case 'document': return '📄';
    case 'spreadsheet': return '📊';
    case 'presentation': return '📖';
    case 'archive': return '🗜️';
    default: return '📎';
  }
};