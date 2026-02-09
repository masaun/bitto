 import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  bufferCVFromString,
  uintCV,
  principalCV,
  stringAsciiCV,
  PostConditionMode
} from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.AGENT_SEMANTIC_MEMORY_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'agent-semantic-memory';
const NETWORK = new StacksMainnet();

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function connectWallet() {
  showConnect({
    appDetails: {
      name: 'AgentSemanticMemory',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

async function createRecord(data: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'create-record',
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

async function updateRecord(id: number, data: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'update-record',
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

document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-wallet');
  const createBtn = document.getElementById('create-record');
  const updateBtn = document.getElementById('update-record');
  
  connectBtn?.addEventListener('click', connectWallet);
  
  createBtn?.addEventListener('click', async () => {
    const input = document.getElementById('data-input') as HTMLInputElement;
    if (input && input.value) {
      await createRecord(input.value);
    }
  });
  
  updateBtn?.addEventListener('click', async () => {
    const idInput = document.getElementById('id-input') as HTMLInputElement;
    const dataInput = document.getElementById('update-data-input') as HTMLInputElement;
    if (idInput && dataInput && idInput.value && dataInput.value) {
      await updateRecord(parseInt(idInput.value), dataInput.value);
    }
  });
  
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    document.getElementById('user-address')!.textContent = userData.profile.stxAddress.mainnet;
  }
});
