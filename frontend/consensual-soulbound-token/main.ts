import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.CONSENSUAL_SOULBOUND_TOKEN_CONTRACT_ADDRESS as string;
const contractName = 'consensual-soulbound-token';

const appConfig = new AppConfig(['storeSession']);
const userSession = new UserSession({ appConfig });

function renderButton(text: string, onClick: () => void) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.onclick = onClick;
  document.getElementById('root')?.appendChild(btn);
}

function connectWallet() {
  showConnect({
    appDetails: { name: 'Consensual Soulbound Token' },
    userSession,
    walletConnectProjectId: projectId
  });
}

function callMint() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), uintCV(1)],
    appDetails: { name: 'Consensual Soulbound Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callBurn() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'burn',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'Consensual Soulbound Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callOwnerOf() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'owner-of',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'Consensual Soulbound Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callBalanceOf() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'balance-of',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet)],
    appDetails: { name: 'Consensual Soulbound Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Mint', callMint);
  renderButton('Burn', callBurn);
  renderButton('Owner Of', callOwnerOf);
  renderButton('Balance Of', callBalanceOf);
});
