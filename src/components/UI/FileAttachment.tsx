/**
 * File Attachment Component
 * A modern, responsive file attachment component with download/preview capabilities
 * Optimized for both desktop and mobile experiences
 */

import React, { useState, useCallback } from 'react';
import type { FileAttachment as FileAttachmentType } from '../../types';
import { backendFileService } from '../../services/backendFileService';
import { formatFileSize } from '../../utils/fileConfig';
import ImageViewer from './ImageViewer';

interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

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
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('FileAttachment component rendered with data:', {
      fileId: fileAttachment.fileId,
      originalName: fileAttachment.originalName,
      category: fileAttachment.category,
      currentUserId,
      fullAttachment: fileAttachment
    });
  }, [fileAttachment, currentUserId]);

  const handleDownload = useCallback(async () => {
    if (isDownloading || !fileAttachment.fileId) {
      console.log('Download blocked:', { isDownloading, fileId: fileAttachment.fileId });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(null);

    try {
      // Create a download link using the backend download URL
      const downloadUrl = backendFileService.getDownloadUrl(fileAttachment.fileId, currentUserId);
      console.log('Download URL generated:', downloadUrl);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileAttachment.originalName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download initiated for:', fileAttachment.originalName);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  }, [fileAttachment, currentUserId, isDownloading]);

  const handlePreview = useCallback(async () => {
    try {
      // Check if file can be previewed (images, PDFs, etc.)
      const canPreview = ['image', 'pdf'].includes(fileAttachment.category);
      console.log('Preview attempt:', { canPreview, category: fileAttachment.category, fileId: fileAttachment.fileId });
      
      if (!canPreview || !fileAttachment.fileId) {
        // For non-previewable files, just download
        await handleDownload();
        return;
      }

      if (fileAttachment.category === 'image') {
        // For images, open the modal viewer
        setIsImageViewerOpen(true);
      } else {
        // For PDFs and other previewable files, open in new tab
        const viewUrl = backendFileService.getViewUrl(fileAttachment.fileId, currentUserId);
        console.log('View URL generated:', viewUrl);
        window.open(viewUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Preview failed:', error);
      await handleDownload();
    }
  }, [fileAttachment, currentUserId, handleDownload]);

  // Get preview URL for images
  React.useEffect(() => {
    if (fileAttachment.category === 'image' && fileAttachment.fileId) {
      // Use the backend view URL for image previews
      const viewUrl = backendFileService.getViewUrl(fileAttachment.fileId, currentUserId);
      setPreviewUrl(viewUrl);
    }
  }, [fileAttachment, currentUserId]);

  const renderFileIcon = () => {
    const getIconColor = () => {
      switch (fileAttachment.category) {
        case 'image': return 'text-pink-600 bg-pink-50';
        case 'pdf': return 'text-red-600 bg-red-50';
        case 'video': return 'text-purple-600 bg-purple-50';
        case 'audio': return 'text-green-600 bg-green-50';
        case 'archive': return 'text-yellow-600 bg-yellow-50';
        case 'document': return 'text-blue-600 bg-blue-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    };

    return (
      <div className={`relative ${
        isMobile ? 'w-12 h-12' : 'w-16 h-16'
      } rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor()}`}>
        <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
          {fileAttachment.icon}
        </span>
        {/* File type badge */}
        <div className="absolute -top-1 -right-1 bg-white border border-gray-200 rounded-full p-1">
          <div className={`w-2 h-2 rounded-full ${getIconColor().split(' ')[0].replace('text-', 'bg-')}`}></div>
        </div>
      </div>
    );
  };

  const renderImagePreview = () => {
    if (!previewUrl || imageError) {
      return renderFileIcon();
    }

    return (
      <div className={`relative ${
        isMobile ? 'w-full h-32' : 'w-full h-40'
      } bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0 group`}>
        <img
          src={previewUrl}
          alt={fileAttachment.originalName}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } group-hover:scale-105`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
        
        {/* Loading state */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            {renderFileIcon()}
          </div>
        )}
        
        {/* Preview overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setIsImageViewerOpen(true)}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
              title="Preview image"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Image size indicator */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {formatFileSize(fileAttachment.fileSize)}
        </div>
      </div>
    );
  };

  return (
    <div className={`${
      isMobile ? 'max-w-[280px]' : 'max-w-sm'
    } ${
      isMobile ? 'p-3' : 'p-4'
    } bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group`}>
      
      {/* File Preview/Icon */}
      <div className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
        {fileAttachment.category === 'image' ? (
          <div onClick={() => setIsImageViewerOpen(true)} className="cursor-pointer">
            {renderImagePreview()}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {renderFileIcon()}
            <div className="flex-1 min-w-0">
              <h4 className={`${
                isMobile ? 'text-sm' : 'text-base'
              } font-semibold text-gray-900 truncate`} title={fileAttachment.originalName}>
                {fileAttachment.originalName}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`${
                  isMobile ? 'text-xs' : 'text-sm'
                } text-gray-500 font-medium`}>
                  {formatFileSize(fileAttachment.fileSize)}
                </span>
                <span className="text-gray-300">•</span>
                <span className={`${
                  isMobile ? 'text-xs' : 'text-sm'
                } text-gray-500 capitalize`}>
                  {fileAttachment.category}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Info for Images */}
      {fileAttachment.category === 'image' && (
        <div className="mb-3">
          <h4 className={`${
            isMobile ? 'text-sm' : 'text-base'
          } font-semibold text-gray-900 truncate mb-1`} title={fileAttachment.originalName}>
            {fileAttachment.originalName}
          </h4>
          <div className="flex items-center space-x-2">
            <span className={`${
              isMobile ? 'text-xs' : 'text-sm'
            } text-gray-500 font-medium`}>
              Image
            </span>
          </div>
        </div>
      )}

      {/* Download Progress */}
      {downloadProgress && (
        <div className="mb-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Downloading</span>
            <span className="text-sm font-semibold text-emerald-600">{downloadProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${downloadProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex ${fileAttachment.category === 'image' ? 'gap-2' : 'gap-2'}`}>
        {fileAttachment.category === 'image' ? (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full ${
              isMobile ? 'px-3 py-2.5 text-xs' : 'px-4 py-2.5 text-sm'
            } bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md`}
            title="Download file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
        ) : ['pdf'].includes(fileAttachment.category) ? (
          <>
            <button
              onClick={handlePreview}
              disabled={isDownloading}
              className={`flex-1 ${
                isMobile ? 'px-3 py-2.5 text-xs' : 'px-4 py-2.5 text-sm'
              } bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isDownloading ? 'Opening...' : 'Open'}
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`${
                isMobile ? 'px-3 py-2.5' : 'px-4 py-2.5'
              } bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center border border-gray-200 hover:border-gray-300`}
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
              isMobile ? 'px-3 py-3 text-xs' : 'px-4 py-3 text-sm'
            } bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md`}
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
        )}
      </div>

      {/* Image Viewer Modal */}
      <ImageViewer
        fileAttachment={fileAttachment}
        currentUserId={currentUserId}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />
    </div>
  );
};

export default FileAttachment;