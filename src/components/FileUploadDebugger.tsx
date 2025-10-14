import React, { useState } from 'react';
import { backendFileService } from '../services/backendFileService';
import { APP_CONFIG } from '../constants';

const FileUploadDebugger: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      console.log('Debug: Starting upload with backend service');
      console.log('Debug: API Base URL:', APP_CONFIG.API_BASE_URL);
      console.log('Debug: Current User ID:', APP_CONFIG.CURRENT_USER_ID);
      console.log('Debug: File:', { name: file.name, size: file.size, type: file.type });

      const uploadResult = await backendFileService.uploadFile(
        file,
        APP_CONFIG.CURRENT_USER_ID,
        (progressData) => {
          console.log('Debug: Upload progress:', progressData);
          setProgress(progressData.percentage);
        }
      );

      console.log('Debug: Upload result:', uploadResult);
      setResult(uploadResult);

      if (!uploadResult.success) {
        setError(uploadResult.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Debug: Upload error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      console.log('Debug: Testing backend connection...');
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/collab/files/health`);
      console.log('Debug: Health check response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Debug: Health check data:', data);
        setResult({ healthCheck: 'Success', data });
      } else {
        setError(`Health check failed: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Debug: Health check error:', err);
      setError(err instanceof Error ? err.message : 'Health check failed');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '20px', 
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto',
      zIndex: 9999,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h3>🔧 File Upload Debugger</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>API URL:</strong> {APP_CONFIG.API_BASE_URL}<br />
        <strong>User ID:</strong> {APP_CONFIG.CURRENT_USER_ID}
      </div>

      <button 
        onClick={testBackendConnection}
        style={{ marginBottom: '10px', padding: '5px 10px' }}
      >
        Test Backend Connection
      </button>

      <div style={{ marginBottom: '10px' }}>
        <input 
          type="file" 
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </div>

      {file && (
        <div style={{ marginBottom: '10px', fontSize: '12px' }}>
          <strong>Selected:</strong> {file.name} ({file.size} bytes, {file.type})
        </div>
      )}

      <button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: uploading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginBottom: '10px'
        }}
      >
        {uploading ? `Uploading... ${progress}%` : 'Upload File'}
      </button>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px', fontSize: '12px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px', 
          fontSize: '11px',
          wordBreak: 'break-all'
        }}>
          <strong>Result:</strong>
          <pre style={{ margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FileUploadDebugger;