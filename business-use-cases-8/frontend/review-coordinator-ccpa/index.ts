import { uintCV, contractPrincipalCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import * as dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ADDRESS = process.env.REVIEW_COORDINATOR_CCPA_ADDRESS || '';
const CONTRACT_NAME = 'review-coordinator-ccpa';

export const initialize = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'initialize',
      functionArgs: [],
      appDetails: {
        name: 'review-coordinator-ccpa',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Initialize failed:', error);
    throw error;
  }
};

export const executeAction = async (amount: number) => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'place-bid',
      functionArgs: [uintCV(amount)],
      appDetails: {
        name: 'review-coordinator-ccpa',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Execute action failed:', error);
    throw error;
  }
};

export const processTransaction = async (txId: number) => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'settle-auction',
      functionArgs: [uintCV(txId)],
      appDetails: {
        name: 'review-coordinator-ccpa',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Process transaction failed:', error);
    throw error;
  }
};

export const getStatus = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-bid-count',
      functionArgs: [],
      appDetails: {
        name: 'review-coordinator-ccpa',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Get status failed:', error);
    throw error;
  }
};

export const queryData = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-volume',
      functionArgs: [],
      appDetails: {
        name: 'review-coordinator-ccpa',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Query data failed:', error);
    throw error;
  }
};

export const persistState = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'cancel-auction',
      functionArgs: [],
      appDetails: {
        name: 'review-coordinator-ccpa',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Persist state failed:', error);
    throw error;
  }
};

export const getFullState = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'query-auction-info',
      functionArgs: [],
      appDetails: {
        name: 'review-coordinator-ccpa',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Get full state failed:', error);
    throw error;
  }
};
