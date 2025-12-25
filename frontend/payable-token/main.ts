import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, bufferCV, noneCV, someCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.PAYABLE_TOKEN_CONTRACT_ADDRESS as string;
const contractName = 'payable-token';

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
    appDetails: { name: 'Payable Token' },
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
    appDetails: { name: 'Payable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callApprove() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'approve',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), uintCV(1)],
    appDetails: { name: 'Payable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callTransferFrom() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'transfer-from',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), uintCV(1)],
    appDetails: { name: 'Payable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callAllowance() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'allowance',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet)],
    appDetails: { name: 'Payable Token' },
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
    appDetails: { name: 'Payable Token' },
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
    appDetails: { name: 'Payable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callOnTransferReceived() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'on-transfer-received',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), uintCV(1), noneCV()],
    appDetails: { name: 'Payable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callOnApprovalReceived() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'on-approval-received',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), uintCV(1), noneCV()],
    appDetails: { name: 'Payable Token' },
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
    appDetails: { name: 'Payable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Transfer', callTransfer);
  renderButton('Approve', callApprove);
  renderButton('Transfer From', callTransferFrom);
  renderButton('Allowance', callAllowance);
  renderButton('Balance Of', callBalanceOf);
  renderButton('Total Supply', callTotalSupply);
  renderButton('On Transfer Received', callOnTransferReceived);
  renderButton('On Approval Received', callOnApprovalReceived);
  renderButton('Mint', callMint);
});
