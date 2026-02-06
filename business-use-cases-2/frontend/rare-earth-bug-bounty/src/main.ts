import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV,
  principalCV,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const contractAddress = 'SPBD48014EX450A9ED877X6M2SFAZBHYZSVJASWA';
const contractName = 'rare-earth-bug-bounty';

function updateStatus(message: string) {
  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.textContent = message;
}

function updateAddress(address: string) {
  const addressEl = document.getElementById('address');
  const walletInfoEl = document.getElementById('wallet-info');
  if (addressEl) addressEl.textContent = address;
  if (walletInfoEl) walletInfoEl.style.display = 'block';
}

async function connectWallet() {
  showConnect({
    appDetails: {
      name: 'Rare Earth Bug Bounty',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      updateAddress(userData.profile.stxAddress.mainnet);
      updateStatus('Wallet connected');
    },
    userSession,
  });
}

async function callContract() {
  try {
    updateStatus('Preparing transaction...');
    
    const userData = userSession.loadUserData();
    const senderAddress = userData.profile.stxAddress.mainnet;

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'get-info',
      functionArgs: [uintCV(1)],
      senderKey: userData.appPrivateKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    updateStatus(`Transaction broadcast: ${broadcastResponse.txid}`);
    
    const resultEl = document.getElementById('result');
    if (resultEl) {
      resultEl.innerHTML = `<p>Transaction ID: ${broadcastResponse.txid}</p>`;
    }
  } catch (error) {
    updateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

document.getElementById('connect')?.addEventListener('click', connectWallet);
document.getElementById('call-contract')?.addEventListener('click', callContract);

if (userSession.isUserSignedIn()) {
  const userData = userSession.loadUserData();
  updateAddress(userData.profile.stxAddress.mainnet);
  updateStatus('Wallet already connected');
}
