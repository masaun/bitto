import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  makeContractSTXPostCondition,
  FungibleConditionCode,
  bufferCVFromString,
  uintCV,
  stringAsciiCV,
  PostConditionMode,
  callReadOnlyFunction,
  cvToJSON
} from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.CONFIDENTIAL_BIDDING_ENGINE_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'confidential-bidding-engine';
const NETWORK = new StacksMainnet();

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function connectWallet() {
  showConnect({
    appDetails: {
      name: 'ConfidentialBiddingEngine',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

async function createEntry(data: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'create-entry',
    functionArgs: [bufferCVFromString(data)],
    senderKey: userSession.loadUserData().appPrivateKey,
    validateWithAbi: true,
    network: NETWORK,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Transaction:', data);
      alert('Transaction submitted: ' + data.txId);
    },
  };
  await makeContractCall(txOptions);
}

async function updateEntry(id: number, data: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'update-entry',
    functionArgs: [uintCV(id), bufferCVFromString(data)],
    senderKey: userSession.loadUserData().appPrivateKey,
    validateWithAbi: true,
    network: NETWORK,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Transaction:', data);
      alert('Transaction submitted: ' + data.txId);
    },
  };
  await makeContractCall(txOptions);
}

async function updateStatus(id: number, status: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'update-status',
    functionArgs: [uintCV(id), stringAsciiCV(status)],
    senderKey: userSession.loadUserData().appPrivateKey,
    validateWithAbi: true,
    network: NETWORK,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Transaction:', data);
      alert('Transaction submitted: ' + data.txId);
    },
  };
  await makeContractCall(txOptions);
}

async function getEntry(id: number) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS.split('.')[0],
      contractName: CONTRACT_NAME,
      functionName: 'get-entry',
      functionArgs: [uintCV(id)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS.split('.')[0],
    });
    const resultElement = document.getElementById('entry-result');
    if (resultElement) {
      resultElement.textContent = JSON.stringify(cvToJSON(result), null, 2);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error fetching entry: ' + error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-wallet');
  const createBtn = document.getElementById('create-entry');
  const updateBtn = document.getElementById('update-entry');
  const statusBtn = document.getElementById('update-status');
  const getBtn = document.getElementById('get-entry');
  
  connectBtn?.addEventListener('click', connectWallet);
  
  createBtn?.addEventListener('click', async () => {
    const input = document.getElementById('data-input') as HTMLInputElement;
    if (input && input.value) {
      await createEntry(input.value);
    }
  });
  
  updateBtn?.addEventListener('click', async () => {
    const idInput = document.getElementById('id-input') as HTMLInputElement;
    const dataInput = document.getElementById('update-data-input') as HTMLInputElement;
    if (idInput && dataInput && idInput.value && dataInput.value) {
      await updateEntry(parseInt(idInput.value), dataInput.value);
    }
  });
  
  statusBtn?.addEventListener('click', async () => {
    const idInput = document.getElementById('status-id-input') as HTMLInputElement;
    const statusInput = document.getElementById('status-input') as HTMLInputElement;
    if (idInput && statusInput && idInput.value && statusInput.value) {
      await updateStatus(parseInt(idInput.value), statusInput.value);
    }
  });
  
  getBtn?.addEventListener('click', async () => {
    const idInput = document.getElementById('get-id-input') as HTMLInputElement;
    if (idInput && idInput.value) {
      await getEntry(parseInt(idInput.value));
    }
  });
  
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    const addressElement = document.getElementById('user-address');
    if (addressElement) {
      addressElement.textContent = userData.profile.stxAddress.mainnet;
    }
  }
});
