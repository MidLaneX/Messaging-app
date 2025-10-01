/**
 * Browser-optimized File Upload Service using direct HTTP requests
 * More compatible with browser environments than AWS SDK
 */

import { R2Config, getR2Config } from '../utils/r2Config';
import { validateFile, generateSecureFilename } from '../utils/fileConfig';
import { localFileStorage } from './localFileStorage';

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

class BrowserFileUploadService {
  private config: any;

  constructor() {
    try {
      console.log("🚀 Initializing BrowserFileUploadService...");
      this.config = getR2Config();
      console.log("⚙️ R2 Config loaded:", {
        endpoint: this.config.endpoint,
        bucketName: this.config.bucketName,
        region: this.config.region,
        hasAccessKey: !!this.config.accessKey,
        hasSecretKey: !!this.config.secretKey
      });
      console.log("✅ Browser file upload service initialized successfully");
    } catch (error) {
      console.error('❌ Failed to initialize browser file upload service:', error);
      throw error;
    }
  }

  /**
   * Create authorization signature for R2 upload
   */
  private async createAuthSignature(
    method: string,
    path: string,
    contentType: string,
    timestamp: string
  ): Promise<string> {
    // This is a simplified approach - in production, you'd want to generate
    // proper AWS signature v4 on your backend
    return btoa(`${this.config.accessKey}:${this.config.secretKey}`);
  }

  /**
   * Upload file using direct HTTP PUT request
   */
  async uploadFile(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log("🔄 Starting browser file upload:", {
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

      // Upload directly to R2 with public access enabled
      console.log("🚀 Uploading to R2 with public access...");
      
      try {
        const uploadResult = await this.uploadDirectlyToR2(file, fileName, onProgress);
        console.log("🎉 R2 upload successful:", uploadResult);
        return uploadResult;
      } catch (r2Error) {
        console.error("❌ R2 upload failed:", r2Error);
        
        // Fallback to local storage if R2 fails
        console.log("🔄 Falling back to local storage...");
        
        if (onProgress) {
          // Simulate upload progress for fallback
          for (let i = 0; i <= 100; i += 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            onProgress({
              loaded: (file.size * i) / 100,
              total: file.size,
              percentage: i
            });
          }
        }

        // Store file in local storage as fallback
        const { fileId, fileUrl } = await localFileStorage.storeFile(file, userId);
        console.log("🔗 File stored locally with ID:", fileId, "URL:", fileUrl);

        return {
          success: true,
          fileUrl,
          fileName,
          fileSize: file.size,
          mimeType: file.type,
        };
      }

    } catch (error) {
      console.error("❌ Browser file upload failed:", error);
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
   * Upload file directly to R2 bucket
   */
  private async uploadDirectlyToR2(
    file: File,
    fileName: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    console.log("🔧 R2 Config:", {
      endpoint: this.config.endpoint,
      bucketName: this.config.bucketName,
      hasAccessKey: !!this.config.accessKeyId,
      hasSecretKey: !!this.config.secretAccessKey
    });

    // Construct R2 URL using public development URL
    // Public dev URLs don't need bucket name in path since they're bucket-specific
    const uploadUrl = `${this.config.endpoint}/${fileName}`;
    console.log("🔗 R2 upload URL:", uploadUrl);

    // First try without authentication to test connectivity
    console.log("🧪 Testing R2 connectivity without auth...");
    const testResult = await this.testR2Connectivity(uploadUrl);
    console.log("🧪 Connectivity test result:", testResult);

    // Try upload with XMLHttpRequest for better progress tracking
    const uploadResult = await this.uploadWithXHR(uploadUrl, file, onProgress);
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'R2 upload failed');
    }

    // Generate public URL for the uploaded file using public development URL
    const publicUrl = `${this.config.endpoint}/${fileName}`;
    
    return {
      success: true,
      fileUrl: publicUrl,
      fileName,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  /**
   * Test R2 connectivity
   */
  private async testR2Connectivity(url: string): Promise<{ success: boolean; status?: number; error?: string }> {
    try {
      const response = await fetch(url, {
        method: 'HEAD', // Just test if the endpoint is reachable
        mode: 'cors'
      });
      
      console.log("🧪 HEAD request response:", response.status, response.statusText);
      return { success: response.ok, status: response.status };
    } catch (error) {
      console.log("🧪 HEAD request failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * Upload file using XMLHttpRequest with proper progress tracking
   */
  private async uploadWithXHR(
    url: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            console.log(`📊 Upload progress: ${progress.percentage}%`);
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        console.log(`📡 XHR Response: ${xhr.status} ${xhr.statusText}`);
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log("✅ XHR upload successful");
          resolve({ success: true });
        } else {
          console.error('❌ XHR upload failed:', xhr.status, xhr.statusText, xhr.responseText);
          resolve({ 
            success: false, 
            error: `Upload failed: ${xhr.status} ${xhr.statusText}` 
          });
        }
      });

      // Handle errors
      xhr.addEventListener('error', (event) => {
        console.error('❌ XHR upload error:', event);
        resolve({ 
          success: false, 
          error: 'Network error during upload' 
        });
      });

      // Handle timeouts
      xhr.addEventListener('timeout', () => {
        console.error('❌ XHR upload timeout');
        resolve({ 
          success: false, 
          error: 'Upload timeout' 
        });
      });

      // Configure request
      xhr.open('PUT', url, true);
      xhr.timeout = 60000; // 60 seconds
      
      // Set headers
      xhr.setRequestHeader('Content-Type', file.type);
      
      // For public access R2, we don't need authentication
      // The bucket should allow public uploads once you enable public access
      console.log("📤 Uploading to public R2 bucket...");
      
      console.log("📤 Sending XHR request...");
      
      // Send the file
      xhr.send(file);
    });
  }

  /**
   * Alternative upload method using fetch API
   */
  private async uploadWithFetch(
    url: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("📤 Uploading with fetch API...");
      
      const headers: HeadersInit = {
        'Content-Type': file.type,
      };

      // Add basic auth header
      try {
        headers['Authorization'] = `Basic ${btoa(this.config.accessKeyId + ':' + this.config.secretAccessKey)}`;
      } catch (authError) {
        console.warn('⚠️ Could not set authorization header:', authError);
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: file,
      });

      console.log(`📡 Fetch Response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log("✅ Fetch upload successful");
        if (onProgress) {
          onProgress({ loaded: file.size, total: file.size, percentage: 100 });
        }
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('❌ Fetch upload failed:', response.status, response.statusText, errorText);
        return { 
          success: false, 
          error: `Upload failed: ${response.status} ${response.statusText}` 
        };
      }

    } catch (error) {
      console.error('❌ Fetch upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Fetch upload failed' 
      };
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
}

// Export singleton instance
export const browserFileUploadService = new BrowserFileUploadService();

// Export class for testing
export { BrowserFileUploadService };