import { useConnect } from '@stacks/connect-react';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { uintCV, stringAsciiCV } from '@stacks/transactions';
import { useState } from 'react';

const contractAddress = process.env.REACT_APP_MONSOON_DERIVATIVE_VAULT_CONTRACT_ADDRESS || '';
const contractName = 'monsoon-derivative-vault';
const network = process.env.REACT_APP_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

export default function App() {
  const { doContractCall } = useConnect();
  const [entryId, setEntryId] = useState('0');
  const [dataHash, setDataHash] = useState('');
  const [value, setValue] = useState('100');
  const [amount, setAmount] = useState('10');
  const [txStatus, setTxStatus] = useState('');

  const handleCreateEntry = async () => {
    setTxStatus('Creating entry...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'create-entry',
      functionArgs: [stringAsciiCV(dataHash), uintCV(value)],
      onFinish: (result) => {
        setTxStatus(`Transaction submitted: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  const handleVerifyEntry = async () => {
    setTxStatus('Verifying entry...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'verify-entry',
      functionArgs: [uintCV(entryId)],
      onFinish: (result) => {
        setTxStatus(`Entry verified: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  const handleUpdateBalance = async () => {
    setTxStatus('Updating balance...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'update-balance',
      functionArgs: [uintCV(amount)],
      onFinish: (result) => {
        setTxStatus(`Balance updated: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>monsoon derivative vault</h1>
      <p>Contract: {contractAddress}.{contractName}</p>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Status:</strong> {txStatus || 'Ready'}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Create Entry</h2>
        <input
          placeholder="Data Hash"
          value={dataHash}
          onChange={(e) => setDataHash(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '300px' }}
        />
        <input
          placeholder="Value"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleCreateEntry}>Create Entry</button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Verify Entry</h2>
        <input
          placeholder="Entry ID"
          type="number"
          value={entryId}
          onChange={(e) => setEntryId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleVerifyEntry}>Verify Entry</button>
      </div>

      <div>
        <h2>Update Balance</h2>
        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleUpdateBalance}>Update Balance</button>
      </div>
    </div>
  );
}
