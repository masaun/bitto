import { useConnect } from '@stacks/connect-react';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { uintCV, stringAsciiCV, principalCV } from '@stacks/transactions';
import { useState } from 'react';

const contractAddress = process.env.REACT_APP_ORBITVAULT_CUSTODY_CONTRACT_ADDRESS || '';
const contractName = 'orbitvault-custody';
const network = process.env.REACT_APP_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

export default function App() {
  const { doContractCall } = useConnect();
  const [assetId, setAssetId] = useState('0');
  const [assetType, setAssetType] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('10');
  const [txStatus, setTxStatus] = useState('');

  const handleRegisterAsset = async () => {
    setTxStatus('Registering asset...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'register-asset',
      functionArgs: [stringAsciiCV(assetType), uintCV(quantity)],
      onFinish: (result) => {
        setTxStatus(`Asset registered: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  const handleTransferAsset = async () => {
    setTxStatus('Transferring asset...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'transfer-asset',
      functionArgs: [uintCV(assetId), principalCV(recipient), uintCV(amount)],
      onFinish: (result) => {
        setTxStatus(`Asset transferred: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  const handleLockAsset = async () => {
    setTxStatus('Locking asset...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'lock-asset',
      functionArgs: [uintCV(assetId)],
      onFinish: (result) => {
        setTxStatus(`Asset locked: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  const handleUnlockAsset = async () => {
    setTxStatus('Unlocking asset...');
    await doContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'unlock-asset',
      functionArgs: [uintCV(assetId)],
      onFinish: (result) => {
        setTxStatus(`Asset unlocked: ${result.txId}`);
        console.log('Transaction:', result);
      },
      onCancel: () => setTxStatus('Transaction cancelled'),
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>oruitvault custody</h1>
      <p>Contract: {contractAddress}.{contractName}</p>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Status:</strong> {txStatus || 'Ready'}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Register Asset</h2>
        <input
          placeholder="Asset Type"
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '200px' }}
        />
        <input
          placeholder="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleRegisterAsset}>Register Asset</button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Transfer Asset</h2>
        <input
          placeholder="Asset ID"
          type="number"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <input
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '300px' }}
        />
        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleTransferAsset}>Transfer</button>
      </div>

      <div>
        <h2>Lock/Unlock Asset</h2>
        <input
          placeholder="Asset ID"
          type="number"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '100px' }}
        />
        <button onClick={handleLockAsset} style={{ marginRight: '10px' }}>
          Lock Asset
        </button>
        <button onClick={handleUnlockAsset}>Unlock Asset</button>
      </div>
    </div>
  );
}
