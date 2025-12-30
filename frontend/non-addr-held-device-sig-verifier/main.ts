import { showConnect, AppConfig, UserSession } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { 
  makeContractCall, 
  bufferCV, 
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let connectedAddress: string | null = null;
let walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
let contractAddress = import.meta.env.VITE_NON_ADDR_HELD_DEVICE_SIG_VERIFIER_CONTRACT_ADDRESS;

const network = new StacksMainnet();

let appKit: any = null;

function updateStatus(message: string, isError: boolean = false) {
  const statusEl = document.getElementById('status')!;
  statusEl.textContent = message;
  statusEl.className = isError ? 'status-error' : 'status-success';
}

function hexToBuffer(hex: string): Uint8Array {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function connectStacksWallet() {
  try {
    showConnect({
      appDetails: {
        name: 'Non-Addr Held Device Sig Verifier',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        connectedAddress = userData.profile.stxAddress.mainnet;
        updateStatus(`Connected: ${connectedAddress}`);
      },
      onCancel: () => {
        updateStatus('Connection cancelled', true);
      },
      userSession,
    });
  } catch (error) {
    updateStatus(`Error: ${error}`, true);
  }
}

async function connectWalletKit() {
  try {
    updateStatus('WalletKit connection not fully implemented in this example');
  } catch (error) {
    updateStatus(`Error: ${error}`, true);
  }
}

async function connectAppKit() {
  try {
    if (!appKit) {
      const stacksAdapter = new StacksAdapter();
      
      appKit = createAppKit({
        adapters: [stacksAdapter],
        networks: [
          {
            id: 'stacks-mainnet',
            name: 'Stacks Mainnet',
            nativeCurrency: {
              name: 'Stacks',
              symbol: 'STX',
              decimals: 6
            },
            rpcUrls: {
              default: { http: ['https://api.mainnet.hiro.so'] }
            }
          }
        ],
        projectId: walletConnectProjectId,
        features: {
          analytics: false
        }
      });
    }
    
    await appKit.open();
    updateStatus('AppKit modal opened');
  } catch (error) {
    updateStatus(`Error: ${error}`, true);
  }
}

async function registerKey(keyHex: string) {
  try {
    if (!connectedAddress) {
      updateStatus('Please connect wallet first', true);
      return;
    }

    const keyBuffer = hexToBuffer(keyHex);
    
    if (keyBuffer.length !== 33) {
      updateStatus('Key must be exactly 33 bytes', true);
      return;
    }

    const [contractAddr, contractName] = contractAddress.split('.');

    const txOptions = {
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'register-key',
      functionArgs: [bufferCV(keyBuffer)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        updateStatus(`Transaction submitted: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Transaction cancelled', true);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus(`Error: ${error}`, true);
  }
}

async function unregisterKey(keyHex: string) {
  try {
    if (!connectedAddress) {
      updateStatus('Please connect wallet first', true);
      return;
    }

    const keyBuffer = hexToBuffer(keyHex);
    
    if (keyBuffer.length !== 33) {
      updateStatus('Key must be exactly 33 bytes', true);
      return;
    }

    const [contractAddr, contractName] = contractAddress.split('.');

    const txOptions = {
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'unregister-key',
      functionArgs: [bufferCV(keyBuffer)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        updateStatus(`Transaction submitted: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Transaction cancelled', true);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus(`Error: ${error}`, true);
  }
}

document.getElementById('connect-stacks')?.addEventListener('click', connectStacksWallet);
document.getElementById('connect-walletkit')?.addEventListener('click', connectWalletKit);
document.getElementById('connect-appkit')?.addEventListener('click', connectAppKit);

document.getElementById('register-key-btn')?.addEventListener('click', () => {
  const input = document.getElementById('register-key-input') as HTMLInputElement;
  registerKey(input.value);
});

document.getElementById('unregister-key-btn')?.addEventListener('click', () => {
  const input = document.getElementById('unregister-key-input') as HTMLInputElement;
  unregisterKey(input.value);
});

if (userSession.isUserSignedIn()) {
  const userData = userSession.loadUserData();
  connectedAddress = userData.profile.stxAddress.mainnet;
  updateStatus(`Connected: ${connectedAddress}`);
}
