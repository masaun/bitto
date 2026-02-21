import { useState } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import {
  stringAsciiCV,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const contractAddress = process.env.REACT_APP_CLOSURE_ATTESTATION_CONTRACT_ADDRESS || '';
const contractName = 'closure-attestation';

export default function App() {
  const [userData, setUserData] = useState<any>(null);
  const [data, setData] = useState('');
  const [entryId, setEntryId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Closure Attestation',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        setUserData(userData);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  const handleRegister = async () => {
    if (!userData || !data) return;
    
    setLoading(true);
    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'register',
        functionArgs: [stringAsciiCV(data)],
        senderKey: userData.appPrivateKey,
        network: new StacksMainnet(),
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, new StacksMainnet());
      
      setTxId(broadcastResponse.txid);
      setResult({ success: true, txid: broadcastResponse.txid });
      setData('');
    } catch (error) {
      console.error('Transaction error:', error);
      setResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleGetEntry = async () => {
    if (!contractAddress || !entryId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/v2/contracts/call-read/${contractAddress}/${contractName}/get-entry`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: contractAddress,
            arguments: [stringAsciiCV(entryId).serialize().toString('hex')],
          }),
        }
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Read error:', error);
      setResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Closure Attestation</h1>
      
      {!userData ? (
        <div>
          <button 
            onClick={connectWallet}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
            <p><strong>Connected:</strong> {userData.profile.stxAddress.mainnet}</p>
            <button onClick={disconnectWallet} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Disconnect
            </button>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Register Entry</h2>
            <input
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter data (max 256 characters)"
              maxLength={256}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', fontSize: '14px' }}
            />
            <button
              onClick={handleRegister}
              disabled={loading || !data}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Get Entry</h2>
            <input
              type="number"
              value={entryId}
              onChange={(e) => setEntryId(e.target.value)}
              placeholder="Enter entry ID"
              style={{ width: '100%', padding: '10px', marginBottom: '10px', fontSize: '14px' }}
            />
            <button
              onClick={handleGetEntry}
              disabled={loading || !entryId}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
              {loading ? 'Loading...' : 'Get Entry'}
            </button>
          </div>

          {txId && (
            <div style={{ marginBottom: '20px', padding: '10px', background: '#e8f5e9', borderRadius: '5px' }}>
              <p><strong>Transaction ID:</strong></p>
              <a 
                href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1976d2', wordBreak: 'break-all' }}
              >
                {txId}
              </a>
            </div>
          )}

          {result && (
            <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '5px', marginTop: '20px' }}>
              <h3>Result:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
