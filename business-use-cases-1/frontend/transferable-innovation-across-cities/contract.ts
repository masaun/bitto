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

const contractAddress = process.env.NEXT_PUBLIC_TRANSFERABLE_INNOVATION_ACROSS_CITIES_CONTRACT?.split('.')[0] || '';
const contractName = process.env.NEXT_PUBLIC_TRANSFERABLE_INNOVATION_ACROSS_CITIES_CONTRACT?.split('.')[1] || 'transferable-innovation-across-cities';

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'Transferable Innovation Across Cities',
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

export const register_innovation = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'register-innovation',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const adopt_innovation = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'adopt-innovation',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const verify_innovation = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'verify-innovation',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const update_success_rate = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'update-success-rate',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};


export { userSession };
