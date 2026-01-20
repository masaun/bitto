import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  StacksMainnet,
  StacksTestnet
} from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const contractAddress = import.meta.env.VITE_CULTURAL_HISTORICAL_TOKEN_CONTRACT_ADDRESS;
const [deployerAddress, contractName] = contractAddress.split('.');

const network = new StacksMainnet();

let currentAddress: string | null = null;

const stacksAdapter = new StacksAdapter();

const metadata = {
  name: 'Cultural Historical Token',
  description: 'Cultural Historical Token Management',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

const modal = createAppKit({
  adapters: [stacksAdapter],
  metadata,
  projectId,
  networks: [
    {
      id: 'stacks',
      name: 'Stacks',
      nativeCurrency: { name: 'STX', symbol: 'STX', decimals: 6 },
      rpcUrls: {
        default: { http: ['https://api.mainnet.hiro.so'] },
        public: { http: ['https://api.mainnet.hiro.so'] }
      }
    }
  ],
  features: {
    analytics: false
  }
});

function updateWalletStatus(address: string) {
  currentAddress = address;
  const statusEl = document.getElementById('wallet-status');
  if (statusEl) {
    statusEl.textContent = `Connected: ${address}`;
  }
}

document.getElementById('connect-hiro')?.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Cultural Historical Token',
      icon: window.location.origin + '/icon.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      updateWalletStatus(userData.profile.stxAddress.mainnet);
    },
    userSession,
  });
});

document.getElementById('connect-xverse')?.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Cultural Historical Token',
      icon: window.location.origin + '/icon.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      updateWalletStatus(userData.profile.stxAddress.mainnet);
    },
    userSession,
  });
});

document.getElementById('connect-reown')?.addEventListener('click', async () => {
  await modal.open();
});

document.getElementById('mint-btn')?.addEventListener('click', async () => {
  const resultEl = document.getElementById('mint-result');
  const errorEl = document.getElementById('mint-error');
  
  if (resultEl) resultEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  try {
    const recipient = (document.getElementById('mint-recipient') as HTMLInputElement).value;
    const catalogLevel = (document.getElementById('mint-catalog-level') as HTMLInputElement).value;
    const creationDate = (document.getElementById('mint-creation-date') as HTMLInputElement).value;
    const creatorName = (document.getElementById('mint-creator-name') as HTMLInputElement).value;
    const assetType = (document.getElementById('mint-asset-type') as HTMLInputElement).value;
    const materials = (document.getElementById('mint-materials') as HTMLInputElement).value;
    const dimensions = (document.getElementById('mint-dimensions') as HTMLInputElement).value;
    const provenance = (document.getElementById('mint-provenance') as HTMLTextAreaElement).value;
    const copyright = (document.getElementById('mint-copyright') as HTMLInputElement).value;

    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'mint',
      functionArgs: [
        principalCV(recipient),
        stringAsciiCV(catalogLevel),
        stringAsciiCV(creationDate),
        stringAsciiCV(creatorName),
        stringAsciiCV(assetType),
        stringAsciiCV(materials),
        stringAsciiCV(dimensions),
        stringAsciiCV(provenance),
        stringAsciiCV(copyright)
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        if (resultEl) {
          resultEl.textContent = `Transaction ID: ${data.txId}`;
          resultEl.style.display = 'block';
        }
      },
      onCancel: () => {
        if (errorEl) {
          errorEl.textContent = 'Transaction cancelled';
          errorEl.style.display = 'block';
        }
      }
    };

    await showConnect({
      appDetails: {
        name: 'Cultural Historical Token',
        icon: window.location.origin + '/icon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        makeContractCall(txOptions);
      },
      userSession,
    });
  } catch (error) {
    if (errorEl) {
      errorEl.textContent = `Error: ${error}`;
      errorEl.style.display = 'block';
    }
  }
});

document.getElementById('set-extended-btn')?.addEventListener('click', async () => {
  const resultEl = document.getElementById('extended-result');
  const errorEl = document.getElementById('extended-error');
  
  if (resultEl) resultEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  try {
    const tokenId = (document.getElementById('extended-token-id') as HTMLInputElement).value;
    const fullText = (document.getElementById('extended-full-text') as HTMLTextAreaElement).value;
    const exhibitions = (document.getElementById('extended-exhibitions') as HTMLTextAreaElement).value;
    const documents = (document.getElementById('extended-documents') as HTMLTextAreaElement).value;
    const urls = (document.getElementById('extended-urls') as HTMLInputElement).value;

    const txOptions = {
      contractAddress: deployerAddress,
      contractName: contractName,
      functionName: 'set-extended',
      functionArgs: [
        uintCV(tokenId),
        stringAsciiCV(fullText),
        stringAsciiCV(exhibitions),
        stringAsciiCV(documents),
        stringAsciiCV(urls)
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        if (resultEl) {
          resultEl.textContent = `Transaction ID: ${data.txId}`;
          resultEl.style.display = 'block';
        }
      },
      onCancel: () => {
        if (errorEl) {
          errorEl.textContent = 'Transaction cancelled';
          errorEl.style.display = 'block';
        }
      }
    };

    await showConnect({
      appDetails: {
        name: 'Cultural Historical Token',
        icon: window.location.origin + '/icon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        makeContractCall(txOptions);
      },
      userSession,
    });
  } catch (error) {
    if (errorEl) {
      errorEl.textContent = `Error: ${error}`;
      errorEl.style.display = 'block';
    }
  }
});

document.getElementById('transfer-btn')?.addEventListener('click', async () => {
  const resultEl = document.getElementById('transfer-result');
  const errorEl = document.getElementById('transfer-error');
  
  if (resultEl) resultEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  try {
    const tokenId = (document.getElementById('transfer-token-id') as HTMLInputElement).value;
    const sender = (document.getElementById('transfer-sender') as HTMLInputElement).value;
    const recipient = (document.getElementById('transfer-recipient') as HTMLInputElement).value;

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
        if (resultEl) {
          resultEl.textContent = `Transaction ID: ${data.txId}`;
          resultEl.style.display = 'block';
        }
      },
      onCancel: () => {
        if (errorEl) {
          errorEl.textContent = 'Transaction cancelled';
          errorEl.style.display = 'block';
        }
      }
    };

    await showConnect({
      appDetails: {
        name: 'Cultural Historical Token',
        icon: window.location.origin + '/icon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        makeContractCall(txOptions);
      },
      userSession,
    });
  } catch (error) {
    if (errorEl) {
      errorEl.textContent = `Error: ${error}`;
      errorEl.style.display = 'block';
    }
  }
});
