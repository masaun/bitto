/**
 * Batch Call Script for Royalty Bearing Non-Fungible Token Contract
 * 
 * This script performs:
 * 1. Calling the set-platform-fee-rate function 100 times as batch transactions (for just testing of batch call purposes)
 * 2. Fetching events using the @hirosystems/chainhooks-client library
 * 
 * Usage:
 *   npx ts-node scripts/batch-call/royalty-bearing-non-fungible-token_batch-call.ts
 */

import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  uintCV,
  PostConditionMode,
} from '@stacks/transactions';
import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';
import * as dotenv from 'dotenv';

// Network type definition
type NetworkType = 'mainnet' | 'testnet' | 'devnet';

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
  // Network configuration
  network: (process.env.STACKS_NETWORK || 'testnet') as NetworkType, // 'mainnet' | 'testnet' | 'devnet'
  
  // Contract details
  contractAddress: process.env.CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'royalty-bearing-non-fungible-token',
  functionName: 'set-platform-fee-rate',
  
  // Batch configuration
  batchSize: 100,
  delayBetweenCalls: 1000, // milliseconds between each call
  
  // Deployer credentials (from Devnet.toml for local testing)
  senderKey: process.env.SENDER_PRIVATE_KEY || '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601',
  
  // Chainhooks API configuration
  chainhooksApiKey: process.env.CHAINHOOKS_API_KEY || '',
  
  // Fee rate range for batch calls (0 to MAX_ROYALTY_RATE = 10000 basis points)
  minFeeRate: 100,  // 1%
  maxFeeRate: 1000, // 10%
};

// Get the network string for API calls
function getNetworkForBroadcast(): 'mainnet' | 'testnet' {
  // For devnet, we'll use testnet-like settings but with custom API
  return CONFIG.network === 'mainnet' ? 'mainnet' : 'testnet';
}

// Interface for batch call result
interface BatchCallResult {
  index: number;
  feeRate: number;
  txId: string | null;
  success: boolean;
  error?: string;
}

// Interface for event data
interface PlatformFeeEvent {
  event: string;
  feeRate: number;
  stacksBlockTime: number;
  txId: string;
  blockHeight: number;
}

/**
 * Generate fee rates for batch calls
 * Creates a sequence of fee rates within the valid range
 */
function generateFeeRates(count: number): number[] {
  const feeRates: number[] = [];
  const range = CONFIG.maxFeeRate - CONFIG.minFeeRate;
  
  for (let i = 0; i < count; i++) {
    // Cycle through fee rates within the range
    const feeRate = CONFIG.minFeeRate + (i % (range + 1));
    feeRates.push(feeRate);
  }
  
  return feeRates;
}

/**
 * Execute a single set-platform-fee-rate call
 */
async function callSetPlatformFeeRate(
  feeRate: number,
  nonce: bigint
): Promise<{ txId: string; success: boolean; error?: string }> {
  try {
    const network = getNetworkForBroadcast();
    
    const txOptions = {
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName: CONFIG.functionName,
      functionArgs: [uintCV(feeRate)],
      senderKey: CONFIG.senderKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce,
      fee: 1000n, // fee in microSTX
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
 * Execute batch calls to set-platform-fee-rate
 */
async function executeBatchCalls(): Promise<BatchCallResult[]> {
  console.log('\n=== Starting Batch Calls for set-platform-fee-rate ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract: ${CONFIG.contractAddress}.${CONFIG.contractName}`);
  console.log(`Total calls: ${CONFIG.batchSize}`);
  console.log('');

  const feeRates = generateFeeRates(CONFIG.batchSize);
  const results: BatchCallResult[] = [];
  let nonce = BigInt(0);

  // Get initial nonce (in production, fetch from chain)
  // For devnet, we start from 0 or fetch from node
  
  for (let i = 0; i < feeRates.length; i++) {
    const feeRate = feeRates[i];
    console.log(`[${i + 1}/${CONFIG.batchSize}] Calling set-platform-fee-rate(${feeRate})...`);

    const result = await callSetPlatformFeeRate(feeRate, nonce);
    
    results.push({
      index: i,
      feeRate,
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
    if (i < feeRates.length - 1) {
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
    failed.forEach(f => {
      console.log(`  - Index ${f.index}: fee-rate=${f.feeRate}, error=${f.error}`);
    });
  }

  if (successful.length > 0) {
    console.log('\nSuccessful Transaction IDs:');
    successful.slice(0, 10).forEach(s => {
      console.log(`  - ${s.txId}`);
    });
    if (successful.length > 10) {
      console.log(`  ... and ${successful.length - 10} more`);
    }
  }
}

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
 * Register a chainhook to monitor platform-fee-updated events
 */
async function registerPlatformFeeEventChainhook(client: ChainhooksClient): Promise<string | null> {
  console.log('\n=== Registering Chainhook for platform-fee-updated Events ===');

  const contractIdentifier = `${CONFIG.contractAddress}.${CONFIG.contractName}`;
  
  // Using the simplified definition structure for the chainhooks API
  const chainhookDefinition = {
    name: 'Platform Fee Rate Update Monitor',
    version: 1,
    chain: 'stacks' as const,
    network: CONFIG.network === 'mainnet' ? 'mainnet' as const : 'testnet' as const,
    filters: {
      events: [
        {
          principal: contractIdentifier,
          type: 'contract_call',
          method: CONFIG.functionName,
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
    console.log(`  Name: ${result.definition?.name || 'Platform Fee Rate Update Monitor'}`);
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
 * Check API status
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
 * Fetch events for a specific chainhook
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
 * Demo function to show event handling workflow
 */
async function demonstrateEventFetching(): Promise<void> {
  console.log('\n=== Demonstrating Event Fetching with Chainhooks Client ===');
  
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

  // Register a new chainhook for platform fee events
  const chainhookUuid = await registerPlatformFeeEventChainhook(client);
  
  if (chainhookUuid) {
    // Fetch details of the newly registered chainhook
    await fetchChainhookDetails(client, chainhookUuid);
    
    console.log('\n=== Event Monitoring Setup Complete ===');
    console.log('The chainhook is now registered and will send events to your webhook URL.');
    console.log('Events will be triggered when set-platform-fee-rate is called on the contract.');
    console.log('');
    console.log('Event payload structure (platform-fee-updated):');
    console.log(JSON.stringify({
      event: 'platform-fee-updated',
      'fee-rate': '<uint>',
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
  console.log('================================================');
  console.log('  Royalty Bearing NFT - Batch Call Script');
  console.log('  set-platform-fee-rate Function');
  console.log('================================================');

  const { mode, chainhookUuid } = parseArgs();

  try {
    switch (mode) {
      case 'batch':
        // Execute batch calls only
        const batchResults = await executeBatchCalls();
        printBatchSummary(batchResults);
        break;

      case 'events':
        // Demonstrate event fetching only
        await demonstrateEventFetching();
        break;

      case 'cleanup':
        // Cleanup chainhooks
        await cleanupChainhooks(chainhookUuid);
        break;

      case 'both':
      default:
        // Execute both batch calls and event fetching
        const results = await executeBatchCalls();
        printBatchSummary(results);
        await demonstrateEventFetching();
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
  callSetPlatformFeeRate,
  generateFeeRates,
  initChainhooksClient,
  registerPlatformFeeEventChainhook,
  fetchRegisteredChainhooks,
  fetchChainhookDetails,
  toggleChainhook,
  deleteChainhook,
  checkApiStatus,
  CONFIG,
};

// Export types
export type { BatchCallResult, PlatformFeeEvent };

// Run main function
main().catch(console.error);
