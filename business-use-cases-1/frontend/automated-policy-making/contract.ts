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

const contractAddress = process.env.NEXT_PUBLIC_AUTOMATED_POLICY_MAKING_CONTRACT?.split('.')[0] || '';
const contractName = process.env.NEXT_PUBLIC_AUTOMATED_POLICY_MAKING_CONTRACT?.split('.')[1] || 'automated-policy-making';

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'Automated Policy Making',
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

export const create_policy = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-policy',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const set_policy_data = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'set-policy-data',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const execute_policy = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'execute-policy',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const add_operator = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'add-operator',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const remove_operator = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'remove-operator',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};


export { userSession };
