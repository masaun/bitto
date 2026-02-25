'use client';

import { useState } from 'react';
import { StacksTestnet } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';
import { getContractAddress } from '@/lib/stacks';

export default function AiSecurityAuditorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const contractAddress = getContractAddress('ai-security-auditor');

  const handleAction = async () => {
    setLoading(true);
    try {
      await openContractCall({
        network: new StacksTestnet(),
        contractAddress,
        contractName: 'ai-security-auditor',
        functionName: 'initialize',
        functionArgs: [],
        appDetails: { name: 'ai-security-auditor' },
      });
      setResult('Action executed');
    } catch (e) {
      setResult('Error: ' + (e instanceof Error ? e.message : 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <span style={{ display: 'inline-block', backgroundColor: '#4ECDC4', color: 'white', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
        compliance
      </span>
      <h1>Ai Security Auditor</h1>
      <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
        <code>{contractAddress}</code>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={handleAction} disabled={loading} style={{ padding: '0.5rem', backgroundColor: '#45B7D1', color: 'white', border: 'none', borderRadius: '4px' }}>Execute</button>
        <button onClick={handleAction} disabled={loading} style={{ padding: '0.5rem', backgroundColor: '#FF6B6B', color: 'white', border: 'none', borderRadius: '4px' }}>Query</button>
      </div>      {loading && <p>Loading...</p>}
      {result && <div style={{ padding: '1rem', backgroundColor: '#d4edda', borderRadius: '4px' }}>{result}</div>}
    </div>
  );
}
