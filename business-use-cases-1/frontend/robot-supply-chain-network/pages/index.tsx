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
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function RobotSupplyChainNetwork() {
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [threshold, setThreshold] = useState('');
  const [cost, setCost] = useState('');
  const [partId, setPartId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderId, setOrderId] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [newCost, setNewCost] = useState('');
  const [partInfo, setPartInfo] = useState<any>(null);
  const [orderInfo, setOrderInfo] = useState<any>(null);

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
        name: 'Robot Supply Chain Network',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const registerPart = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'register-part',
      functionArgs: [
        stringAsciiCV(name),
        stringAsciiCV(category),
        uintCV(stock),
        uintCV(threshold),
        uintCV(cost)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const placeSupplyOrder = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'place-supply-order',
      functionArgs: [uintCV(partId), uintCV(quantity)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const fulfillSupplyOrder = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'fulfill-supply-order',
      functionArgs: [uintCV(orderId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateStockLevel = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-stock-level',
      functionArgs: [uintCV(partId), uintCV(newLevel)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateUnitCost = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-unit-cost',
      functionArgs: [uintCV(partId), uintCV(newCost)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getPartInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-part-info',
      functionArgs: [uintCV(partId)],
      network,
      senderAddress: contractAddress,
    });

    setPartInfo(cvToValue(result));
  };

  const getOrderInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-order-info',
      functionArgs: [uintCV(orderId)],
      network,
      senderAddress: contractAddress,
    });

    setOrderInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Robot Supply Chain Network</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Register Part</h2>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
            <input placeholder="Threshold" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            <input placeholder="Cost" value={cost} onChange={(e) => setCost(e.target.value)} />
            <button onClick={registerPart}>Register Part</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Place Supply Order</h2>
            <input placeholder="Part ID" value={partId} onChange={(e) => setPartId(e.target.value)} />
            <input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <button onClick={placeSupplyOrder}>Place Supply Order</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Fulfill Supply Order</h2>
            <input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            <button onClick={fulfillSupplyOrder}>Fulfill Supply Order</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Stock Level</h2>
            <input placeholder="Part ID" value={partId} onChange={(e) => setPartId(e.target.value)} />
            <input placeholder="New Level" value={newLevel} onChange={(e) => setNewLevel(e.target.value)} />
            <button onClick={updateStockLevel}>Update Stock Level</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Unit Cost</h2>
            <input placeholder="Part ID" value={partId} onChange={(e) => setPartId(e.target.value)} />
            <input placeholder="New Cost" value={newCost} onChange={(e) => setNewCost(e.target.value)} />
            <button onClick={updateUnitCost}>Update Unit Cost</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Part Info</h2>
            <input placeholder="Part ID" value={partId} onChange={(e) => setPartId(e.target.value)} />
            <button onClick={getPartInfo}>Get Part Info</button>
            {partInfo && <pre>{JSON.stringify(partInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Order Info</h2>
            <input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            <button onClick={getOrderInfo}>Get Order Info</button>
            {orderInfo && <pre>{JSON.stringify(orderInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
