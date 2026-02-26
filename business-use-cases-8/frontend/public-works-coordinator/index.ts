import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  uintCV,
  stringAsciiCV,
  PostConditionMode
} from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.PUBLIC_WORKS_COORDINATOR_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'public-works-coordinator';
const NETWORK = new StacksMainnet();

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function connectWallet() {
  showConnect({
    appDetails: {
      name: 'Construction Contract',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

async function registerEntity(value: number) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'register-entity',
    functionArgs: [uintCV(value)],
    senderKey: userSession.loadUserData().appPrivateKey,
    validateWithAbi: true,
    network: NETWORK,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data: any) => {
      console.log('Transaction:', data);
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
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data: any) => {
      console.log('Transaction:', data);
    },
  };
  await makeContractCall(txOptions);
}

export { connectWallet, registerEntity, updateStatus };
