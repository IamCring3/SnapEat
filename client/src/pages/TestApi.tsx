import { useState } from 'react';
import { config } from '../../config';
import Container from '../ui/Container';

const TestApi = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    setTestResult('');
    
    try {
      console.log("Testing API connection to:", `${config.baseUrl}/test-cors`);
      
      const response = await fetch(`${config.baseUrl}/test-cors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        setTestResult(JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setError(`Server returned ${response.status}: ${errorText}`);
      }
    } catch (error: any) {
      console.error("API test failed:", error);
      setError(`Connection failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRazorpayOrder = async () => {
    setLoading(true);
    setError(null);
    setTestResult('');
    
    try {
      console.log("Testing Razorpay order creation:", `${config.baseUrl}/checkout`);
      
      const response = await fetch(`${config.baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10000,
          email: 'test@example.com',
        }),
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        setTestResult(JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setError(`Server returned ${response.status}: ${errorText}`);
      }
    } catch (error: any) {
      console.error("Razorpay test failed:", error);
      setError(`Connection failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
        
        <div className="mb-6">
          <p className="mb-2">Current API URL: <code className="bg-gray-100 px-2 py-1 rounded">{config.baseUrl}</code></p>
          
          <div className="flex gap-4 mt-4">
            <button
              onClick={testApiConnection}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test API Connection'}
            </button>
            
            <button
              onClick={testRazorpayOrder}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Razorpay Order'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {testResult && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Test Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </Container>
  );
};

export default TestApi;
