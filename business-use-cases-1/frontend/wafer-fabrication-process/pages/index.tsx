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

export default function WaferFabricationProcess() {
  const [userData, setUserData] = useState<any>(null);
  const [waferSize, setWaferSize] = useState('');
  const [waferCount, setWaferCount] = useState('');
  const [processNode, setProcessNode] = useState('');
  const [batchId, setBatchId] = useState('');
  const [waferId, setWaferId] = useState('');
  const [defectCount, setDefectCount] = useState('');
  const [yieldRate, setYieldRate] = useState('');
  const [qualityGrade, setQualityGrade] = useState('');
  const [processingTime, setProcessingTime] = useState('');
  const [newDefectCount, setNewDefectCount] = useState('');
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [waferInfo, setWaferInfo] = useState<any>(null);

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
        name: 'Wafer Fabrication Process',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const startWaferBatch = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'start-wafer-batch',
      functionArgs: [
        uintCV(waferSize),
        uintCV(waferCount),
        uintCV(processNode)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const addWafer = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'add-wafer',
      functionArgs: [
        uintCV(batchId),
        uintCV(waferId),
        uintCV(defectCount),
        uintCV(yieldRate),
        stringAsciiCV(qualityGrade)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeWafer = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-wafer',
      functionArgs: [
        uintCV(batchId),
        uintCV(waferId),
        uintCV(processingTime)
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

  const updateWaferDefects = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-wafer-defects',
      functionArgs: [
        uintCV(batchId),
        uintCV(waferId),
        uintCV(newDefectCount)
      ],
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

  const getWaferInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-wafer-info',
      functionArgs: [uintCV(batchId), uintCV(waferId)],
      network,
      senderAddress: contractAddress,
    });

    setWaferInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Wafer Fabrication Process</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Start Wafer Batch</h2>
            <input placeholder="Wafer Size" value={waferSize} onChange={(e) => setWaferSize(e.target.value)} />
            <input placeholder="Wafer Count" value={waferCount} onChange={(e) => setWaferCount(e.target.value)} />
            <input placeholder="Process Node" value={processNode} onChange={(e) => setProcessNode(e.target.value)} />
            <button onClick={startWaferBatch}>Start Wafer Batch</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Add Wafer</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Wafer ID" value={waferId} onChange={(e) => setWaferId(e.target.value)} />
            <input placeholder="Defect Count" value={defectCount} onChange={(e) => setDefectCount(e.target.value)} />
            <input placeholder="Yield Rate" value={yieldRate} onChange={(e) => setYieldRate(e.target.value)} />
            <input placeholder="Quality Grade" value={qualityGrade} onChange={(e) => setQualityGrade(e.target.value)} />
            <button onClick={addWafer}>Add Wafer</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Wafer</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Wafer ID" value={waferId} onChange={(e) => setWaferId(e.target.value)} />
            <input placeholder="Processing Time" value={processingTime} onChange={(e) => setProcessingTime(e.target.value)} />
            <button onClick={completeWafer}>Complete Wafer</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Batch</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <button onClick={completeBatch}>Complete Batch</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Wafer Defects</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Wafer ID" value={waferId} onChange={(e) => setWaferId(e.target.value)} />
            <input placeholder="New Defect Count" value={newDefectCount} onChange={(e) => setNewDefectCount(e.target.value)} />
            <button onClick={updateWaferDefects}>Update Wafer Defects</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Batch Info</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <button onClick={getBatchInfo}>Get Batch Info</button>
            {batchInfo && <pre>{JSON.stringify(batchInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Wafer Info</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Wafer ID" value={waferId} onChange={(e) => setWaferId(e.target.value)} />
            <button onClick={getWaferInfo}>Get Wafer Info</button>
            {waferInfo && <pre>{JSON.stringify(waferInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
