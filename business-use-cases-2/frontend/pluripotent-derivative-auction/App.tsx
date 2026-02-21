import { useConnect } from '@stacks/connect-react';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { uintCV, stringAsciiCV } from '@stacks/transactions';
import { useState } from 'react';

const contractAddress = process.env.REACT_APP_PLURIPOTENT_DERIVATIVE_AUCTION_CONTRACT_ADDRESS || '';
const contractName = 'pluripotent-derivative-auction';
const network = process.env.REACT_APP_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

export default function App() {
  const { doContractCall } = useConnect();
  const [recordId, setRecordId] = useState('0');
  const [data, setData] = useState('');
  const [status, setStatus] = useState('pending');
  const [txStatus, setTxStatus] = useState('');

  const handleCreateRecord = async () => {
    setTxStatus('Creating record...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'create-record',
      functionArgs: [stringAsciiCV(data), stringAsciiCV(status)],
      onFinish: (result) => {
        setTxStatus(`Transaction submitted: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  const handleUpdateStatus = async () => {
    setTxStatus('Updating status...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'update-status',
      functionArgs: [uintCV(recordId), stringAsciiCV(status)],
      onFinish: (result) => {
        setTxStatus(`Status updated: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  const handleToggleActive = async () => {
    setTxStatus('Toggling active status...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'toggle-active',
      functionArgs: [uintCV(recordId)],
      onFinish: (result) => {
        setTxStatus(`Active status toggled: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>pluripotent derivative auction</h1>
      <p>Contract: {contractAddress}.{contractName}</p>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Status:</strong> {txStatus || 'Ready'}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Create Record</h2>
        <input
          placeholder="Data"
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '300px' }}
        />
        <input
          placeholder="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '150px' }}
        />
        <button onClick={handleCreateRecord}>Create Record</button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Manage Record</h2>
        <input
          placeholder="Record ID"
          type="number"
          value={recordId}
          onChange={(e) => setRecordId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleUpdateStatus} style={{ marginRight: '10px' }}>
          Update Status
        </button>
        <button onClick={handleToggleActive}>Toggle Active</button>
      </div>
    </div>
  );
}
