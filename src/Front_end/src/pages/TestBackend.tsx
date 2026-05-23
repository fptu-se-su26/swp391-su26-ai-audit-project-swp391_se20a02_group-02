import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import BackendStatus from '../components/BackendStatus';

const TestBackend: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testHealthCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.healthCheck();
      setHealthData(data);
    } catch (err: any) {
      setError(`Health check failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getDatabaseInfo();
      setDbInfo(data);
    } catch (err: any) {
      setError(`Database info failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUsersAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getUsers(0, 5);
      setUsers(data.users || []);
    } catch (err: any) {
      setError(`Users API failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testVehiclesAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getVehicles(0, 5);
      setVehicles(data.vehicles || []);
    } catch (err: any) {
      setError(`Vehicles API failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testHealthCheck();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LuxeWay Backend Test</h1>
              <p className="text-gray-600 mt-2">Test kết nối và API endpoints</p>
            </div>
            <BackendStatus />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">❌ Error:</div>
              <div className="text-red-700 ml-2">{error}</div>
            </div>
          </div>
        )}

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={testHealthCheck}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Testing...' : 'Health Check'}
          </button>
          
          <button
            onClick={testDatabaseInfo}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Testing...' : 'Database Info'}
          </button>
          
          <button
            onClick={testUsersAPI}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Testing...' : 'Test Users API'}
          </button>
          
          <button
            onClick={testVehiclesAPI}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Testing...' : 'Test Vehicles API'}
          </button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Check Results */}
          {healthData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Health Check</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            </div>
          )}

          {/* Database Info Results */}
          {dbInfo && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🗄️ Database Info</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(dbInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Users Results */}
          {users.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Users ({users.length})</h3>
              <div className="space-y-3">
                {users.map((user, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="font-medium text-gray-900">{user.displayName || user.firstName + ' ' + user.lastName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500">Role: {user.role} | Rating: {user.rating}/5</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicles Results */}
          {vehicles.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚗 Vehicles ({vehicles.length})</h3>
              <div className="space-y-3">
                {vehicles.map((vehicle, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="font-medium text-gray-900">{vehicle.name}</div>
                    <div className="text-sm text-gray-600">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
                    <div className="text-xs text-gray-500">
                      {vehicle.pricePerDay?.toLocaleString('vi-VN')} VND/day | {vehicle.city} | {vehicle.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Backend URLs */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Backend URLs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Health Check:</strong><br />
              <a href="http://localhost:8080/api/v1/test/health" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                http://localhost:8080/api/v1/test/health
              </a>
            </div>
            <div>
              <strong>Swagger UI:</strong><br />
              <a href="http://localhost:8080/api/v1/swagger-ui.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                http://localhost:8080/api/v1/swagger-ui.html
              </a>
            </div>
            <div>
              <strong>Users API:</strong><br />
              <a href="http://localhost:8080/api/v1/users" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                http://localhost:8080/api/v1/users
              </a>
            </div>
            <div>
              <strong>Vehicles API:</strong><br />
              <a href="http://localhost:8080/api/v1/vehicles" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                http://localhost:8080/api/v1/vehicles
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBackend;