import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { useState, useEffect } from 'react';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function DemoDayRegistration() {
  const [userData, setUserData] = useState(null);
  const [demoDayId, setDemoDayId] = useState('');
  const [demoDayName, setDemoDayName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [maxPresenters, setMaxPresenters] = useState('');
  const [startupAddress, setStartupAddress] = useState('');
  const [startupId, setStartupId] = useState('');
  const [txId, setTxId] = useState('');

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const authenticate = () => {
    showConnect({
      appDetails: {
        name: 'Demo Day Registration',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const createDemoDay = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'demo-day-registration',
      functionName: 'create-demo-day',
      functionArgs: [
        stringAsciiCV(demoDayId),
        stringAsciiCV(demoDayName),
        uintCV(eventDate),
        uintCV(maxPresenters)
      ],
      senderKey: userData.appPrivateKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(options);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    setTxId(broadcastResponse.txid);
  };

  const registerStartup = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'demo-day-registration',
      functionName: 'register-startup',
      functionArgs: [
        stringAsciiCV(demoDayId),
        principalCV(startupAddress),
        stringAsciiCV(startupId)
      ],
      senderKey: userData.appPrivateKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(options);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    setTxId(broadcastResponse.txid);
  };

  const approveStartup = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'demo-day-registration',
      functionName: 'approve-startup',
      functionArgs: [
        stringAsciiCV(demoDayId),
        principalCV(startupAddress)
      ],
      senderKey: userData.appPrivateKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(options);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    setTxId(broadcastResponse.txid);
  };

  const cancelDemoDay = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'demo-day-registration',
      functionName: 'cancel-demo-day',
      functionArgs: [stringAsciiCV(demoDayId)],
      senderKey: userData.appPrivateKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(options);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    setTxId(broadcastResponse.txid);
  };

  if (!userData) {
    return (
      <div>
        <h1>Demo Day Registration</h1>
        <button onClick={authenticate}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Demo Day Registration</h1>
      <p>Connected: {userData.profile.stxAddress.mainnet}</p>

      <div>
        <h2>Create Demo Day</h2>
        <input
          type="text"
          placeholder="Demo Day ID"
          value={demoDayId}
          onChange={(e) => setDemoDayId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Demo Day Name"
          value={demoDayName}
          onChange={(e) => setDemoDayName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Event Date (block height)"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Presenters"
          value={maxPresenters}
          onChange={(e) => setMaxPresenters(e.target.value)}
        />
        <button onClick={createDemoDay}>Create Demo Day</button>
      </div>

      <div>
        <h2>Register Startup</h2>
        <input
          type="text"
          placeholder="Startup Address"
          value={startupAddress}
          onChange={(e) => setStartupAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Startup ID"
          value={startupId}
          onChange={(e) => setStartupId(e.target.value)}
        />
        <button onClick={registerStartup}>Register Startup</button>
      </div>

      <div>
        <h2>Approve Startup</h2>
        <button onClick={approveStartup}>Approve Startup</button>
      </div>

      <div>
        <h2>Cancel Demo Day</h2>
        <button onClick={cancelDemoDay}>Cancel Demo Day</button>
      </div>

      {txId && <p>Transaction ID: {txId}</p>}
    </div>
  );
}
