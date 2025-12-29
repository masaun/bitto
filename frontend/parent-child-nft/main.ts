import { showConnect, UserSession, AppConfig, openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV } from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.PARENT_CHILD_NFT_CONTRACT_ADDRESS as string;
const contractName = 'parent-child-nft';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let appKit: any;
let web3Wallet: any;

async function initializeWalletKit() {
  web3Wallet = await Web3Wallet.init({
    core: {
      projectId
    },
    metadata: {
      name: 'Parent Child NFT',
      description: 'Parent Child NFT Frontend',
      url: window.location.origin,
      icons: []
    }
  });
}

async function initializeAppKit() {
  appKit = createAppKit({
    projectId,
    chains: [],
    metadata: {
      name: 'Parent Child NFT',
      description: 'Parent Child NFT Frontend',
      url: window.location.origin,
      icons: []
    }
  });
}

function renderButton(text: string, onClick: () => void) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.margin = '5px';
  btn.onclick = onClick;
  document.getElementById('root')?.appendChild(btn);
}

function renderSeparator(text: string) {
  const div = document.createElement('div');
  div.textContent = text;
  div.style.marginTop = '20px';
  div.style.fontWeight = 'bold';
  document.getElementById('root')?.appendChild(div);
}

async function connectWalletStacksConnect() {
  await showConnect({
    appDetails: { name: 'Parent Child NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    walletConnectProjectId: projectId,
    onFinish: () => {
      console.log('Wallet connected');
    },
    onCancel: () => {
      console.log('Connection cancelled');
    }
  });
}

async function connectWalletKit() {
  if (!web3Wallet) {
    await initializeWalletKit();
  }
  console.log('WalletKit initialized');
}

async function connectAppKit() {
  if (!appKit) {
    await initializeAppKit();
  }
  appKit.open();
}

function getUserAddress(): string {
  if (userSession.isUserSignedIn()) {
    return userSession.loadUserData().profile.stxAddress.mainnet;
  }
  return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
}

function callMintParent() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'mint-parent',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Parent Child NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callMintChild() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'mint-child',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Parent Child NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callProposeAddChild() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'propose-add-child',
    functionArgs: [uintCV(1), uintCV(1)],
    appDetails: { name: 'Parent Child NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callAcceptChild() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'accept-child',
    functionArgs: [uintCV(1), uintCV(1)],
    appDetails: { name: 'Parent Child NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callRemoveChild() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'remove-child',
    functionArgs: [uintCV(1), uintCV(1)],
    appDetails: { name: 'Parent Child NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSeparator('Wallet Connections');
  renderButton('Connect Wallet (@stacks/connect)', connectWalletStacksConnect);
  renderButton('Connect Wallet (WalletKit)', connectWalletKit);
  renderButton('Connect Wallet (AppKit)', connectAppKit);
  
  renderSeparator('Contract Functions');
  renderButton('Mint Parent NFT', callMintParent);
  renderButton('Mint Child NFT', callMintChild);
  renderButton('Propose Add Child', callProposeAddChild);
  renderButton('Accept Child', callAcceptChild);
  renderButton('Remove Child', callRemoveChild);
});
