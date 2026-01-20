import { showConnect, UserSession, AppConfig, openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, bufferCV, listCV } from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = import.meta.env.VITE_AC_REGISTRY_CONTRACT_ADDRESS as string;
const contractName = 'ac-registry';

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
      name: 'AC Registry',
      description: 'AC Registry Frontend',
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
      name: 'AC Registry',
      description: 'AC Registry Frontend',
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
    appDetails: { name: 'AC Registry', icon: window.location.origin + '/logo.png' },
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

function callRegisterContract() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'register-contract',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'AC Registry', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callUnregisterContract() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'unregister-contract',
    functionArgs: [standardPrincipalCV(`${contractAddress}.${contractName}`)],
    appDetails: { name: 'AC Registry', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callGrantRole() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'grant-role',
    functionArgs: [standardPrincipalCV(`${contractAddress}.${contractName}`), bufferCV(Buffer.from('admin')), standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'AC Registry', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callRevokeRole() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'revoke-role',
    functionArgs: [standardPrincipalCV(`${contractAddress}.${contractName}`), bufferCV(Buffer.from('admin')), standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'AC Registry', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callGrantRoles() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'grant-roles',
    functionArgs: [
      listCV([standardPrincipalCV(`${contractAddress}.${contractName}`)]),
      listCV([bufferCV(Buffer.from('admin'))]),
      listCV([standardPrincipalCV(getUserAddress())])
    ],
    appDetails: { name: 'AC Registry', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callRevokeRoles() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'revoke-roles',
    functionArgs: [
      listCV([standardPrincipalCV(`${contractAddress}.${contractName}`)]),
      listCV([bufferCV(Buffer.from('admin'))]),
      listCV([standardPrincipalCV(getUserAddress())])
    ],
    appDetails: { name: 'AC Registry', icon: window.location.origin + '/logo.png' },
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
  renderButton('Register Contract', callRegisterContract);
  renderButton('Unregister Contract', callUnregisterContract);
  renderButton('Grant Role', callGrantRole);
  renderButton('Revoke Role', callRevokeRole);
  renderButton('Grant Roles', callGrantRoles);
  renderButton('Revoke Roles', callRevokeRoles);
});
