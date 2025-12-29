import { showConnect, UserSession, AppConfig, openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, boolCV } from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.DUAL_TOKEN_CONTRACT_ADDRESS as string;
const contractName = 'dual-token';

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
      name: 'Dual Token',
      description: 'Dual Token Frontend',
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
      name: 'Dual Token',
      description: 'Dual Token Frontend',
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
    appDetails: { name: 'Dual Token', icon: window.location.origin + '/logo.png' },
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

function callSetSkipNft() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'set-skip-nft',
    functionArgs: [boolCV(true)],
    appDetails: { name: 'Dual Token', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callMint() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [uintCV(1000000), standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Dual Token', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callTransfer() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: [uintCV(1000000), standardPrincipalCV(getUserAddress()), standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Dual Token', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callMintNft() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'mint-nft',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Dual Token', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callTransferNft() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'transfer-nft',
    functionArgs: [uintCV(1), standardPrincipalCV(getUserAddress()), standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Dual Token', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callBurn() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'burn',
    functionArgs: [uintCV(1000000), standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Dual Token', icon: window.location.origin + '/logo.png' },
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
  renderButton('Set Skip NFT', callSetSkipNft);
  renderButton('Mint Tokens', callMint);
  renderButton('Transfer Tokens', callTransfer);
  renderButton('Mint NFT', callMintNft);
  renderButton('Transfer NFT', callTransferNft);
  renderButton('Burn Tokens', callBurn);
});
