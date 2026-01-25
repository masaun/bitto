import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  stringAsciiCV,
  uintCV,
  intCV,
  principalCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function CashflowStatement() {
  const [userData, setUserData] = useState<any>(null);
  const [company, setCompany] = useState('');
  const [period, setPeriod] = useState('');
  const [operating, setOperating] = useState('');
  const [investing, setInvesting] = useState('');
  const [financing, setFinancing] = useState('');
  const [beginning, setBeginning] = useState('');
  const [ending, setEnding] = useState('');
  const [owner, setOwner] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [queryCompany, setQueryCompany] = useState('');
  const [queryPeriod, setQueryPeriod] = useState('');
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
        name: 'Cashflow Statement',
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
        intCV(operating),
        intCV(investing),
        intCV(financing),
        uintCV(beginning),
        uintCV(ending)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateOperatingActivities = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-operating-activities',
      functionArgs: [principalCV(company), uintCV(period), intCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateInvestingActivities = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-investing-activities',
      functionArgs: [principalCV(company), uintCV(period), intCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateFinancingActivities = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-financing-activities',
      functionArgs: [principalCV(company), uintCV(period), intCV(newAmount)],
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
      functionArgs: [principalCV(queryCompany), uintCV(queryPeriod)],
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
      functionArgs: [principalCV(queryCompany)],
      network,
      senderAddress: contractAddress,
    });

    alert(JSON.stringify(cvToValue(result)));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cashflow Statement</h1>
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
            <input placeholder="Operating Activities" value={operating} onChange={(e) => setOperating(e.target.value)} />
            <input placeholder="Investing Activities" value={investing} onChange={(e) => setInvesting(e.target.value)} />
            <input placeholder="Financing Activities" value={financing} onChange={(e) => setFinancing(e.target.value)} />
            <input placeholder="Beginning Balance" value={beginning} onChange={(e) => setBeginning(e.target.value)} />
            <input placeholder="Ending Balance" value={ending} onChange={(e) => setEnding(e.target.value)} />
            <button onClick={submitStatement}>Submit</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Update Operating Activities</h3>
            <input placeholder="Company Address" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="New Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <button onClick={updateOperatingActivities}>Update</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Update Investing Activities</h3>
            <button onClick={updateInvestingActivities}>Update</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Update Financing Activities</h3>
            <button onClick={updateFinancingActivities}>Update</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Get Statement</h3>
            <input placeholder="Company Address" value={queryCompany} onChange={(e) => setQueryCompany(e.target.value)} />
            <input placeholder="Period" value={queryPeriod} onChange={(e) => setQueryPeriod(e.target.value)} />
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
