import React from 'react';

interface FileAttachmentMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectImage: () => void;
  onSelectDocument: () => void;
  onSelectCamera: () => void;
}

const FileAttachmentMenu: React.FC<FileAttachmentMenuProps> = ({
  isVisible,
  onClose,
  onSelectImage,
  onSelectDocument,
  onSelectCamera
}) => {
  console.log("FileAttachmentMenu rendered, isVisible:", isVisible);
  
  if (!isVisible) return null;

  const attachmentOptions = [
    {
      id: 'image',
      label: 'Photo & Video',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Share photos and videos',
      action: onSelectImage
    },
    {
      id: 'document',
      label: 'Document',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Share documents and files',
      action: onSelectDocument
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Take a photo or video',
      action: onSelectCamera
    }
  ];

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2 backdrop-blur-sm" style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}>
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Attach</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="py-2">
        {attachmentOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={option.action}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start"
          >
            <div className="mr-3 mt-0.5">
              {option.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{option.label}</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FileAttachmentMenu;
