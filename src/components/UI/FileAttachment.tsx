/**
 * File Attachment Component
 * Displays file attachments with download/preview capabilities
 */

import React, { useState, useCallback } from 'react';
import type { FileAttachment as FileAttachmentType } from '../../types';
import { fileDownloadService, DownloadProgress } from '../../services/fileDownload';
import { formatFileSize } from '../../utils/fileConfig';

interface FileAttachmentProps {
  /** File attachment data */
  fileAttachment: FileAttachmentType;
  /** Current user ID for access control */
  currentUserId: string;
  /** Whether this is displayed on mobile */
  isMobile?: boolean;
  /** Whether this is the current user's message */
  isCurrentUser?: boolean;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  fileAttachment,
  currentUserId,
  isMobile = false,
  isCurrentUser = false,
}) => {
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(null);

    try {
      const success = await fileDownloadService.downloadAndSave(
        fileAttachment,
        (progress: DownloadProgress) => setDownloadProgress(progress)
      );

      if (!success) {
        alert('Failed to download file. Please try again.');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  }, [fileAttachment, isDownloading]);

  const handlePreview = useCallback(async () => {
    try {
      const canPreview = fileDownloadService.canPreview(fileAttachment);
      if (!canPreview) {
        // For non-previewable files, just download
        await handleDownload();
        return;
      }

      const success = await fileDownloadService.previewFile(fileAttachment);
      if (!success) {
        // Fallback to download
        await handleDownload();
      }
    } catch (error) {
      console.error('Preview failed:', error);
      await handleDownload();
    }
  }, [fileAttachment, handleDownload]);

  // Get preview URL for images
  React.useEffect(() => {
    if (fileAttachment.category === 'image') {
      fileDownloadService.getPreviewUrl(fileAttachment)
        .then((url: string | null) => {
          if (url) {
            setPreviewUrl(url);
          }
        })
        .catch((error: any) => {
          console.error('Failed to get preview URL:', error);
          setImageError(true);
        });
    }
  }, [fileAttachment]);

  const renderFileIcon = () => (
    <div className={`${
      isMobile ? 'w-8 h-8 text-lg' : 'w-10 h-10 text-xl'
    } bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
      <span>{fileAttachment.icon}</span>
    </div>
  );

  const renderImagePreview = () => {
    if (!previewUrl || imageError) {
      return renderFileIcon();
    }

    return (
      <div className={`relative ${
        isMobile ? 'w-32 h-24' : 'w-40 h-32'
      } bg-gray-100 rounded-lg overflow-hidden flex-shrink-0`}>
        <img
          src={previewUrl}
          alt={fileAttachment.originalName}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            {renderFileIcon()}
          </div>
        )}
        {/* Preview overlay for images */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <button
            onClick={handlePreview}
            className="bg-white bg-opacity-90 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
            title="Preview image"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-xs ${
      isMobile ? 'p-3' : 'p-4'
    } bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200`}>
      {/* File Preview/Icon */}
      <div className="mb-3">
        {fileAttachment.category === 'image' ? renderImagePreview() : renderFileIcon()}
      </div>

      {/* File Info */}
      <div className="space-y-2">
        <div>
          <h4 className={`${
            isMobile ? 'text-sm' : 'text-base'
          } font-medium text-gray-900 truncate`} title={fileAttachment.originalName}>
            {fileAttachment.originalName}
          </h4>
          <p className={`${
            isMobile ? 'text-xs' : 'text-sm'
          } text-gray-500`}>
            {formatFileSize(fileAttachment.fileSize)}
          </p>
        </div>

        {/* Download Progress */}
        {downloadProgress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Downloading...</span>
              <span>{downloadProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {fileAttachment.category === 'image' ? (
            <>
              <button
                onClick={handlePreview}
                disabled={isDownloading}
                className={`flex-1 ${
                  isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                } bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`${
                  isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                } bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center`}
                title="Download file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </>
          ) : fileDownloadService.canPreview(fileAttachment) ? (
            <>
              <button
                onClick={handlePreview}
                disabled={isDownloading}
                className={`flex-1 ${
                  isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                } bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {isDownloading ? 'Loading...' : 'Open'}
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`${
                  isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                } bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center`}
                title="Download file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`w-full ${
                isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
              } bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileAttachment;