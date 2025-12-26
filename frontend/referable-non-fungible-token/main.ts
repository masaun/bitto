import { showConnect, UserSession, AppConfig } from '@stacks/connect';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import { standardPrincipalCV, uintCV, noneCV, listCV, stringAsciiCV, tupleCV } from '@stacks/transactions';

const projectId = process.env.WALLET_CONNECT_PROJECT_ID as string;
const contractAddress = process.env.REFERABLE_NON_FUNGIBLE_TOKEN_CONTRACT_ADDRESS as string;
const contractName = 'referable-non-fungible-token';

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
    appDetails: { name: 'Referable Non-Fungible Token' },
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
    appDetails: { name: 'Referable Non-Fungible Token' },
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
    appDetails: { name: 'Referable Non-Fungible Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callGetLastTokenId() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'get-last-token-id',
    functionArgs: [],
    appDetails: { name: 'Referable Non-Fungible Token' },
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
    appDetails: { name: 'Referable Non-Fungible Token' },
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
    appDetails: { name: 'Referable Non-Fungible Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callCreatedTimestampOf() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'created-timestamp-of',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'Referable Non-Fungible Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callReferringOf() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'referring-of',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'Referable Non-Fungible Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callReferredOf() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'referred-of',
    functionArgs: [uintCV(1)],
    appDetails: { name: 'Referable Non-Fungible Token' },
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
    functionArgs: [standardPrincipalCV(address), stringAsciiCV('https://example.com/token/1')],
    appDetails: { name: 'Referable Non-Fungible Token' },
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
    appDetails: { name: 'Referable Non-Fungible Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

function callSetNode() {
  openContractCall({
    contractAddress,
    contractName,
    functionName: 'set-node',
    functionArgs: [
      uintCV(2),
      tupleCV({
        'referring': listCV([uintCV(1)]),
        'referred': listCV([])
      })
    ],
    appDetails: { name: 'Referable Non-Fungible Token' },
    userSession,
    onFinish: (data: FinishedTxData) => {},
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderButton('Connect Wallet', connectWallet);
  renderButton('Get Name', callGetName);
  renderButton('Get Symbol', callGetSymbol);
  renderButton('Get Last Token ID', callGetLastTokenId);
  renderButton('Get Token URI', callGetTokenUri);
  renderButton('Get Owner', callGetOwner);
  renderButton('Created Timestamp Of', callCreatedTimestampOf);
  renderButton('Referring Of', callReferringOf);
  renderButton('Referred Of', callReferredOf);
  renderButton('Mint', callMint);
  renderButton('Transfer', callTransfer);
  renderButton('Set Node', callSetNode);
});
