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

export default function ChipAtpProcess() {
  const [userData, setUserData] = useState<any>(null);
  const [chipType, setChipType] = useState('');
  const [totalChips, setTotalChips] = useState('');
  const [batchId, setBatchId] = useState('');
  const [chipId, setChipId] = useState('');
  const [voltagePass, setVoltagePass] = useState(false);
  const [frequencyPass, setFrequencyPass] = useState(false);
  const [tempPass, setTempPass] = useState(false);
  const [powerPass, setPowerPass] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

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
        name: 'Chip ATP Process',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const startTestBatch = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'start-test-batch',
      functionArgs: [
        stringAsciiCV(chipType),
        uintCV(totalChips)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const testChip = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'test-chip',
      functionArgs: [
        uintCV(batchId),
        uintCV(chipId),
        boolCV(voltagePass),
        boolCV(frequencyPass),
        boolCV(tempPass),
        boolCV(powerPass)
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
      functionArgs: [uintCV(batchId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateBatchStatus = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-batch-status',
      functionArgs: [uintCV(batchId), stringAsciiCV(newStatus)],
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

  const getTestResult = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-test-result',
      functionArgs: [uintCV(batchId), uintCV(chipId)],
      network,
      senderAddress: contractAddress,
    });

    setTestResult(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Chip ATP Process</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Start Test Batch</h2>
            <input placeholder="Chip Type" value={chipType} onChange={(e) => setChipType(e.target.value)} />
            <input placeholder="Total Chips" value={totalChips} onChange={(e) => setTotalChips(e.target.value)} />
            <button onClick={startTestBatch}>Start Test Batch</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Test Chip</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Chip ID" value={chipId} onChange={(e) => setChipId(e.target.value)} />
            <label>
              <input type="checkbox" checked={voltagePass} onChange={(e) => setVoltagePass(e.target.checked)} />
              Voltage Pass
            </label>
            <label>
              <input type="checkbox" checked={frequencyPass} onChange={(e) => setFrequencyPass(e.target.checked)} />
              Frequency Pass
            </label>
            <label>
              <input type="checkbox" checked={tempPass} onChange={(e) => setTempPass(e.target.checked)} />
              Temperature Pass
            </label>
            <label>
              <input type="checkbox" checked={powerPass} onChange={(e) => setPowerPass(e.target.checked)} />
              Power Pass
            </label>
            <button onClick={testChip}>Test Chip</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Testing</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <button onClick={completeTesting}>Complete Testing</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Batch Status</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
            <button onClick={updateBatchStatus}>Update Batch Status</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Batch Info</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <button onClick={getBatchInfo}>Get Batch Info</button>
            {batchInfo && <pre>{JSON.stringify(batchInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Test Result</h2>
            <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input placeholder="Chip ID" value={chipId} onChange={(e) => setChipId(e.target.value)} />
            <button onClick={getTestResult}>Get Test Result</button>
            {testResult && <pre>{JSON.stringify(testResult, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
