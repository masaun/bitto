import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { bufferCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.NATIVE_META_TX_CONTRACT_ADDRESS as string;
const contractName = 'native-meta-tx';

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
    appDetails: { name: 'Native Meta TX' },
    userSession,
    walletConnectProjectId: projectId
  });
}

function callExecuteMetaTx() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'execute-meta-tx',
    functionArgs: [bufferCV(Buffer.alloc(32)), bufferCV(Buffer.alloc(64)), bufferCV(Buffer.alloc(33))],
    appDetails: { name: 'Native Meta TX' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Execute Meta TX', callExecuteMetaTx);
});
