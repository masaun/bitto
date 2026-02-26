import { StacksTestnet, StacksMainnet } from '@stacks/network';

export function getNetwork() {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
}

export function getContractAddress(contractName: string): string {
  const envKey = `NEXT_PUBLIC_${contractName.toUpperCase().replace(/-/g, '_')}_ADDRESS`;
  return process.env[envKey] || 'STX...';
}

export interface ContractFunction {
  name: string;
  description: string;
  functionName: string;
  args?: { name: string; type: string }[];
}

export interface ContractMetadata {
  name: string;
  category: string;
  description: string;
  functions: ContractFunction[];
}

export const CATEGORIES = [
  'auction',
  'treasury',
  'governance',
  'api',
  'automation',
  'compliance',
  'otc',
  'revenue'
];

export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    auction: '#FF6B6B',
    treasury: '#4ECDC4',
    governance: '#45B7D1',
    api: '#FFA07A',
    automation: '#98D8C8',
    compliance: '#F7DC6F',
    otc: '#BB8FCE',
    revenue: '#85C1E2'
  };
  return colors[category] || '#95A5A6';
}
