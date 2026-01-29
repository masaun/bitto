import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { uintCV, stringAsciiCV, intCV, boolCV, makeContractCall, AnchorMode, PostConditionMode, standardPrincipalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'rtk-network-for-agriculture';

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [altitude, setAltitude] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [stationId, setStationId] = useState('');
  const [duration, setDuration] = useState('');
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
      appDetails: { name: 'RTK Network for Agriculture', icon: window.location.origin + '/logo.png' },
      redirectTo: '/',
      onFinish: () => setUserData(userSession.loadUserData()),
      userSession,
    });
  };

  const registerRTKStation = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      await makeContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-rtk-station',
        functionArgs: [
          stringAsciiCV(location),
          intCV(parseInt(latitude)),
          intCV(parseInt(longitude)),
          intCV(parseInt(altitude)),
          uintCV(parseInt(accuracy))
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus('Station registered successfully');
          setLoading(false);
        },
      });
    } catch (error) {
      setStatus('Error: ' + error);
      setLoading(false);
    }
  };

  const subscribeToStation = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      await makeContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'subscribe-to-station',
        functionArgs: [
          uintCV(parseInt(stationId)),
          uintCV(parseInt(duration))
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus('Subscribed successfully');
          setLoading(false);
        },
      });
    } catch (error) {
      setStatus('Error: ' + error);
      setLoading(false);
    }
  };

  const updateStationStatus = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      await makeContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-station-status',
        functionArgs: [
          uintCV(parseInt(stationId)),
          boolCV(status === 'active')
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus('Station status updated');
          setLoading(false);
        },
      });
    } catch (error) {
      setStatus('Error: ' + error);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>RTK Network for Agriculture</h1>
      {!userData ? (
        <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>Connect Wallet</button>
      ) : (
        <div>
          <p>Address: {userData.profile.stxAddress.mainnet}</p>
          <button onClick={() => userSession.signUserOut('/')} style={{ marginBottom: '20px' }}>Disconnect</button>
          
          <div style={{ marginTop: '20px' }}>
            <h2>Register RTK Station</h2>
            <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ margin: '5px', padding: '5px' }} />
            <input placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} style={{ margin: '5px', padding: '5px' }} />
            <input placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} style={{ margin: '5px', padding: '5px' }} />
            <input placeholder="Altitude" value={altitude} onChange={(e) => setAltitude(e.target.value)} style={{ margin: '5px', padding: '5px' }} />
            <input placeholder="Accuracy" value={accuracy} onChange={(e) => setAccuracy(e.target.value)} style={{ margin: '5px', padding: '5px' }} />
            <button onClick={registerRTKStation} disabled={loading} style={{ margin: '5px', padding: '10px' }}>Register Station</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Subscribe to Station</h2>
            <input placeholder="Station ID" value={stationId} onChange={(e) => setStationId(e.target.value)} style={{ margin: '5px', padding: '5px' }} />
            <input placeholder="Duration (blocks)" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ margin: '5px', padding: '5px' }} />
            <button onClick={subscribeToStation} disabled={loading} style={{ margin: '5px', padding: '10px' }}>Subscribe</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Station Status</h2>
            <input placeholder="Station ID" value={stationId} onChange={(e) => setStationId(e.target.value)} style={{ margin: '5px', padding: '5px' }} />
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ margin: '5px', padding: '5px' }}>
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button onClick={updateStationStatus} disabled={loading} style={{ margin: '5px', padding: '10px' }}>Update Status</button>
          </div>

          {status && <p style={{ marginTop: '20px', color: status.includes('Error') ? 'red' : 'green' }}>{status}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
