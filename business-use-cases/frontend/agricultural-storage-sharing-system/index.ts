import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  uintCV,
  stringAsciiCV,
  stringUtf8CV,
  principalCV,
  boolCV,
  bufferCVFromString,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { openContractCall } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = process.env.AGRICULTURAL_STORAGE_SHARING_SYSTEM_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'agricultural-storage-sharing-system';

export async function connectWallet() {
  showConnect({
    appDetails: {
      name: 'Agricultural Storage Sharing System',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

export function getUserData() {
  return userSession.loadUserData();
}

export function isUserSignedIn() {
  return userSession.isUserSignedIn();
}

export function disconnect() {
  userSession.signUserOut('/');
}

export async function list_storage() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'list-storage',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      alert(`Transaction broadcasted: ${data.txId}`);
    },
    onCancel: () => {
      console.log('Transaction canceled');
    },
  };

  await openContractCall(options);
}

export async function rent_storage() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'rent-storage',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      alert(`Transaction broadcasted: ${data.txId}`);
    },
    onCancel: () => {
      console.log('Transaction canceled');
    },
  };

  await openContractCall(options);
}

export async function end_rental() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'end-rental',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      alert(`Transaction broadcasted: ${data.txId}`);
    },
    onCancel: () => {
      console.log('Transaction canceled');
    },
  };

  await openContractCall(options);
}

export async function get_storage_space() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-storage-space`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: CONTRACT_ADDRESS.split('.')[0],
        arguments: [],
      }),
    }
  );
  
  return await response.json();
}

export async function get_rental() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-rental`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: CONTRACT_ADDRESS.split('.')[0],
        arguments: [],
      }),
    }
  );
  
  return await response.json();
}
