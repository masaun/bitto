import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  principalCV,
  listCV,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const network = new StacksMainnet();
const contractAddress = import.meta.env.VITE_SC_DEPENDENCIES_REGISTRY_CONTRACT_ADDRESS;
const [deployer, contractName] = contractAddress.split('.');

let currentAddress: string | null = null;

const appKit = createAppKit({
  adapters: [new StacksAdapter()],
  networks: [network],
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  features: {
    analytics: false,
  },
});

function showStatus(elementId: string, message: string, type: 'success' | 'error' | 'info') {
  const statusEl = document.getElementById(elementId);
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
  }
}

function connectHiro() {
  showConnect({
    appDetails: {
      name: 'SC Dependencies Registry',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      currentAddress = userData.profile.stxAddress.mainnet;
      showStatus('wallet-status', `Connected: ${currentAddress}`, 'success');
    },
    userSession,
  });
}

function connectXverse() {
  if (typeof window.StacksProvider !== 'undefined') {
    window.StacksProvider.request('stx_requestAccounts', {})
      .then((addresses: any) => {
        currentAddress = addresses.result.addresses[0].address;
        showStatus('wallet-status', `Connected: ${currentAddress}`, 'success');
      })
      .catch((error: any) => {
        showStatus('wallet-status', `Error: ${error.message}`, 'error');
      });
  } else {
    showStatus('wallet-status', 'Xverse wallet not found', 'error');
  }
}

function connectAppKit() {
  appKit.open({ view: 'Connect' }).then(() => {
    const account = appKit.getAccount();
    if (account?.address) {
      currentAddress = account.address;
      showStatus('wallet-status', `Connected: ${currentAddress}`, 'success');
    }
  });
}

async function addContract() {
  const name = (document.getElementById('add-contract-name') as HTMLInputElement).value;
  const address = (document.getElementById('add-contract-address') as HTMLInputElement).value;

  if (!name || !address) {
    showStatus('add-contract-status', 'Please fill in all fields', 'error');
    return;
  }

  if (!currentAddress) {
    showStatus('add-contract-status', 'Please connect wallet first', 'error');
    return;
  }

  try {
    const txOptions = {
      contractAddress: deployer,
      contractName,
      functionName: 'add-contract',
      functionArgs: [stringAsciiCV(name), principalCV(address)],
      senderKey: '',
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    showStatus('add-contract-status', `Transaction submitted: ${broadcastResponse.txid}`, 'success');
  } catch (error: any) {
    showStatus('add-contract-status', `Error: ${error.message}`, 'error');
  }
}

async function addProxyContract() {
  const name = (document.getElementById('add-proxy-name') as HTMLInputElement).value;
  const proxyAddress = (document.getElementById('add-proxy-address') as HTMLInputElement).value;

  if (!name || !proxyAddress) {
    showStatus('add-proxy-status', 'Please fill in all fields', 'error');
    return;
  }

  if (!currentAddress) {
    showStatus('add-proxy-status', 'Please connect wallet first', 'error');
    return;
  }

  try {
    const txOptions = {
      contractAddress: deployer,
      contractName,
      functionName: 'add-proxy-contract',
      functionArgs: [stringAsciiCV(name), principalCV(proxyAddress)],
      senderKey: '',
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    showStatus('add-proxy-status', `Transaction submitted: ${broadcastResponse.txid}`, 'success');
  } catch (error: any) {
    showStatus('add-proxy-status', `Error: ${error.message}`, 'error');
  }
}

async function injectDependencies() {
  const name = (document.getElementById('inject-name') as HTMLInputElement).value;
  const depsInput = (document.getElementById('inject-deps') as HTMLTextAreaElement).value;

  if (!name || !depsInput) {
    showStatus('inject-deps-status', 'Please fill in all fields', 'error');
    return;
  }

  if (!currentAddress) {
    showStatus('inject-deps-status', 'Please connect wallet first', 'error');
    return;
  }

  const deps = depsInput.split(',').map(d => d.trim()).filter(d => d.length > 0);
  
  if (deps.length > 20) {
    showStatus('inject-deps-status', 'Maximum 20 dependencies allowed', 'error');
    return;
  }

  try {
    const depsList = listCV(deps.map(d => stringAsciiCV(d)));
    
    const txOptions = {
      contractAddress: deployer,
      contractName,
      functionName: 'inject-dependencies',
      functionArgs: [stringAsciiCV(name), depsList],
      senderKey: '',
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    showStatus('inject-deps-status', `Transaction submitted: ${broadcastResponse.txid}`, 'success');
  } catch (error: any) {
    showStatus('inject-deps-status', `Error: ${error.message}`, 'error');
  }
}

async function upgradeContract() {
  const name = (document.getElementById('upgrade-name') as HTMLInputElement).value;
  const newImpl = (document.getElementById('upgrade-address') as HTMLInputElement).value;

  if (!name || !newImpl) {
    showStatus('upgrade-status', 'Please fill in all fields', 'error');
    return;
  }

  if (!currentAddress) {
    showStatus('upgrade-status', 'Please connect wallet first', 'error');
    return;
  }

  try {
    const txOptions = {
      contractAddress: deployer,
      contractName,
      functionName: 'upgrade-contract',
      functionArgs: [stringAsciiCV(name), principalCV(newImpl)],
      senderKey: '',
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    showStatus('upgrade-status', `Transaction submitted: ${broadcastResponse.txid}`, 'success');
  } catch (error: any) {
    showStatus('upgrade-status', `Error: ${error.message}`, 'error');
  }
}

document.getElementById('connect-hiro')?.addEventListener('click', connectHiro);
document.getElementById('connect-xverse')?.addEventListener('click', connectXverse);
document.getElementById('connect-appkit')?.addEventListener('click', connectAppKit);
document.getElementById('add-contract-btn')?.addEventListener('click', addContract);
document.getElementById('add-proxy-btn')?.addEventListener('click', addProxyContract);
document.getElementById('inject-deps-btn')?.addEventListener('click', injectDependencies);
document.getElementById('upgrade-btn')?.addEventListener('click', upgradeContract);
