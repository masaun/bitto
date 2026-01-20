import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  standardPrincipalCV,
  uintCV,
  listCV,
  tupleCV,
  PostConditionMode,
  getAddressFromPrivateKey,
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

async function derivePrivateKeyFromMnemonic(mnemonic: string): Promise<string> {
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

const contractDetails = parseContractIdentifier(process.env.REFERABLE_NON_FUNGIBLE_TOKEN_CONTRACT_ADDRESS, 'referable-non-fungible-token');
const RAW_KEY = process.env.SENDER_PRIVATE_KEY || '';

const CONFIG = {
  network: (process.env.STACKS_NETWORK || 'testnet') as NetworkType,
  contractAddress: contractDetails.address,
  contractName: contractDetails.name,
  batchCycles: 10,
  delayBetweenCalls: 1000,
  senderKey: '',
};

async function initializeSenderKey(): Promise<{ success: boolean; address?: string; error?: string }> {
  const rawKey = RAW_KEY.trim();
  if (isMnemonicPhrase(rawKey)) {
    CONFIG.senderKey = await derivePrivateKeyFromMnemonic(rawKey);
    const address = getAddressFromKey(CONFIG.senderKey, CONFIG.network);
    return { success: true, address };
  } else if (isHexPrivateKey(rawKey)) {
    CONFIG.senderKey = normalizeHexPrivateKey(rawKey);
    const address = getAddressFromKey(CONFIG.senderKey, CONFIG.network);
    return { success: true, address };
  }
  return { success: false, error: 'Invalid key format' };
}

function getStacksApiUrl(): string {
  return CONFIG.network === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';
}

async function fetchAccountNonce(address: string): Promise<bigint> {
  const url = `${getStacksApiUrl()}/extended/v1/address/${address}/nonces`;
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      const data = JSON.parse(text) as { possible_next_nonce: number };
      return BigInt(data.possible_next_nonce);
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('Failed to fetch nonce after retries. Using nonce 0.');
        return BigInt(0);
      }
      console.log(`Retrying nonce fetch... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return BigInt(0);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function batchCall(): Promise<void> {
  const initResult = await initializeSenderKey();
  if (!initResult.success || !initResult.address) {
    console.error('Failed to initialize sender key:', initResult.error);
    return;
  }

  const senderAddress = initResult.address;
  console.log(`Sender address: ${senderAddress}`);
  console.log(`Contract: ${CONFIG.contractAddress}.${CONFIG.contractName}`);
  console.log(`Network: ${CONFIG.network}`);

  let nonce = await fetchAccountNonce(senderAddress);
  const networkForBroadcast = CONFIG.network === 'mainnet' ? 'mainnet' : 'testnet';

  for (let cycle = 0; cycle < CONFIG.batchCycles; cycle++) {
    console.log(`\nCycle ${cycle + 1}/${CONFIG.batchCycles}`);

    const mintTx = await makeContractCall({
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName: 'mint',
      functionArgs: [standardPrincipalCV(senderAddress), stringAsciiCV(`https://example.com/token/${cycle}`)],
      senderKey: CONFIG.senderKey,
      network: networkForBroadcast,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce,
    });
    const mintResult = await broadcastTransaction({ transaction: mintTx, network: networkForBroadcast });
    console.log(`mint tx: ${mintResult.txid}`);
    nonce++;
    await sleep(CONFIG.delayBetweenCalls);

    const transferTx = await makeContractCall({
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName: 'transfer',
      functionArgs: [uintCV(cycle + 1), standardPrincipalCV(senderAddress), standardPrincipalCV(senderAddress)],
      senderKey: CONFIG.senderKey,
      network: networkForBroadcast,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce,
    });
    const transferResult = await broadcastTransaction({ transaction: transferTx, network: networkForBroadcast });
    console.log(`transfer tx: ${transferResult.txid}`);
    nonce++;
    await sleep(CONFIG.delayBetweenCalls);

    const setNodeTx = await makeContractCall({
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName: 'set-node',
      functionArgs: [
        uintCV(cycle + 1),
        listCV([standardPrincipalCV(senderAddress)]),
        listCV([listCV([uintCV(1)])])
      ],
      senderKey: CONFIG.senderKey,
      network: networkForBroadcast,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce,
    });
    const setNodeResult = await broadcastTransaction({ transaction: setNodeTx, network: networkForBroadcast });
    console.log(`set-node tx: ${setNodeResult.txid}`);
    nonce++;
    await sleep(CONFIG.delayBetweenCalls);
  }

  console.log('\nBatch call completed.');
}

batchCall().catch(console.error);
