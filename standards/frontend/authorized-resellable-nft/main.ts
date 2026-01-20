import { showConnect, UserSession, AppConfig, openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, boolCV } from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.AUTHORIZED_RESELLABLE_NFT_CONTRACT_ADDRESS as string;
const contractName = 'authorized-resellable-nft';

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
      name: 'Authorized Resellable NFT',
      description: 'Authorized Resellable NFT Frontend',
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
      name: 'Authorized Resellable NFT',
      description: 'Authorized Resellable NFT Frontend',
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
    appDetails: { name: 'Authorized Resellable NFT', icon: window.location.origin + '/logo.png' },
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

function callMint() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Authorized Resellable NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callAuthorizeReseller() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'authorize-reseller',
    functionArgs: [uintCV(1), standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Authorized Resellable NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callRevokeReseller() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'revoke-reseller',
    functionArgs: [uintCV(1), standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Authorized Resellable NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callResell() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'resell',
    functionArgs: [uintCV(1), standardPrincipalCV(getUserAddress()), uintCV(1000000)],
    appDetails: { name: 'Authorized Resellable NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callChangeStatus() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'change-status',
    functionArgs: [uintCV(1), boolCV(true)],
    appDetails: { name: 'Authorized Resellable NFT', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callRedeem() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'redeem',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'Authorized Resellable NFT', icon: window.location.origin + '/logo.png' },
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
  renderButton('Mint NFT', callMint);
  renderButton('Authorize Reseller', callAuthorizeReseller);
  renderButton('Revoke Reseller', callRevokeReseller);
  renderButton('Resell NFT', callResell);
  renderButton('Change Status', callChangeStatus);
  renderButton('Redeem NFT', callRedeem);
});
