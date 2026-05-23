import React, { useState, useEffect } from 'react';
import { checkBackendConnection, apiClient } from '../services/api';

interface BackendStatusProps {
  className?: string;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendInfo, setBackendInfo] = useState<any>(null);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await checkBackendConnection();
      setIsConnected(connected);
      
      if (connected) {
        try {
          const healthData = await apiClient.healthCheck();
          setBackendInfo(healthData);
        } catch (error) {
          console.warn('Could not fetch backend info:', error);
        }
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">Checking backend...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div 
        className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></div>
      <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
        {isConnected ? 'Backend Connected' : 'Backend Offline'}
      </span>
      
      {isConnected && backendInfo && (
        <div className="text-xs text-gray-500">
          ({backendInfo.total_users || 0} users)
        </div>
      )}
      
      {!isConnected && (
        <button
          onClick={checkConnection}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default BackendStatus;