import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  uintCV,
  principalCV,
  stringUtf8CV,
  stringAsciiCV,
  someCV,
  noneCV,
  bufferCV,
  listCV
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const contractAddress = process.env.NEXT_PUBLIC_KGST_STABLECOIN_CONTRACT?.split('.')[0] || '';
const contractName = process.env.NEXT_PUBLIC_KGST_STABLECOIN_CONTRACT?.split('.')[1] || 'kgst-stablecoin';

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'Kgst Stablecoin',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
};

export const disconnect = () => {
  userSession.signUserOut('/');
};

export const transfer = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const mint = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const burn = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'burn',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const freeze_account = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'freeze-account',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const unfreeze_account = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'unfreeze-account',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const add_minter = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'add-minter',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const remove_minter = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'remove-minter',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const set_token_uri = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'set-token-uri',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};


export { userSession };
