import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, stringAsciiCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.NFT_AUTHORIZATION_CONTRACT_ADDRESS as string;
const contractName = 'nft-authorization';

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
    appDetails: { name: 'NFT Authorization' },
    userSession,
    walletConnectProjectId: projectId
  });
}

function callGetLastTokenId() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-last-token-id',
    functionArgs: [],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetTokenUri() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-token-uri',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetOwner() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-owner',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetRights() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-rights',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetExpires() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-expires',
    functionArgs: [uintCV(1), standardPrincipalCV(address)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetUserRights() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-user-rights',
    functionArgs: [uintCV(1), standardPrincipalCV(address)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callCheckAuthorizationAvailability() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'check-authorization-availability',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'NFT Authorization' },
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
    functionArgs: [
      standardPrincipalCV(address),
      stringAsciiCV('https://example.com/token/1'),
      uintCV(1000)
    ],
    appDetails: { name: 'NFT Authorization' },
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
    functionArgs: [uintCV(1), standardPrincipalCV(address), standardPrincipalCV(address)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callAuthorizeUser() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'authorize-user',
    functionArgs: [uintCV(1), standardPrincipalCV(address), uintCV(100)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callAuthorizeUserWithRights() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'authorize-user-with-rights',
    functionArgs: [uintCV(1), standardPrincipalCV(address), uintCV(100), uintCV(500)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callTransferUserRights() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'transfer-user-rights',
    functionArgs: [uintCV(1), standardPrincipalCV(address), standardPrincipalCV(address)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callExtendDuration() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'extend-duration',
    functionArgs: [uintCV(1), standardPrincipalCV(address), uintCV(50)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callUpdateUserRights() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'update-user-rights',
    functionArgs: [uintCV(1), standardPrincipalCV(address), uintCV(800)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callUpdateUserLimit() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'update-user-limit',
    functionArgs: [uintCV(1), uintCV(10)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callUpdateResetAllowed() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'update-reset-allowed',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callResetUser() {
  const address = userSession.loadUserData().profile.stxAddress.mainnet;
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'reset-user',
    functionArgs: [uintCV(1), standardPrincipalCV(address)],
    appDetails: { name: 'NFT Authorization' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Get Last Token ID', callGetLastTokenId);
  renderButton('Get Token URI', callGetTokenUri);
  renderButton('Get Owner', callGetOwner);
  renderButton('Get Rights', callGetRights);
  renderButton('Get Expires', callGetExpires);
  renderButton('Get User Rights', callGetUserRights);
  renderButton('Check Authorization Availability', callCheckAuthorizationAvailability);
  renderButton('Mint', callMint);
  renderButton('Transfer', callTransfer);
  renderButton('Authorize User', callAuthorizeUser);
  renderButton('Authorize User With Rights', callAuthorizeUserWithRights);
  renderButton('Transfer User Rights', callTransferUserRights);
  renderButton('Extend Duration', callExtendDuration);
  renderButton('Update User Rights', callUpdateUserRights);
  renderButton('Update User Limit', callUpdateUserLimit);
  renderButton('Update Reset Allowed', callUpdateResetAllowed);
  renderButton('Reset User', callResetUser);
});
