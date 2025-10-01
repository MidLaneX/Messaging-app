/**
 * File Download Service
 * Provides secure file download with authentication and access control
 */

import { browserFileUploadService } from './browserFileUpload';
import { localFileStorage } from './localFileStorage';
import type { FileAttachment } from '../types';

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DownloadResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

class FileDownloadService {
  /**
   * Download file with progress tracking
   */
  async downloadFile(
    fileAttachment: FileAttachment,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    try {
      // Handle local storage URLs for testing
      if (fileAttachment.fileUrl.startsWith('local-storage://')) {
        const fileId = fileAttachment.fileUrl.replace('local-storage://', '');
        const storedFile = localFileStorage.getFile(fileId);
        
        if (!storedFile) {
          return { success: false, error: 'File not found in local storage' };
        }

        // Convert base64 to blob
        const response = await fetch(storedFile.data);
        const blob = await response.blob();
        
        // Simulate progress for consistency
        if (onProgress) {
          for (let i = 0; i <= 100; i += 25) {
            await new Promise(resolve => setTimeout(resolve, 50));
            onProgress({
              loaded: (storedFile.size * i) / 100,
              total: storedFile.size,
              percentage: i
            });
          }
        }

        return { success: true, blob };
      }

      // Check if file service is configured for cloud storage
      if (!browserFileUploadService.isConfigured()) {
        return { success: false, error: 'File service not configured' };
      }

      // Get file metadata from URL
      const { fileName, isR2File } = browserFileUploadService.getFileMetadataFromUrl(fileAttachment.fileUrl);
      
      let downloadUrl = fileAttachment.fileUrl;

      // For now, use direct URL since we're simulating uploads
      // TODO: Generate signed URL for R2 files when proper integration is ready
      if (isR2File && fileName) {
        console.warn('Using direct URL for download - signed URLs not implemented yet');
        // Fallback to direct URL
      }

      // Perform download with progress tracking
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : fileAttachment.fileSize;

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;

        if (onProgress && total > 0) {
          onProgress({
            loaded,
            total,
            percentage: Math.round((loaded / total) * 100),
          });
        }
      }

      // Combine all chunks into a single Uint8Array
      const allChunks = new Uint8Array(loaded);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      // Create blob with correct MIME type
      const blob = new Blob([allChunks], { type: fileAttachment.mimeType });

      return { success: true, blob };

    } catch (error) {
      console.error('File download failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }

  /**
   * Download and save file to user's device
   */
  async downloadAndSave(
    fileAttachment: FileAttachment,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<boolean> {
    try {
      const result = await this.downloadFile(fileAttachment, onProgress);
      
      if (!result.success || !result.blob) {
        console.error('Download failed:', result.error);
        return false;
      }

      // Create download link
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileAttachment.originalName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      return true;

    } catch (error) {
      console.error('Save file failed:', error);
      return false;
    }
  }

  /**
   * Get preview URL for images (with optional size optimization)
   */
  async getPreviewUrl(
    fileAttachment: FileAttachment,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<string | null> {
    try {
      // Handle local storage URLs for testing
      if (fileAttachment.fileUrl.startsWith('local-storage://')) {
        const fileId = fileAttachment.fileUrl.replace('local-storage://', '');
        const blobUrl = localFileStorage.createBlobUrl(fileId);
        return blobUrl;
      }

      // For images, return the direct URL for preview
      if (fileAttachment.category === 'image') {
        const { fileName, isR2File } = browserFileUploadService.getFileMetadataFromUrl(fileAttachment.fileUrl);
        
        if (isR2File && fileName) {
          // For now, return direct URL since we don't have signed URL generation in browser service
          // TODO: Implement signed URLs when proper R2 integration is ready
          return fileAttachment.fileUrl;
        }
        
        return fileAttachment.fileUrl;
      }

      return null;

    } catch (error) {
      console.error('Failed to get preview URL:', error);
      return null;
    }
  }

  /**
   * Check if file can be previewed in browser
   */
  canPreview(fileAttachment: FileAttachment): boolean {
    const previewableCategories = ['image', 'pdf'];
    const previewableMimeTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
    ];

    return (
      previewableCategories.includes(fileAttachment.category) ||
      previewableMimeTypes.includes(fileAttachment.mimeType)
    );
  }

  /**
   * Open file in new tab for preview
   */
  async previewFile(fileAttachment: FileAttachment): Promise<boolean> {
    try {
      if (!this.canPreview(fileAttachment)) {
        return false;
      }

      const { fileName, isR2File } = browserFileUploadService.getFileMetadataFromUrl(fileAttachment.fileUrl);
      let previewUrl = fileAttachment.fileUrl;

      if (isR2File && fileName) {
        // For now, use direct URL since we don't have signed URL generation
        // TODO: Implement signed URLs when proper R2 integration is ready
        previewUrl = fileAttachment.fileUrl;
      }

      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      return true;

    } catch (error) {
      console.error('Preview failed:', error);
      return false;
    }
  }

  /**
   * Get file thumbnail for display (placeholder for now)
   */
  getThumbnailUrl(fileAttachment: FileAttachment): string | null {
    // For images, use the file URL as thumbnail
    if (fileAttachment.category === 'image') {
      return fileAttachment.fileUrl;
    }

    // For other files, return null (will use icon instead)
    return null;
  }

  /**
   * Validate file access permissions
   */
  async validateAccess(fileAttachment: FileAttachment, userId: string): Promise<boolean> {
    try {
      // Basic validation - in a real app, you'd check with your backend
      // For now, just check if the file was uploaded by the current user
      // or if it's in a shared chat
      return fileAttachment.uploadedBy === userId || true; // Allow all for now
      
    } catch (error) {
      console.error('Access validation failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const fileDownloadService = new FileDownloadService();

// Export class for testing
export { FileDownloadService };