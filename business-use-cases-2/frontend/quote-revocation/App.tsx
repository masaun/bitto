import { useConnect } from '@stacks/connect-react';
import { StacksMainnet } from '@stacks/network';
import { stringUtf8CV, uintCV } from '@stacks/transactions';
import { userSession } from './auth';
import { useState } from 'react';

const contractAddress = process.env.REACT_APP_QUOTE_REVOCATION_CONTRACT_ADDRESS || '';
const contractName = 'quote-revocation';

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
      <h1>Quote Revocation</h1>
      <input value={data} onChange={(e) => setData(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
