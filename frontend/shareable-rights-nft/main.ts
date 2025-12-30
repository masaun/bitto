import { showConnect, openContractCall, UserSession, AppConfig } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  stringAsciiCV,
  trueCV,
  falseCV,
} from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';
import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const contractAddress = import.meta.env.VITE_SHAREABLE_RIGHTS_NFT_CONTRACT_ADDRESS;

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let connectedAddress: string | null = null;
let currentWalletType: 'stacks' | 'walletconnect' | 'reown' | null = null;
let reownAppKit: any = null;
let web3wallet: any = null;

const network = new StacksMainnet();

function updateWalletAddress(address: string) {
  connectedAddress = address;
  const walletAddressEl = document.getElementById('walletAddress');
  if (walletAddressEl) {
    walletAddressEl.textContent = `Connected: ${address}`;
  }
}

function showStatus(elementId: string, message: string, type: 'success' | 'error' | 'info') {
  const statusEl = document.getElementById(elementId);
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
  }
}

async function connectStacksWallet() {
  try {
    showStatus('connectionStatus', 'Connecting to Stacks Wallet...', 'info');
    
    showConnect({
      appDetails: {
        name: 'Shareable Rights NFT',
        icon: window.location.origin + '/icon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        const address = userData.profile.stxAddress.mainnet;
        updateWalletAddress(address);
        currentWalletType = 'stacks';
        showStatus('connectionStatus', 'Connected successfully!', 'success');
      },
      onCancel: () => {
        showStatus('connectionStatus', 'Connection cancelled', 'error');
      },
      userSession,
    });
  } catch (error) {
    showStatus('connectionStatus', `Error: ${error}`, 'error');
  }
}

async function connectWalletConnect() {
  try {
    showStatus('connectionStatus', 'Initializing WalletConnect...', 'info');

    const core = new Core({
      projectId: projectId,
    });

    web3wallet = await Web3Wallet.init({
      core,
      metadata: {
        name: 'Shareable Rights NFT',
        description: 'NFT with shareable rights',
        url: window.location.origin,
        icons: [window.location.origin + '/icon.png'],
      },
    });

    const { uri, approval } = await web3wallet.connect({
      requiredNamespaces: {
        stacks: {
          methods: ['stacks_signTransaction'],
          chains: ['stacks:mainnet'],
          events: [],
        },
      },
    });

    if (uri) {
      showStatus('connectionStatus', `Scan QR: ${uri}`, 'info');
    }

    const session = await approval();
    const address = session.namespaces.stacks?.accounts[0]?.split(':')[2];
    
    if (address) {
      updateWalletAddress(address);
      currentWalletType = 'walletconnect';
      showStatus('connectionStatus', 'Connected via WalletConnect!', 'success');
    }
  } catch (error) {
    showStatus('connectionStatus', `Error: ${error}`, 'error');
  }
}

async function connectReown() {
  try {
    showStatus('connectionStatus', 'Initializing Reown AppKit...', 'info');

    const stacksAdapter = new StacksAdapter();

    reownAppKit = createAppKit({
      adapters: [stacksAdapter],
      networks: [
        {
          id: 'stacks:mainnet',
          name: 'Stacks Mainnet',
          nativeCurrency: { name: 'STX', symbol: 'STX', decimals: 6 },
          rpcUrls: {
            default: { http: ['https://stacks-node-api.mainnet.stacks.co'] },
          },
        },
      ],
      metadata: {
        name: 'Shareable Rights NFT',
        description: 'NFT with shareable rights',
        url: window.location.origin,
        icons: [window.location.origin + '/icon.png'],
      },
      projectId: projectId,
      features: {
        analytics: false,
      },
    });

    reownAppKit.open();

    reownAppKit.subscribe((state: any) => {
      if (state.address) {
        updateWalletAddress(state.address);
        currentWalletType = 'reown';
        showStatus('connectionStatus', 'Connected via Reown AppKit!', 'success');
      }
    });
  } catch (error) {
    showStatus('connectionStatus', `Error: ${error}`, 'error');
  }
}

async function mint(recipient: string) {
  try {
    if (!connectedAddress) {
      showStatus('mintStatus', 'Please connect wallet first', 'error');
      return;
    }

    showStatus('mintStatus', 'Preparing transaction...', 'info');

    const [contractAddr, contractName] = contractAddress.split('.');

    const txOptions = {
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'mint',
      functionArgs: [principalCV(recipient)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      senderKey: '',
    };

    if (currentWalletType === 'stacks') {
      await openContractCall({
        ...txOptions,
        onFinish: (data: any) => {
          showStatus('mintStatus', `Transaction sent: ${data.txId}`, 'success');
        },
        onCancel: () => {
          showStatus('mintStatus', 'Transaction cancelled', 'error');
        },
      });
    } else {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);
      showStatus('mintStatus', `Transaction sent: ${broadcastResponse.txid}`, 'success');
    }
  } catch (error) {
    showStatus('mintStatus', `Error: ${error}`, 'error');
  }
}

async function setPrivilege(tokenId: number, delegate: string, right: string, can: boolean) {
  try {
    if (!connectedAddress) {
      showStatus('privilegeStatus', 'Please connect wallet first', 'error');
      return;
    }

    showStatus('privilegeStatus', 'Preparing transaction...', 'info');

    const [contractAddr, contractName] = contractAddress.split('.');

    const txOptions = {
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'set-privilege',
      functionArgs: [
        uintCV(tokenId),
        principalCV(delegate),
        stringAsciiCV(right),
        can ? trueCV() : falseCV(),
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      senderKey: '',
    };

    if (currentWalletType === 'stacks') {
      await openContractCall({
        ...txOptions,
        onFinish: (data: any) => {
          showStatus('privilegeStatus', `Transaction sent: ${data.txId}`, 'success');
        },
        onCancel: () => {
          showStatus('privilegeStatus', 'Transaction cancelled', 'error');
        },
      });
    } else {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);
      showStatus('privilegeStatus', `Transaction sent: ${broadcastResponse.txid}`, 'success');
    }
  } catch (error) {
    showStatus('privilegeStatus', `Error: ${error}`, 'error');
  }
}

async function transfer(tokenId: number, sender: string, recipient: string) {
  try {
    if (!connectedAddress) {
      showStatus('transferStatus', 'Please connect wallet first', 'error');
      return;
    }

    showStatus('transferStatus', 'Preparing transaction...', 'info');

    const [contractAddr, contractName] = contractAddress.split('.');

    const txOptions = {
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'transfer',
      functionArgs: [
        uintCV(tokenId),
        principalCV(sender),
        principalCV(recipient),
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      senderKey: '',
    };

    if (currentWalletType === 'stacks') {
      await openContractCall({
        ...txOptions,
        onFinish: (data: any) => {
          showStatus('transferStatus', `Transaction sent: ${data.txId}`, 'success');
        },
        onCancel: () => {
          showStatus('transferStatus', 'Transaction cancelled', 'error');
        },
      });
    } else {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);
      showStatus('transferStatus', `Transaction sent: ${broadcastResponse.txid}`, 'success');
    }
  } catch (error) {
    showStatus('transferStatus', `Error: ${error}`, 'error');
  }
}

document.getElementById('connectStacksWallet')?.addEventListener('click', connectStacksWallet);
document.getElementById('connectWalletConnect')?.addEventListener('click', connectWalletConnect);
document.getElementById('connectReown')?.addEventListener('click', connectReown);

document.getElementById('mintBtn')?.addEventListener('click', () => {
  const recipient = (document.getElementById('mintRecipient') as HTMLInputElement).value;
  if (recipient) {
    mint(recipient);
  } else {
    showStatus('mintStatus', 'Please enter recipient address', 'error');
  }
});

document.getElementById('setPrivilegeBtn')?.addEventListener('click', () => {
  const tokenId = parseInt((document.getElementById('privilegeTokenId') as HTMLInputElement).value);
  const delegate = (document.getElementById('privilegeDelegate') as HTMLInputElement).value;
  const right = (document.getElementById('privilegeRight') as HTMLInputElement).value;
  const can = (document.getElementById('privilegeCan') as HTMLSelectElement).value === 'true';

  if (tokenId && delegate && right) {
    setPrivilege(tokenId, delegate, right, can);
  } else {
    showStatus('privilegeStatus', 'Please fill all fields', 'error');
  }
});

document.getElementById('transferBtn')?.addEventListener('click', () => {
  const tokenId = parseInt((document.getElementById('transferTokenId') as HTMLInputElement).value);
  const sender = (document.getElementById('transferSender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transferRecipient') as HTMLInputElement).value;

  if (tokenId && sender && recipient) {
    transfer(tokenId, sender, recipient);
  } else {
    showStatus('transferStatus', 'Please fill all fields', 'error');
  }
});

if (userSession.isUserSignedIn()) {
  const userData = userSession.loadUserData();
  const address = userData.profile.stxAddress.mainnet;
  updateWalletAddress(address);
  currentWalletType = 'stacks';
  showStatus('connectionStatus', 'Already connected!', 'success');
}
