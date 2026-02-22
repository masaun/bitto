import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { 
  uintCV, 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [functionName, setFunctionName] = useState('register-entity');
  const [param1, setParam1] = useState('');
  const [param2, setParam2] = useState('');
  const [txId, setTxId] = useState('');
  const [status, setStatus] = useState('');

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
        name: 'robotics-control-vault',
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
    userSession.signUserOut();
    setUserData(null);
  };

  const callContractFunction = async () => {
    if (!userData) return;
    
    setStatus('Processing transaction...');
    
    try {
      const network = new StacksTestnet();
      const [contractAddr, contractName] = contractAddress.split('.');
      
      const txOptions = {
        contractAddress: contractAddr,
        contractName: contractName || 'robotics-control-vault',
        functionName,
        functionArgs: param1 && param2 ? [uintCV(param1), uintCV(param2)] : [],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);
      
      setTxId(broadcastResponse.txid);
      setStatus('Transaction submitted: ' + broadcastResponse.txid);
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  if (!userData) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>robotics-control-vault</h1>
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>robotics-control-vault</h1>
      <p>Connected: {userData.profile.stxAddress.testnet}</p>
      <button onClick={disconnectWallet}>Disconnect</button>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Call Contract Function</h2>
        <input 
          placeholder="Contract Address (e.g., ST123...ABC.contract-name)"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <input 
          placeholder="Function Name"
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <input 
          placeholder="Parameter 1 (uint)"
          value={param1}
          onChange={(e) => setParam1(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <input 
          placeholder="Parameter 2 (uint)"
          value={param2}
          onChange={(e) => setParam2(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <button onClick={callContractFunction}>Execute Function</button>
        
        {status && <p style={{ marginTop: '10px' }}>{status}</p>}
        {txId && (
          <p>
            View transaction: 
            <a href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`} target="_blank" rel="noreferrer">
              {txId}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;