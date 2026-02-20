import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  getAddressFromPrivateKey,
  uintCV,
} from '@stacks/transactions';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

type NetworkType = 'mainnet' | 'testnet' | 'devnet';

// Find the .env file by searching up the directory tree
function findEnvFile(): string | null {
  let currentDir = __dirname || process.cwd();
  
  for (let i = 0; i < 10; i++) {
    const envPath = path.join(currentDir, '.env');
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  
  return null;
}

const envPath = findEnvFile();
if (envPath) {
  console.log(`[dotenv@17.3.1] Loading env from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('[dotenv@17.3.1] No .env file found, using environment variables');
  dotenv.config();
}

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
  process.env.LOCAL_CITY_PROSPERITY_CONTRACT_ADDRESS,
  'local-city-prosperity'
);

const RAW_KEY = process.env.SENDER_PRIVATE_KEY || '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';

const CONFIG = {
  network: (process.env.STACKS_NETWORK || 'testnet') as NetworkType,
  contractAddress: contractDetails.address,
  contractName: contractDetails.name,
  senderKey: '',
  delayBetweenCalls: 3000,
};

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
      error: `Unrecognized key format (${rawKey.length} characters).`,
    };
  }
}

async function main(): Promise<void> {
  console.log('==========================================================');
  console.log('  LocalCityProsperity - SAFE Function Calls');
  console.log('  (Only calls functions you have permission for)');
  console.log('==========================================================');

  console.log('\n=== Configuration ===');
  console.log(`Network: ${CONFIG.network}`);
  console.log(`Contract Address: ${CONFIG.contractAddress}`);
  console.log(`Contract Name: ${CONFIG.contractName}`);

  console.log('\n=== Initializing Sender Key ===');
  const keyInit = await initializeSenderKey();

  if (!keyInit.success) {
    console.error(`\n✗ Key Initialization Failed: ${keyInit.error}`);
    process.exit(1);
  }

  const senderAddress = keyInit.address!;
  console.log(`✓ Sender Address: ${senderAddress}`);

  console.log(`\nFetching nonce for ${senderAddress}...`);
  let nonce = await fetchAccountNonce(senderAddress);
  console.log(`Starting nonce: ${nonce}`);

  // Step 1: Register participant
  console.log('\n--- Step 1: Register Participant ---');
  const registerResult = await executeContractCall('register-participant', [], nonce);
  
  if (registerResult.success) {
    console.log(`✓ Successfully registered! TxID: ${registerResult.txId}`);
    console.log(`  Explorer: https://explorer.hiro.so/txid/${registerResult.txId}?chain=${CONFIG.network}`);
    nonce++;
    
    // Wait for transaction to be mined
    console.log('\n⏳ Waiting 30 seconds for transaction to be mined...');
    await new Promise(resolve => setTimeout(resolve, 30000));
  } else {
    console.log(`✗ Registration failed: ${registerResult.error}`);
    if (registerResult.error?.includes('err-already-exists') || registerResult.error?.includes('102')) {
      console.log('  Note: You are already registered. Continuing...');
    } else {
      console.log('  Cannot proceed without registration.');
      process.exit(1);
    }
  }

  // Step 2: Update level (now that we're definitely registered)
  console.log('\n--- Step 2: Update Level ---');
  const updateLevelResult = await executeContractCall('update-level', [uintCV(5)], nonce);
  
  if (updateLevelResult.success) {
    console.log(`✓ Level updated! TxID: ${updateLevelResult.txId}`);
    console.log(`  Explorer: https://explorer.hiro.so/txid/${updateLevelResult.txId}?chain=${CONFIG.network}`);
    nonce++;
  } else {
    console.log(`✗ Level update failed: ${updateLevelResult.error}`);
  }

  console.log('\n=== Summary ===');
  console.log('✓ Completed safe function calls');
  console.log('\n⚠ NOTE: To claim rewards, you need:');
  console.log('  1. The contract owner must create quests (create-quest)');
  console.log('  2. You must complete a quest (complete-quest)');
  console.log('  3. Then you can claim the reward (claim-reward)');
  console.log(`\n  Contract owner address: ${CONFIG.contractAddress}`);
  console.log(`  Your address: ${senderAddress}`);
  
  if (senderAddress.toLowerCase() !== CONFIG.contractAddress.toLowerCase()) {
    console.log('\n  ℹ You are NOT the contract owner. Only the owner can:');
    console.log('     - Create quests (create-quest)');
    console.log('     - Toggle quests (toggle-quest)');
  } else {
    console.log('\n  ✓ You ARE the contract owner! You can:');
    console.log('     - Create quests (create-quest)');
    console.log('     - Toggle quests (toggle-quest)');
  }
}

main().catch(console.error);
