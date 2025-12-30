import { showConnect, AppConfig, UserSession } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import {
  makeContractCall,
  bufferCV,
  uintCV,
  principalCV,
  stringAsciiCV,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let currentAddress: string | null = null;

const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const contractAddress = import.meta.env.VITE_ACC_BOUNDED_TOKEN_CONTRACT_ADDRESS;

const [contractPrincipal, contractName] = contractAddress.split('.');

const network = new StacksMainnet();

const stacksAdapter = new StacksAdapter();

const appKit = createAppKit({
  adapters: [stacksAdapter],
  networks: [
    {
      id: 'stacks',
      name: 'Stacks',
      nativeCurrency: { name: 'STX', symbol: 'STX', decimals: 6 },
      rpcUrls: {
        default: { http: ['https://api.mainnet.hiro.so'] },
        public: { http: ['https://api.mainnet.hiro.so'] },
      },
      blockExplorers: {
        default: { name: 'Stacks Explorer', url: 'https://explorer.stacks.co' },
      },
    },
  ],
  metadata: {
    name: 'ACC Bounded Token',
    description: 'ACC Bounded Token Frontend',
    url: window.location.origin,
    icons: [],
  },
  projectId: walletConnectProjectId,
  features: {
    analytics: false,
  },
});

function updateWalletInfo(address: string) {
  currentAddress = address;
  const walletInfo = document.getElementById('wallet-info');
  if (walletInfo) {
    walletInfo.textContent = `Connected: ${address}`;
  }
}

document.getElementById('connect-stacks-wallet')?.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'ACC Bounded Token',
      icon: window.location.origin + '/logo.png',
    },
    onFinish: () => {
      const userData = userSession.loadUserData();
      updateWalletInfo(userData.profile.stxAddress.mainnet);
    },
    userSession,
  });
});

document.getElementById('connect-wallet-connect')?.addEventListener('click', async () => {
  try {
    await appKit.open();
  } catch (error) {
    console.error('WalletConnect error:', error);
  }
});

document.getElementById('connect-reown')?.addEventListener('click', async () => {
  try {
    await appKit.open({ view: 'Connect' });
  } catch (error) {
    console.error('Reown AppKit error:', error);
  }
});

document.getElementById('give-btn')?.addEventListener('click', async () => {
  const to = (document.getElementById('give-to') as HTMLInputElement).value;
  const metadata = (document.getElementById('give-metadata') as HTMLInputElement).value;
  const signature = (document.getElementById('give-signature') as HTMLInputElement).value;
  const uri = (document.getElementById('give-uri') as HTMLInputElement).value;

  if (!to || !metadata || !signature || !uri) {
    alert('Please fill in all fields');
    return;
  }

  const metadataBuffer = Buffer.from(metadata, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');

  const txOptions = {
    contractAddress: contractPrincipal,
    contractName: contractName,
    functionName: 'give',
    functionArgs: [
      principalCV(to),
      bufferCV(metadataBuffer),
      bufferCV(signatureBuffer),
      stringAsciiCV(uri),
    ],
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  try {
    await makeContractCall(txOptions);
    alert('Transaction submitted');
  } catch (error) {
    console.error('Give error:', error);
    alert('Transaction failed');
  }
});

document.getElementById('take-btn')?.addEventListener('click', async () => {
  const from = (document.getElementById('take-from') as HTMLInputElement).value;
  const metadata = (document.getElementById('take-metadata') as HTMLInputElement).value;
  const signature = (document.getElementById('take-signature') as HTMLInputElement).value;
  const uri = (document.getElementById('take-uri') as HTMLInputElement).value;

  if (!from || !metadata || !signature || !uri) {
    alert('Please fill in all fields');
    return;
  }

  const metadataBuffer = Buffer.from(metadata, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');

  const txOptions = {
    contractAddress: contractPrincipal,
    contractName: contractName,
    functionName: 'take',
    functionArgs: [
      principalCV(from),
      bufferCV(metadataBuffer),
      bufferCV(signatureBuffer),
      stringAsciiCV(uri),
    ],
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  try {
    await makeContractCall(txOptions);
    alert('Transaction submitted');
  } catch (error) {
    console.error('Take error:', error);
    alert('Transaction failed');
  }
});

document.getElementById('unequip-btn')?.addEventListener('click', async () => {
  const tokenIdStr = (document.getElementById('unequip-token-id') as HTMLInputElement).value;

  if (!tokenIdStr) {
    alert('Please enter token ID');
    return;
  }

  const tokenId = parseInt(tokenIdStr);

  const txOptions = {
    contractAddress: contractPrincipal,
    contractName: contractName,
    functionName: 'unequip',
    functionArgs: [uintCV(tokenId)],
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  try {
    await makeContractCall(txOptions);
    alert('Transaction submitted');
  } catch (error) {
    console.error('Unequip error:', error);
    alert('Transaction failed');
  }
});

document.getElementById('transfer-btn')?.addEventListener('click', async () => {
  const tokenIdStr = (document.getElementById('transfer-token-id') as HTMLInputElement).value;
  const sender = (document.getElementById('transfer-sender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transfer-recipient') as HTMLInputElement).value;

  if (!tokenIdStr || !sender || !recipient) {
    alert('Please fill in all fields');
    return;
  }

  const tokenId = parseInt(tokenIdStr);

  const txOptions = {
    contractAddress: contractPrincipal,
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
  };

  try {
    await makeContractCall(txOptions);
    alert('Transaction submitted');
  } catch (error) {
    console.error('Transfer error:', error);
    alert('Transaction failed');
  }
});
