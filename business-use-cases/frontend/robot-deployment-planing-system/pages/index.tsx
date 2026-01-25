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

export default function RobotDeploymentPlaningSystem() {
  const [userData, setUserData] = useState<any>(null);
  const [facility, setFacility] = useState('');
  const [robotType, setRobotType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [zone, setZone] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [planId, setPlanId] = useState('');
  const [deploymentId, setDeploymentId] = useState('');
  const [robotSerial, setRobotSerial] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null);

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
        name: 'Robot Deployment Planning System',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const createPlan = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'create-plan',
      functionArgs: [
        stringAsciiCV(facility),
        stringAsciiCV(robotType),
        uintCV(quantity),
        stringAsciiCV(zone),
        uintCV(plannedDate)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const addDeployment = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'add-deployment',
      functionArgs: [
        uintCV(planId),
        uintCV(deploymentId),
        stringAsciiCV(robotSerial),
        stringAsciiCV(location)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeDeployment = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-deployment',
      functionArgs: [uintCV(planId), uintCV(deploymentId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const setOperational = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'set-operational',
      functionArgs: [uintCV(planId), uintCV(deploymentId), boolCV(status)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updatePlanStatus = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-plan-status',
      functionArgs: [uintCV(planId), stringAsciiCV(newStatus)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getPlanInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-plan-info',
      functionArgs: [uintCV(planId)],
      network,
      senderAddress: contractAddress,
    });

    setPlanInfo(cvToValue(result));
  };

  const getDeploymentInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-deployment-info',
      functionArgs: [uintCV(planId), uintCV(deploymentId)],
      network,
      senderAddress: contractAddress,
    });

    setDeploymentInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Robot Deployment Planning System</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Create Plan</h2>
            <input placeholder="Facility" value={facility} onChange={(e) => setFacility(e.target.value)} />
            <input placeholder="Robot Type" value={robotType} onChange={(e) => setRobotType(e.target.value)} />
            <input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <input placeholder="Zone" value={zone} onChange={(e) => setZone(e.target.value)} />
            <input placeholder="Planned Date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} />
            <button onClick={createPlan}>Create Plan</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Add Deployment</h2>
            <input placeholder="Plan ID" value={planId} onChange={(e) => setPlanId(e.target.value)} />
            <input placeholder="Deployment ID" value={deploymentId} onChange={(e) => setDeploymentId(e.target.value)} />
            <input placeholder="Robot Serial" value={robotSerial} onChange={(e) => setRobotSerial(e.target.value)} />
            <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <button onClick={addDeployment}>Add Deployment</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Deployment</h2>
            <input placeholder="Plan ID" value={planId} onChange={(e) => setPlanId(e.target.value)} />
            <input placeholder="Deployment ID" value={deploymentId} onChange={(e) => setDeploymentId(e.target.value)} />
            <button onClick={completeDeployment}>Complete Deployment</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Set Operational</h2>
            <input placeholder="Plan ID" value={planId} onChange={(e) => setPlanId(e.target.value)} />
            <input placeholder="Deployment ID" value={deploymentId} onChange={(e) => setDeploymentId(e.target.value)} />
            <label>
              <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
              Operational
            </label>
            <button onClick={setOperational}>Set Operational</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Plan Status</h2>
            <input placeholder="Plan ID" value={planId} onChange={(e) => setPlanId(e.target.value)} />
            <input placeholder="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
            <button onClick={updatePlanStatus}>Update Plan Status</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Plan Info</h2>
            <input placeholder="Plan ID" value={planId} onChange={(e) => setPlanId(e.target.value)} />
            <button onClick={getPlanInfo}>Get Plan Info</button>
            {planInfo && <pre>{JSON.stringify(planInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Deployment Info</h2>
            <input placeholder="Plan ID" value={planId} onChange={(e) => setPlanId(e.target.value)} />
            <input placeholder="Deployment ID" value={deploymentId} onChange={(e) => setDeploymentId(e.target.value)} />
            <button onClick={getDeploymentInfo}>Get Deployment Info</button>
            {deploymentInfo && <pre>{JSON.stringify(deploymentInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
