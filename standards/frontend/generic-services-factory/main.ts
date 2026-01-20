import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  bufferCV,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const contractAddress = import.meta.env.VITE_GENERIC_SERVICES_FACTORY_CONTRACT_ADDRESS;
const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

let currentAddress: string | null = null;
let reownModal: any = null;

const walletStatus = document.getElementById('walletStatus') as HTMLDivElement;
const createBtn = document.getElementById('createBtn') as HTMLButtonElement;
const createStatus = document.getElementById('createStatus') as HTMLDivElement;
const disconnectBtn = document.getElementById('disconnect') as HTMLButtonElement;

function showStatus(element: HTMLDivElement, message: string, isError = false) {
  element.textContent = message;
  element.className = `status active ${isError ? 'error' : ''}`;
}

function hideStatus(element: HTMLDivElement) {
  element.className = 'status';
}

function updateWalletUI(address: string | null) {
  currentAddress = address;
  
  if (address) {
    showStatus(walletStatus, `Connected: ${address.slice(0, 8)}...${address.slice(-8)}`);
    createBtn.disabled = false;
    disconnectBtn.style.display = 'block';
    
    document.querySelectorAll('.btn-hiro, .btn-leather, .btn-reown').forEach(btn => {
      (btn as HTMLButtonElement).style.display = 'none';
    });
  } else {
    hideStatus(walletStatus);
    createBtn.disabled = true;
    disconnectBtn.style.display = 'none';
    
    document.querySelectorAll('.btn-hiro, .btn-leather, .btn-reown').forEach(btn => {
      (btn as HTMLButtonElement).style.display = 'block';
    });
  }
}

document.getElementById('connectHiro')?.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Generic Services Factory',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      updateWalletUI(userData.profile.stxAddress.mainnet);
    },
    onCancel: () => {
      showStatus(walletStatus, 'Connection cancelled', true);
    },
    userSession,
  });
});

document.getElementById('connectLeather')?.addEventListener('click', async () => {
  try {
    const wallet = (window as any).LeatherProvider;
    if (!wallet) {
      showStatus(walletStatus, 'Leather wallet not found. Please install Leather extension.', true);
      return;
    }
    
    const response = await wallet.request('getAddresses');
    if (response.result && response.result.addresses && response.result.addresses.length > 0) {
      const address = response.result.addresses[0].address;
      updateWalletUI(address);
    }
  } catch (error) {
    showStatus(walletStatus, `Leather connection failed: ${error}`, true);
  }
});

document.getElementById('connectReown')?.addEventListener('click', async () => {
  try {
    if (!reownModal) {
      const stacksAdapter = new StacksAdapter();
      
      reownModal = createAppKit({
        adapters: [stacksAdapter],
        networks: [
          {
            id: 'stacks:mainnet',
            chainId: 'stacks:mainnet',
            name: 'Stacks Mainnet',
            currency: 'STX',
            rpcUrl: 'https://api.mainnet.hiro.so',
            explorerUrl: 'https://explorer.stacks.co'
          }
        ],
        projectId: walletConnectProjectId,
        features: {
          analytics: false
        },
        metadata: {
          name: 'Generic Services Factory',
          description: 'Create and manage generic services',
          url: window.location.origin,
          icons: [window.location.origin + '/logo.png']
        }
      });
      
      reownModal.subscribeProvider((state: any) => {
        if (state.address) {
          updateWalletUI(state.address);
        }
      });
    }
    
    await reownModal.open();
  } catch (error) {
    showStatus(walletStatus, `Reown connection failed: ${error}`, true);
  }
});

document.getElementById('disconnect')?.addEventListener('click', () => {
  if (userSession.isUserSignedIn()) {
    userSession.signUserOut();
  }
  
  if (reownModal) {
    reownModal.disconnect();
  }
  
  updateWalletUI(null);
});

document.getElementById('createBtn')?.addEventListener('click', async () => {
  if (!currentAddress) {
    showStatus(createStatus, 'Please connect your wallet first', true);
    return;
  }

  const implementationInput = (document.getElementById('implementation') as HTMLInputElement).value;
  const saltInput = (document.getElementById('salt') as HTMLInputElement).value;
  const svcChainIdInput = (document.getElementById('svcChainId') as HTMLInputElement).value;
  const modeInput = (document.getElementById('mode') as HTMLInputElement).value;
  const linkedContractInput = (document.getElementById('linkedContract') as HTMLInputElement).value;
  const linkedIdInput = (document.getElementById('linkedId') as HTMLInputElement).value;

  if (!implementationInput || !saltInput || !svcChainIdInput || !modeInput || !linkedContractInput || !linkedIdInput) {
    showStatus(createStatus, 'Please fill in all fields', true);
    return;
  }

  try {
    showStatus(createStatus, 'Creating service...');
    
    const saltHex = saltInput.startsWith('0x') ? saltInput.slice(2) : saltInput;
    const saltBuffer = Buffer.from(saltHex, 'hex');
    
    if (saltBuffer.length !== 32) {
      showStatus(createStatus, 'Salt must be exactly 32 bytes', true);
      return;
    }

    const [contractAddr, contractName] = contractAddress.split('.');
    
    const txOptions = {
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'create',
      functionArgs: [
        principalCV(implementationInput),
        bufferCV(saltBuffer),
        uintCV(svcChainIdInput),
        uintCV(modeInput),
        principalCV(linkedContractInput),
        uintCV(linkedIdInput),
      ],
      senderKey: currentAddress,
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, new StacksMainnet());
    
    if (broadcastResponse.error) {
      showStatus(createStatus, `Transaction failed: ${broadcastResponse.error}`, true);
    } else {
      showStatus(createStatus, `Service created! TX: ${broadcastResponse.txid}`);
    }
  } catch (error) {
    showStatus(createStatus, `Error: ${error}`, true);
  }
});

if (userSession.isUserSignedIn()) {
  const userData = userSession.loadUserData();
  updateWalletUI(userData.profile.stxAddress.mainnet);
}
