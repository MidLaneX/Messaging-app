/**
 * File Upload Progress Component
 * Shows upload progress with cancel functionality
 */

import React from 'react';
import { formatFileSize } from '../../utils/fileConfig';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface FileUploadProgressProps {
  /** File being uploaded */
  file: File;
  /** Upload progress */
  progress: UploadProgress;
  /** Upload state */
  isUploading: boolean;
  /** Success state */
  isSuccess?: boolean;
  /** Error message */
  error?: string;
  /** Cancel upload callback */
  onCancel?: () => void;
  /** Retry upload callback */
  onRetry?: () => void;
  /** Whether component is displayed on mobile */
  isMobile?: boolean;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  file,
  progress,
  isUploading,
  isSuccess = false,
  error,
  onCancel,
  onRetry,
  isMobile = false,
}) => {
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📄';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📖';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '🗜️';
    return '📎';
  };

  return (
    <div className={`${
      isMobile ? 'p-3 mx-2' : 'p-4 mx-4'
    } bg-white border border-gray-200 rounded-lg shadow-sm max-w-xs`}>
      {/* File Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`${
          isMobile ? 'w-8 h-8 text-lg' : 'w-10 h-10 text-xl'
        } bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <span>{getFileIcon(file.type)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`${
            isMobile ? 'text-sm' : 'text-base'
          } font-medium text-gray-900 truncate`} title={file.name}>
            {file.name}
          </h4>
          <p className={`${
            isMobile ? 'text-xs' : 'text-sm'
          } text-gray-500`}>
            {formatFileSize(file.size)}
          </p>
        </div>

        {/* Action button */}
        {onCancel && isUploading && (
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Cancel upload"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Section */}
      <div className="space-y-2">
        {isUploading && (
          <>
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Uploading...</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatFileSize(progress.loaded)}</span>
                <span>{formatFileSize(progress.total)}</span>
              </div>
            </div>
          </>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 text-emerald-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
              Upload complete
            </span>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-red-600">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Upload failed
                </p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-red-500 mt-1`}>
                  {error}
                </p>
              </div>
            </div>
            
            {onRetry && (
              <button
                onClick={onRetry}
                className={`w-full ${
                  isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                } bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Upload
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadProgress;