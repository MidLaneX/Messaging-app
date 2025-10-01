// Backend proxy upload service for production use
export interface BackendUploadResult {
  success: boolean;
  file?: {
    name: string;
    size: number;
    type: string;
    url: string;
    key: string;
  };
  error?: string;
  details?: string;
}

export interface PresignedUrlResult {
  success: boolean;
  uploadUrl?: string;
  publicUrl?: string;
  key?: string;
  error?: string;
  details?: string;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const backendUploadService = {
  // Direct upload through backend
  uploadFile: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<BackendUploadResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Progress tracking
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const errorResult = JSON.parse(xhr.responseText);
              resolve(errorResult);
            } catch {
              resolve({
                success: false,
                error: `Upload failed with status ${xhr.status}`,
              });
            }
          }
        };

        xhr.onerror = () => {
          resolve({
            success: false,
            error: 'Network error during upload',
          });
        };

        xhr.open('POST', `${BACKEND_URL}/api/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Get presigned URL for direct upload
  getPresignedUrl: async (
    filename: string,
    contentType: string
  ): Promise<PresignedUrlResult> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          contentType,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  // Upload using presigned URL
  uploadWithPresignedUrl: async (
    file: File,
    presignedUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            resolve({ success: true });
          } else {
            resolve({
              success: false,
              error: `Upload failed with status ${xhr.status}`,
            });
          }
        };

        xhr.onerror = () => {
          resolve({
            success: false,
            error: 'Network error during upload',
          });
        };

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};