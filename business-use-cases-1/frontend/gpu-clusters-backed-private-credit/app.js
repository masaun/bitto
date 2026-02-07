import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { PostConditionMode, makeContractCall, broadcastTransaction } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = import.meta.env.VITE_STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractName = 'gpu-clusters-backed-private-credit';

function updateWalletStatus() {
  const statusDiv = document.getElementById('wallet-status');
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    statusDiv.innerHTML = `Connected: ${userData.profile.stxAddress.mainnet}`;
  } else {
    statusDiv.innerHTML = 'Not connected';
  }
}

document.getElementById('connect-wallet').addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Gpu Clusters Backed Private Credit',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      updateWalletStatus();
    },
    userSession,
  });
});

async function callContract(functionName, functionArgs) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    senderKey: userSession.loadUserData().appPrivateKey,
    network,
    postConditionMode: PostConditionMode.Allow,
  };
  
  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  alert(`Transaction ID: ${broadcastResponse.txid}`);
}

document.getElementById('register-gpu-cluster').addEventListener('click', () => {
  callContract('register-gpu-cluster', []);
});

document.getElementById('verify-cluster').addEventListener('click', () => {
  callContract('verify-cluster', []);
});

document.getElementById('request-loan').addEventListener('click', () => {
  callContract('request-loan', []);
});

document.getElementById('approve-loan').addEventListener('click', () => {
  callContract('approve-loan', []);
});

document.getElementById('distribute-revenue').addEventListener('click', () => {
  callContract('distribute-revenue', []);
});

document.getElementById('repay-loan').addEventListener('click', () => {
  callContract('repay-loan', []);
});

document.getElementById('default-loan').addEventListener('click', () => {
  callContract('default-loan', []);
});

updateWalletStatus();
