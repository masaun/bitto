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

export default function RobotMaintainanceAutomation() {
  const [userData, setUserData] = useState<any>(null);
  const [robotId, setRobotId] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [taskId, setTaskId] = useState('');
  const [taskType, setTaskType] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [technician, setTechnician] = useState('');
  const [hours, setHours] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [robotInfo, setRobotInfo] = useState<any>(null);
  const [taskInfo, setTaskInfo] = useState<any>(null);

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
        name: 'Robot Maintenance Automation',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const registerRobot = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'register-robot',
      functionArgs: [
        stringAsciiCV(robotId),
        stringAsciiCV(model),
        stringAsciiCV(location)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const scheduleMaintenance = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'schedule-maintenance',
      functionArgs: [
        stringAsciiCV(robotId),
        uintCV(taskId),
        stringAsciiCV(taskType),
        stringAsciiCV(description),
        uintCV(scheduledAt),
        principalCV(technician)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const completeMaintenance = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'complete-maintenance',
      functionArgs: [stringAsciiCV(robotId), uintCV(taskId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateOperationalHours = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-operational-hours',
      functionArgs: [stringAsciiCV(robotId), uintCV(hours)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateNextScheduled = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-next-scheduled',
      functionArgs: [stringAsciiCV(robotId), uintCV(nextDate)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getRobotInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-robot-info',
      functionArgs: [stringAsciiCV(robotId)],
      network,
      senderAddress: contractAddress,
    });

    setRobotInfo(cvToValue(result));
  };

  const getTaskInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-task-info',
      functionArgs: [stringAsciiCV(robotId), uintCV(taskId)],
      network,
      senderAddress: contractAddress,
    });

    setTaskInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Robot Maintenance Automation</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Register Robot</h2>
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <input placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
            <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <button onClick={registerRobot}>Register Robot</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Schedule Maintenance</h2>
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <input placeholder="Task ID" value={taskId} onChange={(e) => setTaskId(e.target.value)} />
            <input placeholder="Task Type" value={taskType} onChange={(e) => setTaskType(e.target.value)} />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input placeholder="Scheduled At" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            <input placeholder="Technician" value={technician} onChange={(e) => setTechnician(e.target.value)} />
            <button onClick={scheduleMaintenance}>Schedule Maintenance</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Complete Maintenance</h2>
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <input placeholder="Task ID" value={taskId} onChange={(e) => setTaskId(e.target.value)} />
            <button onClick={completeMaintenance}>Complete Maintenance</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Operational Hours</h2>
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <input placeholder="Hours" value={hours} onChange={(e) => setHours(e.target.value)} />
            <button onClick={updateOperationalHours}>Update Operational Hours</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Next Scheduled</h2>
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <input placeholder="Next Date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
            <button onClick={updateNextScheduled}>Update Next Scheduled</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Robot Info</h2>
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <button onClick={getRobotInfo}>Get Robot Info</button>
            {robotInfo && <pre>{JSON.stringify(robotInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Task Info</h2>
            <input placeholder="Robot ID" value={robotId} onChange={(e) => setRobotId(e.target.value)} />
            <input placeholder="Task ID" value={taskId} onChange={(e) => setTaskId(e.target.value)} />
            <button onClick={getTaskInfo}>Get Task Info</button>
            {taskInfo && <pre>{JSON.stringify(taskInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
