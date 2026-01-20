import { showConnect, UserSession, AppConfig, openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, stringAsciiCV, bufferCV } from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { Web3Wallet } from '@walletconnect/web3wallet';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.DID_VERIFICATION_CONTRACT_ADDRESS as string;
const contractName = 'did-verification';

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
      name: 'DID Verification',
      description: 'DID Verification Frontend',
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
      name: 'DID Verification',
      description: 'DID Verification Frontend',
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
    appDetails: { name: 'DID Verification', icon: window.location.origin + '/logo.png' },
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

function callAuthorizeVerifier() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'authorize-verifier',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'DID Verification', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callRevokeVerifier() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'revoke-verifier',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'DID Verification', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callCreateIdentity() {
  const samplePublicKey = new Uint8Array(33).fill(1);
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'create-identity',
    functionArgs: [stringAsciiCV('did:example:123'), bufferCV(samplePublicKey)],
    appDetails: { name: 'DID Verification', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callVerifyIdentity() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'verify-identity',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'DID Verification', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callUpdateIdentity() {
  const samplePublicKey = new Uint8Array(33).fill(2);
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'update-identity',
    functionArgs: [stringAsciiCV('did:example:456'), bufferCV(samplePublicKey)],
    appDetails: { name: 'DID Verification', icon: window.location.origin + '/logo.png' },
    userSession,
    onFinish: (data: FinishedTxData) => {
      console.log('Transaction:', data.txId);
    },
  });
}

function callRevokeIdentity() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'revoke-identity',
    functionArgs: [standardPrincipalCV(getUserAddress())],
    appDetails: { name: 'DID Verification', icon: window.location.origin + '/logo.png' },
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
  renderButton('Authorize Verifier', callAuthorizeVerifier);
  renderButton('Revoke Verifier', callRevokeVerifier);
  renderButton('Create Identity', callCreateIdentity);
  renderButton('Verify Identity', callVerifyIdentity);
  renderButton('Update Identity', callUpdateIdentity);
  renderButton('Revoke Identity', callRevokeIdentity);
});
