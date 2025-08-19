import React, { useEffect, useState } from 'react';
import { recentUsersService } from '../services/recentUsersService';
import { APP_CONFIG } from '../constants';

export const ApiTester: React.FC = () => {
  const [apiLogs, setApiLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setApiLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testApi = async () => {
      addLog('Starting API tests...');
      
      // Test initial load
      try {
        addLog(`Calling: GET ${APP_CONFIG.API_BASE_URL}/api/users/${APP_CONFIG.CURRENT_USER_ID}/recent-users/initial`);
        const initialData = await recentUsersService.getInitialRecentUsers(APP_CONFIG.CURRENT_USER_ID);
        addLog(`Success: Received ${initialData.users.length} users, hasMore: ${initialData.hasMore}`);
      } catch (error) {
        addLog(`Error: ${error}`);
      }

      // Test load more
      try {
        addLog(`Calling: GET ${APP_CONFIG.API_BASE_URL}/api/users/${APP_CONFIG.CURRENT_USER_ID}/recent-users/load-more?page=2`);
        const moreData = await recentUsersService.loadMoreRecentUsers(APP_CONFIG.CURRENT_USER_ID, 2);
        addLog(`Success: Received ${moreData.users.length} more users, hasMore: ${moreData.hasMore}`);
      } catch (error) {
        addLog(`Error: ${error}`);
      }
    };

    testApi();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">API Test Log</h3>
        <button 
          onClick={() => setApiLogs([])}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      </div>
      <div className="max-h-40 overflow-y-auto text-xs font-mono space-y-1">
        {apiLogs.map((log, index) => (
          <div key={index} className="text-gray-700">
            {log}
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        API Base URL: {APP_CONFIG.API_BASE_URL}
      </div>
    </div>
  );
};
