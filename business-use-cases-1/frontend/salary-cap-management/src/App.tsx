import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { makeContractCall, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'salary-cap-management';

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => setUserData(userData));
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: { name: 'salary-cap-management', icon: window.location.origin + '/logo.png' },
      redirectTo: '/',
      onFinish: () => setUserData(userSession.loadUserData()),
      userSession,
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>salary-cap-management</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Address: {userData.profile.stxAddress.mainnet}</p>
          <button onClick={() => userSession.signUserOut('/')}>Disconnect</button>
        </div>
      )}
    </div>
  );
}

export default App;
