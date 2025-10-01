/**
 * Pending Files Preview Component
 * Shows selected files before sending
 */

import React from 'react';
import { formatFileSize, getFileIcon } from '../../utils/fileConfig';

interface PendingFilesPreviewProps {
  /** Files waiting to be sent */
  files: File[];
  /** Remove file callback */
  onRemoveFile: (index: number) => void;
  /** Whether component is displayed on mobile */
  isMobile?: boolean;
}

const PendingFilesPreview: React.FC<PendingFilesPreviewProps> = ({
  files,
  onRemoveFile,
  isMobile = false,
}) => {
  if (files.length === 0) return null;

  return (
    <div className={`${
      isMobile ? 'px-2 py-1.5' : 'px-4 py-2'
    } border-b border-gray-200 bg-gray-50`}>
      <div className={`flex ${
        isMobile ? 'gap-2' : 'gap-3'
      } overflow-x-auto pb-1`}>
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.lastModified}-${index}`}
            className={`${
              isMobile ? 'min-w-[120px] p-2' : 'min-w-[140px] p-3'
            } bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0`}
          >
            {/* File Info */}
            <div className="flex items-start gap-2 mb-2">
              <div className={`${
                isMobile ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-base'
              } bg-gray-100 rounded flex items-center justify-center flex-shrink-0`}>
                <span>{getFileIcon(file.type)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`${
                  isMobile ? 'text-xs' : 'text-sm'
                } font-medium text-gray-900 truncate`} title={file.name}>
                  {file.name}
                </h4>
                <p className={`${
                  isMobile ? 'text-xs' : 'text-xs'
                } text-gray-500`}>
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemoveFile(index)}
                className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Ready to send indicator */}
            <div className="flex items-center gap-1 text-emerald-600">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className={`${
                isMobile ? 'text-xs' : 'text-xs'
              } font-medium`}>
                Ready to send
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Info text */}
      <div className={`${
        isMobile ? 'mt-1 text-xs' : 'mt-2 text-sm'
      } text-gray-500 text-center`}>
        {files.length} file{files.length !== 1 ? 's' : ''} selected • Press Send to upload
      </div>
    </div>
  );
};

export default PendingFilesPreview;