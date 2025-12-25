import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.SECURITY_TOKEN_CONTRACT_ADDRESS as string;
const contractName = 'security-token';

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
    appDetails: { name: 'Security Token' },
    userSession,
    walletConnectProjectId: projectId
  });
}

function callTransfer() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), uintCV(1)],
    appDetails: { name: 'Security Token' },
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
    appDetails: { name: 'Security Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callTotalSupply() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'total-supply',
    functionArgs: [],
    appDetails: { name: 'Security Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callMint() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), uintCV(1)],
    appDetails: { name: 'Security Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callBurn() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'burn',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), uintCV(1)],
    appDetails: { name: 'Security Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Transfer', callTransfer);
  renderButton('Balance Of', callBalanceOf);
  renderButton('Total Supply', callTotalSupply);
  renderButton('Mint', callMint);
  renderButton('Burn', callBurn);
});
