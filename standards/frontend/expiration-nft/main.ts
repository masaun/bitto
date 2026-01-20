import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  standardPrincipalCV
} from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const contractAddress = import.meta.env.VITE_EXPIRATION_NFT_CONTRACT_ADDRESS;
const [deployerAddress, contractName] = contractAddress.split('.');

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let currentAddress: string | null = null;
let appKitInstance: any = null;

const statusDiv = document.getElementById('status')!;
const walletStatusDiv = document.getElementById('walletStatus')!;

function updateStatus(message: string) {
  statusDiv.textContent = message;
  console.log(message);
}

function updateWalletStatus(address: string | null) {
  if (address) {
    walletStatusDiv.textContent = `Connected: ${address}`;
    currentAddress = address;
  } else {
    walletStatusDiv.textContent = 'Not connected';
    currentAddress = null;
  }
}

document.getElementById('connectStacksConnect')!.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Expiration NFT',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      updateWalletStatus(userData.profile.stxAddress.mainnet);
      updateStatus('Connected via Stacks Connect');
    },
    onCancel: () => {
      updateStatus('Connection cancelled');
    },
    userSession,
  });
});

document.getElementById('connectWalletKit')!.addEventListener('click', async () => {
  try {
    const { Web3Wallet } = await import('@walletconnect/web3wallet');
    
    const web3wallet = await Web3Wallet.init({
      core: {
        projectId: projectId,
      },
      metadata: {
        name: 'Expiration NFT',
        description: 'Expiration NFT DApp',
        url: window.location.origin,
        icons: []
      }
    });

    updateStatus('WalletKit initialized');
  } catch (error) {
    updateStatus(`WalletKit error: ${error}`);
  }
});

document.getElementById('connectAppKit')!.addEventListener('click', () => {
  if (!appKitInstance) {
    const stacksAdapter = new StacksAdapter();
    
    appKitInstance = createAppKit({
      adapters: [stacksAdapter],
      projectId: projectId,
      networks: [
        {
          id: 'stacks:mainnet',
          name: 'Stacks Mainnet',
          network: 'mainnet',
          nativeCurrency: { name: 'STX', symbol: 'STX', decimals: 6 },
          rpcUrl: 'https://api.mainnet.hiro.so',
          explorerUrl: 'https://explorer.hiro.so'
        }
      ],
      metadata: {
        name: 'Expiration NFT',
        description: 'Expiration NFT DApp',
        url: window.location.origin,
        icons: []
      },
      features: {
        analytics: false
      }
    });
  }
  
  appKitInstance.open();
  updateStatus('AppKit opened');
});

async function mint(recipient: string) {
  if (!currentAddress) {
    updateStatus('Please connect wallet first');
    return;
  }

  try {
    const network = new StacksMainnet();
    
    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'mint',
      functionArgs: [principalCV(recipient)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        updateStatus(`Mint transaction: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Mint cancelled');
      }
    };

    await showConnect({
      appDetails: {
        name: 'Expiration NFT',
        icon: window.location.origin + '/logo.png',
      },
      userSession,
      onFinish: async () => {
        const transaction = await makeContractCall(txOptions);
        await broadcastTransaction(transaction, network);
      }
    });
  } catch (error) {
    updateStatus(`Mint error: ${error}`);
  }
}

async function transfer(tokenId: number, sender: string, recipient: string) {
  if (!currentAddress) {
    updateStatus('Please connect wallet first');
    return;
  }

  try {
    const network = new StacksMainnet();
    
    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'transfer',
      functionArgs: [
        uintCV(tokenId),
        principalCV(sender),
        principalCV(recipient)
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        updateStatus(`Transfer transaction: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Transfer cancelled');
      }
    };

    await showConnect({
      appDetails: {
        name: 'Expiration NFT',
        icon: window.location.origin + '/logo.png',
      },
      userSession,
      onFinish: async () => {
        const transaction = await makeContractCall(txOptions);
        await broadcastTransaction(transaction, network);
      }
    });
  } catch (error) {
    updateStatus(`Transfer error: ${error}`);
  }
}

document.getElementById('mintBtn')!.addEventListener('click', () => {
  const recipient = (document.getElementById('mintRecipient') as HTMLInputElement).value;
  if (recipient) {
    mint(recipient);
  } else {
    updateStatus('Please enter recipient address');
  }
});

document.getElementById('transferBtn')!.addEventListener('click', () => {
  const tokenId = parseInt((document.getElementById('transferTokenId') as HTMLInputElement).value);
  const sender = (document.getElementById('transferSender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transferRecipient') as HTMLInputElement).value;
  
  if (tokenId && sender && recipient) {
    transfer(tokenId, sender, recipient);
  } else {
    updateStatus('Please fill all transfer fields');
  }
});

if (userSession.isUserSignedIn()) {
  const userData = userSession.loadUserData();
  updateWalletStatus(userData.profile.stxAddress.mainnet);
}
