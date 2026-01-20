import { showConnect, AppConfig, UserSession } from '@stacks/connect';
import {
  makeContractCall,
  standardPrincipalCV,
  uintCV,
  PostConditionMode,
  AnchorMode,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const network = new StacksMainnet();
const contractAddress = import.meta.env.VITE_CAP_TF_NFT_CONTRACT_ADDRESS.split('.')[0];
const contractName = import.meta.env.VITE_CAP_TF_NFT_CONTRACT_ADDRESS.split('.')[1];

let currentAddress: string | null = null;
let reownAppKit: any = null;

const updateWalletStatus = (message: string) => {
  const statusEl = document.getElementById('wallet-status');
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = `<strong>Status:</strong> ${message}`;
  }
};

const updateStatus = (elementId: string, message: string) => {
  const statusEl = document.getElementById(elementId);
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = `<strong>Status:</strong> ${message}`;
  }
};

const connectHiroWallet = async () => {
  try {
    showConnect({
      appDetails: {
        name: 'Cap-TF-NFT',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: () => {
        if (userSession.isUserSignedIn()) {
          const userData = userSession.loadUserData();
          currentAddress = userData.profile.stxAddress.mainnet;
          updateWalletStatus(`Connected: ${currentAddress}`);
        }
      },
      onCancel: () => {
        updateWalletStatus('Connection cancelled');
      },
      userSession,
    });
  } catch (error) {
    updateWalletStatus(`Error: ${error}`);
  }
};

const connectLeatherWallet = async () => {
  try {
    const response = await (window as any).btc?.request('getAddresses');
    if (response?.result?.addresses) {
      const stxAddress = response.result.addresses.find((addr: any) => addr.type === 'stacks')?.address;
      if (stxAddress) {
        currentAddress = stxAddress;
        updateWalletStatus(`Connected: ${currentAddress}`);
      } else {
        updateWalletStatus('No Stacks address found');
      }
    }
  } catch (error) {
    updateWalletStatus(`Error: ${error}`);
  }
};

const connectReownWallet = async () => {
  try {
    if (!reownAppKit) {
      const stacksAdapter = new StacksAdapter();
      
      reownAppKit = createAppKit({
        adapters: [stacksAdapter],
        networks: [
          {
            id: 'stacks',
            name: 'Stacks',
            chainId: '1',
            nativeCurrency: {
              name: 'Stacks',
              symbol: 'STX',
              decimals: 6,
            },
            rpcUrls: {
              default: {
                http: ['https://stacks-node-api.mainnet.stacks.co'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Stacks Explorer',
                url: 'https://explorer.stacks.co',
              },
            },
          },
        ],
        metadata: {
          name: 'Cap-TF-NFT',
          description: 'Transfer-limited NFT application',
          url: window.location.origin,
          icons: [window.location.origin + '/logo.png'],
        },
        projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
        features: {
          analytics: false,
        },
      });
    }
    
    await reownAppKit.open();
    
    const checkConnection = setInterval(() => {
      const address = reownAppKit.getAddress();
      if (address) {
        currentAddress = address;
        updateWalletStatus(`Connected: ${currentAddress}`);
        clearInterval(checkConnection);
      }
    }, 500);
    
    setTimeout(() => clearInterval(checkConnection), 10000);
  } catch (error) {
    updateWalletStatus(`Error: ${error}`);
  }
};

const mint = async (recipient: string, limit: number) => {
  if (!currentAddress) {
    updateStatus('mint-status', 'Please connect wallet first');
    return;
  }

  try {
    updateStatus('mint-status', 'Preparing transaction...');

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'mint',
      functionArgs: [
        standardPrincipalCV(recipient),
        uintCV(limit),
      ],
      senderKey: currentAddress,
      network,
      postConditionMode: PostConditionMode.Allow,
      anchorMode: AnchorMode.Any,
      onFinish: (data: any) => {
        updateStatus('mint-status', `Transaction submitted: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('mint-status', 'Transaction cancelled');
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus('mint-status', `Error: ${error}`);
  }
};

const setTransferLimit = async (tokenId: number, limit: number) => {
  if (!currentAddress) {
    updateStatus('set-limit-status', 'Please connect wallet first');
    return;
  }

  try {
    updateStatus('set-limit-status', 'Preparing transaction...');

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'set-transfer-limit',
      functionArgs: [
        uintCV(tokenId),
        uintCV(limit),
      ],
      senderKey: currentAddress,
      network,
      postConditionMode: PostConditionMode.Allow,
      anchorMode: AnchorMode.Any,
      onFinish: (data: any) => {
        updateStatus('set-limit-status', `Transaction submitted: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('set-limit-status', 'Transaction cancelled');
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus('set-limit-status', `Error: ${error}`);
  }
};

const transfer = async (tokenId: number, sender: string, recipient: string) => {
  if (!currentAddress) {
    updateStatus('transfer-status', 'Please connect wallet first');
    return;
  }

  try {
    updateStatus('transfer-status', 'Preparing transaction...');

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'transfer',
      functionArgs: [
        uintCV(tokenId),
        standardPrincipalCV(sender),
        standardPrincipalCV(recipient),
      ],
      senderKey: currentAddress,
      network,
      postConditionMode: PostConditionMode.Allow,
      anchorMode: AnchorMode.Any,
      onFinish: (data: any) => {
        updateStatus('transfer-status', `Transaction submitted: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('transfer-status', 'Transaction cancelled');
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus('transfer-status', `Error: ${error}`);
  }
};

document.getElementById('connect-hiro')?.addEventListener('click', connectHiroWallet);
document.getElementById('connect-leather')?.addEventListener('click', connectLeatherWallet);
document.getElementById('connect-reown')?.addEventListener('click', connectReownWallet);

document.getElementById('mint-btn')?.addEventListener('click', async () => {
  const recipient = (document.getElementById('mint-recipient') as HTMLInputElement).value;
  const limit = parseInt((document.getElementById('mint-limit') as HTMLInputElement).value);
  
  if (!recipient || isNaN(limit)) {
    updateStatus('mint-status', 'Please fill in all fields');
    return;
  }
  
  await mint(recipient, limit);
});

document.getElementById('set-limit-btn')?.addEventListener('click', async () => {
  const tokenId = parseInt((document.getElementById('set-limit-token-id') as HTMLInputElement).value);
  const limit = parseInt((document.getElementById('set-limit-value') as HTMLInputElement).value);
  
  if (isNaN(tokenId) || isNaN(limit)) {
    updateStatus('set-limit-status', 'Please fill in all fields');
    return;
  }
  
  await setTransferLimit(tokenId, limit);
});

document.getElementById('transfer-btn')?.addEventListener('click', async () => {
  const tokenId = parseInt((document.getElementById('transfer-token-id') as HTMLInputElement).value);
  const sender = (document.getElementById('transfer-sender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transfer-recipient') as HTMLInputElement).value;
  
  if (isNaN(tokenId) || !sender || !recipient) {
    updateStatus('transfer-status', 'Please fill in all fields');
    return;
  }
  
  await transfer(tokenId, sender, recipient);
});
