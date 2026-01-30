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

const CONTRACT_ADDRESS = process.env.ALACS_STYLE_WHISTLEBLOWING_PLATFORM_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'alacs-style-whistleblowing-platform';

export async function connectWallet() {
  showConnect({
    appDetails: {
      name: 'Alacs Style Whistleblowing Platform',
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

export async function file_complaint() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'file-complaint',
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

export async function register_legal_officer() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'register-legal-officer',
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

export async function review_case() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'review-case',
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

export async function update_complaint_status() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'update-complaint-status',
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

export async function deactivate_officer() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'deactivate-officer',
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

export async function transfer_ownership() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'transfer-ownership',
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

export async function get_owner)() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-owner)`,
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

export async function get_complaint() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-complaint`,
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

export async function get_legal_officer() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-legal-officer`,
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

export async function get_case_review() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-case-review`,
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
