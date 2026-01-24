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

const contractAddress = process.env.NEXT_PUBLIC_OUTCOME_BASED_VENDOR_PAYMENT_CONTRACT?.split('.')[0] || '';
const contractName = process.env.NEXT_PUBLIC_OUTCOME_BASED_VENDOR_PAYMENT_CONTRACT?.split('.')[1] || 'outcome-based-vendor-payment';

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'Outcome Based Vendor Payment',
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

export const create_contract = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-contract',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const report_outcome = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'report-outcome',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const process_payment = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'process-payment',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};


export { userSession };
