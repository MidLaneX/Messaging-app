/**
 * Local File Storage Service
 * Simulates file storage for testing purposes
 * In production, this would be replaced with actual cloud storage
 */

export interface StoredFile {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  data: string; // Base64 encoded file data
}

class LocalFileStorageService {
  private readonly STORAGE_KEY = 'messaging_app_shared_files'; // Shared across all users

  /**
   * Store a file in localStorage for testing
   */
  async storeFile(file: File, uploadedBy: string): Promise<{ fileId: string; fileUrl: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const base64Data = reader.result as string;
          
          const storedFile: StoredFile = {
            id: fileId,
            fileName: `${Date.now()}_${file.name}`,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedBy,
            uploadedAt: new Date().toISOString(),
            data: base64Data,
          };

          // Get existing files
          const existingFiles = this.getStoredFiles();
          existingFiles[fileId] = storedFile;
          
          // Store back to localStorage
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFiles));
          
          // Create a downloadable URL
          const fileUrl = `local-storage://${fileId}`;
          
          console.log('✅ File stored locally:', { fileId, fileUrl, size: file.size });
          resolve({ fileId, fileUrl });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Retrieve a file from localStorage
   */
  getFile(fileId: string): StoredFile | null {
    const files = this.getStoredFiles();
    return files[fileId] || null;
  }

  /**
   * Create a blob URL for a stored file
   */
  createBlobUrl(fileId: string): string | null {
    const storedFile = this.getFile(fileId);
    if (!storedFile) return null;

    try {
      // Convert base64 back to blob
      const response = fetch(storedFile.data);
      response.then(res => res.blob()).then(blob => {
        return URL.createObjectURL(blob);
      });
      
      // For immediate use, create from base64
      const byteCharacters = atob(storedFile.data.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: storedFile.mimeType });
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to create blob URL:', error);
      return null;
    }
  }

  /**
   * Download a file by fileId
   */
  downloadFile(fileId: string): void {
    const storedFile = this.getFile(fileId);
    if (!storedFile) {
      throw new Error('File not found');
    }

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = storedFile.data;
      link.download = storedFile.originalName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ File download triggered:', storedFile.originalName);
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }

  /**
   * Get all stored files
   */
  private getStoredFiles(): Record<string, StoredFile> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse stored files:', error);
      return {};
    }
  }

  /**
   * Clear all stored files (for testing)
   */
  clearAllFiles(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ All stored files cleared');
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { fileCount: number; totalSize: number } {
    const files = this.getStoredFiles();
    const fileCount = Object.keys(files).length;
    const totalSize = Object.values(files).reduce((sum, file) => sum + file.size, 0);
    
    return { fileCount, totalSize };
  }
}

export const localFileStorage = new LocalFileStorageService();