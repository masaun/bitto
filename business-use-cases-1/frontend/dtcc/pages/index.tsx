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
  const [assetId, setAssetId] = useState('');
  const [owner, setOwner] = useState('');
  const [quantity, setQuantity] = useState('');
  const [assetType, setAssetType] = useState('');
  const [cusip, setCusip] = useState('');
  const [isin, setIsin] = useState('');
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
        name: 'DTCC - Custodied Assets',
        icon: 'https://stacks.org/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const handleRegisterAsset = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'register-asset',
      functionArgs: [
        stringAsciiCV(assetId),
        principalCV(owner),
        uintCV(quantity),
        stringAsciiCV(assetType),
        stringAsciiCV(cusip),
        stringAsciiCV(isin)
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

  const handleTokenizeAsset = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'tokenize-asset',
      functionArgs: [stringAsciiCV(assetId), principalCV(owner)],
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

  const handleTransferAsset = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'transfer-asset',
      functionArgs: [stringAsciiCV(assetId), uintCV(amount), principalCV(recipient)],
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

  const handleUpdateQuantity = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'update-quantity',
      functionArgs: [stringAsciiCV(assetId), principalCV(owner), uintCV(quantity)],
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

  const handleGetAssetInfo = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-asset-info',
        functionArgs: [stringAsciiCV(assetId), principalCV(owner)],
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
        functionArgs: [stringAsciiCV(assetId), principalCV(holder)],
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
      <h1>DTCC - Custodied Assets</h1>
      
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Register Asset</h3>
            <input placeholder="Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
            <input placeholder="Owner Principal" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <input placeholder="Asset Type" value={assetType} onChange={(e) => setAssetType(e.target.value)} />
            <input placeholder="CUSIP" value={cusip} onChange={(e) => setCusip(e.target.value)} />
            <input placeholder="ISIN" value={isin} onChange={(e) => setIsin(e.target.value)} />
            <button onClick={handleRegisterAsset}>Register</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Tokenize Asset</h3>
            <input placeholder="Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
            <input placeholder="Owner Principal" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <button onClick={handleTokenizeAsset}>Tokenize</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Transfer Asset</h3>
            <input placeholder="Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
            <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input placeholder="Recipient Principal" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <button onClick={handleTransferAsset}>Transfer</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Update Quantity</h3>
            <input placeholder="Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
            <input placeholder="Owner Principal" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <input placeholder="New Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <button onClick={handleUpdateQuantity}>Update</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Asset Info</h3>
            <input placeholder="Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
            <input placeholder="Owner Principal" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <button onClick={handleGetAssetInfo}>Query</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Balance</h3>
            <input placeholder="Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
            <input placeholder="Holder Principal" value={holder} onChange={(e) => setHolder(e.target.value)} />
            <button onClick={handleGetBalance}>Query</button>
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
