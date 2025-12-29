import { showConnect, UserSession, AppConfig, openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, contractPrincipalCV } from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.MULTI_ASSET_VAULT_CONTRACT_ADDRESS as string;
const contractName = 'multi-asset-vault';

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
      name: 'Multi Asset Vault',
      description: 'Multi Asset Vault Frontend',
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
      name: 'Multi Asset Vault',
      description: 'Multi Asset Vault Frontend',
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
    appDetails: { name: 'Multi Asset Vault', icon: window.location.origin + '/logo.png' },
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

function callAddAsset() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'add-asset',
    functionArgs: [contractPrincipalCV(contractAddress, 'sample-token')],
    appDetails: { name: 'Multi Asset Vault', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callDeposit() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'deposit',
    functionArgs: [contractPrincipalCV(contractAddress, 'sample-token'), uintCV(1000000)],
    appDetails: { name: 'Multi Asset Vault', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callWithdraw() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'withdraw',
    functionArgs: [contractPrincipalCV(contractAddress, 'sample-token'), uintCV(1000000)],
    appDetails: { name: 'Multi Asset Vault', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callTransferShares() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'transfer-shares',
    functionArgs: [uintCV(1000000), standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Multi Asset Vault', icon: window.location.origin + '/logo.png' },
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
  renderButton('Add Asset', callAddAsset);
  renderButton('Deposit', callDeposit);
  renderButton('Withdraw', callWithdraw);
  renderButton('Transfer Shares', callTransferShares);
});
