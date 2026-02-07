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
  boolCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function OnchainKyt() {
  const [userData, setUserData] = useState<any>(null);
  const [txId, setTxId] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [alertId, setAlertId] = useState('');
  const [description, setDescription] = useState('');
  const [riskScore, setRiskScore] = useState('');
  const [resolution, setResolution] = useState('');
  const [transactionInfo, setTransactionInfo] = useState<any>(null);
  const [alertInfo, setAlertInfo] = useState<any>(null);

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
        name: 'Onchain KYT',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const recordTransaction = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'record-transaction',
      functionArgs: [
        stringAsciiCV(txId),
        principalCV(fromAddress),
        principalCV(toAddress),
        uintCV(amount),
        stringAsciiCV(currency)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const flagTransaction = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'flag-transaction',
      functionArgs: [
        stringAsciiCV(txId),
        stringAsciiCV(flagReason)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const createRiskAlert = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'create-risk-alert',
      functionArgs: [
        stringAsciiCV(txId),
        stringAsciiCV(description),
        uintCV(riskScore)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const resolveAlert = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'resolve-alert',
      functionArgs: [
        uintCV(alertId),
        stringAsciiCV(resolution)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateRiskScore = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-risk-score',
      functionArgs: [
        stringAsciiCV(txId),
        uintCV(riskScore)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getTransactionInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-transaction-info',
      functionArgs: [stringAsciiCV(txId)],
      network,
      senderAddress: contractAddress,
    });

    setTransactionInfo(cvToValue(result));
  };

  const getAlertInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-alert-info',
      functionArgs: [uintCV(alertId)],
      network,
      senderAddress: contractAddress,
    });

    setAlertInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Onchain KYT</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Record Transaction</h2>
            <input placeholder="Transaction ID" value={txId} onChange={(e) => setTxId(e.target.value)} />
            <input placeholder="From Address" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
            <input placeholder="To Address" value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
            <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
            <button onClick={recordTransaction}>Record Transaction</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Flag Transaction</h2>
            <input placeholder="Transaction ID" value={txId} onChange={(e) => setTxId(e.target.value)} />
            <input placeholder="Flag Reason" value={flagReason} onChange={(e) => setFlagReason(e.target.value)} />
            <button onClick={flagTransaction}>Flag Transaction</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Create Risk Alert</h2>
            <input placeholder="Transaction ID" value={txId} onChange={(e) => setTxId(e.target.value)} />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input placeholder="Risk Score" value={riskScore} onChange={(e) => setRiskScore(e.target.value)} />
            <button onClick={createRiskAlert}>Create Risk Alert</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Resolve Alert</h2>
            <input placeholder="Alert ID" value={alertId} onChange={(e) => setAlertId(e.target.value)} />
            <input placeholder="Resolution" value={resolution} onChange={(e) => setResolution(e.target.value)} />
            <button onClick={resolveAlert}>Resolve Alert</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Risk Score</h2>
            <input placeholder="Transaction ID" value={txId} onChange={(e) => setTxId(e.target.value)} />
            <input placeholder="Risk Score" value={riskScore} onChange={(e) => setRiskScore(e.target.value)} />
            <button onClick={updateRiskScore}>Update Risk Score</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Transaction Info</h2>
            <input placeholder="Transaction ID" value={txId} onChange={(e) => setTxId(e.target.value)} />
            <button onClick={getTransactionInfo}>Get Transaction Info</button>
            {transactionInfo && <pre>{JSON.stringify(transactionInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Alert Info</h2>
            <input placeholder="Alert ID" value={alertId} onChange={(e) => setAlertId(e.target.value)} />
            <button onClick={getAlertInfo}>Get Alert Info</button>
            {alertInfo && <pre>{JSON.stringify(alertInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
