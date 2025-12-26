import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, contractPrincipalCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.ESCROW_REFUNDABLE_TOKEN_CONTRACT_ADDRESS as string;
const contractName = 'escrow-refundable-token';

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
    appDetails: { name: 'Escrow Refundable Token' },
    userSession,
    walletConnectProjectId: projectId
  });
}

function callGetEscrowState() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-escrow-state',
    functionArgs: [],
    appDetails: { name: 'Escrow Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetSellerBalance() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-seller-balance',
    functionArgs: [],
    appDetails: { name: 'Escrow Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetBuyerBalance() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-buyer-balance',
    functionArgs: [],
    appDetails: { name: 'Escrow Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callInitEscrow() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'init-escrow',
    functionArgs: [
      standardPrincipalCV(address),
      standardPrincipalCV(address),
      contractPrincipalCV(contractAddress, 'refundable-token'),
      uintCV(1000)
    ],
    appDetails: { name: 'Escrow Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callEscrowFund() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'escrow-fund',
    functionArgs: [uintCV(500)],
    appDetails: { name: 'Escrow Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callEscrowRefund() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'escrow-refund',
    functionArgs: [],
    appDetails: { name: 'Escrow Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callEscrowWithdraw() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'escrow-withdraw',
    functionArgs: [],
    appDetails: { name: 'Escrow Refundable Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Get Escrow State', callGetEscrowState);
  renderButton('Get Seller Balance', callGetSellerBalance);
  renderButton('Get Buyer Balance', callGetBuyerBalance);
  renderButton('Init Escrow', callInitEscrow);
  renderButton('Escrow Fund', callEscrowFund);
  renderButton('Escrow Refund', callEscrowRefund);
  renderButton('Escrow Withdraw', callEscrowWithdraw);
});
