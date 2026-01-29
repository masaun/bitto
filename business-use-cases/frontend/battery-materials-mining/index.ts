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

const CONTRACT_ADDRESS = process.env.BATTERY_MATERIALS_MINING_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'battery-materials-mining';

export async function connectWallet() {
  showConnect({
    appDetails: {
      name: 'Battery Materials Mining',
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

export async function register_mine() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'register-mine',
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

export async function license_operation() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'license-operation',
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

export async function log_production() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'log-production',
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

export async function get_mine() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-mine`,
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
