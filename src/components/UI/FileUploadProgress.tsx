/**
 * File Upload Progress Component - Stunning Modern Design
 * Shows upload progress with animations and beautiful UI
 */

import React, { useEffect, useState } from "react";
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isUploading && progress.percentage > 0) {
      setAnimateProgress(true);
    }
  }, [isUploading, progress.percentage]);

  const getFileIcon = (
    mimeType: string
  ): { icon: string; gradient: string; color: string } => {
    if (mimeType.startsWith("image/"))
      return {
        icon: "🖼️",
        gradient: "from-purple-500 to-pink-500",
        color: "text-purple-600",
      };
    if (mimeType.startsWith("video/"))
      return {
        icon: "🎥",
        gradient: "from-red-500 to-orange-500",
        color: "text-red-600",
      };
    if (mimeType.startsWith("audio/"))
      return {
        icon: "🎵",
        gradient: "from-blue-500 to-cyan-500",
        color: "text-blue-600",
      };
    if (mimeType === "application/pdf")
      return {
        icon: "📕",
        gradient: "from-red-600 to-red-400",
        color: "text-red-600",
      };
    if (mimeType.includes("word") || mimeType.includes("document"))
      return {
        icon: "📄",
        gradient: "from-blue-600 to-blue-400",
        color: "text-blue-600",
      };
    if (mimeType.includes("sheet") || mimeType.includes("excel"))
      return {
        icon: "📊",
        gradient: "from-green-600 to-green-400",
        color: "text-green-600",
      };
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return {
        icon: "📖",
        gradient: "from-orange-600 to-orange-400",
        color: "text-orange-600",
      };
    if (
      mimeType.includes("zip") ||
      mimeType.includes("rar") ||
      mimeType.includes("7z")
    )
      return {
        icon: "🗜️",
        gradient: "from-gray-600 to-gray-400",
        color: "text-gray-600",
      };
    return {
      icon: "📎",
      gradient: "from-indigo-500 to-purple-500",
      color: "text-indigo-600",
    };
  };

  const fileInfo = getFileIcon(file.type);

  return (
    <div
      className={`${
        isMobile ? "p-3 mx-2" : "p-4 mx-4"
      } bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl 
    max-w-md transform transition-all duration-300 hover:shadow-2xl ${
      showSuccess ? "scale-105" : ""
    }`}
    >
      {/* File Info with Gradient Background */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`${
            isMobile ? "w-12 h-12 text-2xl" : "w-14 h-14 text-3xl"
          } bg-gradient-to-br ${
            fileInfo.gradient
          } rounded-xl flex items-center justify-center flex-shrink-0 
        shadow-lg transform transition-transform ${
          isUploading ? "animate-pulse" : ""
        } ${showSuccess ? "scale-110 rotate-12" : ""}`}
        >
          <span className="filter drop-shadow-md">{fileInfo.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`${
              isMobile ? "text-sm" : "text-base"
            } font-semibold text-gray-900 dark:text-white truncate`}
            title={file.name}
          >
            {file.name}
          </h4>
          <p
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } text-gray-500 dark:text-gray-400 font-medium`}
          >
            {formatFileSize(file.size)}
          </p>
        </div>

        {/* Action button */}
        {onCancel && isUploading && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 
            rounded-lg transition-all duration-200 transform hover:scale-110"
            title="Cancel upload"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        {isUploading && (
          <>
            {/* Progress Bar with Gradient and Animation */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span
                  className={`${fileInfo.color} dark:text-white flex items-center gap-1`}
                >
                  <span className="inline-block w-2 h-2 bg-current rounded-full animate-ping"></span>
                  Uploading
                </span>
                <span
                  className={`${fileInfo.color} dark:text-white tabular-nums`}
                >
                  {progress.percentage}%
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    fileInfo.gradient
                  } h-3 rounded-full 
                  transition-all duration-500 ease-out ${
                    animateProgress ? "animate-progress-shimmer" : ""
                  }`}
                  style={{ width: `${progress.percentage}%` }}
                >
                  {/* Shimmer effect */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent 
                    animate-shimmer"
                  ></div>
                </div>
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${fileInfo.gradient} h-3 rounded-full blur-sm opacity-50`}
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 font-medium tabular-nums">
                <span>{formatFileSize(progress.loaded)}</span>
                <span>{formatFileSize(progress.total)}</span>
              </div>
            </div>
          </>
        )}

        {isSuccess && (
          <div
            className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 
            dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 
            dark:border-green-700 transform animate-bounce-in"
          >
            <div className="flex-shrink-0">
              <div
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full 
                flex items-center justify-center shadow-lg transform animate-check-pop"
              >
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
            </div>
            <span
              className={`${
                isMobile ? "text-sm" : "text-base"
              } font-bold text-green-700 dark:text-green-300`}
            >
              Upload complete! 🎉
            </span>
          </div>
        )}

        {error && (
          <div className="space-y-3 animate-shake">
            <div
              className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 
              dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-700"
            >
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full 
                  flex items-center justify-center shadow-lg"
                >
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
              </div>
              <div className="flex-1">
                <p
                  className={`${
                    isMobile ? "text-sm" : "text-base"
                  } font-bold text-red-700 dark:text-red-300`}
                >
                  Upload failed
                </p>
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-red-600 dark:text-red-400 mt-1`}
                >
                  {error}
                </p>
              </div>
            </div>

            {onRetry && (
              <button
                onClick={onRetry}
                className={`w-full ${
                  isMobile ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                } bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl 
                hover:from-red-700 hover:to-pink-700 transition-all duration-200 
                flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105
                active:scale-95`}
              >
                <svg
                  className="w-5 h-5 animate-spin-slow"
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