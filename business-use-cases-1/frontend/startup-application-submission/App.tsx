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

export default function StartupApplicationSubmission() {
  const [userData, setUserData] = useState(null);
  const [applicationId, setApplicationId] = useState('');
  const [programId, setProgramId] = useState('');
  const [startupName, setStartupName] = useState('');
  const [founderAddress, setFounderAddress] = useState('');
  const [applicationHash, setApplicationHash] = useState('');
  const [reviewerAddress, setReviewerAddress] = useState('');
  const [newStatus, setNewStatus] = useState('');
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
        name: 'Startup Application Submission',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const submitApplication = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'startup-application-submission',
      functionName: 'submit-application',
      functionArgs: [
        stringAsciiCV(applicationId),
        stringAsciiCV(programId),
        stringAsciiCV(startupName),
        principalCV(founderAddress),
        stringAsciiCV(applicationHash)
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

  const updateApplicationStatus = async () => {
    const network = new StacksMainnet();
    const options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      contractName: 'startup-application-submission',
      functionName: 'update-application-status',
      functionArgs: [
        stringAsciiCV(applicationId),
        stringAsciiCV(newStatus),
        principalCV(reviewerAddress)
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

  if (!userData) {
    return (
      <div>
        <h1>Startup Application Submission</h1>
        <button onClick={authenticate}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Startup Application Submission</h1>
      <p>Connected: {userData.profile.stxAddress.mainnet}</p>

      <div>
        <h2>Submit Application</h2>
        <input
          type="text"
          placeholder="Application ID"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Program ID"
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Startup Name"
          value={startupName}
          onChange={(e) => setStartupName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Founder Address"
          value={founderAddress}
          onChange={(e) => setFounderAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Application Hash"
          value={applicationHash}
          onChange={(e) => setApplicationHash(e.target.value)}
        />
        <button onClick={submitApplication}>Submit Application</button>
      </div>

      <div>
        <h2>Update Application Status</h2>
        <input
          type="text"
          placeholder="Reviewer Address"
          value={reviewerAddress}
          onChange={(e) => setReviewerAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="New Status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        />
        <button onClick={updateApplicationStatus}>Update Status</button>
      </div>

      {txId && <p>Transaction ID: {txId}</p>}
    </div>
  );
}
