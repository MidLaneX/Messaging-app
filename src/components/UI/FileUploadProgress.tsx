import React, { useEffect, useState } from "react";
import {
  formatFileSize,
  getFileCategory,
  getFileIcon,
} from "../../utils/fileConfig";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadProgressProps {
  file: File;
  progress: UploadProgress;
  isUploading: boolean;
  isSuccess?: boolean;
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const category = getFileCategory(file.type);
  const icon = getFileIcon(file.type);

  // Generate preview for images
  useEffect(() => {
    if (category === "image") {
      try {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        console.warn("Failed to create preview for image:", error);
      }
    }
  }, [file, category]);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
    }
  }, [isSuccess]);

  const getColors = (category: string) => {
    switch (category) {
      case "image":
        return {
          gradient: "from-pink-500 to-purple-500",
          text: "text-pink-600",
          icon: "bg-pink-500",
        };
      case "video":
        return {
          gradient: "from-red-500 to-orange-500",
          text: "text-red-600",
          icon: "bg-red-500",
        };
      case "audio":
        return {
          gradient: "from-blue-500 to-cyan-500",
          text: "text-blue-600",
          icon: "bg-blue-500",
        };
      case "pdf":
        return {
          gradient: "from-red-600 to-red-400",
          text: "text-red-600",
          icon: "bg-red-600",
        };
      case "document":
        return {
          gradient: "from-blue-600 to-blue-400",
          text: "text-blue-600",
          icon: "bg-blue-600",
        };
      case "archive":
        return {
          gradient: "from-yellow-600 to-yellow-400",
          text: "text-yellow-600",
          icon: "bg-yellow-600",
        };
      default:
        return {
          gradient: "from-indigo-500 to-purple-500",
          text: "text-indigo-600",
          icon: "bg-gray-500",
        };
    }
  };

  const colors = getColors(category);

  return (
    <div
      className={`${
        isMobile ? "p-3 mx-2" : "p-4 mx-4"
      } bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 max-w-md`}
    >
      {/* File Preview Section */}
      <div className={`flex items-start gap-3 ${isMobile ? "mb-3" : "mb-4"}`}>
        {/* File Icon/Preview */}
        <div className="flex-shrink-0">
          {category === "image" && previewUrl ? (
            <div
              className={`${
                isMobile ? "w-16 h-16" : "w-20 h-20"
              } bg-gray-100 rounded-xl overflow-hidden shadow-md border-2 border-white group relative`}
            >
              <img
                src={previewUrl}
                alt={file.name}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
              />
              {!imageLoaded && (
                <div
                  className={`absolute inset-0 flex items-center justify-center ${colors.icon} text-white`}
                >
                  <span className={`${isMobile ? "text-xl" : "text-2xl"}`}>
                    {icon}
                  </span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`${
                isMobile ? "w-16 h-16" : "w-20 h-20"
              } bg-gradient-to-br ${
                colors.gradient
              } rounded-xl flex items-center justify-center shadow-lg border-2 border-white ${
                isUploading ? "animate-pulse" : ""
              }`}
            >
              <span
                className={`${isMobile ? "text-2xl" : "text-3xl"} text-white`}
              >
                {icon}
              </span>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h4
            className={`${
              isMobile ? "text-sm" : "text-base"
            } font-bold text-gray-900 truncate mb-1`}
            title={file.name}
          >
            {file.name}
          </h4>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} ${
                colors.text
              } font-semibold`}
            >
              {formatFileSize(file.size)}
            </span>
            <span className="text-gray-300">•</span>
            <span
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-gray-500 capitalize font-medium`}
            >
              {category}
            </span>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1">
            {isUploading && (
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 ${colors.icon} rounded-full animate-ping`}
                ></div>
                <span
                  className={`${isMobile ? "text-xs" : "text-sm"} ${
                    colors.text
                  } font-semibold`}
                >
                  Uploading...
                </span>
              </div>
            )}
            {isSuccess && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-emerald-600 font-semibold`}
                >
                  Complete
                </span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-red-600 font-semibold`}
                >
                  Failed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cancel button */}
        {onCancel && isUploading && (
          <button
            onClick={onCancel}
            className={`${
              isMobile ? "p-1.5" : "p-2"
            } text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200`}
            title="Cancel upload"
          >
            <svg
              className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span
                className={`${isMobile ? "text-xs" : "text-sm"} ${
                  colors.text
                } font-bold`}
              >
                Uploading
              </span>
              <span
                className={`${isMobile ? "text-xs" : "text-sm"} ${
                  colors.text
                } font-bold`}
              >
                {progress.percentage}%
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} h-3 rounded-full transition-all duration-700`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 font-semibold">
              <span>{formatFileSize(progress.loaded)}</span>
              <span>{formatFileSize(progress.total)}</span>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            <span
              className={`${
                isMobile ? "text-sm" : "text-base"
              } font-bold text-emerald-700`}
            >
              Upload successful! 🎉
            </span>
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p
                  className={`${
                    isMobile ? "text-sm" : "text-base"
                  } font-bold text-red-700`}
                >
                  Upload failed
                </p>
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-red-600 mt-1`}
                >
                  {error}
                </p>
              </div>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className={`w-full ${
                  isMobile ? "px-3 py-2.5 text-xs" : "px-4 py-3 text-sm"
                } bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2`}
              >
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
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
