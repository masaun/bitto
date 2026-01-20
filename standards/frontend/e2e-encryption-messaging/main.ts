import { showConnect, UserSession, AppConfig, openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, bufferCV } from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.E2E_ENCRYPTION_MESSAGING_CONTRACT_ADDRESS as string;
const contractName = 'e2e-encryption-messaging';

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
      name: 'E2E Encryption Messaging',
      description: 'E2E Encryption Messaging Frontend',
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
      name: 'E2E Encryption Messaging',
      description: 'E2E Encryption Messaging Frontend',
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
    appDetails: { name: 'E2E Encryption Messaging', icon: window.location.origin + '/logo.png' },
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

function callUpdatePublicKey() {
  const sampleKey = new Uint8Array(33).fill(1);
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'update-public-key',
    functionArgs: [bufferCV(sampleKey)],
    appDetails: { name: 'E2E Encryption Messaging', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callSendMessage() {
  const sampleMessage = new Uint8Array(100).fill(1);
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'send-message',
    functionArgs: [standardPrincipalCV(getUserAddress()), bufferCV(sampleMessage)],
    appDetails: { name: 'E2E Encryption Messaging', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callVerifyMessageSignature() {
  const sampleMessage = new Uint8Array(100).fill(1);
  const sampleSignature = new Uint8Array(65).fill(1);
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'verify-message-signature',
    functionArgs: [uintCV(1), bufferCV(sampleMessage), bufferCV(sampleSignature)],
    appDetails: { name: 'E2E Encryption Messaging', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callDeleteMessage() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'delete-message',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'E2E Encryption Messaging', icon: window.location.origin + '/logo.png' },
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
  renderButton('Update Public Key', callUpdatePublicKey);
  renderButton('Send Message', callSendMessage);
  renderButton('Verify Message Signature', callVerifyMessageSignature);
  renderButton('Delete Message', callDeleteMessage);
});
