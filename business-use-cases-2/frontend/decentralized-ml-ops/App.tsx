import React, { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  callReadOnlyFunction, 
  makeContractCall, 
  standardPrincipalCV, 
  uintCV, 
  stringAsciiCV, 
  bufferCV, 
  broadcastTransaction 
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = process.env.DECENTRALIZED_ML_OPS_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'decentralized-ml-ops';

export default function App() {
  const [userData, setUserData] = useState(null);
  const [recordId, setRecordId] = useState('');
  const [dataHash, setDataHash] = useState('');
  const [status, setStatus] = useState('');
  const [recordData, setRecordData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'decentralized-ml-ops',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const createRecord = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-record',
        functionArgs: [bufferCV(Buffer.from(dataHash, 'hex'))],
        senderKey: userData.appPrivateKey,
        network,
        postConditionMode: 1,
      };
      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network });
      alert('Transaction broadcast: ' + result.txid);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-status',
        functionArgs: [uintCV(recordId), stringAsciiCV(status)],
        senderKey: userData.appPrivateKey,
        network,
        postConditionMode: 1,
      };
      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network });
      alert('Transaction broadcast: ' + result.txid);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecord = async () => {
    setLoading(true);
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-record',
        functionArgs: [uintCV(recordId)],
        network,
        senderAddress: CONTRACT_ADDRESS,
      });
      setRecordData(result);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecordCount = async () => {
    setLoading(true);
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-record-count',
        functionArgs: [],
        network,
        senderAddress: CONTRACT_ADDRESS,
      });
      alert('Record count: ' + JSON.stringify(result));
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>decentralized-ml-ops</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected as: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
            <h3>Create Record</h3>
            <input
              type="text"
              placeholder="Data Hash (hex)"
              value={dataHash}
              onChange={(e) => setDataHash(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={createRecord} disabled={loading}>
              {loading ? 'Loading...' : 'Create Record'}
            </button>
          </div>

          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
            <h3>Update Status</h3>
            <input
              type="text"
              placeholder="Record ID"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={updateStatus} disabled={loading}>
              {loading ? 'Loading...' : 'Update Status'}
            </button>
          </div>

          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
            <h3>Get Record</h3>
            <input
              type="text"
              placeholder="Record ID"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={getRecord} disabled={loading}>
              {loading ? 'Loading...' : 'Get Record'}
            </button>
            {recordData && (
              <pre style={{ marginTop: '10px', background: '#f5f5f5', padding: '10px' }}>
                {JSON.stringify(recordData, null, 2)}
              </pre>
            )}
          </div>

          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
            <h3>Get Record Count</h3>
            <button onClick={getRecordCount} disabled={loading}>
              {loading ? 'Loading...' : 'Get Record Count'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
