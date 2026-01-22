const fs = require('fs');
const path = require('path');

const contracts = [
  {
    name: 'decentralized-ai-marketplace',
    functions: ['create-listing', 'purchase-service', 'submit-rating', 'update-listing-status'],
  },
  {
    name: 'decentralized-training-and-fine-tuning-of-llm-network',
    functions: ['register-compute-node', 'create-training-job', 'assign-job', 'submit-training-result', 'verify-and-pay', 'update-node-status'],
  },
  {
    name: 'decentralizing-training-data-marketplace-for-robots',
    functions: ['list-dataset', 'purchase-dataset', 'submit-quality-review', 'update-dataset-status'],
  },
  {
    name: 'real-time-data-marketplace-for-robots',
    functions: ['register-data-stream', 'subscribe-to-stream', 'publish-data-packet', 'end-subscription', 'update-stream-status'],
  },
  {
    name: 'robot-to-robot-communication-network',
    functions: ['register-robot', 'establish-connection', 'send-message', 'acknowledge-message', 'update-robot-status'],
  },
  {
    name: 'robot-to-robot-payment-network',
    functions: ['initialize-wallet', 'deposit-funds', 'send-payment', 'create-escrow', 'release-escrow', 'cancel-escrow'],
  },
  {
    name: 'medical-data-exchange-for-enterprise',
    functions: ['register-medical-record', 'request-access', 'grant-access', 'revoke-access', 'update-consent-status'],
  },
  {
    name: 'clinical-trial-data-marketplace',
    functions: ['create-trial', 'submit-data', 'purchase-data', 'verify-data', 'update-trial-status'],
  },
  {
    name: 'data-marketplace-for-epidemiological-studies',
    functions: ['list-dataset', 'purchase-dataset', 'submit-quality-rating', 'update-dataset-status'],
  },
  {
    name: 'decentralized-clinical-trial-network',
    functions: ['create-trial', 'register-site', 'enroll-participant', 'submit-data', 'distribute-incentive', 'update-trial-status'],
  },
  {
    name: 'decentralized-scientific-research',
    functions: ['create-project', 'contribute-funding', 'submit-peer-review', 'publish-results', 'update-project-status'],
  },
  {
    name: 'onchain-intellectual-property-registry',
    functions: ['register-ip', 'purchase-license', 'verify-ip', 'transfer-ownership'],
  },
  {
    name: 'decentralized-salesforce',
    functions: ['create-account', 'add-lead', 'convert-lead', 'create-subscription', 'update-account-status'],
  },
  {
    name: 'micropayment-with-revenue-sharing',
    functions: ['register-provider', 'add-beneficiary', 'make-micropayment', 'distribute-revenue', 'update-provider-status'],
  },
  {
    name: 'ip-registry',
    functions: ['register-ip', 'transfer-ip', 'grant-usage-rights', 'revoke-usage-rights'],
  },
  {
    name: 'insurance-for-ip-breach',
    functions: ['purchase-policy', 'file-claim', 'assess-claim', 'approve-claim', 'reject-claim'],
  },
  {
    name: 'decentralized-cdn-network',
    functions: ['register-node', 'cache-content', 'serve-content', 'record-distribution', 'update-node-status'],
  },
  {
    name: 'decentralized-gpu-network',
    functions: ['register-provider', 'submit-compute-job', 'assign-job', 'submit-result', 'verify-and-pay', 'update-provider-status'],
  },
  {
    name: 'decentralized-advertisement-network',
    functions: ['create-campaign', 'register-publisher', 'record-impression', 'distribute-payment', 'update-campaign-status'],
  },
  {
    name: 'decentralized-legal-counsel-network',
    functions: ['register-counsel', 'create-case', 'upload-document', 'bill-hours', 'close-case'],
  },
  {
    name: 'prediction-market',
    functions: ['create-market', 'stake-yes', 'stake-no', 'resolve-market', 'claim-winnings'],
  },
  {
    name: 'perp-dex-for-prediction-market',
    functions: ['create-market', 'open-long-position', 'open-short-position', 'close-position', 'liquidate-position', 'update-mark-price'],
  },
  {
    name: 'tokenized-equity-platform',
    functions: ['issue-equity', 'purchase-equity', 'transfer-equity', 'update-kyc-status', 'update-trading-enabled'],
  },
  {
    name: 'undercollateralized-lending',
    functions: ['create-credit-profile', 'request-loan', 'approve-loan', 'repay-loan', 'default-loan', 'update-credit-score'],
  },
  {
    name: 'onchain-fx-market',
    functions: ['create-pair', 'add-liquidity', 'remove-liquidity', 'create-limit-order', 'execute-limit-order', 'market-swap'],
  },
  {
    name: 'onchain-kyc',
    functions: ['register-provider', 'submit-kyc', 'approve-kyc', 'reject-kyc', 'renew-kyc', 'revoke-kyc'],
  },
  {
    name: 'onchain-etf-market',
    functions: ['create-fund', 'add-holding', 'purchase-shares', 'redeem-shares', 'update-nav', 'distribute-management-fee'],
  },
  {
    name: 'gpu-clusters-backed-private-credit',
    functions: ['register-gpu-cluster', 'verify-cluster', 'request-loan', 'approve-loan', 'distribute-revenue', 'repay-loan', 'default-loan'],
  },
];

const baseDir = '/Users/unomasanori/Projects/Talent-Rewards/Stacks-rewards/bitto/business-use-cases/frontend';

contracts.forEach(contract => {
  const contractDir = path.join(baseDir, contract.name);
  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir, { recursive: true });
  }

  const title = contract.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const htmlSections = contract.functions.map(fn => {
    const fnTitle = fn.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `  <div class="section">
    <h2>${fnTitle}</h2>
    <button id="${fn}">${fnTitle}</button>
  </div>`;
  }).join('\n\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    button { margin: 5px; padding: 10px 15px; cursor: pointer; }
    input { margin: 5px; padding: 8px; width: 300px; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div id="wallet-status"></div>
  <button id="connect-wallet">Connect Wallet</button>
  
${htmlSections}

  <script type="module" src="app.js"></script>
</body>
</html>`;

  const jsListeners = contract.functions.map(fn => {
    return `document.getElementById('${fn}').addEventListener('click', () => {
  callContract('${fn}', []);
});`;
  }).join('\n\n');

  const js = `import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { PostConditionMode, makeContractCall, broadcastTransaction } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = import.meta.env.VITE_STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractName = '${contract.name}';

function updateWalletStatus() {
  const statusDiv = document.getElementById('wallet-status');
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    statusDiv.innerHTML = \`Connected: \${userData.profile.stxAddress.mainnet}\`;
  } else {
    statusDiv.innerHTML = 'Not connected';
  }
}

document.getElementById('connect-wallet').addEventListener('click', () => {
  showConnect({
    appDetails: {
      name: '${title}',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      updateWalletStatus();
    },
    userSession,
  });
});

async function callContract(functionName, functionArgs) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    senderKey: userSession.loadUserData().appPrivateKey,
    network,
    postConditionMode: PostConditionMode.Allow,
  };
  
  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  alert(\`Transaction ID: \${broadcastResponse.txid}\`);
}

${jsListeners}

updateWalletStatus();
`;

  const env = `VITE_CONTRACT_ADDRESS=SP1V95DB4JK47QVPJBXCEN6MT35JK84CQ4CWS15DQ
VITE_STACKS_NETWORK=mainnet
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
`;

  fs.writeFileSync(path.join(contractDir, 'index.html'), html);
  fs.writeFileSync(path.join(contractDir, 'app.js'), js);
  fs.writeFileSync(path.join(contractDir, '.env.example'), env);
  
  console.log(`Created frontend for ${contract.name}`);
});

console.log('All frontends created successfully!');
