import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  getAddressFromPrivateKey,
  principalCV,
  stringAsciiCV,
  uintCV,
  noneCV,
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
  const walletSdk = await import('@stacks/wallet-sdk' as string) as {
    generateWallet: (opts: { secretKey: string; password: string }) => Promise<{
      accounts: Array<{ stxPrivateKey: string }>;
    }>;
  };
  const wallet = await walletSdk.generateWallet({ secretKey: mnemonic, password: '' });
  return wallet.accounts[0].stxPrivateKey;
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
  process.env.DIVERSIFIED_ROYALTY_NFT_CONTRACT_ADDRESS,
  'diversified-royalty-nft'
);

const RAW_KEY = process.env.SENDER_PRIVATE_KEY || '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';

const CONFIG = {
  network: (process.env.STACKS_NETWORK || 'testnet') as NetworkType,
  contractAddress: contractDetails.address,
  contractName: contractDetails.name,
  batchCycles: 10,
  delayBetweenCalls: 1000,
  senderKey: '',
  testRecipient: process.env.TEST_RECIPIENT || '',
};

interface FunctionCall {
  name: string;
  args: () => any[];
  description: string;
}

function getWriteFunctions(senderAddress: string, recipientAddress: string): FunctionCall[] {
  return [
    {
      name: 'mint',
      args: () => [principalCV(recipientAddress), stringAsciiCV('ipfs://test-uri')],
      description: 'Mint new diversified royalty NFT',
    },
    {
      name: 'transfer',
      args: () => [uintCV(1), principalCV(senderAddress), principalCV(recipientAddress)],
      description: 'Transfer NFT to new owner',
    },
    {
      name: 'list-item',
      args: () => [uintCV(1), uintCV(1000000), uintCV(999999999), noneCV()],
      description: 'List NFT for sale',
    },
    {
      name: 'delist-item',
      args: () => [uintCV(1)],
      description: 'Remove NFT from sale',
    },
    {
      name: 'buy-item',
      args: () => [uintCV(1), uintCV(1000000), noneCV()],
      description: 'Purchase listed NFT',
    },
    {
      name: 'set-royalty',
      args: () => [principalCV(recipientAddress), uintCV(250)],
      description: 'Set royalty recipient and percentage',
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
  return CONFIG.network === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';
}

async function fetchAccountNonce(address: string): Promise<bigint> {
  const url = `${getStacksApiUrl()}/extended/v1/address/${address}/nonces`;
  try {
    const response = await fetch(url);
    const data = await response.json() as { possible_next_nonce: number };
    return BigInt(data.possible_next_nonce);
  } catch {
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
      return { txId: '', success: false, error: broadcastResponse.error || 'Unknown broadcast error' };
    }
    return { txId: broadcastResponse.txid, success: true };
  } catch (error) {
    return { txId: '', success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function executeBatchCycles(): Promise<BatchCallResult[]> {
  console.log('\n=== Starting Batch Calls for diversified-royalty-nft ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract: ${CONFIG.contractAddress}.${CONFIG.contractName}`);
  console.log(`Cycles: ${CONFIG.batchCycles}`);

  const senderAddress = getAddressFromKey(CONFIG.senderKey, CONFIG.network);
  const recipientAddress = CONFIG.testRecipient || senderAddress;
  const functions = getWriteFunctions(senderAddress, recipientAddress);

  console.log(`Sender: ${senderAddress}`);
  console.log(`Functions: ${functions.length}`);
  console.log(`Total transactions: ${functions.length * CONFIG.batchCycles}`);

  let nonce = await fetchAccountNonce(senderAddress);
  console.log(`Starting nonce: ${nonce}`);

  const allResults: BatchCallResult[] = [];

  for (let cycle = 1; cycle <= CONFIG.batchCycles; cycle++) {
    console.log(`\n--- Cycle ${cycle}/${CONFIG.batchCycles} ---`);

    for (const func of functions) {
      console.log(`  Calling ${func.name}...`);
      const result = await executeContractCall(func.name, func.args(), nonce);

      allResults.push({
        functionName: func.name,
        cycle,
        txId: result.txId || null,
        success: result.success,
        error: result.error,
      });

      if (result.success) {
        console.log(`    ✓ TxID: ${result.txId}`);
        nonce++;
      } else {
        console.log(`    ✗ Error: ${result.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenCalls));
    }
  }

  return allResults;
}

function printSummary(results: BatchCallResult[]): void {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n=== Summary ===');
  console.log(`Total: ${results.length}, Success: ${successful.length}, Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed calls:');
    failed.slice(0, 10).forEach(f => console.log(`  - ${f.functionName} (cycle ${f.cycle}): ${f.error}`));
  }
}

async function initializeSenderKey(): Promise<boolean> {
  const rawKey = RAW_KEY.trim();

  if (isMnemonicPhrase(rawKey)) {
    CONFIG.senderKey = await derivePrivateKeyFromMnemonic(rawKey, CONFIG.network);
    return true;
  } else if (isHexPrivateKey(rawKey)) {
    CONFIG.senderKey = normalizeHexPrivateKey(rawKey);
    return true;
  }
  return false;
}

async function main(): Promise<void> {
  console.log('==========================================================');
  console.log('  Diversified Royalty NFT - Batch Call Script');
  console.log('==========================================================');

  if (!await initializeSenderKey()) {
    console.error('Failed to initialize sender key');
    process.exit(1);
  }

  console.log(`Sender: ${getAddressFromKey(CONFIG.senderKey, CONFIG.network)}`);

  const results = await executeBatchCycles();
  printSummary(results);

  console.log('\n=== Completed ===');
}

main().catch(console.error);
