import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, bufferCV, uintCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.STEALTH_ADDRESS_GENERATOR_CONTRACT_ADDRESS as string;
const contractName = 'stealth-address-generator';

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
    appDetails: { name: 'Stealth Address Generator' },
    userSession,
    walletConnectProjectId: projectId
  });
}

function callGetStealthMetaAddress() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-stealth-meta-address',
    functionArgs: [standardPrincipalCV(address)],
    appDetails: { name: 'Stealth Address Generator' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetAnnouncement() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-announcement',
    functionArgs: [standardPrincipalCV(address), uintCV(0)],
    appDetails: { name: 'Stealth Address Generator' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callRegisterStealthMetaAddress() {
  const spendingPubKey = new Uint8Array(33);
  const viewingPubKey = new Uint8Array(33);
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'register-stealth-meta-address',
    functionArgs: [
      bufferCV(spendingPubKey),
      bufferCV(viewingPubKey)
    ],
    appDetails: { name: 'Stealth Address Generator' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callAnnounce() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  const ephemeralPubKey = new Uint8Array(33);
  const metadata = new Uint8Array(32);
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'announce',
    functionArgs: [
      standardPrincipalCV(address),
      bufferCV(ephemeralPubKey),
      bufferCV(metadata)
    ],
    appDetails: { name: 'Stealth Address Generator' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callCheckStealthAddress() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'check-stealth-address',
    functionArgs: [standardPrincipalCV(address)],
    appDetails: { name: 'Stealth Address Generator' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Get Stealth Meta Address', callGetStealthMetaAddress);
  renderButton('Get Announcement', callGetAnnouncement);
  renderButton('Register Stealth Meta Address', callRegisterStealthMetaAddress);
  renderButton('Announce', callAnnounce);
  renderButton('Check Stealth Address', callCheckStealthAddress);
});
