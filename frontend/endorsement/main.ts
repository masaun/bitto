import { showConnect } from '@stacks/connect';
import { 
  StacksTestnet, 
  StacksMainnet 
} from '@stacks/network';
import {
  AnchorMode,
  makeContractCall,
  bufferCV,
  principalCV,
  stringAsciiCV,
  PostConditionMode,
  uintCV
} from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const CONTRACT_ADDRESS = import.meta.env.VITE_ENDORSEMENT_CONTRACT_ADDRESS;

let userAddress: string | null = null;
let network = new StacksMainnet();

const showStatus = (message: string, type: 'success' | 'error' | 'info') => {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `show ${type}`;
    setTimeout(() => {
      statusEl.className = '';
    }, 5000);
  }
};

const updateWalletDisplay = (address: string) => {
  userAddress = address;
  const walletEl = document.getElementById('wallet-address');
  if (walletEl) {
    walletEl.textContent = `Connected: ${address}`;
    walletEl.style.display = 'block';
  }
};

const connectHiro = () => {
  showConnect({
    appDetails: {
      name: 'Endorsement DApp',
      icon: window.location.origin + '/logo.png',
    },
    onFinish: (data) => {
      updateWalletDisplay(data.userSession.loadUserData().profile.stxAddress.mainnet);
      showStatus('Hiro Wallet connected successfully', 'success');
    },
    onCancel: () => {
      showStatus('Wallet connection cancelled', 'error');
    },
    userSession: undefined,
  });
};

const connectLeather = () => {
  showConnect({
    appDetails: {
      name: 'Endorsement DApp',
      icon: window.location.origin + '/logo.png',
    },
    onFinish: (data) => {
      updateWalletDisplay(data.userSession.loadUserData().profile.stxAddress.mainnet);
      showStatus('Leather Wallet connected successfully', 'success');
    },
    onCancel: () => {
      showStatus('Wallet connection cancelled', 'error');
    },
    userSession: undefined,
  });
};

const connectReown = async () => {
  const stacksAdapter = new StacksAdapter();
  
  const appKit = createAppKit({
    adapters: [stacksAdapter],
    networks: [
      {
        id: 'stacks:mainnet',
        name: 'Stacks Mainnet',
        network: 'mainnet',
        nativeCurrency: { name: 'Stacks', symbol: 'STX', decimals: 6 },
        rpcUrls: {
          default: { http: ['https://stacks-node-api.mainnet.stacks.co'] }
        }
      }
    ],
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
      name: 'Endorsement DApp',
      description: 'Submit and verify endorsements on Stacks',
      url: window.location.origin,
      icons: [window.location.origin + '/logo.png']
    }
  });

  await appKit.open();
  showStatus('Reown AppKit initialized', 'info');
};

const hexToBuffer = (hex: string): Uint8Array => {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
};

const submitEndorsement = async () => {
  if (!userAddress) {
    showStatus('Please connect wallet first', 'error');
    return;
  }

  const endorsee = (document.getElementById('submit-endorsee') as HTMLInputElement).value;
  const endorser = (document.getElementById('submit-endorser') as HTMLInputElement).value;
  const endorsementType = (document.getElementById('submit-type') as HTMLInputElement).value;
  const metadata = (document.getElementById('submit-metadata') as HTMLTextAreaElement).value;
  const signature = (document.getElementById('submit-signature') as HTMLInputElement).value;
  const publicKey = (document.getElementById('submit-public-key') as HTMLInputElement).value;
  const endorsementHash = (document.getElementById('submit-hash') as HTMLInputElement).value;

  if (!endorsee || !endorser || !endorsementType || !metadata || !signature || !publicKey || !endorsementHash) {
    showStatus('Please fill in all fields', 'error');
    return;
  }

  try {
    const [contractAddr, contractName] = CONTRACT_ADDRESS.split('.');
    
    const txOptions = {
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'submit-endorsement',
      functionArgs: [
        principalCV(endorsee),
        principalCV(endorser),
        stringAsciiCV(endorsementType),
        stringAsciiCV(metadata),
        bufferCV(hexToBuffer(signature)),
        bufferCV(hexToBuffer(publicKey)),
        bufferCV(hexToBuffer(endorsementHash))
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        showStatus(`Transaction submitted: ${data.txId}`, 'success');
      },
      onCancel: () => {
        showStatus('Transaction cancelled', 'error');
      }
    };

    await makeContractCall(txOptions);
  } catch (error: any) {
    showStatus(`Error: ${error.message}`, 'error');
  }
};

const verifyEndorsement = async () => {
  if (!userAddress) {
    showStatus('Please connect wallet first', 'error');
    return;
  }

  const endorsementHash = (document.getElementById('verify-hash') as HTMLInputElement).value;

  if (!endorsementHash) {
    showStatus('Please enter endorsement hash', 'error');
    return;
  }

  try {
    const [contractAddr, contractName] = CONTRACT_ADDRESS.split('.');
    
    const txOptions = {
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'verify-endorsement',
      functionArgs: [
        bufferCV(hexToBuffer(endorsementHash))
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        showStatus(`Verification transaction submitted: ${data.txId}`, 'success');
      },
      onCancel: () => {
        showStatus('Transaction cancelled', 'error');
      }
    };

    await makeContractCall(txOptions);
  } catch (error: any) {
    showStatus(`Error: ${error.message}`, 'error');
  }
};

document.getElementById('connect-hiro')?.addEventListener('click', connectHiro);
document.getElementById('connect-leather')?.addEventListener('click', connectLeather);
document.getElementById('connect-reown')?.addEventListener('click', connectReown);
document.getElementById('submit-endorsement')?.addEventListener('click', submitEndorsement);
document.getElementById('verify-endorsement')?.addEventListener('click', verifyEndorsement);
