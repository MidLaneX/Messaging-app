import React, { useState, useRef } from 'react';
import { backendFileService, UploadProgress } from '../services/backendFileService';
import { localFileStorage } from '../services/localFileStorage';
import { validateFile } from '../utils/fileConfig';

export const ApiTester: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFileTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult("🔄 Starting file sharing diagnostic tests...");

    try {
      // Test 1: Check environment variables
      addResult("📋 Testing environment configuration...");
      try {
        const envVars = {
          'REACT_APP_API_URL': process.env.REACT_APP_API_URL,
          'REACT_APP_WS_URL': process.env.REACT_APP_WS_URL,
        };
        
        Object.entries(envVars).forEach(([key, value]) => {
          addResult(`  ${key}: ${value || 'NOT SET'}`);
        });
        addResult("  Note: R2 credentials no longer needed - file operations handled by backend");
      } catch (error) {
        addResult(`❌ Environment check failed: ${error}`);
      }

      // Test 2: Test backend connectivity
      addResult("🌐 Testing backend connectivity...");
      try {
        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8090';
        const response = await fetch(`${backendUrl}/health`);
        if (response.ok) {
          addResult(`✅ Backend reachable at ${backendUrl}`);
        } else {
          addResult(`⚠️ Backend responded with status: ${response.status}`);
        }
      } catch (error) {
        addResult(`❌ Backend connection failed: ${error}`);
      }

      // Test 3: Test backend file service configuration
      addResult("🔧 Testing backend file service...");
      try {
        // Test if backend file service is accessible
        const isConfigured = backendFileService && typeof backendFileService.uploadFile === 'function';
        addResult(`Backend file service: ${isConfigured ? '✅ Available' : '❌ Not available'}`);
      } catch (error) {
        addResult(`❌ Backend service check failed: ${error}`);
      }

      // Test 4: Test local storage
      addResult("💾 Testing local storage...");
      try {
        const testKey = 'test-file-storage';
        localStorage.setItem(testKey, 'test');
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        addResult(`Local storage: ${retrieved === 'test' ? '✅ Working' : '❌ Failed'}`);
      } catch (error) {
        addResult(`❌ Local storage test failed: ${error}`);
      }

      // Test 5: Test file validation
      if (selectedFile) {
        addResult("📄 Testing file validation...");
        const validation = validateFile(selectedFile);
        addResult(`File validation: ${validation.valid ? '✅ Valid' : `❌ Invalid - ${validation.error}`}`);
        
        if (validation.valid) {
          // Test 6: Test local file storage
          addResult("💾 Testing local file storage upload...");
          try {
            const { fileId, fileUrl } = await localFileStorage.storeFile(selectedFile, 'test-user');
            addResult(`✅ Local storage upload successful - ID: ${fileId}`);
            addResult(`📎 File URL: ${fileUrl.substring(0, 50)}...`);
            
            // Test file retrieval
            const retrievedFile = localFileStorage.getFile(fileId);
            addResult(`File retrieval: ${retrievedFile ? '✅ Success' : '❌ Failed'}`);
          } catch (error) {
            addResult(`❌ Local storage upload failed: ${error}`);
          }

          // Test 7: Test backend upload service
          addResult("🌐 Testing backend upload service...");
          try {
            const result = await backendFileService.uploadFile(
              selectedFile, 
              'test-user',
              (progress: UploadProgress) => {
                if (progress.percentage % 25 === 0) {
                  addResult(`📊 Upload progress: ${progress.percentage}%`);
                }
              }
            );
            addResult(`Backend upload: ${result.success ? '✅ Success' : `❌ Failed - ${result.error}`}`);
            if (result.success && result.fileUrl) {
              addResult(`📎 Upload URL: ${result.fileUrl.substring(0, 50)}...`);
            }
          } catch (error) {
            addResult(`❌ Backend upload test failed: ${error}`);
          }
        }
      } else {
        addResult("⚠️ No file selected for upload tests - select a file to run upload tests");
      }

      addResult("🎉 File sharing diagnostic tests completed!");

    } catch (error) {
      addResult(`❌ Test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      addResult(`📁 File selected: ${file.name} (${Math.round(file.size / 1024)}KB)`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setSelectedFile(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🔧 File Sharing Debug Tool</h2>
      
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Test File (optional):
          </label>
          <input
            type="file"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={runFileTests}
            disabled={isRunning}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? '🔄 Running Tests...' : '🚀 Run File Sharing Tests'}
          </button>
          
          <button
            onClick={clearResults}
            disabled={isRunning}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Clear Results
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50 h-96 overflow-y-auto">
        <h3 className="font-medium text-gray-800 mb-3">Test Results:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500 italic">No tests run yet. Click "Run File Sharing Tests" to begin.</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono text-gray-700 border-l-2 border-gray-300 pl-2">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">💡 Debugging Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• File operations are handled by the backend - ensure backend service is running</li>
          <li>• If backend connection fails, ensure the backend server is running on the correct port</li>
          <li>• File uploads should work via local storage even if R2 is misconfigured</li>
          <li>• Check browser console (F12) for additional error details</li>
          <li>• Ensure WebSocket connection is established before sending file messages</li>
        </ul>
      </div>
    </div>
  );
};
