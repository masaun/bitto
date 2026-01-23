import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { stringUtf8CV, uintCV, bufferCV, boolCV, PostConditionMode, makeContractCall, broadcastTransaction } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = import.meta.env.VITE_STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractName = 'decentralized-ai-models-network';

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
      name: 'Decentralized AI Models Network',
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

document.getElementById('register-model').addEventListener('click', () => {
  const modelHash = bufferCV(Buffer.from(document.getElementById('model-hash').value, 'hex'));
  const computePower = uintCV(document.getElementById('compute-power').value);
  const pricePerInference = uintCV(document.getElementById('price-per-inference').value);
  const stakeAmount = uintCV(document.getElementById('stake-amount').value);
  callContract('register-model', [modelHash, computePower, pricePerInference, stakeAmount]);
});

document.getElementById('request-inference').addEventListener('click', () => {
  const modelId = uintCV(document.getElementById('req-model-id').value);
  const inputHash = bufferCV(Buffer.from(document.getElementById('input-hash').value, 'hex'));
  callContract('request-inference', [modelId, inputHash]);
});

document.getElementById('submit-inference').addEventListener('click', () => {
  const taskId = uintCV(document.getElementById('submit-task-id').value);
  const outputHash = bufferCV(Buffer.from(document.getElementById('output-hash').value, 'hex'));
  callContract('submit-inference', [taskId, outputHash]);
});

document.getElementById('verify-and-pay').addEventListener('click', () => {
  const taskId = uintCV(document.getElementById('verify-task-id').value);
  callContract('verify-and-pay', [taskId]);
});

document.getElementById('update-model-status').addEventListener('click', () => {
  const modelId = uintCV(document.getElementById('update-model-id').value);
  const active = boolCV(document.getElementById('model-status').value === 'true');
  callContract('update-model-status', [modelId, active]);
});

document.getElementById('withdraw-stake').addEventListener('click', () => {
  const modelId = uintCV(document.getElementById('withdraw-model-id').value);
  callContract('withdraw-stake', [modelId]);
});

updateWalletStatus();
