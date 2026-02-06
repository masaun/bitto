import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  uintCV,
  principalCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function BalanceSheet() {
  const [userData, setUserData] = useState<any>(null);
  const [company, setCompany] = useState('');
  const [period, setPeriod] = useState('');
  const [currentAssets, setCurrentAssets] = useState('');
  const [nonCurrentAssets, setNonCurrentAssets] = useState('');
  const [currentLiabilities, setCurrentLiabilities] = useState('');
  const [nonCurrentLiabilities, setNonCurrentLiabilities] = useState('');
  const [equity, setEquity] = useState('');
  const [owner, setOwner] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [sheetData, setSheetData] = useState<any>(null);

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
        name: 'Balance Sheet',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const registerCompany = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'register-company',
      functionArgs: [principalCV(owner)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const submitSheet = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'submit-sheet',
      functionArgs: [
        principalCV(company),
        uintCV(period),
        uintCV(currentAssets),
        uintCV(nonCurrentAssets),
        uintCV(currentLiabilities),
        uintCV(nonCurrentLiabilities),
        uintCV(equity)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateCurrentAssets = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-current-assets',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateNonCurrentAssets = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-non-current-assets',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateCurrentLiabilities = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-current-liabilities',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateShareholdersEquity = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-shareholders-equity',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getSheet = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-sheet',
      functionArgs: [principalCV(company), uintCV(period)],
      network,
      senderAddress: contractAddress,
    });

    setSheetData(cvToValue(result));
  };

  const getCompanyOwner = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-company-owner',
      functionArgs: [principalCV(company)],
      network,
      senderAddress: contractAddress,
    });

    alert(JSON.stringify(cvToValue(result)));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Balance Sheet</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Register Company</h3>
            <input placeholder="Owner Address" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <button onClick={registerCompany}>Register</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Submit Sheet</h3>
            <input placeholder="Company Address" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="Current Assets" value={currentAssets} onChange={(e) => setCurrentAssets(e.target.value)} />
            <input placeholder="Non-Current Assets" value={nonCurrentAssets} onChange={(e) => setNonCurrentAssets(e.target.value)} />
            <input placeholder="Current Liabilities" value={currentLiabilities} onChange={(e) => setCurrentLiabilities(e.target.value)} />
            <input placeholder="Non-Current Liabilities" value={nonCurrentLiabilities} onChange={(e) => setNonCurrentLiabilities(e.target.value)} />
            <input placeholder="Equity" value={equity} onChange={(e) => setEquity(e.target.value)} />
            <button onClick={submitSheet}>Submit</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Update Functions</h3>
            <input placeholder="Company Address" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="New Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <button onClick={updateCurrentAssets}>Update Current Assets</button>
            <button onClick={updateNonCurrentAssets}>Update Non-Current Assets</button>
            <button onClick={updateCurrentLiabilities}>Update Current Liabilities</button>
            <button onClick={updateShareholdersEquity}>Update Shareholders Equity</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Get Sheet</h3>
            <button onClick={getSheet}>Get</button>
            {sheetData && <pre>{JSON.stringify(sheetData, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Get Company Owner</h3>
            <button onClick={getCompanyOwner}>Get</button>
          </div>
        </div>
      )}
    </div>
  );
}
