const fs = require('fs');
const path = require('path');

const contracts = [
  'private-transaction-registry',
  'encrypted-transaction-pool',
  'transaction-encryption-manager',
  'transaction-decryption-coordinator',
  'private-mempool-registry',
  'transaction-commitment-store',
  'transaction-reveal-phase',
  'confidential-transaction-router',
  'privacy-layer-registry',
  'confidential-execution-engine',
  'mev-protection-registry',
  'frontrun-prevention-engine',
  'sandwich-attack-detection',
  'reorder-protection',
  'fair-ordering-engine',
  'transaction-sequencing-policy',
  'mev-risk-score',
  'mev-incident-log',
  'private-orderflow-manager',
  'mev-audit-trail',
  'threshold-encryption-registry',
  'validator-key-share',
  'distributed-key-generation',
  'key-rotation-policy',
  'decryption-quorum',
  'encryption-proof-verifier',
  'confidential-payload-store',
  'encrypted-batch-manager',
  'decryption-time-lock',
  'encryption-audit-log',
  'validator-privacy-registry',
  'validator-sequencing-committee',
  'validator-threshold-consensus',
  'validator-reputation-score',
  'validator-misbehavior-log',
  'validator-slashing-policy',
  'validator-privacy-attestation',
  'validator-key-management',
  'validator-performance-metrics',
  'validator-audit-log',
  'fair-block-construction',
  'deterministic-ordering-policy',
  'encrypted-order-book',
  'private-bundle-manager',
  'anti-censorship-queue',
  'sequencing-randomizer',
  'ordering-proof',
  'block-assembly-log',
  'ordering-governance',
  'ordering-audit',
  'private-swap-engine',
  'confidential-liquidity-pool',
  'shielded-limit-order',
  'private-arbitrage-protection',
  'confidential-lending',
  'private-collateral-manager',
  'liquidation-protection',
  'slippage-protection-policy',
  'private-price-oracle',
  'defi-privacy-audit',
  'enterprise-private-transactions',
  'confidential-payment-engine',
  'private-invoice-settlement',
  'trade-secret-protection',
  'confidential-bidding-engine',
  'sealed-procurement',
  'enterprise-privacy-policy',
  'confidential-data-exchange',
  'enterprise-encryption-gateway',
  'enterprise-privacy-audit',
  'private-nft-minting',
  'confidential-nft-transfer',
  'nft-bid-secrecy',
  'hidden-auction-engine',
  'nft-price-concealment',
  'nft-royalty-privacy',
  'nft-private-marketplace',
  'nft-reveal-policy',
  'nft-confidential-metadata',
  'nft-privacy-audit',
  'private-governance-vote',
  'encrypted-vote-commitment',
  'vote-reveal-manager',
  'confidential-proposal-engine',
  'dao-fair-counting',
  'governance-privacy-policy',
  'dao-threshold-voting',
  'dao-encrypted-treasury',
  'dao-privacy-audit',
  'proposal-secrecy-layer',
  'secure-relay-manager',
  'encrypted-rpc-gateway',
  'private-node-registry',
  'confidential-network-layer',
  'peer-encryption-policy',
  'encrypted-gas-estimator',
  'private-transaction-simulator',
  'secure-broadcast-layer',
  'confidential-metrics-engine',
  'network-privacy-audit',
  'secure-batch-processor',
  'encrypted-state-sync',
  'private-execution-sandbox',
  'shielded-state-root',
  'encrypted-call-forwarder',
  'private-debug-engine',
  'node-attestation-registry',
  'encrypted-archive-node',
  'privacy-sla-monitor',
  'infra-compliance-check',
  'private-block-validator',
  'encrypted-block-storage',
  'confidential-log-aggregator',
  'secure-p2p-channel',
  'private-api-registry',
  'encrypted-event-stream',
  'secure-time-sync',
  'privacy-health-score',
  'network-integrity-check',
  'infrastructure-audit-log',
  'cross-chain-private-bridge',
  'encrypted-message-passing',
  'confidential-relayer-network',
  'cross-chain-threshold-decryption',
  'private-asset-transfer',
  'bridge-integrity-verifier',
  'cross-chain-sequencing',
  'confidential-bridge-oracle',
  'multi-chain-privacy-policy',
  'bridge-audit-log',
  'shielded-token-wrapper',
  'confidential-liquidity-bridge',
  'encrypted-state-proof',
  'cross-domain-privacy-check',
  'bridge-slashing-policy',
  'secure-bridge-validator',
  'cross-chain-mev-protection',
  'encrypted-asset-routing',
  'cross-chain-risk-score',
  'cross-chain-compliance',
  'multi-chain-private-dao',
  'encrypted-interchain-call',
  'privacy-routing-engine',
  'cross-chain-bundle-manager',
  'confidential-bridge-fees',
  'bridge-governance',
  'interchain-fair-ordering',
  'cross-network-audit',
  'bridge-finality-proof',
  'cross-chain-security-log',
  'secure-oracle-bridge',
  'private-settlement-layer',
  'encrypted-validator-bridge',
  'bridge-monitoring-engine',
  'bridge-dispute-resolution',
  'bridge-rollback-engine',
  'cross-chain-state-manager',
  'bridge-risk-mitigation',
  'privacy-interoperability-layer',
  'cross-chain-privacy-audit',
  'confidential-audit-registry',
  'encrypted-transaction-replay',
  'privacy-compliance-registry',
  'regulator-access-gateway',
  'confidential-evidence-store',
  'immutable-privacy-log',
  'privacy-breach-report',
  'privacy-incident-response',
  'compliance-attestation',
  'compliance-score-engine',
  'confidential-analytics-engine',
  'encrypted-usage-metrics',
  'private-behavior-analysis',
  'mev-analytics-dashboard',
  'confidential-risk-engine',
  'encrypted-data-warehouse',
  'privacy-monitoring-layer',
  'suspicious-pattern-detector',
  'anomaly-detection-registry',
  'privacy-performance-score',
  'ai-sequencing-optimizer',
  'predictive-mev-defense',
  'autonomous-privacy-agent',
  'privacy-policy-ai',
  'encrypted-ai-inference',
  'secure-ml-oracle',
  'private-ai-training',
  'confidential-model-weights',
  'privacy-alignment-score',
  'ai-privacy-audit',
  'programmable-privacy-layer',
  'modular-encryption-framework',
  'privacy-hook-registry',
  'custom-ordering-policy',
  'encrypted-logic-execution',
  'dynamic-privacy-level',
  'privacy-tier-manager',
  'adaptive-mev-defense',
  'privacy-upgrade-governance',
  'protocol-privacy-score',
  'confidential-payment-channel',
  'encrypted-streaming-payment',
  'private-subscription-settlement',
  'hidden-treasury-management',
  'secure-fund-release',
  'privacy-revenue-sharing',
  'shielded-royalty-engine',
  'confidential-escrow-layer',
  'encrypted-refund-policy',
  'finance-privacy-audit',
  'gaming-hidden-moves',
  'confidential-game-logic',
  'sealed-game-bidding',
  'hidden-loot-distribution',
  'anti-cheat-privacy-layer',
  'private-scoreboard',
  'gaming-commit-reveal',
  'fair-randomness-engine',
  'gaming-privacy-audit',
  'multiplayer-secrecy-layer',
  'confidential-identity-registry',
  'shielded-wallet-manager',
  'anonymous-session-layer',
  'zk-identity-verifier',
  'privacy-consent-registry',
  'identity-revocation-log',
  'identity-risk-score',
  'private-credential-store',
  'identity-audit-log',
  'sovereign-identity-layer',
  'secure-messaging-layer',
  'encrypted-chat-registry',
  'confidential-notification-engine',
  'privacy-alert-system',
  'secure-broadcast-channel',
  'encrypted-push-service',
  'private-group-management',
  'confidential-signal-manager',
  'communication-audit-log',
  'secure-message-archive',
  'protocol-registry',
  'contract-versioning',
  'dependency-mapping',
  'privacy-upgrade-engine',
  'backward-compatibility-layer',
  'emergency-privacy-switch',
  'protocol-metrics',
  'system-health-index',
  'privacy-sunset-policy',
  'meta-audit-log',
  'validator-incentive-engine',
  'privacy-staking',
  'slashing-enforcement',
  'reward-distribution',
  'incentive-audit',
  'stake-weighted-governance',
  'validator-performance-index',
  'participation-score',
  'validator-risk-monitor',
  'validator-transparency-log',
  'enterprise-confidential-settlement',
  'secure-contract-execution',
  'private-supply-chain',
  'confidential-trade-finance',
  'procurement-sealed-bidding',
  'enterprise-data-secrecy',
  'cross-enterprise-privacy',
  'confidential-api-layer',
  'enterprise-attestation-engine',
  'enterprise-security-log',
  'zk-order-verification',
  'zero-knowledge-sequencing',
  'zk-transaction-proof',
  'zk-execution-proof',
  'zk-compliance-proof',
  'zk-mev-protection',
  'zk-auction-engine',
  'zk-private-settlement',
  'zk-validator-attestation',
  'zk-privacy-audit',
  'autonomous-block-builder',
  'decentralized-sequencer',
  'private-rollup-engine',
  'encrypted-rollup-state',
  'fair-rollup-ordering',
  'rollup-privacy-audit',
  'rollup-fraud-detection',
  'rollup-threshold-decryption',
  'rollup-governance',
  'rollup-integrity-check',
  'privacy-marketplace',
  'encryption-service-market',
  'validator-coordination-layer',
  'privacy-liquidity-pool',
  'confidential-asset-exchange',
  'encrypted-arbitration-layer',
  'decentralized-privacy-dao',
  'privacy-research-grants',
  'protocol-integrity-verifier',
  'network-privacy-index'
];

const toCamelCase = (str) => {
  return str.split('-').map((word, index) => 
    index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
};

const toTitleCase = (str) => {
  return str.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
};

const toEnvVar = (str) => {
  return str.toUpperCase().replace(/-/g, '_');
};

contracts.forEach(contract => {
  const frontendDir = path.join(__dirname, '..', 'frontend', contract);
  
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  const packageJson = {
    name: `${contract}-frontend`,
    version: "1.0.0",
    scripts: {
      dev: "vite",
      build: "tsc && vite build"
    },
    dependencies: {
      "@stacks/connect": "^7.8.2",
      "@stacks/transactions": "^6.13.0",
      "@stacks/network": "^6.13.0"
    },
    devDependencies: {
      "typescript": "^5.3.3",
      "vite": "^5.0.0"
    }
  };
  
  const tsconfig = {
    compilerOptions: {
      target: "ES2020",
      module: "ESNext",
      lib: ["ES2020", "DOM"],
      moduleResolution: "bundler",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true
    }
  };
  
  const envContent = `${toEnvVar(contract)}_CONTRACT_ADDRESS=\n`;
  
  const gitignore = `node_modules/\ndist/\n.env\n`;
  
  const titleCase = toTitleCase(contract);
  const envVar = toEnvVar(contract);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleCase}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #5546ff; }
    button { background: #5546ff; color: white; border: none; padding: 10px 20px; margin: 5px; cursor: pointer; border-radius: 5px; }
    button:hover { background: #4435ee; }
    input { padding: 8px; margin: 5px; width: 300px; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>${titleCase}</h1>
  <div class="section">
    <h2>Wallet</h2>
    <button id="connect-wallet">Connect Wallet</button>
    <p>Address: <span id="user-address">Not connected</span></p>
  </div>
  <div class="section">
    <h2>Create Entry</h2>
    <input type="text" id="data-input" placeholder="Enter data (hex buffer)" />
    <button id="create-entry">Create Entry</button>
  </div>
  <div class="section">
    <h2>Update Entry</h2>
    <input type="number" id="id-input" placeholder="Entry ID" />
    <input type="text" id="update-data-input" placeholder="New data (hex buffer)" />
    <button id="update-entry">Update Entry</button>
  </div>
  <div class="section">
    <h2>Update Status</h2>
    <input type="number" id="status-id-input" placeholder="Entry ID" />
    <input type="text" id="status-input" placeholder="New status" />
    <button id="update-status">Update Status</button>
  </div>
  <div class="section">
    <h2>Get Entry</h2>
    <input type="number" id="get-id-input" placeholder="Entry ID" />
    <button id="get-entry">Get Entry</button>
    <pre id="entry-result"></pre>
  </div>
  <script src="./index.ts" type="module"></script>
</body>
</html>
`;
  
  const typescript = `import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  makeContractSTXPostCondition,
  FungibleConditionCode,
  bufferCVFromString,
  uintCV,
  stringAsciiCV,
  PostConditionMode,
  callReadOnlyFunction,
  cvToJSON
} from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.${envVar}_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = '${contract}';
const NETWORK = new StacksMainnet();

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function connectWallet() {
  showConnect({
    appDetails: {
      name: '${titleCase}',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

async function createEntry(data: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'create-entry',
    functionArgs: [bufferCVFromString(data)],
    senderKey: userSession.loadUserData().appPrivateKey,
    validateWithAbi: true,
    network: NETWORK,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Transaction:', data);
      alert('Transaction submitted: ' + data.txId);
    },
  };
  await makeContractCall(txOptions);
}

async function updateEntry(id: number, data: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'update-entry',
    functionArgs: [uintCV(id), bufferCVFromString(data)],
    senderKey: userSession.loadUserData().appPrivateKey,
    validateWithAbi: true,
    network: NETWORK,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Transaction:', data);
      alert('Transaction submitted: ' + data.txId);
    },
  };
  await makeContractCall(txOptions);
}

async function updateStatus(id: number, status: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS.split('.')[0],
    contractName: CONTRACT_NAME,
    functionName: 'update-status',
    functionArgs: [uintCV(id), stringAsciiCV(status)],
    senderKey: userSession.loadUserData().appPrivateKey,
    validateWithAbi: true,
    network: NETWORK,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data: any) => {
      console.log('Transaction:', data);
      alert('Transaction submitted: ' + data.txId);
    },
  };
  await makeContractCall(txOptions);
}

async function getEntry(id: number) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS.split('.')[0],
      contractName: CONTRACT_NAME,
      functionName: 'get-entry',
      functionArgs: [uintCV(id)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS.split('.')[0],
    });
    const resultElement = document.getElementById('entry-result');
    if (resultElement) {
      resultElement.textContent = JSON.stringify(cvToJSON(result), null, 2);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error fetching entry: ' + error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-wallet');
  const createBtn = document.getElementById('create-entry');
  const updateBtn = document.getElementById('update-entry');
  const statusBtn = document.getElementById('update-status');
  const getBtn = document.getElementById('get-entry');
  
  connectBtn?.addEventListener('click', connectWallet);
  
  createBtn?.addEventListener('click', async () => {
    const input = document.getElementById('data-input') as HTMLInputElement;
    if (input && input.value) {
      await createEntry(input.value);
    }
  });
  
  updateBtn?.addEventListener('click', async () => {
    const idInput = document.getElementById('id-input') as HTMLInputElement;
    const dataInput = document.getElementById('update-data-input') as HTMLInputElement;
    if (idInput && dataInput && idInput.value && dataInput.value) {
      await updateEntry(parseInt(idInput.value), dataInput.value);
    }
  });
  
  statusBtn?.addEventListener('click', async () => {
    const idInput = document.getElementById('status-id-input') as HTMLInputElement;
    const statusInput = document.getElementById('status-input') as HTMLInputElement;
    if (idInput && statusInput && idInput.value && statusInput.value) {
      await updateStatus(parseInt(idInput.value), statusInput.value);
    }
  });
  
  getBtn?.addEventListener('click', async () => {
    const idInput = document.getElementById('get-id-input') as HTMLInputElement;
    if (idInput && idInput.value) {
      await getEntry(parseInt(idInput.value));
    }
  });
  
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    const addressElement = document.getElementById('user-address');
    if (addressElement) {
      addressElement.textContent = userData.profile.stxAddress.mainnet;
    }
  }
});
`;
  
  fs.writeFileSync(path.join(frontendDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  fs.writeFileSync(path.join(frontendDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  fs.writeFileSync(path.join(frontendDir, '.env'), envContent);
  fs.writeFileSync(path.join(frontendDir, '.gitignore'), gitignore);
  fs.writeFileSync(path.join(frontendDir, 'index.html'), html);
  fs.writeFileSync(path.join(frontendDir, 'index.ts'), typescript);
  
  console.log(`✓ Generated frontend for ${contract}`);
});

console.log(`\nGenerated ${contracts.length} frontend implementations!`);
