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

export default function RoboticsOem() {
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState('');
  const [compType, setCompType] = useState('');
  const [specs, setSpecs] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [componentId, setComponentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [componentInfo, setComponentInfo] = useState<any>(null);
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
        name: 'Robotics OEM',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const registerComponent = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'register-component',
      functionArgs: [
        stringAsciiCV(name),
        stringAsciiCV(compType),
        stringAsciiCV(specs),
        uintCV(price),
        uintCV(quantity)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const placeOrder = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'place-order',
      functionArgs: [uintCV(componentId), uintCV(quantity)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const fulfillOrder = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'fulfill-order',
      functionArgs: [uintCV(orderId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateStock = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-stock',
      functionArgs: [uintCV(componentId), uintCV(newQuantity)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updatePrice = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-price',
      functionArgs: [uintCV(componentId), uintCV(newPrice)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getComponentInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-component-info',
      functionArgs: [uintCV(componentId)],
      network,
      senderAddress: contractAddress,
    });

    setComponentInfo(cvToValue(result));
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
      <h1>Robotics OEM</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Register Component</h2>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Type" value={compType} onChange={(e) => setCompType(e.target.value)} />
            <input placeholder="Specifications" value={specs} onChange={(e) => setSpecs(e.target.value)} />
            <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <button onClick={registerComponent}>Register Component</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Place Order</h2>
            <input placeholder="Component ID" value={componentId} onChange={(e) => setComponentId(e.target.value)} />
            <input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <button onClick={placeOrder}>Place Order</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Fulfill Order</h2>
            <input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            <button onClick={fulfillOrder}>Fulfill Order</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Stock</h2>
            <input placeholder="Component ID" value={componentId} onChange={(e) => setComponentId(e.target.value)} />
            <input placeholder="New Quantity" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
            <button onClick={updateStock}>Update Stock</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Price</h2>
            <input placeholder="Component ID" value={componentId} onChange={(e) => setComponentId(e.target.value)} />
            <input placeholder="New Price" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            <button onClick={updatePrice}>Update Price</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Component Info</h2>
            <input placeholder="Component ID" value={componentId} onChange={(e) => setComponentId(e.target.value)} />
            <button onClick={getComponentInfo}>Get Component Info</button>
            {componentInfo && <pre>{JSON.stringify(componentInfo, null, 2)}</pre>}
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
