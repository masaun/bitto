import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  makeContractSTXPostCondition,
  FungibleConditionCode,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  bufferCV
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = process.env.REACT_APP_UNISWAP_V4_LIKE_HOOK_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'uniswap-v4-like-hook';

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hookName, setHookName] = useState('');
  const [hookContract, setHookContract] = useState('');
  const [poolId, setPoolId] = useState('');
  const [amount, setAmount] = useState('');

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
        name: 'Uniswap V4 Hook',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut('/');
    setUserData(null);
  };

  const registerHook = async () => {
    if (!userData) return;
    
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-hook',
        functionArgs: [
          stringAsciiCV(hookName),
          principalCV(hookContract)
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data: any) => {
          console.log('Transaction:', data.txId);
          setLoading(false);
        },
      };
      
      await makeContractCall(txOptions);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const executeBeforeSwap = async () => {
    if (!userData) return;
    
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'execute-before-swap',
        functionArgs: [
          uintCV(poolId),
          uintCV(amount)
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: any) => {
          console.log('Transaction:', data.txId);
          setLoading(false);
        },
      };
      
      await makeContractCall(txOptions);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Uniswap V4-Like Hook System</h1>
      {!userData ? (
        <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Connect Wallet
        </button>
      ) : (
        <>
          <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
            <p><strong>Address:</strong> {userData.profile.stxAddress.mainnet}</p>
            <button onClick={disconnectWallet}>Disconnect</button>
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <h2>Register Hook</h2>
            <div style={{ marginBottom: '10px' }}>
              <label>Hook Name: </label>
              <input 
                type="text" 
                value={hookName} 
                onChange={(e) => setHookName(e.target.value)}
                style={{ padding: '5px', width: '300px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Hook Contract: </label>
              <input 
                type="text" 
                value={hookContract} 
                onChange={(e) => setHookContract(e.target.value)}
                placeholder="SP..."
                style={{ padding: '5px', width: '300px' }}
              />
            </div>
            <button onClick={registerHook} disabled={loading} style={{ padding: '10px 20px' }}>
              Register Hook
            </button>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Execute Before Swap</h2>
            <div style={{ marginBottom: '10px' }}>
              <label>Pool ID: </label>
              <input 
                type="number" 
                value={poolId} 
                onChange={(e) => setPoolId(e.target.value)}
                style={{ padding: '5px', width: '300px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Amount: </label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                style={{ padding: '5px', width: '300px' }}
              />
            </div>
            <button onClick={executeBeforeSwap} disabled={loading} style={{ padding: '10px 20px' }}>
              Execute Before Swap
            </button>
          </div>

          {loading && <p style={{ color: 'blue' }}>⏳ Transaction pending...</p>}
        </>
      )}
    </div>
  );
}

export default App;
