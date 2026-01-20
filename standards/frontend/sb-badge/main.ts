import { AppConfig, showConnect, UserSession } from '@stacks/connect';
import { 
  makeContractCall, 
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  principalCV,
  uintCV,
  stringAsciiCV
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const contractAddress = import.meta.env.VITE_SB_BADGE_CONTRACT_ADDRESS;
const [deployerAddress, contractName] = contractAddress.split('.');

let currentAddress: string | null = null;

const statusDiv = document.getElementById('status')!;
const walletStatusDiv = document.getElementById('walletStatus')!;

function updateStatus(message: string) {
  statusDiv.textContent = message;
  console.log(message);
}

function updateWalletStatus(address: string) {
  currentAddress = address;
  walletStatusDiv.textContent = `Connected: ${address}`;
}

document.getElementById('connectHiro')!.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'SB Badge Frontend',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      updateWalletStatus(userData.profile.stxAddress.mainnet);
      updateStatus('Hiro Wallet connected successfully');
    },
    onCancel: () => {
      updateStatus('Wallet connection cancelled');
    },
    userSession,
  });
});

document.getElementById('connectWalletConnect')!.addEventListener('click', async () => {
  try {
    updateStatus('WalletConnect integration in progress...');
  } catch (error) {
    updateStatus(`WalletConnect error: ${error}`);
  }
});

const stacksAdapter = new StacksAdapter();

const appKit = createAppKit({
  adapters: [stacksAdapter],
  networks: [
    {
      id: 'stacks',
      name: 'Stacks',
      network: 'mainnet',
      nativeCurrency: { name: 'STX', symbol: 'STX', decimals: 6 },
      rpcUrl: 'https://api.mainnet.hiro.so',
    }
  ],
  projectId,
  features: {
    analytics: true,
  },
  metadata: {
    name: 'SB Badge Frontend',
    description: 'Soulbound Badge Management',
    url: window.location.origin,
    icons: [window.location.origin + '/logo.png']
  }
});

document.getElementById('connectReown')!.addEventListener('click', async () => {
  try {
    await appKit.open();
    updateStatus('Reown AppKit opened');
  } catch (error) {
    updateStatus(`Reown error: ${error}`);
  }
});

document.getElementById('mintBtn')!.addEventListener('click', async () => {
  const nftContract = (document.getElementById('mintNftContract') as HTMLInputElement).value;
  const nftTokenId = (document.getElementById('mintNftTokenId') as HTMLInputElement).value;
  const uri = (document.getElementById('mintUri') as HTMLInputElement).value;

  if (!nftContract || !nftTokenId || !uri) {
    updateStatus('Please fill in all mint fields');
    return;
  }

  if (!currentAddress) {
    updateStatus('Please connect your wallet first');
    return;
  }

  try {
    updateStatus('Preparing mint transaction...');

    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'mint',
      functionArgs: [
        principalCV(nftContract),
        uintCV(nftTokenId),
        stringAsciiCV(uri)
      ],
      senderKey: '',
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    if (userSession.isUserSignedIn()) {
      showConnect({
        appDetails: {
          name: 'SB Badge Frontend',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          updateStatus(`Mint transaction broadcast: ${data.txId}`);
        },
        onCancel: () => {
          updateStatus('Transaction cancelled');
        },
        userSession,
      });
    } else {
      updateStatus('Please connect wallet first');
    }
  } catch (error) {
    updateStatus(`Mint error: ${error}`);
  }
});

document.getElementById('transferBtn')!.addEventListener('click', async () => {
  const badgeId = (document.getElementById('transferBadgeId') as HTMLInputElement).value;
  const sender = (document.getElementById('transferSender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transferRecipient') as HTMLInputElement).value;

  if (!badgeId || !sender || !recipient) {
    updateStatus('Please fill in all transfer fields');
    return;
  }

  if (!currentAddress) {
    updateStatus('Please connect your wallet first');
    return;
  }

  try {
    updateStatus('Preparing transfer transaction...');

    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'transfer',
      functionArgs: [
        uintCV(badgeId),
        principalCV(sender),
        principalCV(recipient)
      ],
      senderKey: '',
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    if (userSession.isUserSignedIn()) {
      showConnect({
        appDetails: {
          name: 'SB Badge Frontend',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          updateStatus(`Transfer transaction broadcast: ${data.txId}`);
        },
        onCancel: () => {
          updateStatus('Transaction cancelled');
        },
        userSession,
      });
    } else {
      updateStatus('Please connect wallet first');
    }
  } catch (error) {
    updateStatus(`Transfer error: ${error}`);
  }
});

if (userSession.isUserSignedIn()) {
  const userData = userSession.loadUserData();
  updateWalletStatus(userData.profile.stxAddress.mainnet);
}
