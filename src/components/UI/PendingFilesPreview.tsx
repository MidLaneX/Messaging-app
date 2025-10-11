/**
 * Professional Pending Files Preview Component
 * Shows selected files with image previews before sending
 * Fully mobile optimized with modern UI
 */

import React, { useState, useEffect } from "react";
import {
  formatFileSize,
  getFileIcon,
  getFileCategory,
} from "../../utils/fileConfig";

interface PendingFilesPreviewProps {
  /** Files waiting to be sent */
  files: File[];
  /** Remove file callback */
  onRemoveFile: (index: number) => void;
  /** Whether component is displayed on mobile */
  isMobile?: boolean;
}

interface FilePreview extends File {
  previewUrl?: string;
  category: string;
  icon: string;
}

const PendingFilesPreview: React.FC<PendingFilesPreviewProps> = ({
  files,
  onRemoveFile,
  isMobile = false,
}) => {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);

  // Generate previews for files, especially images
  useEffect(() => {
    const generatePreviews = async () => {
      const previews = await Promise.all(
        files.map(async (file, index) => {
          const category = getFileCategory(file.type);
          const icon = getFileIcon(file.type);

          let previewUrl: string | undefined;

          // Generate preview for images
          if (category === "image") {
            try {
              previewUrl = URL.createObjectURL(file);
            } catch (error) {
              console.warn("Failed to create preview for image:", error);
            }
          }

          return {
            ...file,
            category,
            icon,
            previewUrl,
          } as FilePreview;
        })
      );

      setFilePreviews(previews);
    };

    if (files.length > 0) {
      generatePreviews();
    } else {
      setFilePreviews([]);
    }

    // Cleanup function to revoke object URLs
    return () => {
      filePreviews.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  const getFileTypeColors = (category: string) => {
    switch (category) {
      case "image":
        return {
          bg: "from-pink-50 to-purple-50",
          border: "border-pink-200",
          text: "text-pink-700",
          badge: "bg-pink-100 text-pink-700",
          icon: "bg-pink-500",
        };
      case "video":
        return {
          bg: "from-red-50 to-orange-50",
          border: "border-red-200",
          text: "text-red-700",
          badge: "bg-red-100 text-red-700",
          icon: "bg-red-500",
        };
      case "audio":
        return {
          bg: "from-blue-50 to-cyan-50",
          border: "border-blue-200",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-700",
          icon: "bg-blue-500",
        };
      case "pdf":
        return {
          bg: "from-red-50 to-pink-50",
          border: "border-red-200",
          text: "text-red-700",
          badge: "bg-red-100 text-red-700",
          icon: "bg-red-600",
        };
      case "document":
        return {
          bg: "from-blue-50 to-indigo-50",
          border: "border-blue-200",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-700",
          icon: "bg-blue-600",
        };
      case "archive":
        return {
          bg: "from-yellow-50 to-amber-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-700",
          icon: "bg-yellow-600",
        };
      default:
        return {
          bg: "from-gray-50 to-slate-50",
          border: "border-gray-200",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-700",
          icon: "bg-gray-500",
        };
    }
  };

  if (files.length === 0) return null;

  return (
    <div
      className={`${
        isMobile ? "px-3 py-2" : "px-4 py-3"
      } border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between ${
          isMobile ? "mb-2" : "mb-3"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`${
              isMobile ? "w-6 h-6" : "w-7 h-7"
            } bg-emerald-500 rounded-full flex items-center justify-center`}
          >
            <svg
              className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-white`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </div>
          <span
            className={`${
              isMobile ? "text-sm" : "text-base"
            } font-semibold text-gray-800`}
          >
            {files.length} file{files.length !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div
          className={`${
            isMobile ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
          } bg-emerald-100 text-emerald-700 rounded-full font-medium`}
        >
          Ready to send
        </div>
      </div>

      {/* Files Grid */}
      <div
        className={`grid ${
          isMobile
            ? files.length === 1
              ? "grid-cols-1"
              : files.length === 2
              ? "grid-cols-2 gap-2"
              : "grid-cols-2 gap-2"
            : files.length === 1
            ? "grid-cols-1 max-w-sm"
            : files.length === 2
            ? "grid-cols-2 gap-3"
            : files.length === 3
            ? "grid-cols-3 gap-3"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        }`}
      >
        {filePreviews.map((file, index) => {
          const colors = getFileTypeColors(file.category);

          return (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className={`relative bg-gradient-to-br ${colors.bg} ${colors.border} border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group`}
            >
              {/* Remove button */}
              <button
                onClick={() => onRemoveFile(index)}
                className={`absolute top-1.5 right-1.5 z-10 ${
                  isMobile ? "w-6 h-6" : "w-7 h-7"
                } bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-200 transform hover:scale-110 shadow-md`}
                title="Remove file"
              >
                <svg
                  className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* File Preview */}
              <div className={`${isMobile ? "p-2" : "p-3"}`}>
                {file.category === "image" && file.previewUrl ? (
                  /* Image Preview */
                  <div
                    className={`${
                      isMobile ? "h-24" : "h-32"
                    } bg-white rounded-lg overflow-hidden mb-2 shadow-inner relative`}
                  >
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Show fallback icon container
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          target.style.display = "none";
                          const fallback = parent.querySelector(
                            ".fallback-icon"
                          ) as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }
                      }}
                    />
                    {/* Fallback icon container */}
                    <div
                      className={`fallback-icon absolute inset-0 w-full h-full ${colors.icon} text-white items-center justify-center`}
                      style={{ display: "none" }}
                    >
                      <span className={`${isMobile ? "text-2xl" : "text-3xl"}`}>
                        {file.icon}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* File Icon Preview */
                  <div
                    className={`${
                      isMobile ? "h-16" : "h-20"
                    } bg-white rounded-lg overflow-hidden mb-2 shadow-inner flex items-center justify-center`}
                  >
                    <div
                      className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} ${
                        colors.icon
                      } rounded-full flex items-center justify-center text-white shadow-md`}
                    >
                      <span className={`${isMobile ? "text-lg" : "text-xl"}`}>
                        {file.icon}
                      </span>
                    </div>
                  </div>
                )}

                {/* File Info */}
                <div className="space-y-1">
                  <h4
                    className={`${
                      isMobile ? "text-xs" : "text-sm"
                    } font-semibold ${colors.text} truncate leading-tight`}
                    title={file.name}
                  >
                    {file.name}
                  </h4>

                  <div className="flex items-center justify-between">
                    <span
                      className={`${isMobile ? "text-xs" : "text-xs"} ${
                        colors.text
                      } opacity-75 font-medium`}
                    >
                      {formatFileSize(file.size)}
                    </span>

                    <span
                      className={`${
                        isMobile
                          ? "px-1.5 py-0.5 text-xs"
                          : "px-2 py-0.5 text-xs"
                      } ${colors.badge} rounded-full font-medium capitalize`}
                    >
                      {file.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ready indicator */}
              <div
                className={`absolute bottom-1 left-1 ${
                  isMobile ? "w-4 h-4" : "w-5 h-5"
                } bg-emerald-500 rounded-full flex items-center justify-center shadow-md`}
              >
                <svg
                  className={`${
                    isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                  } text-white`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Info */}
      <div
        className={`${
          isMobile ? "mt-2 text-xs" : "mt-3 text-sm"
        } text-center flex items-center justify-center gap-2 text-gray-600`}
      >
        <svg
          className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-emerald-500`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
        <span className="font-medium">
          Press Send to upload {files.length > 1 ? "all files" : "file"}
        </span>
      </div>
    </div>
  );
};

export default PendingFilesPreview;