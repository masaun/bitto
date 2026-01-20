/**
 * Batch Call Script for Swap Core Contract (With Event Fetching via Hiro Chainhooks)
 * 
 * This script performs:
 * 1. Calling the set-fee-to function 500 times as batch transactions
 * 2. Fetching events using the @hirosystems/chainhooks-client library
 * 
 * The set-fee-to function signature:
 *   (define-public (set-fee-to (new-fee-to (optional principal)))
 * 
 * Supported Private Key Formats:
 * - Hex string (64 or 66 characters)
 * - Mnemonic phrase (12 or 24 words separated by spaces)
 * 
 * Usage:
 *   npx ts-node scripts/batch-call/with-event-fetching/swap-core/swap-core_batch-call_with-event-fetching.ts
 * 
 * Options:
 *   --batch-only    Execute batch calls only (no event fetching)
 *   --events-only   Setup event fetching only (no batch calls)
 *   --cleanup       Delete all registered chainhooks
 *   --cleanup --uuid <uuid>  Delete a specific chainhook
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
import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';
import * as dotenv from 'dotenv';

// Define ClarityValue type based on return type of someCV/noneCV
type ClarityValue = ReturnType<typeof someCV> | ReturnType<typeof noneCV>;

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
  process.env.CONTRACT_ADDRESS,
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
  
  // Chainhooks API configuration
  chainhooksApiKey: process.env.CHAINHOOKS_API_KEY || '',
  
  // Fee-to addresses to cycle through (optional principals)
  // We'll alternate between some, none, and different addresses
  feeToAddresses: [
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

// Interface for event data
interface FeeToUpdatedEvent {
  event: string;
  newFeeTo: string | null;
  updatedBy: string;
  stacksBlockTime: number;
  txId: string;
  blockHeight: number;
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

// ============================================================================
// Chainhooks Event Fetching Functions
// ============================================================================

/**
 * Initialize and configure the Chainhooks client
 */
function initChainhooksClient(): ChainhooksClient | null {
  if (!CONFIG.chainhooksApiKey) {
    console.log('⚠ No Chainhooks API key provided. Skipping Chainhooks client initialization.');
    console.log('  Set CHAINHOOKS_API_KEY environment variable to enable event fetching.');
    return null;
  }

  const baseUrl = CONFIG.network === 'mainnet' 
    ? CHAINHOOKS_BASE_URL.mainnet 
    : CHAINHOOKS_BASE_URL.testnet;

  return new ChainhooksClient({
    baseUrl,
    apiKey: CONFIG.chainhooksApiKey,
  });
}

/**
 * Register a chainhook to monitor fee-to-updated events
 * This will receive events when set-fee-to is called
 */
async function registerFeeToEventChainhook(client: ChainhooksClient): Promise<string | null> {
  console.log('\n=== Registering Chainhook for fee-to-updated Events ===');

  const contractIdentifier = `${CONFIG.contractAddress}.${CONFIG.contractName}`;
  
  // Chainhook definition to monitor the set-fee-to function calls
  // and capture the emitted "fee-to-updated" events
  const chainhookDefinition = {
    name: 'Swap Core Fee-To Update Monitor',
    version: 1,
    chain: 'stacks' as const,
    network: CONFIG.network === 'mainnet' ? 'mainnet' as const : 'testnet' as const,
    filters: {
      // Filter for contract calls to set-fee-to
      events: [
        {
          principal: contractIdentifier,
          type: 'contract_call',
          method: CONFIG.functionName,
        },
      ],
      // Also filter for print events (where fee-to-updated is emitted)
      print_events: [
        {
          contract_identifier: contractIdentifier,
          contains: 'fee-to-updated',
        },
      ],
    },
    action: {
      type: 'http_post',
      url: process.env.WEBHOOK_URL || 'http://localhost:3000/webhook/chainhook',
      authorization_header: process.env.WEBHOOK_AUTH_HEADER || '',
    },
  };

  try {
    const result = await client.registerChainhook(chainhookDefinition as any);
    console.log(`✓ Chainhook registered successfully`);
    console.log(`  UUID: ${result.uuid}`);
    console.log(`  Name: ${result.definition?.name || 'Swap Core Fee-To Update Monitor'}`);
    console.log(`  Contract: ${contractIdentifier}`);
    console.log(`  Function: ${CONFIG.functionName}`);
    return result.uuid;
  } catch (error) {
    console.error('✗ Failed to register chainhook:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Fetch all registered chainhooks
 */
async function fetchRegisteredChainhooks(client: ChainhooksClient): Promise<void> {
  console.log('\n=== Fetching Registered Chainhooks ===');

  try {
    const response = await client.getChainhooks({ limit: 50, offset: 0 });
    
    console.log(`Total chainhooks: ${response.total}`);
    
    if (response.results && response.results.length > 0) {
      console.log('\nRegistered Chainhooks:');
      response.results.forEach((chainhook, index) => {
        console.log(`  ${index + 1}. UUID: ${chainhook.uuid}`);
        console.log(`     Name: ${chainhook.definition?.name || 'N/A'}`);
        console.log(`     Status: ${chainhook.status?.enabled ? 'Enabled' : 'Disabled'}`);
        console.log('');
      });
    } else {
      console.log('No chainhooks registered.');
    }
  } catch (error) {
    console.error('✗ Failed to fetch chainhooks:', error instanceof Error ? error.message : error);
  }
}

/**
 * Check Chainhooks API status
 */
async function checkApiStatus(client: ChainhooksClient): Promise<boolean> {
  console.log('\n=== Checking Chainhooks API Status ===');

  try {
    const status = await client.getStatus();
    console.log(`✓ API Status: ${status.status}`);
    console.log(`  Server Version: ${status.server_version}`);
    return status.status === 'ready';
  } catch (error) {
    console.error('✗ Failed to check API status:', error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Fetch details for a specific chainhook
 */
async function fetchChainhookDetails(client: ChainhooksClient, uuid: string): Promise<void> {
  console.log(`\n=== Fetching Chainhook Details (${uuid}) ===`);

  try {
    const chainhook = await client.getChainhook(uuid);
    
    console.log('Chainhook Details:');
    console.log(`  UUID: ${chainhook.uuid}`);
    console.log(`  Name: ${chainhook.definition?.name || 'N/A'}`);
    console.log(`  Chain: ${chainhook.definition?.chain || 'N/A'}`);
    console.log(`  Network: ${chainhook.definition?.network || 'N/A'}`);
    console.log(`  Enabled: ${chainhook.status?.enabled || false}`);
    
    if (chainhook.definition?.filters) {
      console.log('  Filters:', JSON.stringify(chainhook.definition.filters, null, 4));
    }
  } catch (error) {
    console.error('✗ Failed to fetch chainhook details:', error instanceof Error ? error.message : error);
  }
}

/**
 * Enable or disable a chainhook
 */
async function toggleChainhook(client: ChainhooksClient, uuid: string, enabled: boolean): Promise<void> {
  console.log(`\n=== ${enabled ? 'Enabling' : 'Disabling'} Chainhook (${uuid}) ===`);

  try {
    await client.enableChainhook(uuid, enabled);
    console.log(`✓ Chainhook ${enabled ? 'enabled' : 'disabled'} successfully`);
  } catch (error) {
    console.error(`✗ Failed to ${enabled ? 'enable' : 'disable'} chainhook:`, error instanceof Error ? error.message : error);
  }
}

/**
 * Delete a chainhook
 */
async function deleteChainhook(client: ChainhooksClient, uuid: string): Promise<void> {
  console.log(`\n=== Deleting Chainhook (${uuid}) ===`);

  try {
    await client.deleteChainhook(uuid);
    console.log('✓ Chainhook deleted successfully');
  } catch (error) {
    console.error('✗ Failed to delete chainhook:', error instanceof Error ? error.message : error);
  }
}

/**
 * Setup event fetching with Chainhooks
 * This registers a chainhook to monitor fee-to-updated events
 */
async function setupEventFetching(): Promise<void> {
  console.log('\n=== Setting Up Event Fetching with Chainhooks Client ===');
  
  const client = initChainhooksClient();
  
  if (!client) {
    console.log('\nTo enable Chainhooks integration:');
    console.log('1. Set CHAINHOOKS_API_KEY environment variable');
    console.log('2. Set WEBHOOK_URL for receiving events');
    console.log('3. Optionally set WEBHOOK_AUTH_HEADER for webhook authentication');
    return;
  }

  // Check API status
  const isReady = await checkApiStatus(client);
  if (!isReady) {
    console.log('⚠ API is not ready. Please try again later.');
    return;
  }

  // Fetch existing chainhooks
  await fetchRegisteredChainhooks(client);

  // Register a new chainhook for fee-to events
  const chainhookUuid = await registerFeeToEventChainhook(client);
  
  if (chainhookUuid) {
    // Fetch details of the newly registered chainhook
    await fetchChainhookDetails(client, chainhookUuid);
    
    console.log('\n=== Event Monitoring Setup Complete ===');
    console.log('The chainhook is now registered and will send events to your webhook URL.');
    console.log('Events will be triggered when set-fee-to is called on the contract.');
    console.log('');
    console.log('Expected event payload structure (fee-to-updated):');
    console.log(JSON.stringify({
      event: 'fee-to-updated',
      'new-fee-to': '<optional principal>',
      'updated-by': '<principal>',
      'stacks-block-time': '<uint>',
    }, null, 2));
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): { mode: 'batch' | 'events' | 'both' | 'cleanup', chainhookUuid?: string } {
  const args = process.argv.slice(2);
  
  if (args.includes('--events-only')) {
    return { mode: 'events' };
  }
  
  if (args.includes('--batch-only')) {
    return { mode: 'batch' };
  }
  
  if (args.includes('--cleanup')) {
    const uuidIndex = args.indexOf('--uuid');
    const uuid = uuidIndex !== -1 ? args[uuidIndex + 1] : undefined;
    return { mode: 'cleanup', chainhookUuid: uuid };
  }
  
  return { mode: 'both' };
}

/**
 * Cleanup function to delete registered chainhooks
 */
async function cleanupChainhooks(uuid?: string): Promise<void> {
  const client = initChainhooksClient();
  
  if (!client) {
    console.log('Cannot cleanup: No Chainhooks API key provided.');
    return;
  }

  if (uuid) {
    await deleteChainhook(client, uuid);
  } else {
    // Fetch and delete all chainhooks
    console.log('\n=== Cleanup: Deleting All Chainhooks ===');
    
    try {
      const response = await client.getChainhooks({ limit: 50, offset: 0 });
      
      if (response.results && response.results.length > 0) {
        for (const chainhook of response.results) {
          await deleteChainhook(client, chainhook.uuid);
        }
      } else {
        console.log('No chainhooks to delete.');
      }
    } catch (error) {
      console.error('Cleanup failed:', error instanceof Error ? error.message : error);
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('==========================================================');
  console.log('  Swap Core - Batch Call Script');
  console.log('  set-fee-to Function (With Event Fetching)');
  console.log('==========================================================');

  // Display configuration
  console.log('\n=== Configuration ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract Address: ${CONFIG.contractAddress}`);
  console.log(`Contract Name: ${CONFIG.contractName}`);
  console.log(`Function: ${CONFIG.functionName}`);
  console.log(`Batch Size: ${CONFIG.batchSize}`);
  console.log(`Chainhooks API Key: ${CONFIG.chainhooksApiKey ? '✓ Set' : '✗ Not set'}`);
  
  // Initialize sender key (handles both hex and mnemonic)
  console.log('\n=== Initializing Sender Key ===');
  const keyInit = await initializeSenderKey();
  
  if (!keyInit.success) {
    console.error(`\n✗ Key Initialization Failed: ${keyInit.error}`);
    process.exit(1);
  }
  
  console.log(`✓ Sender Address: ${keyInit.address}`);
  console.log(`  Private Key Length: ${CONFIG.senderKey.length} characters`);

  const { mode, chainhookUuid } = parseArgs();

  try {
    switch (mode) {
      case 'batch':
        // Execute batch calls only
        const batchResults = await executeBatchCalls();
        printBatchSummary(batchResults);
        break;

      case 'events':
        // Setup event fetching only
        await setupEventFetching();
        break;

      case 'cleanup':
        // Cleanup chainhooks
        await cleanupChainhooks(chainhookUuid);
        break;

      case 'both':
      default:
        // Execute both batch calls and event fetching setup
        // First setup event fetching so we can capture events from the batch calls
        await setupEventFetching();
        
        // Then execute batch calls
        const results = await executeBatchCalls();
        printBatchSummary(results);
        break;
    }

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
  initChainhooksClient,
  registerFeeToEventChainhook,
  fetchRegisteredChainhooks,
  fetchChainhookDetails,
  toggleChainhook,
  deleteChainhook,
  checkApiStatus,
  setupEventFetching,
  cleanupChainhooks,
  CONFIG,
};

// Export types
export type { BatchCallResult, FeeToUpdatedEvent };

// Run main function
main().catch(console.error);
