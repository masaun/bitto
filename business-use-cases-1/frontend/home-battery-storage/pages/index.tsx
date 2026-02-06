import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  stringAsciiCV,
  uintCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function HomeBatteryStorage() {
  const [userData, setUserData] = useState<any>(null);
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [systemId, setSystemId] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newCharge, setNewCharge] = useState('');
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [transactionInfo, setTransactionInfo] = useState<any>(null);

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
        name: 'Home Battery Storage',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const installSystem = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'install-system',
      functionArgs: [
        stringAsciiCV(location),
        uintCV(capacity),
        uintCV(warrantyPeriod)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const chargeBattery = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'charge-battery',
      functionArgs: [
        uintCV(systemId),
        uintCV(amount),
        uintCV(transactionId)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const dischargeBattery = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'discharge-battery',
      functionArgs: [
        uintCV(systemId),
        uintCV(amount),
        uintCV(transactionId)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateStatus = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-status',
      functionArgs: [uintCV(systemId), stringAsciiCV(newStatus)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateCurrentCharge = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-current-charge',
      functionArgs: [uintCV(systemId), uintCV(newCharge)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getSystemInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-system-info',
      functionArgs: [uintCV(systemId)],
      network,
      senderAddress: contractAddress,
    });

    setSystemInfo(cvToValue(result));
  };

  const getTransaction = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-transaction',
      functionArgs: [uintCV(systemId), uintCV(transactionId)],
      network,
      senderAddress: contractAddress,
    });

    setTransactionInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Home Battery Storage</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Install System</h2>
            <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <input placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            <input placeholder="Warranty Period" value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} />
            <button onClick={installSystem}>Install System</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Charge Battery</h2>
            <input placeholder="System ID" value={systemId} onChange={(e) => setSystemId(e.target.value)} />
            <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input placeholder="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
            <button onClick={chargeBattery}>Charge Battery</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Discharge Battery</h2>
            <input placeholder="System ID" value={systemId} onChange={(e) => setSystemId(e.target.value)} />
            <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input placeholder="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
            <button onClick={dischargeBattery}>Discharge Battery</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Status</h2>
            <input placeholder="System ID" value={systemId} onChange={(e) => setSystemId(e.target.value)} />
            <input placeholder="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
            <button onClick={updateStatus}>Update Status</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Current Charge</h2>
            <input placeholder="System ID" value={systemId} onChange={(e) => setSystemId(e.target.value)} />
            <input placeholder="New Charge" value={newCharge} onChange={(e) => setNewCharge(e.target.value)} />
            <button onClick={updateCurrentCharge}>Update Current Charge</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get System Info</h2>
            <input placeholder="System ID" value={systemId} onChange={(e) => setSystemId(e.target.value)} />
            <button onClick={getSystemInfo}>Get System Info</button>
            {systemInfo && <pre>{JSON.stringify(systemInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Transaction</h2>
            <input placeholder="System ID" value={systemId} onChange={(e) => setSystemId(e.target.value)} />
            <input placeholder="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
            <button onClick={getTransaction}>Get Transaction</button>
            {transactionInfo && <pre>{JSON.stringify(transactionInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
