/**
 * Backend File Service
 * Handles file operations through the backend API
 */

import { APP_CONFIG } from '../constants';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  fileId?: string;
  error?: string;
}

export interface FileMetadata {
  id: string;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  contentType: string;
  fileUrl: string;
  bucketName: string;
  objectKey: string;
  uploadedById: string;
  uploadedByUsername: string;
  isEncrypted: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface FileUploadResponse {
  success: boolean;
  message?: string;
  file?: FileMetadata;
  error?: string;
}

class BackendFileService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = APP_CONFIG.API_BASE_URL;
  }

  /**
   * Upload file via backend API
   */
  async uploadFile(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log("🔄 Starting backend file upload:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: userId
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const xhr = new XMLHttpRequest();

      return new Promise<UploadResult>((resolve) => {
        // Set up progress tracking
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress: UploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100)
              };
              onProgress(progress);
            }
          });
        }

        // Handle completion
        xhr.addEventListener('load', () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response: FileUploadResponse = JSON.parse(xhr.responseText);
              
              if (response.success && response.file) {
                console.log("✅ Backend upload successful:", response.file);
                resolve({
                  success: true,
                  fileUrl: response.file.fileUrl,
                  fileName: response.file.storedFilename,
                  fileSize: response.file.fileSize,
                  mimeType: response.file.contentType,
                  fileId: response.file.id
                });
              } else {
                console.error("❌ Backend upload failed:", response.error);
                resolve({
                  success: false,
                  error: response.error || 'Upload failed'
                });
              }
            } else {
              console.error('❌ Backend upload failed:', xhr.status, xhr.statusText);
              resolve({
                success: false,
                error: `Upload failed: ${xhr.status} ${xhr.statusText}`
              });
            }
          } catch (e) {
            console.error('❌ Failed to parse upload response:', e);
            resolve({
              success: false,
              error: 'Failed to parse response'
            });
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          console.error('❌ Network error during upload');
          resolve({
            success: false,
            error: 'Network error during upload'
          });
        });

        // Send the request
        xhr.open('POST', `${this.baseUrl}/api/files/upload`, true);
        xhr.send(formData);
      });

    } catch (error) {
      console.error("❌ Backend file upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string, userId: string): Promise<FileMetadata | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/files/metadata/${fileId}?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to get file metadata:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return null;
    }
  }

  /**
   * Generate download URL for file
   */
  getDownloadUrl(fileId: string, userId: string): string {
    return `${this.baseUrl}/api/files/download/${fileId}?userId=${userId}`;
  }

  /**
   * Generate view URL for file (inline viewing)
   */
  getViewUrl(fileId: string, userId: string): string {
    return `${this.baseUrl}/api/files/view/${fileId}?userId=${userId}`;
  }

  /**
   * Get presigned download URL
   */
  async getPresignedDownloadUrl(
    fileId: string, 
    userId: string, 
    expirySeconds: number = 3600
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/files/presigned-url/${fileId}?userId=${userId}&expirySeconds=${expirySeconds}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.downloadUrl;
      } else {
        console.error('Failed to get presigned URL:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      return null;
    }
  }

  /**
   * Download file as blob
   */
  async downloadFileAsBlob(fileId: string, userId: string): Promise<Blob | null> {
    try {
      const response = await fetch(this.getDownloadUrl(fileId, userId), {
        method: 'GET',
      });

      if (response.ok) {
        return await response.blob();
      } else {
        console.error('Failed to download file:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      return null;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/files/${fileId}?userId=${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.success;
      } else {
        console.error('Failed to delete file:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get user's files
   */
  async getUserFiles(
    userId: string, 
    page: number = 0, 
    size: number = 20
  ): Promise<{ content: FileMetadata[]; totalPages: number; totalElements: number } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/files/user/${userId}?requestingUserId=${userId}&page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to get user files:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error getting user files:', error);
      return null;
    }
  }

  /**
   * Get files accessible by user
   */
  async getAccessibleFiles(
    userId: string, 
    page: number = 0, 
    size: number = 20
  ): Promise<{ content: FileMetadata[]; totalPages: number; totalElements: number } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/files/accessible?userId=${userId}&page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to get accessible files:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error getting accessible files:', error);
      return null;
    }
  }

  /**
   * Get user's storage statistics
   */
  async getStorageStats(userId: string): Promise<{ fileCount: number; totalSizeBytes: number; totalSizeMB: number } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/files/stats/${userId}?requestingUserId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to get storage stats:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }

  /**
   * Check if service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/files/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Backend file service not available:', error);
      return false;
    }
  }
}

// Export singleton instance
export const backendFileService = new BackendFileService();

// Export class for testing
export { BackendFileService };