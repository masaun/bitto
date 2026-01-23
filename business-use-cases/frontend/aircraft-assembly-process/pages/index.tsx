import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  boolCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function AircraftAssemblyProcess() {
  const [userData, setUserData] = useState<any>(null);
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [customer, setCustomer] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [aircraftId, setAircraftId] = useState('');
  const [stageId, setStageId] = useState('');
  const [stageName, setStageName] = useState('');
  const [description, setDescription] = useState('');
  const [qualityPassed, setQualityPassed] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [aircraftInfo, setAircraftInfo] = useState<any>(null);
  const [stageInfo, setStageInfo] = useState<any>(null);

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
        name: 'Aircraft Assembly Process',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const startAssembly = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'start-assembly',
      functionArgs: [
        stringAsciiCV(model),
        stringAsciiCV(serialNumber),
        principalCV(customer),
        uintCV(estimatedCompletion)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const addAssemblyStage = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'add-assembly-stage',
      functionArgs: [
        uintCV(aircraftId),
        uintCV(stageId),
        stringAsciiCV(stageName),
        stringAsciiCV(description)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeStage = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-stage',
      functionArgs: [
        uintCV(aircraftId),
        uintCV(stageId),
        boolCV(qualityPassed)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateAssemblyStage = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-assembly-stage',
      functionArgs = [uintCV(aircraftId), stringAsciiCV(newStage)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeAssembly = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-assembly',
      functionArgs: [uintCV(aircraftId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getAircraftInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-aircraft-info',
      functionArgs: [uintCV(aircraftId)],
      network,
      senderAddress: contractAddress,
    });

    setAircraftInfo(cvToValue(result));
  };

  const getStageInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-stage-info',
      functionArgs: [uintCV(aircraftId), uintCV(stageId)],
      network,
      senderAddress: contractAddress,
    });

    setStageInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Aircraft Assembly Process</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Start Assembly</h2>
            <input placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
            <input placeholder="Serial Number" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
            <input placeholder="Customer" value={customer} onChange={(e) => setCustomer(e.target.value)} />
            <input placeholder="Estimated Completion" value={estimatedCompletion} onChange={(e) => setEstimatedCompletion(e.target.value)} />
            <button onClick={startAssembly}>Start Assembly</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Add Assembly Stage</h2>
            <input placeholder="Aircraft ID" value={aircraftId} onChange={(e) => setAircraftId(e.target.value)} />
            <input placeholder="Stage ID" value={stageId} onChange={(e) => setStageId(e.target.value)} />
            <input placeholder="Stage Name" value={stageName} onChange={(e) => setStageName(e.target.value)} />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button onClick={addAssemblyStage}>Add Assembly Stage</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Stage</h2>
            <input placeholder="Aircraft ID" value={aircraftId} onChange={(e) => setAircraftId(e.target.value)} />
            <input placeholder="Stage ID" value={stageId} onChange={(e) => setStageId(e.target.value)} />
            <label>
              <input type="checkbox" checked={qualityPassed} onChange={(e) => setQualityPassed(e.target.checked)} />
              Quality Passed
            </label>
            <button onClick={completeStage}>Complete Stage</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Assembly Stage</h2>
            <input placeholder="Aircraft ID" value={aircraftId} onChange={(e) => setAircraftId(e.target.value)} />
            <input placeholder="New Stage" value={newStage} onChange={(e) => setNewStage(e.target.value)} />
            <button onClick={updateAssemblyStage}>Update Assembly Stage</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Assembly</h2>
            <input placeholder="Aircraft ID" value={aircraftId} onChange={(e) => setAircraftId(e.target.value)} />
            <button onClick={completeAssembly}>Complete Assembly</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Aircraft Info</h2>
            <input placeholder="Aircraft ID" value={aircraftId} onChange={(e) => setAircraftId(e.target.value)} />
            <button onClick={getAircraftInfo}>Get Aircraft Info</button>
            {aircraftInfo && <pre>{JSON.stringify(aircraftInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Stage Info</h2>
            <input placeholder="Aircraft ID" value={aircraftId} onChange={(e) => setAircraftId(e.target.value)} />
            <input placeholder="Stage ID" value={stageId} onChange={(e) => setStageId(e.target.value)} />
            <button onClick={getStageInfo}>Get Stage Info</button>
            {stageInfo && <pre>{JSON.stringify(stageInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
