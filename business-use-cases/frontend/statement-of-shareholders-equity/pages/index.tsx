import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  uintCV, 
  principalCV, 
  intCV,
  callReadOnlyFunction,
  makeContractCall,
  AnchorMode
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [company, setCompany] = useState('');
  const [period, setPeriod] = useState('');
  const [beginning, setBeginning] = useState('');
  const [issuance, setIssuance] = useState('');
  const [repurchase, setRepurchase] = useState('');
  const [netIncome, setNetIncome] = useState('');
  const [dividends, setDividends] = useState('');
  const [oci, setOci] = useState('');
  const [owner, setOwner] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [queryCompany, setQueryCompany] = useState('');
  const [queryPeriod, setQueryPeriod] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    setMounted(true);
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
        name: 'Statement of Shareholders Equity',
        icon: 'https://stacks.org/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const handleRegisterCompany = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'register-company',
      functionArgs: [principalCV(owner)],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleSubmitStatement = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'submit-statement',
      functionArgs: [
        principalCV(company),
        uintCV(period),
        uintCV(beginning),
        uintCV(issuance),
        uintCV(repurchase),
        uintCV(netIncome),
        uintCV(dividends),
        intCV(oci)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleUpdateStockIssuance = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'update-stock-issuance',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleUpdateStockRepurchase = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'update-stock-repurchase',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleUpdateDividendsPaid = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'update-dividends-paid',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleUpdateNetIncome = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'update-net-income',
      functionArgs: [principalCV(company), uintCV(period), uintCV(newAmount)],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleGetStatement = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-statement',
        functionArgs: [principalCV(queryCompany), uintCV(queryPeriod)],
        senderAddress: contractAddress,
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleGetCompanyOwner = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-company-owner',
        functionArgs: [principalCV(queryCompany)],
        senderAddress: contractAddress,
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Statement of Shareholders Equity</h1>
      
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Register Company</h3>
            <input placeholder="Owner Principal" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <button onClick={handleRegisterCompany}>Register</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Submit Statement</h3>
            <input placeholder="Company Principal" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="Beginning Balance" value={beginning} onChange={(e) => setBeginning(e.target.value)} />
            <input placeholder="Stock Issuance" value={issuance} onChange={(e) => setIssuance(e.target.value)} />
            <input placeholder="Stock Repurchase" value={repurchase} onChange={(e) => setRepurchase(e.target.value)} />
            <input placeholder="Net Income" value={netIncome} onChange={(e) => setNetIncome(e.target.value)} />
            <input placeholder="Dividends" value={dividends} onChange={(e) => setDividends(e.target.value)} />
            <input placeholder="OCI" value={oci} onChange={(e) => setOci(e.target.value)} />
            <button onClick={handleSubmitStatement}>Submit</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Update Stock Issuance</h3>
            <input placeholder="Company Principal" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="New Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <button onClick={handleUpdateStockIssuance}>Update</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Update Stock Repurchase</h3>
            <input placeholder="Company Principal" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="New Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <button onClick={handleUpdateStockRepurchase}>Update</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Update Dividends Paid</h3>
            <input placeholder="Company Principal" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="New Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <button onClick={handleUpdateDividendsPaid}>Update</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Update Net Income</h3>
            <input placeholder="Company Principal" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <input placeholder="New Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <button onClick={handleUpdateNetIncome}>Update</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Statement</h3>
            <input placeholder="Company Principal" value={queryCompany} onChange={(e) => setQueryCompany(e.target.value)} />
            <input placeholder="Period" value={queryPeriod} onChange={(e) => setQueryPeriod(e.target.value)} />
            <button onClick={handleGetStatement}>Query</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Company Owner</h3>
            <input placeholder="Company Principal" value={queryCompany} onChange={(e) => setQueryCompany(e.target.value)} />
            <button onClick={handleGetCompanyOwner}>Query</button>
          </div>

          {result && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', background: '#f5f5f5' }}>
              <h3>Result</h3>
              <pre>{result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
