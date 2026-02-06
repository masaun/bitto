import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  boolCV,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { useState, useEffect } from 'react';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function acceleratorlearningmilestones() {
  const [userData, setUserData] = useState(null);
  const [recordId, setRecordId] = useState('');
  const [dataHash, setDataHash] = useState('');
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
        name: 'accelerator learning milestones',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const createRecord = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'accelerator-learning-milestones',
      functionName: 'create-record',
      functionArgs: [
        stringAsciiCV(recordId),
        stringAsciiCV(dataHash)
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

  const updateRecord = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'accelerator-learning-milestones',
      functionName: 'update-record',
      functionArgs: [
        stringAsciiCV(recordId),
        stringAsciiCV(dataHash)
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

  const deactivateRecord = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'accelerator-learning-milestones',
      functionName: 'deactivate-record',
      functionArgs: [stringAsciiCV(recordId)],
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
        <h1>accelerator learning milestones</h1>
        <button onClick={authenticate}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <h1>accelerator learning milestones</h1>
      <p>Connected: {userData.profile.stxAddress.mainnet}</p>

      <div>
        <h2>Create Record</h2>
        <input
          type="text"
          placeholder="Record ID"
          value={recordId}
          onChange={(e) => setRecordId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Data Hash"
          value={dataHash}
          onChange={(e) => setDataHash(e.target.value)}
        />
        <button onClick={createRecord}>Create Record</button>
      </div>

      <div>
        <h2>Update Record</h2>
        <button onClick={updateRecord}>Update Record</button>
      </div>

      <div>
        <h2>Deactivate Record</h2>
        <button onClick={deactivateRecord}>Deactivate Record</button>
      </div>

      {txId && <p>Transaction ID: {txId}</p>}
    </div>
  );
}
