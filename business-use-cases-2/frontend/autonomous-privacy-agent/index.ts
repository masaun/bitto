import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  uintCV,
  principalCV,
  stringAsciiCV,
  PostConditionMode
} from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.AUTONOMOUS_PRIVACY_AGENT_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'autonomous-privacy-agent';
const NETWORK = new StacksMainnet();

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function connectWallet() {
  showConnect({
    appDetails: {
      name: 'Autonomous Privacy Agent',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

async function registerParticipant() {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'register-participant',
    functionArgs: [],
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

async function createRecord(data: string, amount: number) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'create-record',
    functionArgs: [stringAsciiCV(data), uintCV(amount)],
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

async function updateRecord(id: number, data: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'update-record',
    functionArgs: [uintCV(id), stringAsciiCV(data)],
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

async function deactivateRecord(id: number) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'deactivate-record',
    functionArgs: [uintCV(id)],
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

async function awardPoints(user: string, points: number) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'award-points',
    functionArgs: [principalCV(user), uintCV(points)],
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

document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-wallet');
  const registerBtn = document.getElementById('register-participant');
  const createBtn = document.getElementById('create-record');
  const updateBtn = document.getElementById('update-record');
  const deactivateBtn = document.getElementById('deactivate-record');
  const awardBtn = document.getElementById('award-points');
  
  connectBtn?.addEventListener('click', connectWallet);
  registerBtn?.addEventListener('click', registerParticipant);
  
  createBtn?.addEventListener('click', async () => {
    const dataInput = document.getElementById('data-input') as HTMLInputElement;
    const amountInput = document.getElementById('amount-input') as HTMLInputElement;
    if (dataInput && amountInput && dataInput.value && amountInput.value) {
      await createRecord(dataInput.value, parseInt(amountInput.value));
    }
  });
  
  updateBtn?.addEventListener('click', async () => {
    const idInput = document.getElementById('update-id-input') as HTMLInputElement;
    const dataInput = document.getElementById('update-data-input') as HTMLInputElement;
    if (idInput && dataInput && idInput.value && dataInput.value) {
      await updateRecord(parseInt(idInput.value), dataInput.value);
    }
  });
  
  deactivateBtn?.addEventListener('click', async () => {
    const idInput = document.getElementById('deactivate-id-input') as HTMLInputElement;
    if (idInput && idInput.value) {
      await deactivateRecord(parseInt(idInput.value));
    }
  });
  
  awardBtn?.addEventListener('click', async () => {
    const userInput = document.getElementById('award-user-input') as HTMLInputElement;
    const pointsInput = document.getElementById('award-points-input') as HTMLInputElement;
    if (userInput && pointsInput && userInput.value && pointsInput.value) {
      await awardPoints(userInput.value, parseInt(pointsInput.value));
    }
  });
});
