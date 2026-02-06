import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { useState, useEffect } from 'react';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function AcceleratorProgramRegistry() {
  const [userData, setUserData] = useState(null);
  const [programId, setProgramId] = useState('');
  const [programName, setProgramName] = useState('');
  const [operator, setOperator] = useState('');
  const [duration, setDuration] = useState('');
  const [equityStake, setEquityStake] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [txId, setTxId] = useState('');

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const authenticate = () => {
    showConnect({
      appDetails: {
        name: 'Accelerator Program Registry',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const registerProgram = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'accelerator-program-registry',
      functionName: 'register-program',
      functionArgs: [
        stringAsciiCV(programId),
        stringAsciiCV(programName),
        principalCV(operator),
        uintCV(duration),
        uintCV(equityStake),
        uintCV(investmentAmount)
      ],
      senderKey: userData.appPrivateKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(options);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    setTxId(broadcastResponse.txid);
  };

  const updateProgram = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'accelerator-program-registry',
      functionName: 'update-program',
      functionArgs: [
        stringAsciiCV(programId),
        stringAsciiCV(programName),
        uintCV(duration),
        uintCV(equityStake),
        uintCV(investmentAmount)
      ],
      senderKey: userData.appPrivateKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(options);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    setTxId(broadcastResponse.txid);
  };

  const deactivateProgram = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'accelerator-program-registry',
      functionName: 'deactivate-program',
      functionArgs: [stringAsciiCV(programId)],
      senderKey: userData.appPrivateKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(options);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    setTxId(broadcastResponse.txid);
  };

  if (!userData) {
    return (
      <div>
        <h1>Accelerator Program Registry</h1>
        <button onClick={authenticate}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Accelerator Program Registry</h1>
      <p>Connected: {userData.profile.stxAddress.mainnet}</p>

      <div>
        <h2>Register Program</h2>
        <input
          type="text"
          placeholder="Program ID"
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Program Name"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Operator Address"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
        />
        <input
          type="number"
          placeholder="Duration (blocks)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <input
          type="number"
          placeholder="Equity Stake"
          value={equityStake}
          onChange={(e) => setEquityStake(e.target.value)}
        />
        <input
          type="number"
          placeholder="Investment Amount"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(e.target.value)}
        />
        <button onClick={registerProgram}>Register Program</button>
      </div>

      <div>
        <h2>Update Program</h2>
        <button onClick={updateProgram}>Update Program</button>
      </div>

      <div>
        <h2>Deactivate Program</h2>
        <button onClick={deactivateProgram}>Deactivate Program</button>
      </div>

      {txId && <p>Transaction ID: {txId}</p>}
    </div>
  );
}
