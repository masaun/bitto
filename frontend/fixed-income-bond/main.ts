import { showConnect, UserSession, AppConfig, openContractCall, FinishedTxData } from '@stacks/connect';
import { stringAsciiCV, uintCV } from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.FIXED_INCOME_BOND_CONTRACT_ADDRESS as string;
const contractName = 'fixed-income-bond';

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
      name: 'Fixed Income Bond',
      description: 'Fixed Income Bond Frontend',
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
      name: 'Fixed Income Bond',
      description: 'Fixed Income Bond Frontend',
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
    appDetails: { name: 'Fixed Income Bond', icon: window.location.origin + '/logo.png' },
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

function callIssueBond() {
  const bondId = 'BOND' + Date.now().toString().slice(-8);
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'issue-bond',
    functionArgs: [stringAsciiCV(bondId), uintCV(1000), uintCV(50), uintCV(999999999999)],
    appDetails: { name: 'Fixed Income Bond', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callPurchaseBond() {
  const bondId = 'BOND00000001';
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'purchase-bond',
    functionArgs: [stringAsciiCV(bondId), uintCV(100)],
    appDetails: { name: 'Fixed Income Bond', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callRedeemBond() {
  const bondId = 'BOND00000001';
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'redeem-bond',
    functionArgs: [stringAsciiCV(bondId)],
    appDetails: { name: 'Fixed Income Bond', icon: window.location.origin + '/logo.png' },
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
  renderButton('Issue Bond', callIssueBond);
  renderButton('Purchase Bond', callPurchaseBond);
  renderButton('Redeem Bond', callRedeemBond);
});
