/**
 * Batch Call Script for Swap Core Contract (Without Event Fetching)
 * 
 * This script performs:
 * - Calling the set-fee-to function 500 times as batch transactions
 * 
 * Note: This script does NOT use @hirosystems/chainhooks-client for event fetching.
 *       It focuses solely on executing the batch transaction calls.
 * 
 * The set-fee-to function signature:
 *   (define-public (set-fee-to (new-fee-to (optional principal)))
 * 
 * Supported Private Key Formats:
 * - Hex string (64 or 66 characters)
 * - Mnemonic phrase (12 or 24 words separated by spaces)
 * 
 * Usage:
 *   npx ts-node scripts/batch-call/with-no-event-fetching/swap-core/swap-core_batch-call_with-no-event-fetching.ts
 */

import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  someCV,
  noneCV,
  principalCV,
  PostConditionMode,
  getAddressFromPrivateKey,
} from '@stacks/transactions';

// Define ClarityValue type based on return type of someCV/noneCV
type ClarityValue = ReturnType<typeof someCV> | ReturnType<typeof noneCV>;
import * as dotenv from 'dotenv';

// Network type definition
type NetworkType = 'mainnet' | 'testnet' | 'devnet';

// Load environment variables
dotenv.config();

/**
 * Parse contract identifier from environment variable
 * Handles both formats:
 *   - Full identifier: "SP1V95DB4JK47QVPJBXCEN6MT35JK84CQ4CWS15DQ.swap-core"
 *   - Address only: "SP1V95DB4JK47QVPJBXCEN6MT35JK84CQ4CWS15DQ"
 */
function parseContractIdentifier(envValue: string | undefined, defaultContractName: string): { address: string; name: string } {
  const value = envValue || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  
  if (value.includes('.')) {
    // Full contract identifier format: "ADDRESS.CONTRACT_NAME"
    const [address, name] = value.split('.');
    return { address, name: name || defaultContractName };
  }
  
  // Address only format
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
 * Note: This requires @stacks/wallet-sdk to be installed
 */
async function derivePrivateKeyFromMnemonic(mnemonic: string, _network: NetworkType): Promise<string> {
  // Dynamically import @stacks/wallet-sdk to avoid requiring it if not using mnemonic
  try {
    // Use dynamic import with type assertion to handle optional dependency
    const walletSdk = await import('@stacks/wallet-sdk' as string) as {
      generateWallet: (opts: { secretKey: string; password: string }) => Promise<{
        accounts: Array<{ stxPrivateKey: string }>;
      }>;
    };
    
    const wallet = await walletSdk.generateWallet({
      secretKey: mnemonic,
      password: '',
    });
    
    // Get the first account's private key
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
  // Use 'mainnet' or 'testnet' string for the version
  const version = network === 'mainnet' ? 'mainnet' : 'testnet';
  return getAddressFromPrivateKey(privateKey, version);
}

/**
 * Normalize private key format (for hex keys)
 * Removes any whitespace and handles common format issues
 */
function normalizeHexPrivateKey(key: string): string {
  // Remove any whitespace, quotes, or newlines
  let normalized = key.trim().replace(/[\s'"]/g, '');
  
  // Remove 0x prefix if present
  if (normalized.startsWith('0x') || normalized.startsWith('0X')) {
    normalized = normalized.slice(2);
  }
  
  return normalized;
}

// Parse contract details
const contractDetails = parseContractIdentifier(
  process.env.SWAP_CORE_CONTRACT_ADDRESS,
  'swap-core'
);

// Raw key from environment (could be hex or mnemonic)
const RAW_KEY = process.env.SENDER_PRIVATE_KEY || '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';

// Configuration (senderKey will be resolved at runtime if mnemonic)
const CONFIG = {
  // Network configuration
  network: (process.env.STACKS_NETWORK || 'testnet') as NetworkType, // 'mainnet' | 'testnet' | 'devnet'
  
  // Contract details (parsed from CONTRACT_ADDRESS or defaults)
  contractAddress: contractDetails.address,
  contractName: contractDetails.name,
  functionName: 'set-fee-to',
  
  // @dev - Batch configuration: 500 calls as per requirement
  batchSize: 500,
  delayBetweenCalls: 1000, // milliseconds between each call
  
  // Deployer credentials - will be set at runtime
  senderKey: '',
  
  // Fee-to addresses to cycle through (optional principals)
  // We'll alternate between some, none, and different addresses
  feeToAddresses: [
    // Use sender's address and none
    'sender', // Will be replaced with actual sender address
    'none',   // Will use noneCV()
  ],
};

/**
 * Initialize the sender key from environment variable
 * Handles both hex private keys and mnemonic phrases
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
        error: `Failed to derive key from mnemonic: ${error instanceof Error ? error.message : error}` 
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
        error: `Invalid hex private key: ${error instanceof Error ? error.message : error}` 
      };
    }
  } else {
    return {
      success: false,
      error: `Unrecognized key format (${rawKey.length} characters). Expected:\n` +
             `  - Hex private key: 64 or 66 hex characters\n` +
             `  - Mnemonic phrase: 12 or 24 words separated by spaces`
    };
  }
}

// Get the network string for API calls
function getNetworkForBroadcast(): 'mainnet' | 'testnet' {
  // For devnet, we'll use testnet-like settings but with custom API
  return CONFIG.network === 'mainnet' ? 'mainnet' : 'testnet';
}

// Interface for batch call result
interface BatchCallResult {
  index: number;
  feeToValue: string;
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
    
    // Use possible_next_nonce which accounts for pending transactions
    return BigInt(data.possible_next_nonce);
  } catch (error) {
    console.warn(`  Warning: Failed to fetch nonce from API: ${error instanceof Error ? error.message : error}`);
    console.warn('  Using nonce 0 as fallback...');
    return BigInt(0);
  }
}

/**
 * Generate fee-to values for batch calls
 * Alternates between sender address and none
 */
function generateFeeToValues(count: number, senderAddress: string): Array<{ value: ClarityValue; display: string }> {
  const values: Array<{ value: ClarityValue; display: string }> = [];
  
  for (let i = 0; i < count; i++) {
    // Alternate between some(sender) and none
    if (i % 2 === 0) {
      values.push({
        value: someCV(principalCV(senderAddress)),
        display: `some(${senderAddress})`,
      });
    } else {
      values.push({
        value: noneCV(),
        display: 'none',
      });
    }
  }
  
  return values;
}

/**
 * Execute a single set-fee-to call
 */
async function callSetFeeTo(
  feeToValue: ClarityValue,
  nonce: bigint
): Promise<{ txId: string; success: boolean; error?: string }> {
  try {
    const network = getNetworkForBroadcast();
    
    const txOptions = {
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName: CONFIG.functionName,
      functionArgs: [feeToValue],
      senderKey: CONFIG.senderKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce,
      fee: CONFIG.network === 'mainnet' ? 10000n : 1000n, // fee in microSTX (higher for mainnet)
    };

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
 * Execute batch calls to set-fee-to
 */
async function executeBatchCalls(): Promise<BatchCallResult[]> {
  console.log('\n=== Starting Batch Calls for set-fee-to ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract: ${CONFIG.contractAddress}.${CONFIG.contractName}`);
  console.log(`Total calls: ${CONFIG.batchSize}`);
  console.log('');

  // Get sender address
  const senderAddress = getAddressFromKey(CONFIG.senderKey, CONFIG.network);
  
  // Generate fee-to values
  const feeToValues = generateFeeToValues(CONFIG.batchSize, senderAddress);
  const results: BatchCallResult[] = [];
  
  // Fetch current nonce from the Stacks API
  console.log(`Fetching nonce for ${senderAddress}...`);
  let nonce = await fetchAccountNonce(senderAddress);
  console.log(`Starting nonce: ${nonce}`);
  console.log('');
  
  for (let i = 0; i < feeToValues.length; i++) {
    const { value, display } = feeToValues[i];
    console.log(`[${i + 1}/${CONFIG.batchSize}] Calling set-fee-to(${display})...`);

    const result = await callSetFeeTo(value, nonce);
    
    results.push({
      index: i,
      feeToValue: display,
      txId: result.txId || null,
      success: result.success,
      error: result.error,
    });

    if (result.success) {
      console.log(`  ✓ Success - TxID: ${result.txId}`);
      nonce++; // Increment nonce for next transaction
    } else {
      console.log(`  ✗ Failed - Error: ${result.error}`);
      // Don't increment nonce on failure
    }

    // Add delay between calls to avoid rate limiting
    if (i < feeToValues.length - 1) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenCalls));
    }
  }

  return results;
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
  
  if (failed.length > 0) {
    console.log('\nFailed calls:');
    failed.slice(0, 20).forEach(f => {
      console.log(`  - Index ${f.index}: fee-to=${f.feeToValue}, error=${f.error}`);
    });
    if (failed.length > 20) {
      console.log(`  ... and ${failed.length - 20} more failed calls`);
    }
  }

  if (successful.length > 0) {
    console.log('\nSuccessful Transaction IDs (first 10):');
    successful.slice(0, 10).forEach(s => {
      console.log(`  - ${s.txId}`);
    });
    if (successful.length > 10) {
      console.log(`  ... and ${successful.length - 10} more`);
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('==========================================================');
  console.log('  Swap Core - Batch Call Script');
  console.log('  set-fee-to Function (Without Event Fetching)');
  console.log('==========================================================');

  // Display configuration
  console.log('\n=== Configuration ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract Address: ${CONFIG.contractAddress}`);
  console.log(`Contract Name: ${CONFIG.contractName}`);
  console.log(`Function: ${CONFIG.functionName}`);
  console.log(`Batch Size: ${CONFIG.batchSize}`);
  
  // Initialize sender key (handles both hex and mnemonic)
  console.log('\n=== Initializing Sender Key ===');
  const keyInit = await initializeSenderKey();
  
  if (!keyInit.success) {
    console.error(`\n✗ Key Initialization Failed: ${keyInit.error}`);
    process.exit(1);
  }
  
  console.log(`✓ Sender Address: ${keyInit.address}`);
  console.log(`  Private Key Length: ${CONFIG.senderKey.length} characters`);

  try {
    // Execute batch calls
    const results = await executeBatchCalls();
    printBatchSummary(results);

    console.log('\n=== Script Completed ===');
  } catch (error) {
    console.error('\nScript failed with error:', error);
    process.exit(1);
  }
}

// Export functions for testing and external use
export {
  executeBatchCalls,
  callSetFeeTo,
  generateFeeToValues,
  initializeSenderKey,
  CONFIG,
};

// Export types
export type { BatchCallResult };

// Run main function
main().catch(console.error);
