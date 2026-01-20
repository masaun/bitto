import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  principalCV,
  uintCV,
  listCV,
  FungibleConditionCode,
  NonFungibleConditionCode,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  bufferCV,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let currentAddress = '';
const network = new StacksMainnet();
const contractAddress = import.meta.env.VITE_DESIGNATE_EXECUTOR_CONTRACT_ADDRESS.split('.')[0];
const contractName = import.meta.env.VITE_DESIGNATE_EXECUTOR_CONTRACT_ADDRESS.split('.')[1];

const stacksAdapter = new StacksAdapter();

const appKit = createAppKit({
  adapters: [stacksAdapter],
  networks: [
    {
      id: 'stacks',
      name: 'Stacks',
      chain: 'stacks:1',
      nativeCurrency: { name: 'STX', symbol: 'STX', decimals: 6 },
      rpcUrl: 'https://api.mainnet.hiro.so',
      explorerUrl: 'https://explorer.hiro.so',
    }
  ],
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  features: {
    analytics: false,
  },
});

function updateStatus(message: string) {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.style.display = 'block';
  }
}

function updateAddress(address: string) {
  currentAddress = address;
  const walletEl = document.getElementById('wallet-address');
  if (walletEl) {
    walletEl.textContent = `Connected: ${address}`;
  }
}

document.getElementById('connect-stacks')?.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'Designate Executor',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      updateAddress(userData.profile.stxAddress.mainnet);
      updateStatus('Connected via Stacks Connect');
    },
    userSession,
  });
});

document.getElementById('connect-walletkit')?.addEventListener('click', async () => {
  try {
    updateStatus('WalletKit connection not fully implemented in this demo');
  } catch (error) {
    updateStatus(`Error: ${error}`);
  }
});

document.getElementById('connect-appkit')?.addEventListener('click', async () => {
  try {
    await appKit.open();
    updateStatus('AppKit modal opened');
  } catch (error) {
    updateStatus(`Error: ${error}`);
  }
});

document.getElementById('mint-btn')?.addEventListener('click', async () => {
  const recipient = (document.getElementById('mint-recipient') as HTMLInputElement).value;
  if (!recipient) {
    updateStatus('Please enter recipient address');
    return;
  }
  await mint(recipient);
});

document.getElementById('set-will-btn')?.addEventListener('click', async () => {
  const tokenId = (document.getElementById('set-will-token-id') as HTMLInputElement).value;
  const executorsStr = (document.getElementById('set-will-executors') as HTMLTextAreaElement).value;
  const moratorium = (document.getElementById('set-will-moratorium') as HTMLInputElement).value;
  
  if (!tokenId || !executorsStr || !moratorium) {
    updateStatus('Please fill all fields');
    return;
  }
  
  const executors = executorsStr.split(',').map(e => e.trim()).filter(e => e.length > 0);
  if (executors.length > 10) {
    updateStatus('Maximum 10 executors allowed');
    return;
  }
  
  await setWill(parseInt(tokenId), executors, parseInt(moratorium));
});

document.getElementById('announce-obit-btn')?.addEventListener('click', async () => {
  const tokenId = (document.getElementById('announce-token-id') as HTMLInputElement).value;
  const owner = (document.getElementById('announce-owner') as HTMLInputElement).value;
  const inheritor = (document.getElementById('announce-inheritor') as HTMLInputElement).value;
  
  if (!tokenId || !owner || !inheritor) {
    updateStatus('Please fill all fields');
    return;
  }
  
  await announceObit(parseInt(tokenId), owner, inheritor);
});

document.getElementById('cancel-obit-btn')?.addEventListener('click', async () => {
  const tokenId = (document.getElementById('cancel-token-id') as HTMLInputElement).value;
  
  if (!tokenId) {
    updateStatus('Please enter token ID');
    return;
  }
  
  await cancelObit(parseInt(tokenId));
});

document.getElementById('bequeath-btn')?.addEventListener('click', async () => {
  const tokenId = (document.getElementById('bequeath-token-id') as HTMLInputElement).value;
  const owner = (document.getElementById('bequeath-owner') as HTMLInputElement).value;
  
  if (!tokenId || !owner) {
    updateStatus('Please fill all fields');
    return;
  }
  
  await bequeath(parseInt(tokenId), owner);
});

async function mint(recipient: string) {
  try {
    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'mint',
      functionArgs: [principalCV(recipient)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data: any) => {
        updateStatus(`Transaction submitted: ${data.txId}`);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus(`Error: ${error}`);
  }
}

async function setWill(tokenId: number, executors: string[], moratoriumTtl: number) {
  try {
    const executorsCVs = executors.map(e => principalCV(e));
    
    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'set-will',
      functionArgs: [
        uintCV(tokenId),
        listCV(executorsCVs),
        uintCV(moratoriumTtl)
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data: any) => {
        updateStatus(`Transaction submitted: ${data.txId}`);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus(`Error: ${error}`);
  }
}

async function announceObit(tokenId: number, owner: string, inheritor: string) {
  try {
    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'announce-obit',
      functionArgs: [
        uintCV(tokenId),
        principalCV(owner),
        principalCV(inheritor)
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data: any) => {
        updateStatus(`Transaction submitted: ${data.txId}`);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus(`Error: ${error}`);
  }
}

async function cancelObit(tokenId: number) {
  try {
    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'cancel-obit',
      functionArgs: [uintCV(tokenId)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data: any) => {
        updateStatus(`Transaction submitted: ${data.txId}`);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus(`Error: ${error}`);
  }
}

async function bequeath(tokenId: number, owner: string) {
  try {
    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'bequeath',
      functionArgs: [
        uintCV(tokenId),
        principalCV(owner)
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data: any) => {
        updateStatus(`Transaction submitted: ${data.txId}`);
      },
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus(`Error: ${error}`);
  }
}
