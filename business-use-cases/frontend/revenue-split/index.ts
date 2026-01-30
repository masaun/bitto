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

const CONTRACT_ADDRESS = process.env.REVENUE_SPLIT_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'revenue-split';

export async function connectWallet() {
  showConnect({
    appDetails: {
      name: 'Revenue Split',
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

export async function set_revenue_split() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'set-revenue-split',
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

export async function distribute_revenue() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'distribute-revenue',
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

export async function claim_revenue)() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'claim-revenue)',
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

export async function set_split_admin() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'set-split-admin',
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

export async function get_revenue_split() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-revenue-split`,
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

export async function get_pending_revenue() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-pending-revenue`,
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
