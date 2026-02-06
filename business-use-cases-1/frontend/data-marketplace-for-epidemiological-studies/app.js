import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { PostConditionMode, makeContractCall, broadcastTransaction } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = import.meta.env.VITE_STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractName = 'data-marketplace-for-epidemiological-studies';

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
      name: 'Data Marketplace For Epidemiological Studies',
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

document.getElementById('list-dataset').addEventListener('click', () => {
  callContract('list-dataset', []);
});

document.getElementById('purchase-dataset').addEventListener('click', () => {
  callContract('purchase-dataset', []);
});

document.getElementById('submit-quality-rating').addEventListener('click', () => {
  callContract('submit-quality-rating', []);
});

document.getElementById('update-dataset-status').addEventListener('click', () => {
  callContract('update-dataset-status', []);
});

updateWalletStatus();
