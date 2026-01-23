#!/bin/bash

cd "$(dirname "$0")"

CONTRACTS=(
  "tokenized-stocks-platform:3006:Tokenized Stocks Platform"
  "airline-seat-ticketing-service:3007:Airline Seat Ticketing"
  "pro-baseball-ticketing:3008:Pro Baseball Ticketing"
  "pro-football-ticketing:3009:Pro Football Ticketing"
  "pro-basketball-ticketing:3010:Pro Basketball Ticketing"
  "semiconductor-manufacturing:3011:Semiconductor Manufacturing"
  "semiconductor-design-process:3012:Semiconductor Design Process"
  "wafer-fabrication-process:3013:Wafer Fabrication Process"
  "chip-atp-process:3014:Chip ATP Process"
  "battery-electric-bus-production:3015:Battery Electric Bus Production"
  "lithium-battery-monitoring:3016:Lithium Battery Monitoring"
  "humanoid-robot-production:3017:Humanoid Robot Production"
  "robotics-oem:3018:Robotics OEM"
  "robotics-data-sharing:3019:Robotics Data Sharing"
  "robot-deployment-planing-system:3020:Robot Deployment Planning System"
  "robot-supply-chain-network:3021:Robot Supply Chain Network"
  "robot-maintainance-automation:3022:Robot Maintenance Automation"
  "home-battery-storage:3023:Home Battery Storage"
  "aircraft-assembly-process:3024:Aircraft Assembly Process"
  "tokenized-artwork-exchange:3025:Tokenized Artwork Exchange"
  "sports-player-ip-mgmt:3026:Sports Player IP Management"
  "tokenized-sports-club:3027:Tokenized Sports Club"
  "onchain-kyb:3028:Onchain KYB"
  "onchain-kyt:3029:Onchain KYT"
  "onchain-obs:3030:Onchain OBS"
  "onchain-kya:3031:Onchain KYA"
)

for item in "${CONTRACTS[@]}"; do
  IFS=':' read -r contract port title <<< "$item"
  echo "Creating $contract frontend..."
  
  mkdir -p "$contract/pages"
  
  cat > "$contract/package.json" << PKGJSON
{
  "name": "${contract}-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p ${port}",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@stacks/connect": "7.8.2",
    "@stacks/network": "6.13.0",
    "@stacks/transactions": "6.13.0",
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "20.0.0",
    "@types/react": "18.2.0",
    "typescript": "5.0.0"
  }
}
PKGJSON

  cat > "$contract/.env.local" << ENVLOCAL
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_NETWORK=mainnet
ENVLOCAL

  cat > "$contract/.gitignore" << GITIGNORE
node_modules
.next
out
.env.local
.env.development.local
.env.test.local
.env.production.local
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
GITIGNORE

  cat > "$contract/tsconfig.json" << TSCONFIG
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
TSCONFIG

  cat > "$contract/next.config.js" << NEXTCONFIG
module.exports = {
  reactStrictMode: true,
}
NEXTCONFIG

  cat > "$contract/pages/index.tsx" << 'INDEXPAGE'
import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  uintCV, 
  stringAsciiCV,
  principalCV,
  boolCV,
  bufferCV,
  intCV,
  callReadOnlyFunction,
  makeContractCall,
  AnchorMode
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');

  useEffect(() => {
    setMounted(true);
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
        name: 'TITLE_PLACEHOLDER',
        icon: 'https://stacks.org/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const handleInput = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const callContract = async (functionName: string, args: any[]) => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName,
      functionArgs: args,
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted successfully');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const queryContract = async (functionName: string, args: any[]) => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs: args,
        senderAddress: contractAddress,
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>TITLE_PLACEHOLDER</h1>
      
      {!userData ? (
        <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p style={{ padding: '10px', background: '#e8f5e9', borderRadius: '5px' }}>
            Connected: {userData.profile.stxAddress.mainnet}
          </p>
          
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h3>Contract Interface</h3>
            <p>Configure contract address in .env.local file</p>
            <p>Use the inputs below to interact with the smart contract</p>
            
            <div style={{ marginTop: '20px' }}>
              <input 
                placeholder="Generic Input Field" 
                value={formData['generic'] || ''} 
                onChange={(e) => handleInput('generic', e.target.value)}
                style={{ padding: '8px', marginRight: '10px', minWidth: '200px' }}
              />
              <button 
                onClick={() => callContract('sample-function', [])}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Execute Function
              </button>
            </div>
          </div>

          {result && (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px', background: '#f5f5f5' }}>
              <h3>Result</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
INDEXPAGE

  sed -i '' "s/TITLE_PLACEHOLDER/${title}/g" "$contract/pages/index.tsx"
  
done

echo "All frontends created successfully!"
