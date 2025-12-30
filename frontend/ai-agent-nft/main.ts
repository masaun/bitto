import { AppConfig, showConnect, UserSession, openContractCall } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import {
  uintCV,
  stringAsciiCV,
  bufferCV,
  principalCV,
  boolCV,
  PostConditionMode,
  AnchorMode,
} from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let currentAddress: string | null = null;
let appKit: any = null;

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const contractAddress = import.meta.env.VITE_AI_AGENT_NFT_CONTRACT_ADDRESS;

const [contractAddr, contractName] = contractAddress.split('.');

function updateStatus(message: string) {
  const statusEl = document.getElementById('tx-status');
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function updateWalletStatus(message: string) {
  const walletStatusEl = document.getElementById('wallet-status');
  if (walletStatusEl) {
    walletStatusEl.textContent = message;
  }
}

document.getElementById('connect-stacks')?.addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: 'AI Agent NFT',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      currentAddress = userData.profile.stxAddress.mainnet;
      updateWalletStatus(`Connected: ${currentAddress}`);
    },
    userSession,
  });
});

document.getElementById('connect-walletkit')?.addEventListener('click', async () => {
  try {
    const { Web3Wallet } = await import('@walletconnect/web3wallet');
    const web3wallet = await Web3Wallet.init({
      core: {
        projectId: projectId,
      },
      metadata: {
        name: 'AI Agent NFT',
        description: 'AI Agent NFT Interface',
        url: window.location.origin,
        icons: [window.location.origin + '/logo.png'],
      },
    });
    updateWalletStatus('WalletKit initialized');
  } catch (error) {
    updateWalletStatus(`WalletKit error: ${error}`);
  }
});

document.getElementById('connect-appkit')?.addEventListener('click', () => {
  if (!appKit) {
    const stacksAdapter = new StacksAdapter();
    
    appKit = createAppKit({
      adapters: [stacksAdapter],
      networks: [
        {
          id: 'stacks-mainnet',
          chain: 'stacks',
          name: 'Stacks Mainnet',
          network: 'mainnet',
          nativeCurrency: { name: 'Stacks', symbol: 'STX', decimals: 6 },
          rpcUrl: 'https://stacks-node-api.mainnet.stacks.co',
          explorerUrl: 'https://explorer.stacks.co',
        },
      ],
      projectId: projectId,
      features: {
        analytics: true,
      },
    });
  }
  
  appKit.open();
  updateWalletStatus('AppKit opened');
});

document.getElementById('mint')?.addEventListener('click', async () => {
  const dataHashInput = (document.getElementById('mint-data-hash') as HTMLInputElement).value;
  const description = (document.getElementById('mint-description') as HTMLInputElement).value;
  const recipient = (document.getElementById('mint-recipient') as HTMLInputElement).value;

  if (!dataHashInput || !description || !recipient) {
    updateStatus('Please fill all mint fields');
    return;
  }

  try {
    const dataHashBuffer = Buffer.from(dataHashInput.replace('0x', ''), 'hex');
    
    await openContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'mint',
      functionArgs: [
        bufferCV(dataHashBuffer),
        stringAsciiCV(description),
        principalCV(recipient),
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        updateStatus(`Mint transaction: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Mint cancelled');
      },
    });
  } catch (error) {
    updateStatus(`Mint error: ${error}`);
  }
});

document.getElementById('transfer')?.addEventListener('click', async () => {
  const tokenId = (document.getElementById('transfer-token-id') as HTMLInputElement).value;
  const sender = (document.getElementById('transfer-sender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transfer-recipient') as HTMLInputElement).value;

  if (!tokenId || !sender || !recipient) {
    updateStatus('Please fill all transfer fields');
    return;
  }

  try {
    await openContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'transfer',
      functionArgs: [
        uintCV(parseInt(tokenId)),
        principalCV(sender),
        principalCV(recipient),
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        updateStatus(`Transfer transaction: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Transfer cancelled');
      },
    });
  } catch (error) {
    updateStatus(`Transfer error: ${error}`);
  }
});

document.getElementById('authorize-usage')?.addEventListener('click', async () => {
  const tokenId = (document.getElementById('authorize-token-id') as HTMLInputElement).value;
  const user = (document.getElementById('authorize-user') as HTMLInputElement).value;

  if (!tokenId || !user) {
    updateStatus('Please fill all authorize fields');
    return;
  }

  try {
    await openContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'authorize-usage',
      functionArgs: [
        uintCV(parseInt(tokenId)),
        principalCV(user),
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        updateStatus(`Authorize usage transaction: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Authorize usage cancelled');
      },
    });
  } catch (error) {
    updateStatus(`Authorize usage error: ${error}`);
  }
});

document.getElementById('revoke-authorization')?.addEventListener('click', async () => {
  const tokenId = (document.getElementById('revoke-token-id') as HTMLInputElement).value;
  const user = (document.getElementById('revoke-user') as HTMLInputElement).value;

  if (!tokenId || !user) {
    updateStatus('Please fill all revoke fields');
    return;
  }

  try {
    await openContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'revoke-authorization',
      functionArgs: [
        uintCV(parseInt(tokenId)),
        principalCV(user),
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        updateStatus(`Revoke authorization transaction: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Revoke authorization cancelled');
      },
    });
  } catch (error) {
    updateStatus(`Revoke authorization error: ${error}`);
  }
});

document.getElementById('approve')?.addEventListener('click', async () => {
  const spender = (document.getElementById('approve-spender') as HTMLInputElement).value;
  const tokenId = (document.getElementById('approve-token-id') as HTMLInputElement).value;

  if (!spender || !tokenId) {
    updateStatus('Please fill all approve fields');
    return;
  }

  try {
    await openContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'approve',
      functionArgs: [
        principalCV(spender),
        uintCV(parseInt(tokenId)),
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        updateStatus(`Approve transaction: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Approve cancelled');
      },
    });
  } catch (error) {
    updateStatus(`Approve error: ${error}`);
  }
});

document.getElementById('set-approval-for-all')?.addEventListener('click', async () => {
  const operator = (document.getElementById('approval-operator') as HTMLInputElement).value;
  const approved = (document.getElementById('approval-approved') as HTMLInputElement).checked;

  if (!operator) {
    updateStatus('Please fill operator address');
    return;
  }

  try {
    await openContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'set-approval-for-all',
      functionArgs: [
        principalCV(operator),
        boolCV(approved),
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        updateStatus(`Set approval for all transaction: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Set approval for all cancelled');
      },
    });
  } catch (error) {
    updateStatus(`Set approval for all error: ${error}`);
  }
});

document.getElementById('delegate-access-to')?.addEventListener('click', async () => {
  const assistant = (document.getElementById('delegate-assistant') as HTMLInputElement).value;

  if (!assistant) {
    updateStatus('Please fill assistant address');
    return;
  }

  try {
    await openContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: 'delegate-access-to',
      functionArgs: [
        principalCV(assistant),
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        updateStatus(`Delegate access transaction: ${data.txId}`);
      },
      onCancel: () => {
        updateStatus('Delegate access cancelled');
      },
    });
  } catch (error) {
    updateStatus(`Delegate access error: ${error}`);
  }
});
