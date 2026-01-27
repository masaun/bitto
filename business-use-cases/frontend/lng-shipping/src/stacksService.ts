import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import {
  makeContractCall,
  PostConditionMode,
  AnchorMode,
  stringUtf8CV,
  uintCV,
  principalCV,
  bufferCV,
  FungibleConditionCode,
  createAssetInfo,
  makeStandardFungiblePostCondition,
  broadcastTransaction,
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const appDetails = {
  name: 'On-Chain ETF',
  icon: window.location.origin + '/logo.svg',
};

const contractAddress = import.meta.env.LNG_SHIPPING_CONTRACT_ADDRESS?.split('.')[0] || 'SP1V95DB4JK47QVPJBXCEN6MT35JK84CQ4CWS15DQ';
const contractName = import.meta.env.LNG_SHIPPING_CONTRACT_ADDRESS?.split('.')[1] || 'lng-shipping';
const network = new StacksMainnet();

export const authenticate = () => {
  showConnect({
    appDetails,
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

export const createETF = async (name: string, symbol: string, assetIds: string[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-etf',
    functionArgs: [
      stringUtf8CV(name),
      stringUtf8CV(symbol),
      bufferCV(Buffer.from(assetIds.join(','))),
    ],
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      console.log('Explorer:', `https://explorer.hiro.so/txid/${data.txId}?chain=mainnet`);
    },
  };

  await makeContractCall(txOptions);
};

export const purchaseShares = async (etfId: number, amount: number, stxAmount: number) => {
  const postConditions = [
    makeStandardFungiblePostCondition(
      userSession.loadUserData().profile.stxAddress.mainnet,
      FungibleConditionCode.LessEqual,
      uintCV(stxAmount).value,
      createAssetInfo(contractAddress, contractName, 'stx')
    ),
  ];

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'purchase-shares',
    functionArgs: [uintCV(etfId), uintCV(amount)],
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      console.log('Explorer:', `https://explorer.hiro.so/txid/${data.txId}?chain=mainnet`);
    },
  };

  await makeContractCall(txOptions);
};

export const redeemShares = async (etfId: number, amount: number) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'redeem-shares',
    functionArgs: [uintCV(etfId), uintCV(amount)],
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      console.log('Explorer:', `https://explorer.hiro.so/txid/${data.txId}?chain=mainnet`);
    },
  };

  await makeContractCall(txOptions);
};

export const rebalanceETF = async (etfId: number, newAssetIds: string[]) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'rebalance-etf',
    functionArgs: [
      uintCV(etfId),
      bufferCV(Buffer.from(newAssetIds.join(','))),
    ],
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      console.log('Explorer:', `https://explorer.hiro.so/txid/${data.txId}?chain=mainnet`);
    },
  };

  await makeContractCall(txOptions);
};

export const updateETFMetadata = async (etfId: number, name: string, symbol: string) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'update-etf-metadata',
    functionArgs: [
      uintCV(etfId),
      stringUtf8CV(name),
      stringUtf8CV(symbol),
    ],
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      console.log('Explorer:', `https://explorer.hiro.so/txid/${data.txId}?chain=mainnet`);
    },
  };

  await makeContractCall(txOptions);
};

export const setManager = async (etfId: number, newManager: string) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'set-manager',
    functionArgs: [uintCV(etfId), principalCV(newManager)],
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      console.log('Explorer:', `https://explorer.hiro.so/txid/${data.txId}?chain=mainnet`);
    },
  };

  await makeContractCall(txOptions);
};
