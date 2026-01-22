import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { PostConditionMode, makeContractCall, broadcastTransaction } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = import.meta.env.VITE_STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractName = 'decentralized-gpu-network';

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
      name: 'Decentralized Gpu Network',
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

document.getElementById('register-provider').addEventListener('click', () => {
  callContract('register-provider', []);
});

document.getElementById('submit-compute-job').addEventListener('click', () => {
  callContract('submit-compute-job', []);
});

document.getElementById('assign-job').addEventListener('click', () => {
  callContract('assign-job', []);
});

document.getElementById('submit-result').addEventListener('click', () => {
  callContract('submit-result', []);
});

document.getElementById('verify-and-pay').addEventListener('click', () => {
  callContract('verify-and-pay', []);
});

document.getElementById('update-provider-status').addEventListener('click', () => {
  callContract('update-provider-status', []);
});

updateWalletStatus();
