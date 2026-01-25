import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  uintCV, 
  stringAsciiCV,
  principalCV,
  callReadOnlyFunction,
  makeContractCall,
  AnchorMode
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [stockId, setStockId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ticker, setTicker] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [buyer, setBuyer] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [holder, setHolder] = useState('');
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
        name: 'Tokenized Stocks Platform',
        icon: 'https://stacks.org/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const handleIssueStock = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'issue-stock',
      functionArgs: [
        stringAsciiCV(stockId),
        stringAsciiCV(companyName),
        stringAsciiCV(ticker),
        uintCV(initialSupply)
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

  const handleCreateTradeOrder = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'create-trade-order',
      functionArgs: [
        stringAsciiCV(stockId),
        principalCV(buyer),
        uintCV(quantity),
        uintCV(price)
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

  const handleSettleTrade = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'settle-trade',
      functionArgs: [uintCV(orderId)],
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

  const handleTransferStock = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'transfer-stock',
      functionArgs: [stringAsciiCV(stockId), uintCV(amount), principalCV(recipient)],
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

  const handleGetStockInfo = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-stock-info',
        functionArgs: [stringAsciiCV(stockId)],
        senderAddress: contractAddress,
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleGetBalance = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-balance',
        functionArgs: [stringAsciiCV(stockId), principalCV(holder)],
        senderAddress: contractAddress,
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleGetOrder = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-order',
        functionArgs: [uintCV(orderId)],
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
      <h1>Tokenized Stocks Platform</h1>
      
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Issue Stock</h3>
            <input placeholder="Stock ID" value={stockId} onChange={(e) => setStockId(e.target.value)} />
            <input placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <input placeholder="Ticker" value={ticker} onChange={(e) => setTicker(e.target.value)} />
            <input placeholder="Initial Supply" value={initialSupply} onChange={(e) => setInitialSupply(e.target.value)} />
            <button onClick={handleIssueStock}>Issue</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Create Trade Order</h3>
            <input placeholder="Stock ID" value={stockId} onChange={(e) => setStockId(e.target.value)} />
            <input placeholder="Buyer Principal" value={buyer} onChange={(e) => setBuyer(e.target.value)} />
            <input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <button onClick={handleCreateTradeOrder}>Create Order</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Settle Trade</h3>
            <input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            <button onClick={handleSettleTrade}>Settle</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Transfer Stock</h3>
            <input placeholder="Stock ID" value={stockId} onChange={(e) => setStockId(e.target.value)} />
            <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input placeholder="Recipient Principal" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <button onClick={handleTransferStock}>Transfer</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Stock Info</h3>
            <input placeholder="Stock ID" value={stockId} onChange={(e) => setStockId(e.target.value)} />
            <button onClick={handleGetStockInfo}>Query</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Balance</h3>
            <input placeholder="Stock ID" value={stockId} onChange={(e) => setStockId(e.target.value)} />
            <input placeholder="Holder Principal" value={holder} onChange={(e) => setHolder(e.target.value)} />
            <button onClick={handleGetBalance}>Query</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Order</h3>
            <input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            <button onClick={handleGetOrder}>Query</button>
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
