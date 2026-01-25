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

export default function SemiconductorDesignProcess() {
  const [userData, setUserData] = useState<any>(null);
  const [chipName, setChipName] = useState('');
  const [architecture, setArchitecture] = useState('');
  const [processNode, setProcessNode] = useState('');
  const [transistorCount, setTransistorCount] = useState('');
  const [designId, setDesignId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [milestoneName, setMilestoneName] = useState('');
  const [description, setDescription] = useState('');
  const [newStage, setNewStage] = useState('');
  const [newCount, setNewCount] = useState('');
  const [designInfo, setDesignInfo] = useState<any>(null);
  const [milestoneInfo, setMilestoneInfo] = useState<any>(null);

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
        name: 'Semiconductor Design Process',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const createDesign = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'create-design',
      functionArgs: [
        stringAsciiCV(chipName),
        stringAsciiCV(architecture),
        uintCV(processNode),
        uintCV(transistorCount)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const addMilestone = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'add-milestone',
      functionArgs: [
        uintCV(designId),
        uintCV(milestoneId),
        stringAsciiCV(milestoneName),
        stringAsciiCV(description)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeMilestone = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-milestone',
      functionArgs: [uintCV(designId), uintCV(milestoneId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateDesignStage = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-design-stage',
      functionArgs: [uintCV(designId), stringAsciiCV(newStage)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateTransistorCount = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-transistor-count',
      functionArgs: [uintCV(designId), uintCV(newCount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getDesignInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-design-info',
      functionArgs: [uintCV(designId)],
      network,
      senderAddress: contractAddress,
    });

    setDesignInfo(cvToValue(result));
  };

  const getMilestoneInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-milestone-info',
      functionArgs: [uintCV(designId), uintCV(milestoneId)],
      network,
      senderAddress: contractAddress,
    });

    setMilestoneInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Semiconductor Design Process</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Create Design</h2>
            <input placeholder="Chip Name" value={chipName} onChange={(e) => setChipName(e.target.value)} />
            <input placeholder="Architecture" value={architecture} onChange={(e) => setArchitecture(e.target.value)} />
            <input placeholder="Process Node" value={processNode} onChange={(e) => setProcessNode(e.target.value)} />
            <input placeholder="Transistor Count" value={transistorCount} onChange={(e) => setTransistorCount(e.target.value)} />
            <button onClick={createDesign}>Create Design</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Add Milestone</h2>
            <input placeholder="Design ID" value={designId} onChange={(e) => setDesignId(e.target.value)} />
            <input placeholder="Milestone ID" value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)} />
            <input placeholder="Milestone Name" value={milestoneName} onChange={(e) => setMilestoneName(e.target.value)} />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button onClick={addMilestone}>Add Milestone</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Milestone</h2>
            <input placeholder="Design ID" value={designId} onChange={(e) => setDesignId(e.target.value)} />
            <input placeholder="Milestone ID" value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)} />
            <button onClick={completeMilestone}>Complete Milestone</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Design Stage</h2>
            <input placeholder="Design ID" value={designId} onChange={(e) => setDesignId(e.target.value)} />
            <input placeholder="New Stage" value={newStage} onChange={(e) => setNewStage(e.target.value)} />
            <button onClick={updateDesignStage}>Update Design Stage</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Transistor Count</h2>
            <input placeholder="Design ID" value={designId} onChange={(e) => setDesignId(e.target.value)} />
            <input placeholder="New Count" value={newCount} onChange={(e) => setNewCount(e.target.value)} />
            <button onClick={updateTransistorCount}>Update Transistor Count</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Design Info</h2>
            <input placeholder="Design ID" value={designId} onChange={(e) => setDesignId(e.target.value)} />
            <button onClick={getDesignInfo}>Get Design Info</button>
            {designInfo && <pre>{JSON.stringify(designInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Milestone Info</h2>
            <input placeholder="Design ID" value={designId} onChange={(e) => setDesignId(e.target.value)} />
            <input placeholder="Milestone ID" value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)} />
            <button onClick={getMilestoneInfo}>Get Milestone Info</button>
            {milestoneInfo && <pre>{JSON.stringify(milestoneInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
