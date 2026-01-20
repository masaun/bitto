import { showConnect, UserSession, AppConfig, openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, noneCV } from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = import.meta.env.VITE_CAPPABLE_TOKEN_CONTRACT_ADDRESS as string;
const contractName = 'cappable-token';

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
      name: 'Cappable Token',
      description: 'Cappable Token Frontend',
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
      name: 'Cappable Token',
      description: 'Cappable Token Frontend',
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
    appDetails: { name: 'Cappable Token', icon: window.location.origin + '/logo.png' },
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

function callSetMaxSupply() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'set-max-supply',
    functionArgs: [uintCV(1000000)],
    appDetails: { name: 'Cappable Token', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callSetTransferFee() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'set-transfer-fee',
    functionArgs: [uintCV(10)],
    appDetails: { name: 'Cappable Token', icon: window.location.origin + '/logo.png' },
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
    functionArgs: [uintCV(100), standardPrincipalCV(getUserAddress()), standardPrincipalCV(getUserAddress()), noneCV()],
    appDetails: { name: 'Cappable Token', icon: window.location.origin + '/logo.png' },
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
    functionArgs: [uintCV(50)],
    appDetails: { name: 'Cappable Token', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callWithdrawFees() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'withdraw-fees',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'Cappable Token', icon: window.location.origin + '/logo.png' },
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
  renderButton('Set Max Supply', callSetMaxSupply);
  renderButton('Set Transfer Fee', callSetTransferFee);
  renderButton('Transfer', callTransfer);
  renderButton('Burn', callBurn);
  renderButton('Withdraw Fees', callWithdrawFees);
});
