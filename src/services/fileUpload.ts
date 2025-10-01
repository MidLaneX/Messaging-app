/**
 * File Upload Service using Cloudflare R2
 * Provides secure file upload with progress tracking
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Config, validateFile, generateSecureFilename } from '../utils/fileConfig';

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
  error?: string;
}

export interface FileMetadata {
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

class FileUploadService {
  private s3Client: S3Client;
  private config: any;

  constructor() {
    try {
      console.log("🚀 Initializing FileUploadService...");
      this.config = getR2Config();
      console.log("⚙️ R2 Config loaded:", {
        endpoint: this.config.endpoint,
        bucketName: this.config.bucketName,
        region: this.config.region,
        hasAccessKey: !!this.config.accessKey,
        hasSecretKey: !!this.config.secretKey
      });
      
      this.s3Client = new S3Client({
        region: this.config.region,
        endpoint: this.config.endpoint,
        credentials: {
          accessKeyId: this.config.accessKey,
          secretAccessKey: this.config.secretKey,
        },
        forcePathStyle: true, // Required for R2
        // Browser-specific configuration
        requestHandler: {
          requestTimeout: 60000, // 60 seconds
          httpsAgent: undefined,
        },
        // Disable request signing issues in browser
        runtime: 'browser',
      });
      
      console.log("✅ S3 Client initialized successfully");
    } catch (error) {
      console.error('❌ Failed to initialize file upload service:', error);
      throw error;
    }
  }

  /**
   * Upload file using XMLHttpRequest as fallback for browser compatibility
   */
  private async uploadFileWithXHR(
    file: File,
    fileName: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      // Create the full URL for the upload
      const uploadUrl = `${this.config.endpoint}/${this.config.bucketName}/${fileName}`;
      
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
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true });
        } else {
          console.error('XHR upload failed:', xhr.status, xhr.statusText, xhr.responseText);
          resolve({ success: false, error: `Upload failed: ${xhr.status} ${xhr.statusText}` });
        }
      });
      
      // Handle errors
      xhr.addEventListener('error', () => {
        console.error('XHR upload error:', xhr.statusText);
        resolve({ success: false, error: 'Network error during upload' });
      });
      
      // Set up the request
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      
      // Send the file directly (not as FormData for PUT requests)
      xhr.send(file);
    });
  }
  async uploadFile(
    file: File, 
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log("🔄 Starting file upload:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: userId
      });

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        console.error("❌ File validation failed:", validation.error);
        return { success: false, error: validation.error };
      }

      console.log("✅ File validation passed");

      // Generate secure filename
      const fileName = generateSecureFilename(file.name, userId);
      console.log("🔗 Generated secure filename:", fileName);
      
      // Convert File to ArrayBuffer for better compatibility
      const fileBuffer = await file.arrayBuffer();
      console.log("🔄 File converted to ArrayBuffer, size:", fileBuffer.byteLength);
      
      // Create upload command with ArrayBuffer instead of File
      const uploadCommand = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
        ContentLength: file.size,
        Metadata: {
          originalName: file.name,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      });

      console.log("📤 Upload command created:", {
        bucket: this.config.bucketName,
        key: fileName,
        contentType: file.type
      });

      // Try AWS SDK first, fall back to XHR if it fails
      let uploadSuccess = false;
      try {
        console.log("📤 Attempting upload with AWS SDK...");
        
        if (onProgress) {
          onProgress({ loaded: 0, total: file.size, percentage: 0 });
        }
        
        await this.s3Client.send(uploadCommand);
        uploadSuccess = true;
        
        if (onProgress) {
          onProgress({ loaded: file.size, total: file.size, percentage: 100 });
        }
        
        console.log("✅ AWS SDK upload successful");
        
      } catch (awsError) {
        console.warn("⚠️ AWS SDK upload failed, trying XHR fallback:", awsError);
        
        // Try XHR fallback
        const xhrResult = await this.uploadFileWithXHR(file, fileName, onProgress);
        if (!xhrResult.success) {
          throw new Error(xhrResult.error || 'Both AWS SDK and XHR upload methods failed');
        }
        uploadSuccess = true;
        console.log("✅ XHR fallback upload successful");
      }        console.log("✅ Upload completed successfully");

        // Generate file URL
        const fileUrl = `${this.config.endpoint}/${this.config.bucketName}/${fileName}`;
        console.log("🔗 Generated file URL:", fileUrl);

        const result = {
          success: true,
          fileUrl,
          fileName,
          fileSize: file.size,
          mimeType: file.type,
        };

        console.log("🎉 Upload result:", result);
        return result;    } catch (error) {
      console.error("❌ File upload failed:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Generate a signed URL for secure file download
   */
  async generateDownloadUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileName,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Failed to generate download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Get file metadata from URL
   */
  getFileMetadataFromUrl(fileUrl: string): { fileName: string; isR2File: boolean } {
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const isR2File = url.hostname.includes('r2.cloudflarestorage.com') || 
                       url.hostname.includes(this.config.bucketName);
      
      return { fileName, isR2File };
    } catch (error) {
      return { fileName: '', isR2File: false };
    }
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    try {
      getR2Config();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();

// Export class for testing
export { FileUploadService };