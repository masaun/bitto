import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  getAddressFromPrivateKey,
  principalCV,
  uintCV,
  stringAsciiCV,
} from '@stacks/transactions';
import * as dotenv from 'dotenv';

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
  process.env.MAIN_STREET_ACTIVITY_REWARDS_CONTRACT_ADDRESS,
  'main-street-activity-rewards'
);

const RAW_KEY = process.env.SENDER_PRIVATE_KEY || '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';

const CONFIG = {
  network: (process.env.STACKS_NETWORK || 'testnet') as NetworkType,
  contractAddress: contractDetails.address,
  contractName: contractDetails.name,
  
  batchSize: 10,
  delayBetweenCalls: 3000,
  delayBetweenBatches: 6000,
  
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
      name: 'register-participant',
      args: (index: number, sender: string) => [],
      description: 'Register participant',
    },
    {
      name: 'create-quest',
      args: (index: number, sender: string) => [
        stringAsciiCV(`Quest-${index + 1}`),
        uintCV(100 + (index * 10)),
        uintCV(1),
      ],
      description: 'Create quest',
    },
    {
      name: 'complete-quest',
      args: (index: number, sender: string) => [
        uintCV(index),
      ],
      description: 'Complete quest',
    },
    {
      name: 'claim-reward',
      args: (index: number, sender: string) => [
        uintCV(index),
      ],
      description: 'Claim reward',
    },
    {
      name: 'update-level',
      args: (index: number, sender: string) => [
        uintCV(index + 2),
      ],
      description: 'Update level',
    },
    {
      name: 'deactivate-participant',
      args: (index: number, sender: string) => [],
      description: 'Deactivate participant',
    },
    {
      name: 'toggle-quest',
      args: (index: number, sender: string) => [
        uintCV(index),
      ],
      description: 'Toggle quest',
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
  return CONFIG.network === 'mainnet'
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so';
}

async function fetchAccountNonce(address: string): Promise<bigint> {
  const apiUrl = getStacksApiUrl();
  const url = `${apiUrl}/extended/v1/address/${address}/nonces`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json() as {
      last_executed_tx_nonce: number | null;
      last_mempool_tx_nonce: number | null;
      possible_next_nonce: number;
      detected_missing_nonces: number[];
    };
    
    return BigInt(data.possible_next_nonce);
  } catch (error) {
    console.warn(`  Warning: Failed to fetch nonce from API: ${error instanceof Error ? error.message : error}`);
    console.warn('  Using nonce 0 as fallback...');
    return BigInt(0);
  }
}

function getNetworkForBroadcast(): 'mainnet' | 'testnet' {
  return CONFIG.network === 'mainnet' ? 'mainnet' : 'testnet';
}

async function executeContractCall(
  functionName: string,
  functionArgs: any[],
  nonce: bigint,
  dryRun: boolean = false
): Promise<{ txId: string; success: boolean; error?: string }> {
  try {
    const network = getNetworkForBroadcast();
    
    const txOptions = {
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName,
      functionArgs,
      senderKey: CONFIG.senderKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce,
      fee: CONFIG.network === 'mainnet' ? 10000n : 1000n,
    };

    if (dryRun) {
      console.log(`    [DRY RUN] Would call ${functionName} with args:`, functionArgs.map(a => a.type));
      return {
        txId: 'dry-run-no-tx',
        success: true,
      };
    }

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network });

    if ('error' in broadcastResponse) {
      const errorDetails = typeof broadcastResponse.error === 'string' 
        ? broadcastResponse.error 
        : JSON.stringify(broadcastResponse.error);
      const reason = (broadcastResponse as any).reason || '';
      const detailedError = reason ? `${errorDetails} - ${reason}` : errorDetails;
      
      return {
        txId: '',
        success: false,
        error: detailedError || 'Unknown broadcast error',
      };
    }

    return {
      txId: broadcastResponse.txid,
      success: true,
    };
  } catch (error) {
    return {
      txId: '',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function executeBatchCallsForFunction(
  func: FunctionCall,
  startNonce: bigint,
  dryRun: boolean = false,
  senderAddress: string
): Promise<{ results: BatchCallResult[]; endNonce: bigint }> {
  console.log(`\n--- ${func.name} ---`);
  console.log(`Description: ${func.description}`);

  const results: BatchCallResult[] = [];
  let nonce = startNonce;

  for (let i = 0; i < CONFIG.batchSize; i++) {
    const args = func.args(i, senderAddress);
    console.log(`  [${i + 1}/${CONFIG.batchSize}] Calling ${func.name}...`);

    const result = await executeContractCall(func.name, args, nonce, dryRun);

    results.push({
      functionName: func.name,
      index: i,
      txId: result.txId || null,
      success: result.success,
      error: result.error,
    });

    if (result.success) {
      console.log(`    ✓ Success${result.txId && result.txId !== 'dry-run-no-tx' ? ` - TxID: ${result.txId}` : ''}`);
      nonce++;
    } else {
      console.log(`    ✗ Failed - Error: ${result.error}`);
    }

    if (i < CONFIG.batchSize - 1) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenCalls));
    }
  }

  return { results, endNonce: nonce };
}

async function executeAllBatchCalls(dryRun: boolean = false, specificFunction?: string): Promise<BatchCallResult[]> {
  console.log('\n=== Starting Batch Calls for MainStreetActivityRewards Contract ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract: ${CONFIG.contractAddress}.${CONFIG.contractName}`);
  console.log(`Batch Size: ${CONFIG.batchSize} calls per function`);
  console.log(`Delay Between Batches: ${CONFIG.delayBetweenBatches / 1000} seconds`);
  if (dryRun) {
    console.log('Mode: DRY RUN (no transactions will be broadcast)');
  }
  console.log('');

  const senderAddress = getAddressFromKey(CONFIG.senderKey, CONFIG.network);

  console.log(`Sender Address: ${senderAddress}`);

  const allFunctions = getWriteFunctions(senderAddress);
  
  const functionsToCall = specificFunction 
    ? allFunctions.filter(f => f.name === specificFunction)
    : allFunctions;

  if (functionsToCall.length === 0) {
    console.error(`\n✗ Function '${specificFunction}' not found in contract.`);
    console.log('\nAvailable functions:');
    allFunctions.forEach(f => console.log(`  - ${f.name}`));
    process.exit(1);
  }

  console.log(`\nFunctions to call: ${functionsToCall.map(f => f.name).join(', ')}`);
  console.log(`Total transactions: ${functionsToCall.length * CONFIG.batchSize}`);

  console.log(`\nFetching nonce for ${senderAddress}...`);
  let nonce = await fetchAccountNonce(senderAddress);
  console.log(`Starting nonce: ${nonce}`);

  const allResults: BatchCallResult[] = [];

  for (let i = 0; i < functionsToCall.length; i++) {
    const func = functionsToCall[i];
    const { results, endNonce } = await executeBatchCallsForFunction(func, nonce, dryRun, senderAddress);
    allResults.push(...results);
    nonce = endNonce;
    
    if (i < functionsToCall.length - 1 && !dryRun) {
      console.log(`\n⏳ Waiting ${CONFIG.delayBetweenBatches / 1000} seconds for transactions to be mined before next batch...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
    }
  }

  return allResults;
}

function printBatchSummary(results: BatchCallResult[]): void {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n=== Batch Call Summary ===');
  console.log(`Total calls: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  const byFunction = results.reduce((acc, r) => {
    if (!acc[r.functionName]) {
      acc[r.functionName] = { success: 0, failed: 0 };
    }
    if (r.success) {
      acc[r.functionName].success++;
    } else {
      acc[r.functionName].failed++;
    }
    return acc;
  }, {} as Record<string, { success: number; failed: number }>);

  console.log('\nResults by function:');
  Object.entries(byFunction).forEach(([name, stats]) => {
    console.log(`  ${name}: ${stats.success} success, ${stats.failed} failed`);
  });

  if (failed.length > 0) {
    console.log('\nFailed calls (first 10):');
    failed.slice(0, 10).forEach(f => {
      console.log(`  - ${f.functionName}[${f.index}]: ${f.error}`);
    });
    if (failed.length > 10) {
      console.log(`  ... and ${failed.length - 10} more failed calls`);
    }
  }

  if (successful.length > 0 && successful[0].txId && successful[0].txId !== 'dry-run-no-tx') {
    console.log('\nSuccessful Transaction IDs (first 10):');
    successful.filter(s => s.txId).slice(0, 10).forEach(s => {
      console.log(`  - ${s.functionName}[${s.index}]: ${s.txId}`);
    });
    if (successful.length > 10) {
      console.log(`  ... and ${successful.length - 10} more`);
    }
  }
}

async function initializeSenderKey(): Promise<{ success: boolean; address?: string; error?: string }> {
  const rawKey = RAW_KEY.trim();

  if (isMnemonicPhrase(rawKey)) {
    console.log('Detected mnemonic phrase, deriving private key...');
    try {
      CONFIG.senderKey = await derivePrivateKeyFromMnemonic(rawKey, CONFIG.network);
      const address = getAddressFromKey(CONFIG.senderKey, CONFIG.network);
      console.log(`  Derived address: ${address}`);
      return { success: true, address };
    } catch (error) {
      return {
        success: false,
        error: `Failed to derive key from mnemonic: ${error instanceof Error ? error.message : error}`,
      };
    }
  } else if (isHexPrivateKey(rawKey)) {
    CONFIG.senderKey = normalizeHexPrivateKey(rawKey);
    try {
      const address = getAddressFromKey(CONFIG.senderKey, CONFIG.network);
      return { success: true, address };
    } catch (error) {
      return {
        success: false,
        error: `Invalid hex private key: ${error instanceof Error ? error.message : error}`,
      };
    }
  } else {
    return {
      success: false,
      error: `Unrecognized key format (${rawKey.length} characters). Expected:\n` +
        `  - Hex private key: 64 or 66 hex characters\n` +
        `  - Mnemonic phrase: 12 or 24 words separated by spaces`,
    };
  }
}

function parseArgs(): { dryRun: boolean; specificFunction?: string } {
  const args = process.argv.slice(2);
  
  const dryRun = args.includes('--dry-run');
  
  const functionIndex = args.indexOf('--function');
  const specificFunction = functionIndex !== -1 ? args[functionIndex + 1] : undefined;
  
  return { dryRun, specificFunction };
}

async function main(): Promise<void> {
  console.log('==========================================================');
  console.log('  MainStreetActivityRewards Contract - Batch Call Script');
  console.log('  (Without Event Fetching)');
  console.log('==========================================================');

  console.log('\n=== Configuration ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract Address: ${CONFIG.contractAddress}`);
  console.log(`Contract Name: ${CONFIG.contractName}`);
  console.log(`Batch Size: ${CONFIG.batchSize} calls per function`);
  console.log('Environment Variable: MAIN_STREET_ACTIVITY_REWARDS_CONTRACT_ADDRESS');

  if (!process.env.MAIN_STREET_ACTIVITY_REWARDS_CONTRACT_ADDRESS) {
    console.warn('\n⚠ Warning: MAIN_STREET_ACTIVITY_REWARDS_CONTRACT_ADDRESS not set in environment.');
    console.warn(`  Using default: ${CONFIG.contractAddress}.${CONFIG.contractName}`);
  }

  console.log('\n=== Initializing Sender Key ===');
  const keyInit = await initializeSenderKey();

  if (!keyInit.success) {
    console.error(`\n✗ Key Initialization Failed: ${keyInit.error}`);
    process.exit(1);
  }

  console.log(`✓ Sender Address: ${keyInit.address}`);
  console.log(`  Private Key Length: ${CONFIG.senderKey.length} characters`);

  const { dryRun, specificFunction } = parseArgs();

  try {
    const results = await executeAllBatchCalls(dryRun, specificFunction);
    printBatchSummary(results);

    console.log('\n=== Script Completed ===');
  } catch (error) {
    console.error('\nScript failed with error:', error);
    process.exit(1);
  }
}

export {
  executeAllBatchCalls,
  executeContractCall,
  executeBatchCallsForFunction,
  initializeSenderKey,
  getWriteFunctions,
  CONFIG,
};

export type { BatchCallResult, FunctionCall };

main().catch(console.error);
