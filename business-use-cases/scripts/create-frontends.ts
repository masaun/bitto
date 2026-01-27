import * as fs from 'fs';
import * as path from 'path';

const contracts = [
  'uniswap-v4-like-hook',
  'confidential-computing-system',
  'collecting-small-farmer-output',
  'warehouses-management',
  'inventory-management',
  'nft-marketplace-for-rice',
  'agricultural-aggregator',
  'agricultural-cooperative',
  'otc-marketplace-for-rice',
  'dex-style-marketplace-for-rice',
  'regional-spot-price-oracle-for-rice',
  'inventory-registry',
  'agricultural-insurance-for-small-farmer',
  'agricultural-storage-sharing-system',
  'agricultural-aggregation-router',
  'agricultural-governance',
  'agricultural-warehouse-sharing-router',
  'dtcc-for-agricultural-market',
  'agricultural-government-buffer-management',
  'lng-inventory-management',
  'orbital-infrastructure',
  'satellite-routing-protocol',
  'fractional-ownership-nfr-for-satellite',
  'multiple-satellite-ownership-dao',
  'decentralized-bandwidth-access-market',
  'decentralized-identity-for-aid',
  'decentralized-identity-for-donor',
  'aid-distribution-management',
  'aid-analysis-platform',
  'aid-tracking-system',
  'decentralized-geo-mapping',
  'auto-data-aggregation-and-reporting-platform',
  'donors-fund-outcomes-verifier',
  'aid-allocator',
  'biometric-id-systems-for-refugees',
  'voucher-management',
  'automated-vaccines-testing-platform',
  'vaccines-research-scholarship',
  'decentraized-aid-funding',
  'entertainment-ip-management',
  'revenue-sharing-manager-among-clubs',
  'media-rights-management',
  'decentralized-stadium-operation',
  'salary-cap-management',
  'automated-players-draft-system',
  'automated-players-transfer-market',
  'players-scouting-marketplace',
  'players-analytics-model-marketpace',
  'business-model-analytics-model-marketpace',
  'independent-league-management',
  'independent-league-sponcorship',
  'scoring-system-for-players',
  'club-game-match-planning-system',
  'salary-negotiation-system',
  'profit-sharing-between-player-and-club',
  'tokenized-stadium',
  'tokenized-arena-marketplace',
  'dao-based-club'
];

const generateFrontend = (contractName: string) => {
  const envName = contractName.toUpperCase().replace(/-/g, '_');
  const componentName = contractName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');

  const appTsx = `import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  bufferCV,
  listCV
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = process.env.REACT_APP_${envName}_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = '${contractName}';

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: '${componentName}',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut('/');
    setUserData(null);
  };

  const executeContractCall = async (functionName: string, functionArgs: any[]) => {
    if (!userData) return;
    
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data: any) => {
          console.log('Transaction:', data.txId);
          setLoading(false);
        },
      };
      
      await makeContractCall(txOptions);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>${componentName}</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <div>
            <p>Address: {userData.profile.stxAddress.mainnet}</p>
            <button onClick={disconnectWallet}>Disconnect</button>
          </div>
          <div>
            {loading && <p>Transaction pending...</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
`;

  const packageJson = `{
  "name": "${contractName}-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@stacks/connect": "^7.0.0",
    "@stacks/transactions": "^6.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
`;

  const envExample = `REACT_APP_${envName}_CONTRACT_ADDRESS=SP000000000000000000000000000`;

  const readme = `# ${componentName} Frontend

Frontend interface for the ${contractName} smart contract.

## Setup

1. Install dependencies:
\`\`\`
npm install
\`\`\`

2. Create .env file with contract address:
\`\`\`
cp .env.example .env
\`\`\`

3. Start development server:
\`\`\`
npm start
\`\`\`

## Environment Variables

- \`REACT_APP_${envName}_CONTRACT_ADDRESS\`: Deployed contract address on Stacks mainnet
`;

  return { appTsx, packageJson, envExample, readme };
};

const createFrontendDirectories = () => {
  const frontendDir = path.join(__dirname, '../frontend');
  
  contracts.forEach(contractName => {
    const dir = path.join(frontendDir, contractName);
    const srcDir = path.join(dir, 'src');
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
    
    const { appTsx, packageJson, envExample, readme } = generateFrontend(contractName);
    
    fs.writeFileSync(path.join(srcDir, 'App.tsx'), appTsx);
    fs.writeFileSync(path.join(dir, 'package.json'), packageJson);
    fs.writeFileSync(path.join(dir, '.env.example'), envExample);
    fs.writeFileSync(path.join(dir, 'README.md'), readme);
    
    console.log(`✓ Created frontend for ${contractName}`);
  });
};

createFrontendDirectories();
console.log(`\n✓ Generated ${contracts.length} frontends`);
