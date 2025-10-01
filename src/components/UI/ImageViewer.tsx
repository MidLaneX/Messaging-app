/**
 * Image Viewer Modal Component
 * A modern, responsive image viewer with blur overlay
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { FileAttachment } from '../../types';
import { backendFileService } from '../../services/backendFileService';
import { formatFileSize } from '../../utils/fileConfig';

interface ImageViewerProps {
  /** File attachment data */
  fileAttachment: FileAttachment;
  /** Current user ID for access control */
  currentUserId: string;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  fileAttachment,
  currentUserId,
  isOpen,
  onClose,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Generate image URL when component mounts or fileAttachment changes
  useEffect(() => {
    if (isOpen && fileAttachment.fileId) {
      const viewUrl = backendFileService.getViewUrl(fileAttachment.fileId, currentUserId);
      setImageUrl(viewUrl);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen, fileAttachment.fileId, currentUserId]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleDownload = useCallback(async () => {
    if (isDownloading || !fileAttachment.fileId) return;

    setIsDownloading(true);
    try {
      const downloadUrl = backendFileService.getDownloadUrl(fileAttachment.fileId, currentUserId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileAttachment.originalName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [fileAttachment, currentUserId, isDownloading]);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
    >
      {/* Blurred Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-300"
        style={{ backdropFilter: 'blur(8px)' }}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 max-w-7xl max-h-full w-full">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-pink-600">🖼️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 truncate max-w-md" title={fileAttachment.originalName}>
                {fileAttachment.originalName}
              </h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(fileAttachment.fileSize)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium"
              title="Download image"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl overflow-hidden shadow-lg">
          <div className="relative bg-gray-50 flex items-center justify-center min-h-[400px] max-h-[calc(100vh-200px)]">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={fileAttachment.originalName}
                className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
            ) : null}

            {/* Loading State */}
            {imageUrl && !imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
                  <p className="text-gray-600 font-medium">Loading image...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {(imageError || !imageUrl) && (
              <div className="flex flex-col items-center space-y-4 text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-medium">Unable to load image</p>
                  <p className="text-sm">The image might be corrupted or unavailable</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;