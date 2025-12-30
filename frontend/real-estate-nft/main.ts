import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  PostConditionMode,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let currentAddress: string | null = null;
const contractAddress = import.meta.env.VITE_REAL_ESTATE_NFT_CONTRACT_ADDRESS;
const network = new StacksMainnet();

const stacksAdapter = new StacksAdapter();

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

const modal = createAppKit({
  adapters: [stacksAdapter],
  networks: [
    {
      id: 'stacks',
      name: 'Stacks',
      nativeCurrency: { name: 'Stacks', symbol: 'STX', decimals: 6 },
      rpcUrls: { default: { http: ['https://api.mainnet.hiro.so'] } },
    },
  ],
  projectId,
  features: {
    analytics: false,
  },
});

function showStatus(message: string, isError: boolean = false) {
  const statusEl = document.getElementById('status')!;
  statusEl.textContent = message;
  statusEl.className = isError ? 'error' : 'success';
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 5000);
}

function updateWalletDisplay(address: string) {
  currentAddress = address;
  document.getElementById('walletAddress')!.textContent = address;
}

document.getElementById('connectHiro')!.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Real Estate NFT',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      const address = userData.profile.stxAddress.mainnet;
      updateWalletDisplay(address);
      showStatus('Hiro Wallet connected successfully');
    },
    onCancel: () => {
      showStatus('Connection cancelled', true);
    },
    userSession,
  });
});

document.getElementById('connectXverse')!.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Real Estate NFT',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      const address = userData.profile.stxAddress.mainnet;
      updateWalletDisplay(address);
      showStatus('Xverse Wallet connected successfully');
    },
    onCancel: () => {
      showStatus('Connection cancelled', true);
    },
    userSession,
  });
});

document.getElementById('connectReown')!.addEventListener('click', async () => {
  try {
    await modal.open();
    showStatus('Reown WalletConnect opened');
  } catch (error) {
    showStatus('Failed to connect with Reown: ' + (error as Error).message, true);
  }
});

document.getElementById('mintBtn')!.addEventListener('click', async () => {
  if (!currentAddress) {
    showStatus('Please connect your wallet first', true);
    return;
  }

  const propertyAddress = (document.getElementById('propertyAddress') as HTMLInputElement).value;
  const jurisdiction = (document.getElementById('jurisdiction') as HTMLInputElement).value;
  const propertyId = (document.getElementById('propertyId') as HTMLInputElement).value;
  const propertyType = (document.getElementById('propertyType') as HTMLInputElement).value;
  const parcelNumber = (document.getElementById('parcelNumber') as HTMLInputElement).value;
  const dimensions = (document.getElementById('dimensions') as HTMLInputElement).value;
  const valuation = (document.getElementById('valuation') as HTMLInputElement).value;
  const recipient = (document.getElementById('recipient') as HTMLInputElement).value;

  if (!propertyAddress || !jurisdiction || !propertyId || !propertyType || !parcelNumber || !dimensions || !valuation || !recipient) {
    showStatus('Please fill in all fields', true);
    return;
  }

  try {
    const [contract, name] = contractAddress.split('.');
    const txOptions = {
      contractAddress: contract,
      contractName: name,
      functionName: 'mint',
      functionArgs: [
        stringAsciiCV(propertyAddress),
        stringAsciiCV(jurisdiction),
        stringAsciiCV(propertyId),
        stringAsciiCV(propertyType),
        stringAsciiCV(parcelNumber),
        stringAsciiCV(dimensions),
        uintCV(valuation),
        principalCV(recipient),
      ],
      senderKey: currentAddress,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        showStatus('Mint transaction broadcasted: ' + data.txId);
      },
      onCancel: () => {
        showStatus('Transaction cancelled', true);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    showStatus('Mint failed: ' + (error as Error).message, true);
  }
});

document.getElementById('setDebtBtn')!.addEventListener('click', async () => {
  if (!currentAddress) {
    showStatus('Please connect your wallet first', true);
    return;
  }

  const tokenId = (document.getElementById('setDebtTokenId') as HTMLInputElement).value;
  const debtToken = (document.getElementById('debtToken') as HTMLInputElement).value;
  const debtAmount = (document.getElementById('debtAmount') as HTMLInputElement).value;

  if (!tokenId || !debtToken || !debtAmount) {
    showStatus('Please fill in all fields', true);
    return;
  }

  try {
    const [contract, name] = contractAddress.split('.');
    const txOptions = {
      contractAddress: contract,
      contractName: name,
      functionName: 'set-debt',
      functionArgs: [
        uintCV(tokenId),
        principalCV(debtToken),
        uintCV(debtAmount),
      ],
      senderKey: currentAddress,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        showStatus('Set debt transaction broadcasted: ' + data.txId);
      },
      onCancel: () => {
        showStatus('Transaction cancelled', true);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    showStatus('Set debt failed: ' + (error as Error).message, true);
  }
});

document.getElementById('forecloseBtn')!.addEventListener('click', async () => {
  if (!currentAddress) {
    showStatus('Please connect your wallet first', true);
    return;
  }

  const tokenId = (document.getElementById('forecloseTokenId') as HTMLInputElement).value;

  if (!tokenId) {
    showStatus('Please fill in token ID', true);
    return;
  }

  try {
    const [contract, name] = contractAddress.split('.');
    const txOptions = {
      contractAddress: contract,
      contractName: name,
      functionName: 'foreclose',
      functionArgs: [uintCV(tokenId)],
      senderKey: currentAddress,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        showStatus('Foreclose transaction broadcasted: ' + data.txId);
      },
      onCancel: () => {
        showStatus('Transaction cancelled', true);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    showStatus('Foreclose failed: ' + (error as Error).message, true);
  }
});

document.getElementById('transferBtn')!.addEventListener('click', async () => {
  if (!currentAddress) {
    showStatus('Please connect your wallet first', true);
    return;
  }

  const tokenId = (document.getElementById('transferTokenId') as HTMLInputElement).value;
  const sender = (document.getElementById('sender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transferRecipient') as HTMLInputElement).value;

  if (!tokenId || !sender || !recipient) {
    showStatus('Please fill in all fields', true);
    return;
  }

  try {
    const [contract, name] = contractAddress.split('.');
    const txOptions = {
      contractAddress: contract,
      contractName: name,
      functionName: 'transfer',
      functionArgs: [
        uintCV(tokenId),
        principalCV(sender),
        principalCV(recipient),
      ],
      senderKey: currentAddress,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        showStatus('Transfer transaction broadcasted: ' + data.txId);
      },
      onCancel: () => {
        showStatus('Transaction cancelled', true);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    showStatus('Transfer failed: ' + (error as Error).message, true);
  }
});
