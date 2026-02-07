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

const contractAddress = process.env.NEXT_PUBLIC_CROSS_AGENCY_COORDINATION_CONTRACT?.split('.')[0] || '';
const contractName = process.env.NEXT_PUBLIC_CROSS_AGENCY_COORDINATION_CONTRACT?.split('.')[1] || 'cross-agency-coordination';

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'Cross Agency Coordination',
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

export const register_agency = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'register-agency',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const create_initiative = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-initiative',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const assign_task = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'assign-task',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const complete_task = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'complete-task',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const update_initiative_status = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'update-initiative-status',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};


export { userSession };
