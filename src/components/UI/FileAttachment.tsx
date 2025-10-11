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
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log("FileAttachment component rendered with data:", {
      fileId: fileAttachment.fileId,
      originalName: fileAttachment.originalName,
      category: fileAttachment.category,
      currentUserId,
      fullAttachment: fileAttachment,
    });
  }, [fileAttachment, currentUserId]);

  const handleDownload = useCallback(async () => {
    if (isDownloading || !fileAttachment.fileId) {
      console.log("Download blocked:", {
        isDownloading,
        fileId: fileAttachment.fileId,
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(null);

    try {
      // Create a download link using the backend download URL
      const downloadUrl = backendFileService.getDownloadUrl(
        fileAttachment.fileId,
        currentUserId
      );
      console.log("Download URL generated:", downloadUrl);

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileAttachment.originalName;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Download initiated for:", fileAttachment.originalName);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  }, [fileAttachment, currentUserId, isDownloading]);

  const handlePreview = useCallback(async () => {
    try {
      // Check if file can be previewed (images, PDFs, etc.)
      const canPreview = ["image", "pdf"].includes(fileAttachment.category);
      console.log("Preview attempt:", {
        canPreview,
        category: fileAttachment.category,
        fileId: fileAttachment.fileId,
      });

      if (!canPreview || !fileAttachment.fileId) {
        // For non-previewable files, just download
        await handleDownload();
        return;
      }

      if (fileAttachment.category === "image") {
        // For images, open the modal viewer
        setIsImageViewerOpen(true);
      } else {
        // For PDFs and other previewable files, open in new tab
        const viewUrl = backendFileService.getViewUrl(
          fileAttachment.fileId,
          currentUserId
        );
        console.log("View URL generated:", viewUrl);
        window.open(viewUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Preview failed:", error);
      await handleDownload();
    }
  }, [fileAttachment, currentUserId, handleDownload]);

  // Get preview URL for images immediately
  React.useEffect(() => {
    if (fileAttachment.category === "image" && fileAttachment.fileId) {
      console.log("Setting up image preview for:", fileAttachment.fileId);
      // Use the backend view URL for image previews (inline viewing)
      const imageUrl = backendFileService.getViewUrl(
        fileAttachment.fileId,
        currentUserId
      );
      console.log("Generated image URL:", imageUrl);
      setPreviewUrl(imageUrl);
      setImageError(false);
      setImageLoaded(false);
    }
  }, [fileAttachment, currentUserId]);

  const renderFileIcon = () => {
    const getIconColor = () => {
      switch (fileAttachment.category) {
        case "image":
          return "text-pink-600 bg-pink-50";
        case "pdf":
          return "text-red-600 bg-red-50";
        case "video":
          return "text-purple-600 bg-purple-50";
        case "audio":
          return "text-green-600 bg-green-50";
        case "archive":
          return "text-yellow-600 bg-yellow-50";
        case "document":
          return "text-blue-600 bg-blue-50";
        default:
          return "text-gray-600 bg-gray-50";
      }
    };

    return (
      <div
        className={`relative ${
          isMobile ? "w-12 h-12" : "w-16 h-16"
        } rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor()}`}
      >
        <span className={`${isMobile ? "text-xl" : "text-2xl"}`}>
          {fileAttachment.icon}
        </span>
        {/* File type badge */}
        <div className="absolute -top-1 -right-1 bg-white border border-gray-200 rounded-full p-1">
          <div
            className={`w-2 h-2 rounded-full ${getIconColor()
              .split(" ")[0]
              .replace("text-", "bg-")}`}
          ></div>
        </div>
      </div>
    );
  };

  const renderImagePreview = () => {
    console.log("Rendering image preview:", {
      previewUrl,
      imageError,
      imageLoaded,
      fileId: fileAttachment.fileId,
    });

    return (
      <div
        className={`relative ${
          isMobile ? "w-full h-48" : "w-full h-64"
        } bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden`}
      >
        {/* Always show image - let browser handle loading */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt={fileAttachment.originalName}
            className="w-full h-full object-cover"
            onLoad={() => {
              console.log("✅ Image loaded successfully:", previewUrl);
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={(e) => {
              console.error("❌ Image failed to load:", previewUrl, e);
              setImageError(true);
              setImageLoaded(false);
            }}
          />
        )}

        {/* Loading overlay */}
        {previewUrl && !imageLoaded && !imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent mb-2"></div>
            <span className="text-sm text-gray-600 font-medium">
              Loading image...
            </span>
          </div>
        )}

        {/* Error state overlay */}
        {(imageError || !previewUrl) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
            <div className="text-gray-400 mb-2">{renderFileIcon()}</div>
            <span className="text-sm text-gray-500">
              {imageError ? "Failed to load image" : "Loading preview..."}
            </span>
          </div>
        )}

        {/* File name overlay at bottom - only show when image is loaded */}
        {imageLoaded && !imageError && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent p-3">
            <p className="text-white text-sm font-medium truncate">
              {fileAttachment.originalName}
            </p>
            <p className="text-white/80 text-xs">
              {formatFileSize(fileAttachment.fileSize)}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render for images - WhatsApp style with preview
  if (fileAttachment.category === "image") {
    return (
      <div
        className={`${
          isMobile ? "max-w-[280px]" : "max-w-sm"
        } rounded-lg overflow-hidden`}
      >
        {/* Image Preview */}
        <div
          onClick={() => setIsImageViewerOpen(true)}
          className="cursor-pointer relative group"
        >
          {renderImagePreview()}

          {/* Hover overlay with download button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110"
              title="Download image"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          </div>
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
  }

  // Render for other files - WhatsApp style compact card
  return (
    <div
      className={`${isMobile ? "max-w-[280px]" : "max-w-sm"} ${
        isMobile ? "p-3" : "p-4"
      } bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200`}
    >
      {/* File Icon and Info */}
      <div className="flex items-center space-x-3">
        {renderFileIcon()}
        <div className="flex-1 min-w-0">
          <h4
            className={`${
              isMobile ? "text-sm" : "text-base"
            } font-semibold text-gray-900 truncate`}
            title={fileAttachment.originalName}
          >
            {fileAttachment.originalName}
          </h4>
          <div className="flex items-center space-x-2 mt-1">
            <span
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-gray-500 font-medium`}
            >
              {formatFileSize(fileAttachment.fileSize)}
            </span>
            <span className="text-gray-300">•</span>
            <span
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-gray-500 capitalize`}
            >
              {fileAttachment.category}
            </span>
          </div>
        </div>

        {/* Download button for files */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`${
            isMobile ? "p-2" : "p-2.5"
          } bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0`}
          title="Download file"
        >
          {isDownloading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Download Progress */}
      {downloadProgress && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Downloading
            </span>
            <span className="text-sm font-semibold text-emerald-600">
              {downloadProgress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${downloadProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* PDF Preview Button */}
      {fileAttachment.category === "pdf" && (
        <button
          onClick={handlePreview}
          disabled={isDownloading}
          className={`w-full mt-3 ${
            isMobile ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
          } bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium border border-gray-200 hover:border-gray-300`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          {isDownloading ? "Opening..." : "Open PDF"}
        </button>
      )}
    </div>
  );
};

export default FileAttachment;