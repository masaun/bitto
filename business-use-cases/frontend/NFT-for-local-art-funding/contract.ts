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

const contractAddress = process.env.NEXT_PUBLIC_NFT_FOR_LOCAL_ART_FUNDING_CONTRACT?.split('.')[0] || '';
const contractName = process.env.NEXT_PUBLIC_NFT_FOR_LOCAL_ART_FUNDING_CONTRACT?.split('.')[1] || 'NFT-for-local-art-funding';

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'Nft For Local Art Funding',
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

export const mint_art = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'mint-art',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};

export const fund_art = async (...args: any[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'fund-art',
    functionArgs: [...args],
    senderKey: userSession.loadUserData().profile.stxAddress.mainnet,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
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


export { userSession };
