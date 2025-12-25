import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, bufferCV, noneCV, someCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.HYPERLINK_NFT_CONTRACT_ADDRESS as string;
const contractName = 'hyperlink-nft';

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
    appDetails: { name: 'Hyperlink NFT' },
    userSession,
    walletConnectProjectId: projectId
  });
}

function callMint() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [standardPrincipalCV(userSession.loadUserData().profile.stxAddress.mainnet), uintCV(1), noneCV()],
    appDetails: { name: 'Hyperlink NFT' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callSetHyperlink() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'set-hyperlink',
    functionArgs: [uintCV(1), bufferCV(Buffer.alloc(32))],
    appDetails: { name: 'Hyperlink NFT' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetHyperlink() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-hyperlink',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'Hyperlink NFT' },
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
    appDetails: { name: 'Hyperlink NFT' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Mint', callMint);
  renderButton('Set Hyperlink', callSetHyperlink);
  renderButton('Get Hyperlink', callGetHyperlink);
  renderButton('Owner Of', callOwnerOf);
});
