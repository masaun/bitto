import { contractPrincipalCV, uintCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import * as dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ADDRESS = process.env.PRIVATE_PAYMENT_ROUTER_ADDRESS || '';
const CONTRACT_NAME = 'private-payment-router';

export const initializeRouter = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'initialize',
      functionArgs: [],
      appDetails: {
        name: 'Private Payment Router',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Router initialization failed:', error);
    throw error;
  }
};

export const enableRouting = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'enable-routing',
      functionArgs: [],
      appDetails: {
        name: 'Private Payment Router',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Enable routing failed:', error);
    throw error;
  }
};

export const disableRouting = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'disable-routing',
      functionArgs: [],
      appDetails: {
        name: 'Private Payment Router',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Disable routing failed:', error);
    throw error;
  }
};

export const routePayment = async (amount: number, destinationIndex: number) => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'route-payment',
      functionArgs: [uintCV(amount), uintCV(destinationIndex)],
      appDetails: {
        name: 'Private Payment Router',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Route payment failed:', error);
    throw error;
  }
};

export const getRoutingState = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-routing-state',
      functionArgs: [],
      appDetails: {
        name: 'Private Payment Router',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Get routing state failed:', error);
    throw error;
  }
};

export const getTotalRouted = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-routed',
      functionArgs: [],
      appDetails: {
        name: 'Private Payment Router',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Get total routed failed:', error);
    throw error;
  }
};

export const isRoutingEnabled = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'is-routing-enabled',
      functionArgs: [],
      appDetails: {
        name: 'Private Payment Router',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Is routing enabled check failed:', error);
    throw error;
  }
};

export const queryRouterStatus = async () => {
  try {
    await openContractCall({
      network: new StacksTestnet(),
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'query-router-status',
      functionArgs: [],
      appDetails: {
        name: 'Private Payment Router',
        icon: window.location.origin + '/logo.svg',
      },
    });
  } catch (error) {
    console.error('Query router status failed:', error);
    throw error;
  }
};
