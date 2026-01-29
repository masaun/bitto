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

const CONTRACT_ADDRESS = process.env.AGRI_GRANT_ELIGIBILITY_ASSESSMENT_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'agri-grant-eligibility-assessment';

export async function connectWallet() {
  showConnect({
    appDetails: {
      name: 'Agri Grant Eligibility Assessment',
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

export async function create_grant_program() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'create-grant-program',
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

export async function apply_for_grant() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'apply-for-grant',
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

export async function approve_grant() {
  const functionArgs = [
    
  ];

  const options = {
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'approve-grant',
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

export async function get_program() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-program`,
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

export async function get_application() {
  const response = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS.split('.')[0]}/${CONTRACT_NAME}/get-application`,
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
