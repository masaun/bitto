import React, { useState } from 'react';
import { AppConfig, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { principalCV, uintCV } from '@stacks/transactions';
import { callContractFunction } from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SWAP_ROUTER_V3_ADDRESS || '';

export default function Swap_Router_V3Page() {
  const [counter, setCounter] = useState(0);
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    showConnect({
      appDetails: {
        name: 'swap-router-v3',
        icon: '/stacks-logo.png',
      },
      appConfig,
      onFinish: () => window.location.reload(),
      onCancel: () => console.log('Connection cancelled'),
    });
  };

  const getCounter = async () => {
    if (!userAddress) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/v1/contract/{CONTRACT_ADDRESS}.swap-router-v3/read-only/get-counter`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
      setCounter(parseInt(data));
    } catch (err) {
      console.error('Failed to get counter:', err);
    } finally {
      setLoading(false);
    }
  };

  const increment = async () => {
    if (!userAddress || !CONTRACT_ADDRESS) return;
    setLoading(true);
    try {
      const response = await fetch('/api/call-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: CONTRACT_ADDRESS,
          contractName: 'swap-router-v3',
          functionName: 'increment',
          functionArgs: [],
        }),
      });
      const result = await response.json();
      console.log('Transaction submitted:', result);
      await getCounter();
    } catch (err) {
      console.error('Failed to increment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={ padding: '20px', fontFamily: 'Arial' }>
      <h1>swap-router-v3</h1>
      <p>Connected: {userAddress ? userAddress.substring(0, 20) + '...' : 'Not connected'}</p>
      
      {!userAddress ? (
        <button onClick={handleConnect} style={ padding: '10px 20px', cursor: 'pointer' }>
          Connect Wallet
        </button>
      ) : (
        <>
          <p>Counter Value: {counter}</p>
          <button 
            onClick={getCounter} 
            disabled={loading}
            style={ padding: '10px 20px', marginRight: '10px', cursor: loading ? 'not-allowed' : 'pointer' }
          >
            {loading ? 'Loading...' : 'Get Counter'}
          </button>
          <button 
            onClick={increment} 
            disabled={loading}
            style={ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }
          >
            {loading ? 'Processing...' : 'Increment'}
          </button>
        </>
      )}
    </div>
  );
}
