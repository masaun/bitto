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

const contractAddress = process.env.NEXT_PUBLIC_CROSS_SECTOR_COORDINATION_CONTRACT?.split('.')[0] || '';
const contractName = process.env.NEXT_PUBLIC_CROSS_SECTOR_COORDINATION_CONTRACT?.split('.')[1] || 'cross-sector-coordination';

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'Cross Sector Coordination',
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

export const register_coordinator = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'register-coordinator',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const create_project = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-project',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const set_sector_contribution = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'set-sector-contribution',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const complete_sector_task = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'complete-sector-task',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const update_project_status = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'update-project-status',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};


export { userSession };
