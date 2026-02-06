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

export default function HumanoidRobotProduction() {
  const [userData, setUserData] = useState<any>(null);
  const [robotModel, setRobotModel] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [batchId, setBatchId] = useState('');
  const [robotId, setRobotId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [actuatorCount, setActuatorCount] = useState('');
  const [sensorCount, setSensorCount] = useState('');
  const [aiChip, setAiChip] = useState('');
  const [newStage, setNewStage] = useState('');
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [robotInfo, setRobotInfo] = useState<any>(null);

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
        name: 'Humanoid Robot Production',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const startProduction = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'start-production',
      functionArgs: [
        stringAsciiCV(robotModel),
        uintCV(targetQuantity)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const addRobot = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'add-robot',
      functionArgs: [
        uintCV(batchId),
        uintCV(robotId),
        stringAsciiCV(serialNumber),
        uintCV(actuatorCount),
        uintCV(sensorCount),
        stringAsciiCV(aiChip)
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
      functionArgs: [
        uintCV(batchId),
        uintCV(robotId),
        stringAsciiCV(newStage)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeTesting = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-testing',
      functionArgs: [uintCV(batchId), uintCV(robotId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeBatch = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-batch',
      functionArgs: [uintCV(batchId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getBatchInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-batch-info',
      functionArgs: [uintCV(batchId)],
      network,
      senderAddress: contractAddress,
    });

    setBatchInfo(cvToValue(result));
  };

  const getRobotInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-robot-info',
      functionArgs: [uintCV(batchId), uintCV(robotId)],
      network,
      senderAddress: contractAddress,
    });

    setRobotInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Humanoid Robot Production</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Start Production</h2>
            <input placeholder="Robot Model" value={robotModel} onChange={(e) => setRobotModel(e.target.value)} />
            <input placeholder="Target Quantity" value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} />
            <button onClick={startProduction}>Start Production</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Add Robot</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <input placeholder="Serial Number" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
            <input placeholder="Actuator Count" value={actuatorCount} onChange={(e) => setActuatorCount(e.target.value)} />
            <input placeholder="Sensor Count" value={sensorCount} onChange={(e) => setSensorCount(e.target.value)} />
            <input placeholder="AI Chip" value={aiChip} onChange={(e) => setAiChip(e.target.value)} />
            <button onClick={addRobot}>Add Robot</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Assembly Stage</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <input placeholder="New Stage" value={newStage} onChange={(e) => setNewStage(e.target.value)} />
            <button onClick={updateAssemblyStage}>Update Assembly Stage</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Testing</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <button onClick={completeTesting}>Complete Testing</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Batch</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <button onClick={completeBatch}>Complete Batch</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Batch Info</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <button onClick={getBatchInfo}>Get Batch Info</button>
            {batchInfo && <pre>{JSON.stringify(batchInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Robot Info</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <button onClick={getRobotInfo}>Get Robot Info</button>
            {robotInfo && <pre>{JSON.stringify(robotInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
