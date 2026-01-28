import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { uintCV, stringAsciiCV, intCV, boolCV, makeContractCall, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'mortgage-on-vessel-backed-loan';

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => setUserData(userData));
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: { name: 'Mortgage On Vessel Backed Loan', icon: window.location.origin + '/logo.png' },
      redirectTo: '/',
      onFinish: () => setUserData(userSession.loadUserData()),
      userSession,
    });
  };

  return (
    <div style={ padding: '20px', fontFamily: 'Arial, sans-serif' }>
      <h1>Mortgage On Vessel Backed Loan</h1>
      {!userData ? (
        <button onClick={connectWallet} style={ padding: '10px 20px', fontSize: '16px' }>Connect Wallet</button>
      ) : (
        <div>
          <p>Address: {userData.profile.stxAddress.mainnet}</p>
          <button onClick={() => userSession.signUserOut('/')} style={ marginBottom: '20px' }>Disconnect</button>
          
          <div style={ marginTop: '20px' }>
            <p>Contract functions will be implemented here based on the specific contract requirements.</p>
            <p>Contract Address: {CONTRACT_ADDRESS}</p>
          </div>

          {status && <p style={ marginTop: '20px', color: status.includes('Error') ? 'red' : 'green' }>{status}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
