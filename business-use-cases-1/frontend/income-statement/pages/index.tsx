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

export default function IncomeStatement() {
  const [userData, setUserData] = useState<any>(null);
  const [company, setCompany] = useState('');
  const [period, setPeriod] = useState('');
  const [revenue, setRevenue] = useState('');
  const [cogs, setCogs] = useState('');
  const [operating, setOperating] = useState('');
  const [interest, setInterest] = useState('');
  const [tax, setTax] = useState('');
  const [owner, setOwner] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [statementData, setStatementData] = useState<any>(null);

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
        name: 'Income Statement',
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

  const submitStatement = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'submit-statement',
      functionArgs: [
        principalCV(company),
        uintCV(period),
        uintCV(revenue),
        uintCV(cogs),
        uintCV(operating),
        uintCV(interest),
        uintCV(tax)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateRevenue = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-revenue',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateCogs = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-cogs',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateOperatingExpenses = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-operating-expenses',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getStatement = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-statement',
      functionArgs: [principalCV(company), uintCV(period)],
      network,
      senderAddress: contractAddress,
    });

    setStatementData(cvToValue(result));
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
      <h1>Income Statement</h1>
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
            <h3>Submit Statement</h3>
            <input placeholder="Company Address" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="Revenue" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
            <input placeholder="COGS" value={cogs} onChange={(e) => setCogs(e.target.value)} />
            <input placeholder="Operating Expenses" value={operating} onChange={(e) => setOperating(e.target.value)} />
            <input placeholder="Interest Expense" value={interest} onChange={(e) => setInterest(e.target.value)} />
            <input placeholder="Tax Expense" value={tax} onChange={(e) => setTax(e.target.value)} />
            <button onClick={submitStatement}>Submit</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Update Functions</h3>
            <input placeholder="Company Address" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="New Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <button onClick={updateRevenue}>Update Revenue</button>
            <button onClick={updateCogs}>Update COGS</button>
            <button onClick={updateOperatingExpenses}>Update Operating Expenses</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Get Statement</h3>
            <button onClick={getStatement}>Get</button>
            {statementData && <pre>{JSON.stringify(statementData, null, 2)}</pre>}
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
