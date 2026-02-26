import { authenticate } from '@stacks/connect';
import { AnchorMode, PostConditionMode, contractPrincipalCV, intCV, makeContractDeploy, makeContractCall, uintCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import * as dotenv from 'dotenv';

dotenv.config();

const NETWORK = new StacksTestnet();
const CONTRACT_ADDRESS = process.env.SEALED_BID_ESCROW_ADDRESS || '';
const CONTRACT_NAME = 'sealed-bid-escrow';

export const initializeAuction = async () => {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'initialize',
    functionArgs: [],
    senderKey: process.env.PRIVATE_KEY!,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
  });
  return tx;
};

export const depositBid = async (amount: number) => {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'deposit-bid',
    functionArgs: [uintCV(amount)],
    senderKey: process.env.PRIVATE_KEY!,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
  });
  return tx;
};

export const withdrawBid = async (amount: number) => {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'withdraw-bid',
    functionArgs: [uintCV(amount)],
    senderKey: process.env.PRIVATE_KEY!,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
  });
  return tx;
};

export const getEscrowBalance = async () => {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-escrow-balance',
    functionArgs: [],
    senderKey: process.env.PRIVATE_KEY!,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
  });
  return tx;
};

export const getBidCount = async () => {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-bid-count',
    functionArgs: [],
    senderKey: process.env.PRIVATE_KEY!,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
  });
  return tx;
};

export const settleAuction = async () => {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'settle-auction',
    functionArgs: [],
    senderKey: process.env.PRIVATE_KEY!,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
  });
  return tx;
};

export const queryAuctionState = async () => {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'query-auction-state',
    functionArgs: [],
    senderKey: process.env.PRIVATE_KEY!,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
  });
  return tx;
};