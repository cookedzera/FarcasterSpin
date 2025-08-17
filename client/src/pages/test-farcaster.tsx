/**
 * Test page for Farcaster integration
 * This page allows testing the Pinata Hub API directly with known FIDs
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { testWithFID } from '@/services/farcaster-service';

export default function TestFarcaster() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testKnownFID = async () => {
    setLoading(true);
    try {
      // Test with FID 190522 (known working FID from replit.md)
      const userData = await testWithFID(190522);
      setResult(userData);
      console.log('Test result:', userData);
    } catch (error) {
      console.error('Test error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Farcaster Integration Test</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={testKnownFID} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test FID 190522 (RAVI ッ)'}
          </Button>
          
          {result && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Result:</h2>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}