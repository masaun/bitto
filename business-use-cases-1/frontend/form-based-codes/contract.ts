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

const contractAddress = process.env.NEXT_PUBLIC_FORM_BASED_CODES_CONTRACT?.split('.')[0] || '';
const contractName = process.env.NEXT_PUBLIC_FORM_BASED_CODES_CONTRACT?.split('.')[1] || 'form-based-codes';

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'Form Based Codes',
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

export const create_form_code = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-form-code',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const submit_application = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'submit-application',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const review_application = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'review-application',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const update_code = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'update-code',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};


export { userSession };
