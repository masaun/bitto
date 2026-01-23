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
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function SemiconductorManufacturing() {
  const [userData, setUserData] = useState<any>(null);
  const [chipType, setChipType] = useState('');
  const [nodeSize, setNodeSize] = useState('');
  const [waferCount, setWaferCount] = useState('');
  const [processId, setProcessId] = useState('');
  const [stepId, setStepId] = useState('');
  const [stepName, setStepName] = useState('');
  const [duration, setDuration] = useState('');
  const [qualityScore, setQualityScore] = useState('');
  const [newCount, setNewCount] = useState('');
  const [processInfo, setProcessInfo] = useState<any>(null);
  const [stepInfo, setStepInfo] = useState<any>(null);

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
        name: 'Semiconductor Manufacturing',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const startManufacturing = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'start-manufacturing',
      functionArgs: [
        stringAsciiCV(chipType),
        uintCV(nodeSize),
        uintCV(waferCount)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const addProductionStep = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'add-production-step',
      functionArgs: [
        uintCV(processId),
        uintCV(stepId),
        stringAsciiCV(stepName),
        uintCV(duration)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeStep = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-step',
      functionArgs: [
        uintCV(processId),
        uintCV(stepId),
        uintCV(qualityScore)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeManufacturing = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-manufacturing',
      functionArgs: [uintCV(processId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateWaferCount = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-wafer-count',
      functionArgs: [uintCV(processId), uintCV(newCount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getProcessInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-process-info',
      functionArgs: [uintCV(processId)],
      network,
      senderAddress: contractAddress,
    });

    setProcessInfo(cvToValue(result));
  };

  const getStepInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-step-info',
      functionArgs: [uintCV(processId), uintCV(stepId)],
      network,
      senderAddress: contractAddress,
    });

    setStepInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Semiconductor Manufacturing</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Start Manufacturing</h2>
            <input placeholder="Chip Type" value={chipType} onChange={(e) => setChipType(e.target.value)} />
            <input placeholder="Node Size" value={nodeSize} onChange={(e) => setNodeSize(e.target.value)} />
            <input placeholder="Wafer Count" value={waferCount} onChange={(e) => setWaferCount(e.target.value)} />
            <button onClick={startManufacturing}>Start Manufacturing</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Add Production Step</h2>
            <input placeholder="Process ID" value={processId} onChange={(e) => setProcessId(e.target.value)} />
            <input placeholder="Step ID" value={stepId} onChange={(e) => setStepId(e.target.value)} />
            <input placeholder="Step Name" value={stepName} onChange={(e) => setStepName(e.target.value)} />
            <input placeholder="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <button onClick={addProductionStep}>Add Production Step</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Step</h2>
            <input placeholder="Process ID" value={processId} onChange={(e) => setProcessId(e.target.value)} />
            <input placeholder="Step ID" value={stepId} onChange={(e) => setStepId(e.target.value)} />
            <input placeholder="Quality Score" value={qualityScore} onChange={(e) => setQualityScore(e.target.value)} />
            <button onClick={completeStep}>Complete Step</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Manufacturing</h2>
            <input placeholder="Process ID" value={processId} onChange={(e) => setProcessId(e.target.value)} />
            <button onClick={completeManufacturing}>Complete Manufacturing</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Wafer Count</h2>
            <input placeholder="Process ID" value={processId} onChange={(e) => setProcessId(e.target.value)} />
            <input placeholder="New Count" value={newCount} onChange={(e) => setNewCount(e.target.value)} />
            <button onClick={updateWaferCount}>Update Wafer Count</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Process Info</h2>
            <input placeholder="Process ID" value={processId} onChange={(e) => setProcessId(e.target.value)} />
            <button onClick={getProcessInfo}>Get Process Info</button>
            {processInfo && <pre>{JSON.stringify(processInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Step Info</h2>
            <input placeholder="Process ID" value={processId} onChange={(e) => setProcessId(e.target.value)} />
            <input placeholder="Step ID" value={stepId} onChange={(e) => setStepId(e.target.value)} />
            <button onClick={getStepInfo}>Get Step Info</button>
            {stepInfo && <pre>{JSON.stringify(stepInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
