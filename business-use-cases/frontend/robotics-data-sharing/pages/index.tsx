import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  stringAsciiCV,
  uintCV,
  boolCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function RoboticsDataSharing() {
  const [userData, setUserData] = useState<any>(null);
  const [robotId, setRobotId] = useState('');
  const [processType, setProcessType] = useState('');
  const [parameters, setParameters] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [dataId, setDataId] = useState('');
  const [requestor, setRequestor] = useState('');
  const [newEfficiency, setNewEfficiency] = useState('');
  const [dataInfo, setDataInfo] = useState<any>(null);

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
        name: 'Robotics Data Sharing',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const submitProcessData = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'submit-process-data',
      functionArgs: [
        stringAsciiCV(robotId),
        stringAsciiCV(processType),
        stringAsciiCV(parameters),
        uintCV(efficiency),
        boolCV(isPublic)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const grantAccess = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'grant-access',
      functionArgs: [uintCV(dataId), principalCV(requestor)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const revokeAccess = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'revoke-access',
      functionArgs: [uintCV(dataId), principalCV(requestor)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateEfficiency = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-efficiency',
      functionArgs: [uintCV(dataId), uintCV(newEfficiency)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const togglePublicAccess = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'toggle-public-access',
      functionArgs: [uintCV(dataId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getData = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-data',
      functionArgs: [uintCV(dataId)],
      network,
      senderAddress: contractAddress,
    });

    setDataInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Robotics Data Sharing</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Submit Process Data</h2>
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <input placeholder="Process Type" value={processType} onChange={(e) => setProcessType(e.target.value)} />
            <input placeholder="Parameters" value={parameters} onChange={(e) => setParameters(e.target.value)} />
            <input placeholder="Efficiency" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} />
            <label>
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Public Access
            </label>
            <button onClick={submitProcessData}>Submit Process Data</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Grant Access</h2>
            <input placeholder="Data ID" value={dataId} onChange={(e) => setDataId(e.target.value)} />
            <input placeholder="Requestor" value={requestor} onChange={(e) => setRequestor(e.target.value)} />
            <button onClick={grantAccess}>Grant Access</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Revoke Access</h2>
            <input placeholder="Data ID" value={dataId} onChange={(e) => setDataId(e.target.value)} />
            <input placeholder="Requestor" value={requestor} onChange={(e) => setRequestor(e.target.value)} />
            <button onClick={revokeAccess}>Revoke Access</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Efficiency</h2>
            <input placeholder="Data ID" value={dataId} onChange={(e) => setDataId(e.target.value)} />
            <input placeholder="New Efficiency" value={newEfficiency} onChange={(e) => setNewEfficiency(e.target.value)} />
            <button onClick={updateEfficiency}>Update Efficiency</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Toggle Public Access</h2>
            <input placeholder="Data ID" value={dataId} onChange={(e) => setDataId(e.target.value)} />
            <button onClick={togglePublicAccess}>Toggle Public Access</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Data</h2>
            <input placeholder="Data ID" value={dataId} onChange={(e) => setDataId(e.target.value)} />
            <button onClick={getData}>Get Data</button>
            {dataInfo && <pre>{JSON.stringify(dataInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
