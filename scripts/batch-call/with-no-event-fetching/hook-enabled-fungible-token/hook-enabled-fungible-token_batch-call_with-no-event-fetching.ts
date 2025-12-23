/**
 * Batch Call Script for Hook-Enabled Fungible Token Contract (Without Event Fetching)
 * 
 * This script performs:
 * 1. Calling all write (state-change) functions of the hook-enabled-fungible-token.clar 10 times as batch transactions
 * 2. Does NOT use Chainhooks for event fetching - focuses only on transaction execution
 * 
 * Write Functions in hook-enabled-fungible-token.clar:
 *   - authorize-operator (operator: principal)
 *   - revoke-operator (operator: principal)
 *   - register-tokens-to-send-hook (implementer: principal)
 *   - register-tokens-received-hook (implementer: principal)
 *   - unregister-tokens-to-send-hook ()
 *   - unregister-tokens-received-hook ()
 *   - send-tokens (to: principal, amount: uint, user-data: buff 256)
 *   - operator-send (from: principal, to: principal, amount: uint, user-data: buff 256, operator-data: buff 256)
 *   - mint (to: principal, amount: uint, operator-data: buff 256)
 *   - burn (amount: uint, user-data: buff 256)
 *   - operator-burn (from: principal, amount: uint, user-data: buff 256, operator-data: buff 256)
 *   - pause-contract ()
 *   - unpause-contract ()
 *   - set-asset-restrictions (restricted: bool)
 *   - transfer (to: principal, amount: uint, memo: optional buff 34)
 * 
 * Supported Private Key Formats:
 * - Hex string (64 or 66 characters)
 * - Mnemonic phrase (12 or 24 words separated by spaces)
 * 
 * Usage:
 *   npx ts-node scripts/batch-call/with-no-event-fetching/hook-enabled-fungible-token/hook-enabled-fungible-token_batch-call_with-no-event-fetching.ts
 * 
 * Options:
 *   --function <name>  Execute only a specific function (e.g., --function send-tokens)
 *   --dry-run          Print transaction details without broadcasting
 */

import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  getAddressFromPrivateKey,
  principalCV,
  uintCV,
  bufferCV,
  boolCV,
  someCV,
  noneCV,
} from '@stacks/transactions';
import * as dotenv from 'dotenv';

// Network type definition
type NetworkType = 'mainnet' | 'testnet' | 'devnet';

// Load environment variables
dotenv.config();

/**
 * Parse contract identifier from environment variable
 * Handles both formats:
 */
function parseContractIdentifier(envValue: string | undefined, defaultContractName: string): { address: string; name: string } {
  const value = envValue || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  
  if (value.includes('.')) {
    const [address, name] = value.split('.');
    return { address, name: name || defaultContractName };
  }
  
  return { address: value, name: defaultContractName };
}

/**
 * Check if the key is a mnemonic phrase
 */
function isMnemonicPhrase(key: string): boolean {
  const words = key.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
}

/**
 * Check if the key is a valid hex string
 */
function isHexPrivateKey(key: string): boolean {
  const hexRegex = /^[0-9a-fA-F]+$/;
  const normalized = key.replace(/^0x/i, '');
  return hexRegex.test(normalized) && (normalized.length === 64 || normalized.length === 66);
}

/**
 * Derive private key from mnemonic phrase
 */
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

/**
 * Get the Stacks address from a private key
 */
function getAddressFromKey(privateKey: string, network: NetworkType): string {
  const version = network === 'mainnet' ? 'mainnet' : 'testnet';
  return getAddressFromPrivateKey(privateKey, version);
}

/**
 * Normalize private key format (for hex keys)
 */
function normalizeHexPrivateKey(key: string): string {
  let normalized = key.trim().replace(/[\s'"]/g, '');
  
  if (normalized.startsWith('0x') || normalized.startsWith('0X')) {
    normalized = normalized.slice(2);
  }
  
  return normalized;
}

// Parse contract details
const contractDetails = parseContractIdentifier(
  process.env.HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
  'hook-enabled-fungible-token'
);

// Raw key from environment
const RAW_KEY = process.env.SENDER_PRIVATE_KEY || '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';

// Configuration
const CONFIG = {
  network: (process.env.STACKS_NETWORK || 'testnet') as NetworkType,
  contractAddress: contractDetails.address,
  contractName: contractDetails.name,
  
  // Batch configuration: 3 calls per function as per requirement
  batchSize: 3,
  delayBetweenCalls: 1000, // milliseconds between each call
  
  // Sender key - will be set at runtime
  senderKey: '',
  
  // Test addresses for function calls
  testRecipient: process.env.TEST_RECIPIENT || '',
};

// Function definitions for the contract
interface FunctionCall {
  name: string;
  args: () => any[];
  description: string;
  requiresOwner?: boolean;
}

/**
 * Get all write function definitions for the contract
 */
function getWriteFunctions(senderAddress: string, recipientAddress: string): FunctionCall[] {
  // Create buffer data for user-data and operator-data
  const emptyBuffer = bufferCV(Buffer.alloc(0));
  const sampleUserData = bufferCV(Buffer.from('batch-call-test', 'utf8'));
  const sampleOperatorData = bufferCV(Buffer.from('operator-batch-test', 'utf8'));
  
  return [
    {
      name: 'authorize-operator',
      args: () => [principalCV(recipientAddress)],
      description: 'Authorize an operator to manage tokens on behalf of the sender',
    },
    {
      name: 'revoke-operator',
      args: () => [principalCV(recipientAddress)],
      description: 'Revoke operator authorization',
    },
    {
      name: 'unregister-tokens-to-send-hook',
      args: () => [],
      description: 'Unregister the tokens-to-send hook',
    },
    {
      name: 'unregister-tokens-received-hook',
      args: () => [],
      description: 'Unregister the tokens-received hook',
    },
    {
      name: 'send-tokens',
      args: () => [
        principalCV(recipientAddress),
        uintCV(1), // amount: 1 token (smallest unit)
        sampleUserData,
      ],
      description: 'Send tokens with user data (ERC-777 style)',
    },
    {
      name: 'burn',
      args: () => [
        uintCV(1), // amount: 1 token
        sampleUserData,
      ],
      description: 'Burn tokens',
    },
    {
      name: 'transfer',
      args: () => [
        principalCV(recipientAddress),
        uintCV(1), // amount: 1 token
        someCV(bufferCV(Buffer.from('memo', 'utf8'))),
      ],
      description: 'ERC-20 compatible transfer',
    },
    // Owner-only functions
    {
      name: 'mint',
      args: () => [
        principalCV(recipientAddress),
        uintCV(1000000000000000000n), // 1 token with 18 decimals
        sampleOperatorData,
      ],
      description: 'Mint new tokens (owner only)',
      requiresOwner: true,
    },
    {
      name: 'pause-contract',
      args: () => [],
      description: 'Pause the contract (owner only)',
      requiresOwner: true,
    },
    {
      name: 'unpause-contract',
      args: () => [],
      description: 'Unpause the contract (owner only)',
      requiresOwner: true,
    },
    {
      name: 'set-asset-restrictions',
      args: () => [boolCV(false)],
      description: 'Set asset restrictions (owner only)',
      requiresOwner: true,
    },
  ];
}

// Interface for batch call result
interface BatchCallResult {
  functionName: string;
  index: number;
  txId: string | null;
  success: boolean;
  error?: string;
}

/**
 * Get the Stacks API base URL for the current network
 */
function getStacksApiUrl(): string {
  return CONFIG.network === 'mainnet'
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so';
}

/**
 * Fetch the current nonce for an address from the Stacks API
 */
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

/**
 * Get the network string for API calls
 */
function getNetworkForBroadcast(): 'mainnet' | 'testnet' {
  return CONFIG.network === 'mainnet' ? 'mainnet' : 'testnet';
}

/**
 * Execute a single contract call
 */
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
      return {
        txId: '',
        success: false,
        error: broadcastResponse.error || 'Unknown broadcast error',
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
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute batch calls for a specific function
 */
async function executeBatchCallsForFunction(
  func: FunctionCall,
  startNonce: bigint,
  dryRun: boolean = false
): Promise<{ results: BatchCallResult[]; endNonce: bigint }> {
  console.log(`\n--- ${func.name} ---`);
  console.log(`Description: ${func.description}`);
  if (func.requiresOwner) {
    console.log('⚠ Note: This function requires contract owner privileges');
  }

  const results: BatchCallResult[] = [];
  let nonce = startNonce;

  for (let i = 0; i < CONFIG.batchSize; i++) {
    const args = func.args();
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

    // Add delay between calls
    if (i < CONFIG.batchSize - 1) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenCalls));
    }
  }

  return { results, endNonce: nonce };
}

/**
 * Execute all batch calls
 */
async function executeAllBatchCalls(dryRun: boolean = false, specificFunction?: string): Promise<BatchCallResult[]> {
  console.log('\n=== Starting Batch Calls for hook-enabled-fungible-token ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract: ${CONFIG.contractAddress}.${CONFIG.contractName}`);
  console.log(`Batch Size: ${CONFIG.batchSize} calls per function`);
  if (dryRun) {
    console.log('Mode: DRY RUN (no transactions will be broadcast)');
  }
  console.log('');

  const senderAddress = getAddressFromKey(CONFIG.senderKey, CONFIG.network);
  const recipientAddress = CONFIG.testRecipient || senderAddress;

  console.log(`Sender Address: ${senderAddress}`);
  console.log(`Recipient Address: ${recipientAddress}`);

  // Get all write functions
  const allFunctions = getWriteFunctions(senderAddress, recipientAddress);
  
  // Filter to specific function if requested
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

  // Fetch initial nonce
  console.log(`\nFetching nonce for ${senderAddress}...`);
  let nonce = await fetchAccountNonce(senderAddress);
  console.log(`Starting nonce: ${nonce}`);

  const allResults: BatchCallResult[] = [];

  for (const func of functionsToCall) {
    const { results, endNonce } = await executeBatchCallsForFunction(func, nonce, dryRun);
    allResults.push(...results);
    nonce = endNonce;
  }

  return allResults;
}

/**
 * Print batch call summary
 */
function printBatchSummary(results: BatchCallResult[]): void {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n=== Batch Call Summary ===');
  console.log(`Total calls: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  // Group by function
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

/**
 * Initialize the sender key from environment variable
 */
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

/**
 * Parse command line arguments
 */
function parseArgs(): { dryRun: boolean; specificFunction?: string } {
  const args = process.argv.slice(2);
  
  const dryRun = args.includes('--dry-run');
  
  const functionIndex = args.indexOf('--function');
  const specificFunction = functionIndex !== -1 ? args[functionIndex + 1] : undefined;
  
  return { dryRun, specificFunction };
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('==========================================================');
  console.log('  Hook-Enabled Fungible Token - Batch Call Script');
  console.log('  (Without Event Fetching)');
  console.log('==========================================================');

  // Display configuration
  console.log('\n=== Configuration ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract Address: ${CONFIG.contractAddress}`);
  console.log(`Contract Name: ${CONFIG.contractName}`);
  console.log(`Batch Size: ${CONFIG.batchSize} calls per function`);

  // Initialize sender key
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

// Export functions for testing and external use
export {
  executeAllBatchCalls,
  executeContractCall,
  executeBatchCallsForFunction,
  initializeSenderKey,
  getWriteFunctions,
  CONFIG,
};

// Export types
export type { BatchCallResult, FunctionCall };

// Run main function
main().catch(console.error);
