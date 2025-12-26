import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, noneCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.REFUNDABLE_TOKEN_CONTRACT_ADDRESS as string;
const contractName = 'refundable-token';

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
    appDetails: { name: 'Refundable Token' },
    userSession,
    walletConnectProjectId: projectId
  });
}

function callGetName() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-name',
    functionArgs: [],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetSymbol() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-symbol',
    functionArgs: [],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetDecimals() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-decimals',
    functionArgs: [],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetBalance() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-balance',
    functionArgs: [standardPrincipalCV(address)],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetTotalSupply() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-total-supply',
    functionArgs: [],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callRefundOf() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'refund-of',
    functionArgs: [],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callRefundDeadlineOf() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'refund-deadline-of',
    functionArgs: [],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callTransfer() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: [uintCV(100), standardPrincipalCV(address), standardPrincipalCV(address), noneCV()],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callMint() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [uintCV(1000), standardPrincipalCV(address)],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callRefund() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'refund',
    functionArgs: [uintCV(100)],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callRefundFrom() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'refund-from',
    functionArgs: [standardPrincipalCV(address), uintCV(100)],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callSetRefundConfig() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'set-refund-config',
    functionArgs: [uintCV(50), uintCV(10000)],
    appDetails: { name: 'Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Get Name', callGetName);
  renderButton('Get Symbol', callGetSymbol);
  renderButton('Get Decimals', callGetDecimals);
  renderButton('Get Balance', callGetBalance);
  renderButton('Get Total Supply', callGetTotalSupply);
  renderButton('Refund Of', callRefundOf);
  renderButton('Refund Deadline Of', callRefundDeadlineOf);
  renderButton('Transfer', callTransfer);
  renderButton('Mint', callMint);
  renderButton('Refund', callRefund);
  renderButton('Refund From', callRefundFrom);
  renderButton('Set Refund Config', callSetRefundConfig);
});
