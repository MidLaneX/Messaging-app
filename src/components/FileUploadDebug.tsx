/**
 * File Upload Debug Component
 * Simple component to test file upload functionality
 */

import React, { useRef, useState } from 'react';
import { browserFileUploadService } from '../services/browserFileUpload';

const FileUploadDebug: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testServiceInit = () => {
    try {
      addDebugInfo("Testing service initialization...");
      const isConfigured = browserFileUploadService.isConfigured();
      addDebugInfo(`Service configured: ${isConfigured}`);
    } catch (error) {
      addDebugInfo(`Service initialization error: ${error}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      addDebugInfo("No files selected");
      return;
    }

    const file = files[0];
    addDebugInfo(`File selected: ${file.name} (${file.type}, ${file.size} bytes)`);

    setIsUploading(true);
    
    try {
      const result = await browserFileUploadService.uploadFile(
        file,
        'test-user-id',
        (progress: any) => {
          addDebugInfo(`Upload progress: ${progress.percentage}%`);
        }
      );

      if (result.success) {
        addDebugInfo(`Upload successful! URL: ${result.fileUrl}`);
      } else {
        addDebugInfo(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      addDebugInfo(`Upload error: ${error}`);
    } finally {
      setIsUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">File Upload Debug</h3>
      
      <div className="space-y-4">
        <button
          onClick={testServiceInit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Service Init
        </button>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {isUploading && (
          <div className="text-blue-600 font-medium">Uploading...</div>
        )}

        <div className="bg-white p-4 rounded border max-h-64 overflow-y-auto">
          <h4 className="font-medium mb-2">Debug Log:</h4>
          {debugInfo.length === 0 ? (
            <p className="text-gray-500">No debug info yet</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {debugInfo.map((info, index) => (
                <li key={index} className="font-mono text-xs">
                  {info}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadDebug;