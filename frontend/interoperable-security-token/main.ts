import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { 
  makeContractCall, 
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let currentAddress: string | null = null;
let reownModal: any = null;

const contractAddress = import.meta.env.VITE_INTEROPERABLE_SECURITY_TOKEN_CONTRACT_ADDRESS || 'SP000000000000000000002Q6VF78.interoperable-security-token';
const [contractOwner, contractName] = contractAddress.split('.');
const network = new StacksMainnet();

function showStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `status show ${type}`;
    setTimeout(() => {
      statusEl.className = 'status';
    }, 5000);
  }
}

function updateWalletInfo(address: string) {
  currentAddress = address;
  const walletInfo = document.getElementById('wallet-info');
  if (walletInfo) {
    walletInfo.textContent = `Connected: ${address}`;
  }
}

document.getElementById('connect-hiro')?.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Interoperable Security Token',
      icon: window.location.origin + '/icon.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      updateWalletInfo(userData.profile.stxAddress.mainnet);
      showStatus('Hiro Wallet connected successfully', 'success');
    },
    onCancel: () => {
      showStatus('Connection cancelled', 'error');
    },
    userSession,
  });
});

document.getElementById('connect-leather')?.addEventListener('click', async () => {
  try {
    const response = await (window as any).btc?.request('getAddresses');
    if (response?.result?.addresses) {
      const stxAddress = response.result.addresses.find((addr: any) => addr.type === 'stacks')?.address;
      if (stxAddress) {
        updateWalletInfo(stxAddress);
        showStatus('Leather Wallet connected successfully', 'success');
      }
    }
  } catch (error) {
    showStatus('Leather Wallet connection failed', 'error');
  }
});

document.getElementById('connect-reown')?.addEventListener('click', async () => {
  try {
    const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
    
    if (!projectId || projectId === 'your_project_id_here') {
      showStatus('Please set VITE_WALLET_CONNECT_PROJECT_ID in .env', 'error');
      return;
    }

    const stacksAdapter = new StacksAdapter();

    reownModal = createAppKit({
      adapters: [stacksAdapter],
      networks: [
        {
          id: 'stacks',
          name: 'Stacks',
          nativeCurrency: { name: 'STX', symbol: 'STX', decimals: 6 },
          rpcUrls: { default: { http: ['https://stacks-node-api.mainnet.stacks.co'] } }
        }
      ],
      projectId,
      features: {
        analytics: true,
      }
    });

    reownModal.open();
    showStatus('Reown AppKit opened', 'success');
  } catch (error) {
    showStatus('Reown connection failed: ' + (error as Error).message, 'error');
  }
});

async function callContractFunction(functionName: string, functionArgs: any[]) {
  if (!currentAddress) {
    showStatus('Please connect your wallet first', 'error');
    return;
  }

  try {
    const txOptions = {
      contractAddress: contractOwner,
      contractName: contractName,
      functionName: functionName,
      functionArgs: functionArgs,
      senderKey: '',
      network: network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    showStatus(`Transaction broadcasted: ${broadcastResponse.txid}`, 'success');
    return broadcastResponse;
  } catch (error) {
    showStatus(`Error: ${(error as Error).message}`, 'error');
  }
}

document.getElementById('mint-btn')?.addEventListener('click', async () => {
  const account = (document.getElementById('mint-account') as HTMLInputElement).value;
  const partitionId = (document.getElementById('mint-partition') as HTMLInputElement).value;
  const amount = (document.getElementById('mint-amount') as HTMLInputElement).value;

  if (!account || !partitionId || !amount) {
    showStatus('Please fill all fields', 'error');
    return;
  }

  await callContractFunction('mint', [
    principalCV(account),
    uintCV(parseInt(partitionId)),
    uintCV(parseInt(amount))
  ]);
});

document.getElementById('transfer-btn')?.addEventListener('click', async () => {
  const amount = (document.getElementById('transfer-amount') as HTMLInputElement).value;
  const sender = (document.getElementById('transfer-sender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transfer-recipient') as HTMLInputElement).value;
  const partitionId = (document.getElementById('transfer-partition') as HTMLInputElement).value;

  if (!amount || !sender || !recipient || !partitionId) {
    showStatus('Please fill all fields', 'error');
    return;
  }

  await callContractFunction('transfer', [
    uintCV(parseInt(amount)),
    principalCV(sender),
    principalCV(recipient),
    uintCV(parseInt(partitionId))
  ]);
});

document.getElementById('lock-tokens-btn')?.addEventListener('click', async () => {
  const account = (document.getElementById('lock-account') as HTMLInputElement).value;
  const partitionId = (document.getElementById('lock-partition') as HTMLInputElement).value;
  const amount = (document.getElementById('lock-amount') as HTMLInputElement).value;
  const releaseTime = (document.getElementById('lock-release-time') as HTMLInputElement).value;

  if (!account || !partitionId || !amount || !releaseTime) {
    showStatus('Please fill all fields', 'error');
    return;
  }

  await callContractFunction('lock-tokens', [
    principalCV(account),
    uintCV(parseInt(partitionId)),
    uintCV(parseInt(amount)),
    uintCV(parseInt(releaseTime))
  ]);
});

document.getElementById('restrict-transfer-btn')?.addEventListener('click', async () => {
  const partitionId = (document.getElementById('restrict-partition') as HTMLInputElement).value;

  if (!partitionId) {
    showStatus('Please enter partition ID', 'error');
    return;
  }

  await callContractFunction('restrict-transfer', [
    uintCV(parseInt(partitionId))
  ]);
});

document.getElementById('remove-restriction-btn')?.addEventListener('click', async () => {
  const partitionId = (document.getElementById('restrict-partition') as HTMLInputElement).value;

  if (!partitionId) {
    showStatus('Please enter partition ID', 'error');
    return;
  }

  await callContractFunction('remove-restriction', [
    uintCV(parseInt(partitionId))
  ]);
});

document.getElementById('freeze-address-btn')?.addEventListener('click', async () => {
  const account = (document.getElementById('freeze-account') as HTMLInputElement).value;

  if (!account) {
    showStatus('Please enter account address', 'error');
    return;
  }

  await callContractFunction('freeze-address', [
    principalCV(account)
  ]);
});

document.getElementById('unfreeze-address-btn')?.addEventListener('click', async () => {
  const account = (document.getElementById('freeze-account') as HTMLInputElement).value;

  if (!account) {
    showStatus('Please enter account address', 'error');
    return;
  }

  await callContractFunction('unfreeze-address', [
    principalCV(account)
  ]);
});

document.getElementById('forced-transfer-btn')?.addEventListener('click', async () => {
  const from = (document.getElementById('forced-from') as HTMLInputElement).value;
  const to = (document.getElementById('forced-to') as HTMLInputElement).value;
  const partitionId = (document.getElementById('forced-partition') as HTMLInputElement).value;
  const amount = (document.getElementById('forced-amount') as HTMLInputElement).value;

  if (!from || !to || !partitionId || !amount) {
    showStatus('Please fill all fields', 'error');
    return;
  }

  await callContractFunction('forced-transfer', [
    principalCV(from),
    principalCV(to),
    uintCV(parseInt(partitionId)),
    uintCV(parseInt(amount))
  ]);
});
