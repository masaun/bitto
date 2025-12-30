import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import {
  makeContractCall,
  stringAsciiCV,
  uintCV,
  standardPrincipalCV,
  AnchorMode,
  PostConditionMode,
  broadcastTransaction,
  callReadOnlyFunction,
  cvToJSON,
} from '@stacks/transactions';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let userAddress: string | null = null;
let currentNetwork: any;

const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const CONTRACT_ADDRESS = import.meta.env.VITE_SHARED_OWNERSHIP_NFT_CONTRACT_ADDRESS;
const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'testnet';

currentNetwork = NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

function parseContractAddress(address: string): { address: string; name: string } {
  if (address.includes('.')) {
    const [addr, name] = address.split('.');
    return { address: addr, name };
  }
  return { address, name: 'shared-ownership-nft' };
}

const contractInfo = parseContractAddress(CONTRACT_ADDRESS);

async function connectStacksWallet() {
  const onFinish = async (data: any) => {
    userAddress = data.userSession.loadUserData().profile.stxAddress[NETWORK];
    updateWalletInfo();
  };

  await showConnect({
    appDetails: {
      name: 'Shared Ownership NFT',
      icon: window.location.origin + '/logo.png',
    },
    onFinish,
    userSession,
  });
}

async function connectWalletKit() {
  try {
    const { Web3Wallet } = await import('@walletconnect/web3wallet');
    
    const web3wallet = await Web3Wallet.init({
      core: {
        projectId: WALLET_CONNECT_PROJECT_ID
      },
      metadata: {
        name: 'Shared Ownership NFT',
        description: 'Shared Ownership NFT DApp',
        url: window.location.origin,
        icons: []
      }
    });

    showStatus('walletInfo', 'WalletKit initialized', false);
  } catch (error) {
    showStatus('walletInfo', `WalletKit error: ${error}`, true);
  }
}

function connectAppKit() {
  const stacksAdapter = new StacksAdapter();

  const appKit = createAppKit({
    adapters: [stacksAdapter],
    networks: [currentNetwork],
    projectId: WALLET_CONNECT_PROJECT_ID,
    features: {
      analytics: false
    }
  });

  appKit.open();
}

function updateWalletInfo() {
  const walletInfo = document.getElementById('walletInfo');
  if (walletInfo && userAddress) {
    walletInfo.textContent = `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
  }
}

function showStatus(elementId: string, message: string, isError: boolean = false) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
    element.className = isError ? 'status error' : 'status';
  }
}

async function mintNFT() {
  const uri = (document.getElementById('mintUri') as HTMLInputElement).value;
  
  if (!userAddress) {
    showStatus('mintStatus', 'Please connect wallet first', true);
    return;
  }

  try {
    const txOptions = {
      contractAddress: contractInfo.address,
      contractName: contractInfo.name,
      functionName: 'mint',
      functionArgs: [stringAsciiCV(uri)],
      senderKey: '',
      network: currentNetwork,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, currentNetwork);
    showStatus('mintStatus', `Transaction: ${result.txid}`, false);
  } catch (error) {
    showStatus('mintStatus', `Error: ${error}`, true);
  }
}

async function transferNFT() {
  const tokenId = (document.getElementById('transferTokenId') as HTMLInputElement).value;
  const sender = (document.getElementById('transferSender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transferRecipient') as HTMLInputElement).value;

  if (!userAddress) {
    showStatus('transferStatus', 'Please connect wallet first', true);
    return;
  }

  try {
    const txOptions = {
      contractAddress: contractInfo.address,
      contractName: contractInfo.name,
      functionName: 'transfer',
      functionArgs: [
        uintCV(tokenId),
        standardPrincipalCV(sender),
        standardPrincipalCV(recipient)
      ],
      senderKey: '',
      network: currentNetwork,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, currentNetwork);
    showStatus('transferStatus', `Transaction: ${result.txid}`, false);
  } catch (error) {
    showStatus('transferStatus', `Error: ${error}`, true);
  }
}

async function archiveNFT() {
  const tokenId = (document.getElementById('archiveTokenId') as HTMLInputElement).value;

  if (!userAddress) {
    showStatus('archiveStatus', 'Please connect wallet first', true);
    return;
  }

  try {
    const txOptions = {
      contractAddress: contractInfo.address,
      contractName: contractInfo.name,
      functionName: 'archive',
      functionArgs: [uintCV(tokenId)],
      senderKey: '',
      network: currentNetwork,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, currentNetwork);
    showStatus('archiveStatus', `Transaction: ${result.txid}`, false);
  } catch (error) {
    showStatus('archiveStatus', `Error: ${error}`, true);
  }
}

async function setTransferValue() {
  const tokenId = (document.getElementById('setValueTokenId') as HTMLInputElement).value;
  const value = (document.getElementById('setValue') as HTMLInputElement).value;

  if (!userAddress) {
    showStatus('setValueStatus', 'Please connect wallet first', true);
    return;
  }

  try {
    const txOptions = {
      contractAddress: contractInfo.address,
      contractName: contractInfo.name,
      functionName: 'set-transfer-value',
      functionArgs: [uintCV(tokenId), uintCV(value)],
      senderKey: '',
      network: currentNetwork,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, currentNetwork);
    showStatus('setValueStatus', `Transaction: ${result.txid}`, false);
  } catch (error) {
    showStatus('setValueStatus', `Error: ${error}`, true);
  }
}

async function getLastTokenId() {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: contractInfo.address,
      contractName: contractInfo.name,
      functionName: 'get-last-token-id',
      functionArgs: [],
      network: currentNetwork,
      senderAddress: userAddress || contractInfo.address,
    });

    showStatus('lastTokenStatus', `Last Token ID: ${cvToJSON(result).value}`, false);
  } catch (error) {
    showStatus('lastTokenStatus', `Error: ${error}`, true);
  }
}

async function getOwner() {
  const tokenId = (document.getElementById('getOwnerTokenId') as HTMLInputElement).value;

  try {
    const result = await callReadOnlyFunction({
      contractAddress: contractInfo.address,
      contractName: contractInfo.name,
      functionName: 'get-owner',
      functionArgs: [uintCV(tokenId)],
      network: currentNetwork,
      senderAddress: userAddress || contractInfo.address,
    });

    showStatus('ownerStatus', `Owner: ${JSON.stringify(cvToJSON(result))}`, false);
  } catch (error) {
    showStatus('ownerStatus', `Error: ${error}`, true);
  }
}

async function getContractHash() {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: contractInfo.address,
      contractName: contractInfo.name,
      functionName: 'get-contract-hash',
      functionArgs: [],
      network: currentNetwork,
      senderAddress: userAddress || contractInfo.address,
    });

    showStatus('contractHashStatus', `Contract Hash: ${JSON.stringify(cvToJSON(result))}`, false);
  } catch (error) {
    showStatus('contractHashStatus', `Error: ${error}`, true);
  }
}

document.getElementById('connectStacks')?.addEventListener('click', connectStacksWallet);
document.getElementById('connectWalletKit')?.addEventListener('click', connectWalletKit);
document.getElementById('connectAppKit')?.addEventListener('click', connectAppKit);
document.getElementById('mintBtn')?.addEventListener('click', mintNFT);
document.getElementById('transferBtn')?.addEventListener('click', transferNFT);
document.getElementById('archiveBtn')?.addEventListener('click', archiveNFT);
document.getElementById('setValueBtn')?.addEventListener('click', setTransferValue);
document.getElementById('getLastTokenBtn')?.addEventListener('click', getLastTokenId);
document.getElementById('getOwnerBtn')?.addEventListener('click', getOwner);
document.getElementById('getContractHashBtn')?.addEventListener('click', getContractHash);

if (userSession.isUserSignedIn()) {
  userAddress = userSession.loadUserData().profile.stxAddress[NETWORK];
  updateWalletInfo();
}
