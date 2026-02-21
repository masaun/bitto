import { useConnect } from '@stacks/connect-react';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { uintCV, principalCV, stringAsciiCV } from '@stacks/transactions';
import { useState } from 'react';

const contractAddress = process.env.REACT_APP_SMALL_BUSINESS_STAMP_CARD_CONTRACT_ADDRESS || '';
const contractName = 'small-business-stamp-card';
const network = process.env.REACT_APP_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

export default function App() {
  const { doContractCall } = useConnect();
  const [questName, setQuestName] = useState('');
  const [reward, setReward] = useState('100');
  const [level, setLevel] = useState('1');
  const [questId, setQuestId] = useState('0');
  const [status, setStatus] = useState('');

  const handleRegisterParticipant = async () => {
    setStatus('Registering participant...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'register-participant',
      functionArgs: [],
      onFinish: (result) => {
        setStatus(`Transaction submitted: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setStatus('Transaction cancelled'),
    });
  };

  const handleCreateQuest = async () => {
    setStatus('Creating quest...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'create-quest',
      functionArgs: [
        stringAsciiCV(questName),
        uintCV(reward),
        uintCV(level),
      ],
      onFinish: (result) => {
        setStatus(`Quest created: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setStatus('Transaction cancelled'),
    });
  };

  const handleCompleteQuest = async () => {
    setStatus('Completing quest...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'complete-quest',
      functionArgs: [uintCV(questId)],
      onFinish: (result) => {
        setStatus(`Quest completed: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setStatus('Transaction cancelled'),
    });
  };

  const handleClaimReward = async () => {
    setStatus('Claiming reward...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'claim-reward',
      functionArgs: [uintCV(questId)],
      onFinish: (result) => {
        setStatus(`Reward claimed: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setStatus('Transaction cancelled'),
    });
  };

  const handleUpdateLevel = async () => {
    setStatus('Updating level...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'update-level',
      functionArgs: [uintCV(level)],
      onFinish: (result) => {
        setStatus(`Level updated: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setStatus('Transaction cancelled'),
    });
  };

  const handleDeactivate = async () => {
    setStatus('Deactivating participant...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'deactivate-participant',
      functionArgs: [],
      onFinish: (result) => {
        setStatus(`Participant deactivated: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setStatus('Transaction cancelled'),
    });
  };

  const handleToggleQuest = async () => {
    setStatus('Toggling quest...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'toggle-quest',
      functionArgs: [uintCV(questId)],
      onFinish: (result) => {
        setStatus(`Quest toggled: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setStatus('Transaction cancelled'),
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Small Business Stamp Card</h1>
      <p>Contract: {contractAddress}.{contractName}</p>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Status:</strong> {status || 'Ready'}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Participant Management</h2>
        <button onClick={handleRegisterParticipant} style={{ marginRight: '10px' }}>
          Register Participant
        </button>
        <button onClick={handleDeactivate}>Deactivate Participant</button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Create Quest</h2>
        <input
          placeholder="Quest Name"
          value={questName}
          onChange={(e) => setQuestName(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          placeholder="Reward"
          type="number"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <input
          placeholder="Required Level"
          type="number"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleCreateQuest}>Create Quest</button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Quest Management</h2>
        <input
          placeholder="Quest ID"
          type="number"
          value={questId}
          onChange={(e) => setQuestId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleCompleteQuest} style={{ marginRight: '10px' }}>
          Complete Quest
        </button>
        <button onClick={handleClaimReward} style={{ marginRight: '10px' }}>
          Claim Reward
        </button>
        <button onClick={handleToggleQuest}>Toggle Quest</button>
      </div>

      <div>
        <h2>Update Level</h2>
        <input
          placeholder="New Level"
          type="number"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleUpdateLevel}>Update Level</button>
      </div>
    </div>
  );
}
