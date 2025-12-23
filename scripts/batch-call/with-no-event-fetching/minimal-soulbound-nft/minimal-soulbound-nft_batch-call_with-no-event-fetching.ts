import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  getAddressFromPrivateKey,
  principalCV,
  uintCV,
  stringAsciiCV,
  stringUtf8CV,
  boolCV,
} from '@stacks/transactions';
import * as dotenv from 'dotenv';

type NetworkType = 'mainnet' | 'testnet' | 'devnet';

dotenv.config();

function parseContractIdentifier(envValue: string | undefined, defaultContractName: string): { address: string; name: string } {
  const value = envValue || '';
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
  process.env.MINIMAL_SOULBOUND_NFT_CONTRACT_ADDRESS,
  'minimal-soulbound-nft'
);

const RAW_KEY = process.env.SENDER_PRIVATE_KEY || '';

const CONFIG = {
  network: (process.env.STACKS_NETWORK || 'mainnet') as NetworkType,
  contractAddress: contractDetails.address,
  contractName: contractDetails.name,
  cycles: 3,
  delayBetweenCalls: 1000,
  senderKey: '',
};

interface FunctionCall {
  name: string;
  args: (cycle: number, senderAddress: string, tokenId: number) => any[];
}

function getWriteFunctions(): FunctionCall[] {
  return [
    {
      name: 'mint',
      args: (cycle: number, senderAddress: string, _tokenId: number) => [
        principalCV(senderAddress),
        stringUtf8CV(`https://api.bitto.io/sbt/${cycle}-${Date.now()}`),
      ],
    },
    {
      name: 'set-minter',
      args: (cycle: number, senderAddress: string, _tokenId: number) => [
        principalCV(senderAddress),
        boolCV(cycle % 2 === 0),
      ],
    },
    {
      name: 'set-base-uri',
      args: (cycle: number, _senderAddress: string, _tokenId: number) => [
        stringAsciiCV(`https://api.bitto.io/sbt/v${cycle + 1}/`),
      ],
    },
    {
      name: 'unlock',
      args: (_cycle: number, _senderAddress: string, tokenId: number) => [
        uintCV(tokenId),
      ],
    },
    {
      name: 'transfer',
      args: (_cycle: number, senderAddress: string, tokenId: number) => [
        uintCV(tokenId),
        principalCV(senderAddress),
        principalCV(senderAddress),
      ],
    },
    {
      name: 'lock',
      args: (_cycle: number, _senderAddress: string, tokenId: number) => [
        uintCV(tokenId),
      ],
    },
    {
      name: 'burn',
      args: (_cycle: number, _senderAddress: string, tokenId: number) => [
        uintCV(tokenId),
      ],
    },
  ];
}

interface BatchCallResult {
  functionName: string;
  cycle: number;
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
  nonce: bigint
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

async function executeCycle(
  cycle: number,
  startNonce: bigint,
  senderAddress: string
): Promise<{ results: BatchCallResult[]; endNonce: bigint }> {
  console.log(`\n=== Cycle ${cycle + 1}/${CONFIG.cycles} ===`);
  
  const results: BatchCallResult[] = [];
  let nonce = startNonce;
  const tokenId = cycle + 1;
  const functions = getWriteFunctions();

  for (const func of functions) {
    const args = func.args(cycle, senderAddress, tokenId);
    console.log(`  Calling ${func.name}...`);

    const result = await executeContractCall(func.name, args, nonce);

    results.push({
      functionName: func.name,
      cycle,
      txId: result.txId || null,
      success: result.success,
      error: result.error,
    });

    if (result.success) {
      console.log(`    ✓ Success - TxID: ${result.txId}`);
      nonce++;
    } else {
      console.log(`    ✗ Failed - Error: ${result.error}`);
    }

    await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenCalls));
  }

  return { results, endNonce: nonce };
}

async function executeAllCycles(): Promise<BatchCallResult[]> {
  console.log('\n=== Starting Batch Calls for Minimal Soulbound NFT Contract ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract: ${CONFIG.contractAddress}.${CONFIG.contractName}`);
  console.log(`Cycles: ${CONFIG.cycles}`);
  console.log('');

  const senderAddress = getAddressFromKey(CONFIG.senderKey, CONFIG.network);
  console.log(`Sender Address: ${senderAddress}`);

  console.log(`\nFetching nonce for ${senderAddress}...`);
  let nonce = await fetchAccountNonce(senderAddress);
  console.log(`Starting nonce: ${nonce}`);

  const allResults: BatchCallResult[] = [];

  for (let cycle = 0; cycle < CONFIG.cycles; cycle++) {
    const { results, endNonce } = await executeCycle(cycle, nonce, senderAddress);
    allResults.push(...results);
    nonce = endNonce;
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
    console.log('\nFailed calls:');
    failed.forEach(f => {
      console.log(`  - ${f.functionName}[cycle ${f.cycle + 1}]: ${f.error}`);
    });
  }

  if (successful.length > 0) {
    console.log('\nSuccessful Transaction IDs:');
    successful.forEach(s => {
      console.log(`  - ${s.functionName}[cycle ${s.cycle + 1}]: ${s.txId}`);
    });
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

async function main(): Promise<void> {
  console.log('==========================================================');
  console.log('  Minimal Soulbound NFT Contract - Batch Call Script');
  console.log('  (Without Event Fetching)');
  console.log('==========================================================');

  console.log('\n=== Configuration ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract Address: ${CONFIG.contractAddress}`);
  console.log(`Contract Name: ${CONFIG.contractName}`);
  console.log(`Cycles: ${CONFIG.cycles}`);
  console.log(`Environment Variable: MINIMAL_SOULBOUND_NFT_CONTRACT_ADDRESS`);

  if (!process.env.MINIMAL_SOULBOUND_NFT_CONTRACT_ADDRESS) {
    console.warn('\n⚠ Warning: MINIMAL_SOULBOUND_NFT_CONTRACT_ADDRESS not set in environment.');
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

  try {
    const results = await executeAllCycles();
    printBatchSummary(results);
    console.log('\n=== Script Completed ===');
  } catch (error) {
    console.error('\nScript failed with error:', error);
    process.exit(1);
  }
}

export {
  executeAllCycles,
  executeContractCall,
  executeCycle,
  initializeSenderKey,
  getWriteFunctions,
  CONFIG,
};

export type { BatchCallResult, FunctionCall };

main().catch(console.error);
