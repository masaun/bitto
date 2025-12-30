import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  bufferCV,
  stringAsciiCV,
  listCV,
  principalCV,
  uintCV,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let currentAddress: string | null = null;
let walletConnectClient: any = null;
let reownModal: any = null;

const statusEl = document.getElementById('status') as HTMLElement;
const contractAddress = import.meta.env.VITE_AI_AGENT_COORDINATION_CONTRACT_ADDRESS;
const [deployerAddress, contractName] = contractAddress.split('.');
const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

function updateStatus(message: string) {
  statusEl.textContent = message;
}

function hexToBuffer(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (cleanHex.length !== 64) {
    throw new Error('Hash must be exactly 32 bytes (64 hex characters)');
  }
  const buffer = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    buffer[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return buffer;
}

document.getElementById('connect-stacks')?.addEventListener('click', async () => {
  showConnect({
    appDetails: {
      name: 'AI Agent Coordination',
      icon: window.location.origin + '/logo.svg',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      currentAddress = userData.profile.stxAddress.mainnet;
      updateStatus(`Connected with Stacks Wallet: ${currentAddress}`);
    },
    userSession,
  });
});

document.getElementById('connect-walletconnect')?.addEventListener('click', async () => {
  try {
    const { Web3Wallet } = await import('@walletconnect/web3wallet');
    
    walletConnectClient = await Web3Wallet.init({
      projectId: walletConnectProjectId,
      metadata: {
        name: 'AI Agent Coordination',
        description: 'Decentralized coordination for AI agents',
        url: window.location.origin,
        icons: [window.location.origin + '/logo.svg'],
      },
    });

    updateStatus('WalletConnect initialized. Please scan QR code in your wallet app.');
  } catch (error: any) {
    updateStatus(`WalletConnect error: ${error.message}`);
  }
});

document.getElementById('connect-reown')?.addEventListener('click', async () => {
  try {
    const { createAppKit } = await import('@reown/appkit');
    const { StacksAdapter } = await import('@reown/appkit-adapter-stacks');

    const stacksAdapter = new StacksAdapter();

    reownModal = createAppKit({
      adapters: [stacksAdapter],
      networks: [
        {
          id: 'stacks:mainnet',
          name: 'Stacks Mainnet',
          nativeCurrency: { name: 'STX', symbol: 'STX', decimals: 6 },
          rpcUrls: {
            default: { http: ['https://stacks-node-api.mainnet.stacks.co'] },
          },
          blockExplorers: {
            default: { name: 'Stacks Explorer', url: 'https://explorer.stacks.co' },
          },
        },
      ],
      projectId: walletConnectProjectId,
      features: {
        analytics: true,
      },
    });

    await reownModal.open();
    updateStatus('Reown AppKit modal opened');
  } catch (error: any) {
    updateStatus(`Reown AppKit error: ${error.message}`);
  }
});

document.getElementById('btn-propose-coordination')?.addEventListener('click', async () => {
  const intentHashInput = (document.getElementById('propose-intent-hash') as HTMLInputElement).value;
  const intentText = (document.getElementById('propose-intent-text') as HTMLTextAreaElement).value;
  const targetAgentsInput = (document.getElementById('propose-target-agents') as HTMLInputElement).value;

  if (!intentHashInput || !intentText || !targetAgentsInput) {
    updateStatus('Please fill all fields for propose-coordination');
    return;
  }

  try {
    const intentHash = hexToBuffer(intentHashInput);
    const targetAgentsList = targetAgentsInput.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0);
    
    if (targetAgentsList.length > 5) {
      updateStatus('Maximum 5 target agents allowed');
      return;
    }

    const functionArgs = [
      bufferCV(intentHash),
      stringAsciiCV(intentText),
      listCV(targetAgentsList.map(addr => principalCV(addr))),
    ];

    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'propose-coordination',
      functionArgs,
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 10000,
    };

    if (userSession.isUserSignedIn()) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, txOptions.network);
      updateStatus(`Transaction broadcasted: ${broadcastResponse.txid}`);
    } else {
      updateStatus('Please connect wallet first');
    }
  } catch (error: any) {
    updateStatus(`Error: ${error.message}`);
  }
});

document.getElementById('btn-accept-coordination')?.addEventListener('click', async () => {
  const intentHashInput = (document.getElementById('accept-intent-hash') as HTMLInputElement).value;

  if (!intentHashInput) {
    updateStatus('Please provide intent hash');
    return;
  }

  try {
    const intentHash = hexToBuffer(intentHashInput);

    const functionArgs = [bufferCV(intentHash)];

    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'accept-coordination',
      functionArgs,
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 10000,
    };

    if (userSession.isUserSignedIn()) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, txOptions.network);
      updateStatus(`Transaction broadcasted: ${broadcastResponse.txid}`);
    } else {
      updateStatus('Please connect wallet first');
    }
  } catch (error: any) {
    updateStatus(`Error: ${error.message}`);
  }
});

document.getElementById('btn-execute-coordination')?.addEventListener('click', async () => {
  const intentHashInput = (document.getElementById('execute-intent-hash') as HTMLInputElement).value;

  if (!intentHashInput) {
    updateStatus('Please provide intent hash');
    return;
  }

  try {
    const intentHash = hexToBuffer(intentHashInput);

    const functionArgs = [bufferCV(intentHash)];

    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'execute-coordination',
      functionArgs,
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 10000,
    };

    if (userSession.isUserSignedIn()) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, txOptions.network);
      updateStatus(`Transaction broadcasted: ${broadcastResponse.txid}`);
    } else {
      updateStatus('Please connect wallet first');
    }
  } catch (error: any) {
    updateStatus(`Error: ${error.message}`);
  }
});

document.getElementById('btn-cancel-coordination')?.addEventListener('click', async () => {
  const intentHashInput = (document.getElementById('cancel-intent-hash') as HTMLInputElement).value;

  if (!intentHashInput) {
    updateStatus('Please provide intent hash');
    return;
  }

  try {
    const intentHash = hexToBuffer(intentHashInput);

    const functionArgs = [bufferCV(intentHash)];

    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'cancel-coordination',
      functionArgs,
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 10000,
    };

    if (userSession.isUserSignedIn()) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, txOptions.network);
      updateStatus(`Transaction broadcasted: ${broadcastResponse.txid}`);
    } else {
      updateStatus('Please connect wallet first');
    }
  } catch (error: any) {
    updateStatus(`Error: ${error.message}`);
  }
});

if (userSession.isUserSignedIn()) {
  const userData = userSession.loadUserData();
  currentAddress = userData.profile.stxAddress.mainnet;
  updateStatus(`Already connected: ${currentAddress}`);
}
