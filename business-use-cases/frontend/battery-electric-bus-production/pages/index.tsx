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

export default function BatteryElectricBusProduction() {
  const [userData, setUserData] = useState<any>(null);
  const [busModel, setBusModel] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [batchId, setBatchId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState('');
  const [motorPower, setMotorPower] = useState('');
  const [newStage, setNewStage] = useState('');
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [unitInfo, setUnitInfo] = useState<any>(null);

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
        name: 'Battery Electric Bus Production',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const startProductionBatch = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'start-production-batch',
      functionArgs: [
        stringAsciiCV(busModel),
        uintCV(targetQuantity)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const addBusUnit = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'add-bus-unit',
      functionArgs: [
        uintCV(batchId),
        uintCV(unitId),
        stringAsciiCV(chassisNumber),
        uintCV(batteryCapacity),
        uintCV(motorPower)
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
        uintCV(unitId),
        stringAsciiCV(newStage)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeQualityCheck = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-quality-check',
      functionArgs: [uintCV(batchId), uintCV(unitId)],
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

  const getUnitInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-unit-info',
      functionArgs: [uintCV(batchId), uintCV(unitId)],
      network,
      senderAddress: contractAddress,
    });

    setUnitInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Battery Electric Bus Production</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Start Production Batch</h2>
            <input placeholder="Bus Model" value={busModel} onChange={(e) => setBusModel(e.target.value)} />
            <input placeholder="Target Quantity" value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} />
            <button onClick={startProductionBatch}>Start Production Batch</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Add Bus Unit</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Unit ID" value={unitId} onChange={(e) => setUnitId(e.target.value)} />
            <input placeholder="Chassis Number" value={chassisNumber} onChange={(e) => setChassisNumber(e.target.value)} />
            <input placeholder="Battery Capacity" value={batteryCapacity} onChange={(e) => setBatteryCapacity(e.target.value)} />
            <input placeholder="Motor Power" value={motorPower} onChange={(e) => setMotorPower(e.target.value)} />
            <button onClick={addBusUnit}>Add Bus Unit</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Assembly Stage</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Unit ID" value={unitId} onChange={(e) => setUnitId(e.target.value)} />
            <input placeholder="New Stage" value={newStage} onChange={(e) => setNewStage(e.target.value)} />
            <button onClick={updateAssemblyStage}>Update Assembly Stage</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Quality Check</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Unit ID" value={unitId} onChange={(e) => setUnitId(e.target.value)} />
            <button onClick={completeQualityCheck}>Complete Quality Check</button>
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
            <h2>Get Unit Info</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Unit ID" value={unitId} onChange={(e) => setUnitId(e.target.value)} />
            <button onClick={getUnitInfo}>Get Unit Info</button>
            {unitInfo && <pre>{JSON.stringify(unitInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
