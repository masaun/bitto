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

export default function interiorMaterialSourcing() {
  const [userData, setUserData] = useState(null);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderId, setOrderId] = useState('');
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
        name: 'Interior Material Sourcing',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const registerSupplier = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.REACT_APP_INTERIOR_MATERIAL_SOURCING_CONTRACT_ADDRESS.split('.')[0];
    const contractName = 'interior-material-sourcing';
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'register-supplier',
      functionArgs: [],
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

  const addItem = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.REACT_APP_INTERIOR_MATERIAL_SOURCING_CONTRACT_ADDRESS.split('.')[0];
    const contractName = 'interior-material-sourcing';
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'add-item',
      functionArgs: [
        stringAsciiCV(itemName),
        uintCV(price),
        uintCV(stock)
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

  const createOrder = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.REACT_APP_INTERIOR_MATERIAL_SOURCING_CONTRACT_ADDRESS.split('.')[0];
    const contractName = 'interior-material-sourcing';
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'create-order',
      functionArgs: [
        uintCV(itemId),
        uintCV(quantity)
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

  const fulfillOrder = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.REACT_APP_INTERIOR_MATERIAL_SOURCING_CONTRACT_ADDRESS.split('.')[0];
    const contractName = 'interior-material-sourcing';
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'fulfill-order',
      functionArgs: [uintCV(orderId)],
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

  const updateStock = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.REACT_APP_INTERIOR_MATERIAL_SOURCING_CONTRACT_ADDRESS.split('.')[0];
    const contractName = 'interior-material-sourcing';
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'update-stock',
      functionArgs: [
        uintCV(itemId),
        uintCV(stock)
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

  const updatePrice = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.REACT_APP_INTERIOR_MATERIAL_SOURCING_CONTRACT_ADDRESS.split('.')[0];
    const contractName = 'interior-material-sourcing';
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'update-price',
      functionArgs: [
        uintCV(itemId),
        uintCV(price)
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

  const toggleItem = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.REACT_APP_INTERIOR_MATERIAL_SOURCING_CONTRACT_ADDRESS.split('.')[0];
    const contractName = 'interior-material-sourcing';
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'toggle-item',
      functionArgs: [uintCV(itemId)],
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
        <button onClick={authenticate}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Interior Material Sourcing</h1>
      <p>Connected: {userData.profile.stxAddress.mainnet}</p>
      
      <h2>Register Supplier</h2>
      <button onClick={registerSupplier}>Register as Supplier</button>

      <h2>Add Item</h2>
      <input placeholder="Item Name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
      <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
      <input placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
      <button onClick={addItem}>Add Item</button>

      <h2>Create Order</h2>
      <input placeholder="Item ID" value={itemId} onChange={(e) => setItemId(e.target.value)} />
      <input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      <button onClick={createOrder}>Create Order</button>

      <h2>Fulfill Order</h2>
      <input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
      <button onClick={fulfillOrder}>Fulfill Order</button>

      <h2>Update Stock</h2>
      <input placeholder="Item ID" value={itemId} onChange={(e) => setItemId(e.target.value)} />
      <input placeholder="New Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
      <button onClick={updateStock}>Update Stock</button>

      <h2>Update Price</h2>
      <input placeholder="Item ID" value={itemId} onChange={(e) => setItemId(e.target.value)} />
      <input placeholder="New Price" value={price} onChange={(e) => setPrice(e.target.value)} />
      <button onClick={updatePrice}>Update Price</button>

      <h2>Toggle Item</h2>
      <input placeholder="Item ID" value={itemId} onChange={(e) => setItemId(e.target.value)} />
      <button onClick={toggleItem}>Toggle Item</button>

      {txId && <p>Transaction ID: {txId}</p>}
    </div>
  );
}
