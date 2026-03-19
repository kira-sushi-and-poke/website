"use client";
import { useState } from 'react';

export default function TestSquarePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/square/catalog');
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to fetch catalog');
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Square Catalog API Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Open <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file</li>
            <li>Replace <code className="bg-gray-100 px-2 py-1 rounded">YOUR_SANDBOX_ACCESS_TOKEN_HERE</code> with your actual token</li>
            <li>Replace <code className="bg-gray-100 px-2 py-1 rounded">YOUR_LOCATION_ID_HERE</code> with your location ID (optional)</li>
            <li>Restart your dev server (stop and run <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> again)</li>
            <li>Click the button below to test</li>
          </ol>
        </div>

        <button
          onClick={fetchCatalog}
          disabled={loading}
          className="bg-hot-pink text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Fetching...' : 'Fetch Catalog from Square'}
        </button>

        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {data && (
          <div className="mt-6 space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-800 font-semibold">✓ Success! Connected to Square {data.environment} environment</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Transformed Menu Items ({data.transformed?.length || 0})</h3>
              <div className="max-h-96 overflow-auto">
                <pre className="text-xs bg-gray-50 p-4 rounded">
                  {JSON.stringify(data.transformed, null, 2)}
                </pre>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Raw Square Response</h3>
              <div className="max-h-96 overflow-auto">
                <pre className="text-xs bg-gray-50 p-4 rounded">
                  {JSON.stringify(data.raw, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
