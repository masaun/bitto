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

export default function LithiumBatteryMonitoring() {
  const [userData, setUserData] = useState<any>(null);
  const [batteryType, setBatteryType] = useState('');
  const [targetCells, setTargetCells] = useState('');
  const [capacityMah, setCapacityMah] = useState('');
  const [batchId, setBatchId] = useState('');
  const [cellId, setCellId] = useState('');
  const [voltage, setVoltage] = useState('');
  const [capacity, setCapacity] = useState('');
  const [temperature, setTemperature] = useState('');
  const [cycleCount, setCycleCount] = useState('');
  const [qualityGrade, setQualityGrade] = useState('');
  const [newCount, setNewCount] = useState('');
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [cellInfo, setCellInfo] = useState<any>(null);

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
        name: 'Lithium Battery Monitoring',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const startBatteryBatch = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'start-battery-batch',
      functionArgs: [
        stringAsciiCV(batteryType),
        uintCV(targetCells),
        uintCV(capacityMah)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const addBatteryCell = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'add-battery-cell',
      functionArgs: [
        uintCV(batchId),
        uintCV(cellId),
        uintCV(voltage),
        uintCV(capacity)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const testCell = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'test-cell',
      functionArgs: [
        uintCV(batchId),
        uintCV(cellId),
        uintCV(temperature),
        uintCV(cycleCount),
        stringAsciiCV(qualityGrade)
      ],
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

  const updateProducedCells = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-produced-cells',
      functionArgs: [uintCV(batchId), uintCV(newCount)],
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

  const getCellInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-cell-info',
      functionArgs: [uintCV(batchId), uintCV(cellId)],
      network,
      senderAddress: contractAddress,
    });

    setCellInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Lithium Battery Monitoring</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Start Battery Batch</h2>
            <input placeholder="Battery Type" value={batteryType} onChange={(e) => setBatteryType(e.target.value)} />
            <input placeholder="Target Cells" value={targetCells} onChange={(e) => setTargetCells(e.target.value)} />
            <input placeholder="Capacity (mAh)" value={capacityMah} onChange={(e) => setCapacityMah(e.target.value)} />
            <button onClick={startBatteryBatch}>Start Battery Batch</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Add Battery Cell</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Cell ID" value={cellId} onChange={(e) => setCellId(e.target.value)} />
            <input placeholder="Voltage" value={voltage} onChange={(e) => setVoltage(e.target.value)} />
            <input placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            <button onClick={addBatteryCell}>Add Battery Cell</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Test Cell</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Cell ID" value={cellId} onChange={(e) => setCellId(e.target.value)} />
            <input placeholder="Temperature" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
            <input placeholder="Cycle Count" value={cycleCount} onChange={(e) => setCycleCount(e.target.value)} />
            <input placeholder="Quality Grade" value={qualityGrade} onChange={(e) => setQualityGrade(e.target.value)} />
            <button onClick={testCell}>Test Cell</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Batch</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <button onClick={completeBatch}>Complete Batch</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Produced Cells</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="New Count" value={newCount} onChange={(e) => setNewCount(e.target.value)} />
            <button onClick={updateProducedCells}>Update Produced Cells</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Batch Info</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <button onClick={getBatchInfo}>Get Batch Info</button>
            {batchInfo && <pre>{JSON.stringify(batchInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Cell Info</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Cell ID" value={cellId} onChange={(e) => setCellId(e.target.value)} />
            <button onClick={getCellInfo}>Get Cell Info</button>
            {cellInfo && <pre>{JSON.stringify(cellInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
