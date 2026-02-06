import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  getAddressFromPrivateKey,
  principalCV,
  uintCV,
  stringAsciiCV,
  bufferCV,
} from '@stacks/transactions';
import * as dotenv from 'dotenv';
import { Buffer } from 'buffer';

type NetworkType = 'mainnet' | 'testnet' | 'devnet';

dotenv.config();

function parseContractIdentifier(envValue: string | undefined, defaultContractName: string): { address: string; name: string } {
  const value = envValue || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  
  if (value.includes('.')) {
    const [address, name] = value.split('.');
    return { address, name: name || defaultContractName };
  }
  
  return { address: value, name: defaultContractName };
}

function isMnemonicPhrase(key: string): boolean {
  const words = key.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
}

function isHexPrivateKey(key: string): boolean {
  const hexRegex = /^[0-9a-fA-F]+$/;
  const normalized = key.replace(/^0x/i, '');
  return hexRegex.test(normalized) && (normalized.length === 64 || normalized.length === 66);
}

async function derivePrivateKeyFromMnemonic(mnemonic: string, _network: NetworkType): Promise<string> {
  try {
    const walletSdk = await import('@stacks/wallet-sdk' as string) as {
      generateWallet: (opts: { secretKey: string; password: string }) => Promise<{
        accounts: Array<{ stxPrivateKey: string }>;
      }>;
    };
    
    const wallet = await walletSdk.generateWallet({
      secretKey: mnemonic,
      password: '',
    });
    
    const account = wallet.accounts[0];
    return account.stxPrivateKey;
  } catch (error) {
    throw new Error(
      `Failed to import @stacks/wallet-sdk. Please install it: npm install @stacks/wallet-sdk\n` +
      `Original error: ${error instanceof Error ? error.message : error}`
    );
  }
}

function getAddressFromKey(privateKey: string, network: NetworkType): string {
  const version = network === 'mainnet' ? 'mainnet' : 'testnet';
  return getAddressFromPrivateKey(privateKey, version);
}

function normalizeHexPrivateKey(key: string): string {
  let normalized = key.trim().replace(/[\s'"]/g, '');
  
  if (normalized.startsWith('0x') || normalized.startsWith('0X')) {
    normalized = normalized.slice(2);
  }
  
  return normalized;
}

const contractDetails = parseContractIdentifier(
  process.env.DECENTRALIZED_TELECOM_NETWORK_V2_CONTRACT_ADDRESS,
  'decentralized-telecom-network-v2'
);

const RAW_KEY = process.env.SENDER_PRIVATE_KEY || '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';

const CONFIG = {
  network: (process.env.STACKS_NETWORK || 'testnet') as NetworkType,
  contractAddress: contractDetails.address,
  contractName: contractDetails.name,
  
  batchSize: 10,
  delayBetweenCalls: 1000,
  
  senderKey: '',
};

interface FunctionCall {
  name: string;
  args: (index: number, senderAddress: string) => any[];
  description: string;
}

function getWriteFunctions(senderAddress: string): FunctionCall[] {
  return [
    {
      name: 'create-provider',
      args: (index: number, sender: string) => [
        stringAsciiCV(`5G-Provider-${index + 1}`),  // service-type
        uintCV(1000000 + (index * 100000)),  // bandwidth
        uintCV(95 + index),  // quality
      ],
      description: 'Create telecom provider',
    },
    {
      name: 'add-infrastructure-node',
      args: (index: number, sender: string) => [
        uintCV(index + 1),  // provider-id
        stringAsciiCV(`Node-Type-${index + 1}`),  // node-type
        uintCV(50000 + (index * 5000)),  // bandwidth
        bufferCV(Buffer.from("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", "hex")),  // location
      ],
      description: 'Add infrastructure node',
    },
    {
      name: 'subscribe',
      args: (index: number, sender: string) => [
        uintCV(index + 1),  // provider-id
        stringAsciiCV(`Plan-${index + 1}`),  // plan
        uintCV(5000 + (index * 500)),  // fee
        uintCV(100000 + (index * 10000)),  // allowance
      ],
      description: 'Subscribe to provider',
    },
    {
      name: 'reward-node',
      args: (index: number, sender: string) => [
        uintCV(index + 1),  // provider-id
        uintCV(1),  // node-id
        uintCV(1000 + (index * 100)),  // reward
      ],
      description: 'Reward node',
    },
  ];
}

interface BatchCallResult {
  functionName: string;
  index: number;
  txId: string | null;
  success: boolean;
  error?: string;
}

function getStacksApiUrl(): string {
  const network = CONFIG.network;
  
  switch (network) {
    case 'mainnet':
      return 'https://api.hiro.so';
    case 'testnet':
      return 'https://api.testnet.hiro.so';
    case 'devnet':
      return 'http://localhost:3999';
    default:
      throw new Error(`Unknown network: ${network}`);
  }
}

async function fetchAccountNonce(address: string): Promise<number> {
  const apiUrl = getStacksApiUrl();
  const response = await fetch(`${apiUrl}/extended/v1/address/${address}/nonces`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch nonce: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.possible_next_nonce || 0;
}

async function broadcastAndWait(transaction: any): Promise<string> {
  const network = CONFIG.network;
  const apiUrl = getStacksApiUrl();
  
  try {
    const result = await broadcastTransaction({
      transaction,
      url: `${apiUrl}`,
    });
    
    if ('error' in result) {
      throw new Error(result.error || 'Unknown error during broadcast');
    }
    
    if ('reason' in result) {
      throw new Error(`transaction rejected - ${result.reason}`);
    }
    
    return result.txid;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
}

async function executeBatchCalls(): Promise<void> {
  console.log('==========================================================');
  console.log('  Decentralized Telecom Network V2 Contract - Batch Call Script');
  console.log('  (Without Event Fetching)');
  console.log('==========================================================\n');
  
  console.log('=== Configuration ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract Address: ${CONFIG.contractAddress}`);
  console.log(`Contract Name: ${CONFIG.contractName}`);
  console.log(`Batch Size: ${CONFIG.batchSize} calls per function`);
  console.log(`Environment Variable: DECENTRALIZED_TELECOM_NETWORK_V2_CONTRACT_ADDRESS\n`);
  
  console.log('=== Initializing Sender Key ===');
  
  let privateKey: string;
  
  if (isMnemonicPhrase(RAW_KEY)) {
    console.log('Detected mnemonic phrase, deriving private key...');
    privateKey = await derivePrivateKeyFromMnemonic(RAW_KEY, CONFIG.network);
    const derivedAddress = getAddressFromKey(privateKey, CONFIG.network);
    console.log(`  Derived address: ${derivedAddress}`);
  } else if (isHexPrivateKey(RAW_KEY)) {
    console.log('Detected hex private key format.');
    privateKey = normalizeHexPrivateKey(RAW_KEY);
  } else {
    throw new Error(
      'SENDER_PRIVATE_KEY must be either:\n' +
      '  - A 12 or 24 word mnemonic phrase, or\n' +
      '  - A 64-character hex private key (with or without 0x prefix)'
    );
  }
  
  CONFIG.senderKey = privateKey;
  
  const senderAddress = getAddressFromKey(privateKey, CONFIG.network);
  console.log(`✓ Sender Address: ${senderAddress}`);
  console.log(`  Private Key Length: ${privateKey.length} characters\n`);
  
  console.log('=== Starting Batch Calls for Decentralized Telecom Network V2 Contract ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract: ${CONFIG.contractAddress}.${CONFIG.contractName}`);
  console.log(`Batch Size: ${CONFIG.batchSize} calls per function\n`);
  console.log(`Sender Address: ${senderAddress}\n`);
  
  const writeFunctions = getWriteFunctions(senderAddress);
  console.log(`Functions to call: ${writeFunctions.map(f => f.name).join(', ')}`);
  console.log(`Total transactions: ${writeFunctions.length * CONFIG.batchSize}\n`);
  
  console.log(`Fetching nonce for ${senderAddress}...`);
  let currentNonce = await fetchAccountNonce(senderAddress);
  console.log(`Starting nonce: ${currentNonce}\n`);
  
  const results: BatchCallResult[] = [];
  
  for (const func of writeFunctions) {
    console.log(`--- ${func.name} ---`);
    console.log(`Description: ${func.description}`);
    
    for (let i = 0; i < CONFIG.batchSize; i++) {
      try {
        const args = func.args(i, senderAddress);
        
        const txOptions = {
          contractAddress: CONFIG.contractAddress,
          contractName: CONFIG.contractName,
          functionName: func.name,
          functionArgs: args,
          senderKey: CONFIG.senderKey,
          network: CONFIG.network,
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          nonce: currentNonce,
          fee: 50000,
        };
        
        const transaction = await makeContractCall(txOptions as any);
        
        console.log(`  [${i + 1}/${CONFIG.batchSize}] Calling ${func.name}...`);
        
        const txId = await broadcastAndWait(transaction);
        
        console.log(`    ✓ Success - TxID: ${txId}`);
        
        results.push({
          functionName: func.name,
          index: i,
          txId,
          success: true,
        });
        
        currentNonce++;
        
        if (i < CONFIG.batchSize - 1) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenCalls));
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`    ✗ Failed - Error: ${errorMessage}`);
        
        results.push({
          functionName: func.name,
          index: i,
          txId: null,
          success: false,
          error: errorMessage,
        });
        
        currentNonce++;
      }
    }
    
    console.log('');
  }
  
  console.log('=== Summary ===');
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  console.log(`Total Transactions: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  
  if (failureCount > 0) {
    console.log('\nFailed Transactions:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.functionName} [${r.index}]: ${r.error}`);
    });
  }
  
  console.log('\n=== Batch Call Complete ===');
}

executeBatchCalls().catch(error => {
  console.error('\n❌ Fatal Error:', error);
  process.exit(1);
});
