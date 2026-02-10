import { useConnect } from '@stacks/connect-react';
import { StacksMainnet } from '@stacks/network';
import { stringUtf8CV, uintCV } from '@stacks/transactions';
import { userSession } from './auth';
import { useState } from 'react';

const contractAddress = process.env.REACT_APP_BID_BOND_MANAGEMENT_CONTRACT_ADDRESS || '';
const contractName = 'bid-bond-management';

export default function App() {
  const { doContractCall } = useConnect();
  const [data, setData] = useState('');

  const handleRegister = async () => {
    await doContractCall({
      network: new StacksMainnet(),
      contractAddress,
      contractName,
      functionName: 'register',
      functionArgs: [stringUtf8CV(data)],
      onFinish: (result) => {
        console.log('Transaction:', result);
      },
    });
  };

  return (
    <div>
      <h1>Bid Bond Management</h1>
      <input value={data} onChange={(e) => setData(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
