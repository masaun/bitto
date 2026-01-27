#!/bin/bash

CONTRACTS=(
  "confidential-computing-system"
  "collecting-small-farmer-output"
  "warehouses-management"
  "inventory-management"
  "nft-marketplace-for-rice"
  "agricultural-aggregator"
  "agricultural-cooperative"
  "otc-marketplace-for-rice"
  "dex-style-marketplace-for-rice"
  "regional-spot-price-oracle-for-rice"
  "inventory-registry"
  "agricultural-insurance-for-small-farmer"
  "agricultural-storage-sharing-system"
  "agricultural-aggregation-router"
  "agricultural-governance"
  "agricultural-warehouse-sharing-router"
  "dtcc-for-agricultural-market"
  "agricultural-government-buffer-management"
  "lng-inventory-management"
  "orbital-infrastructure"
  "satellite-routing-protocol"
  "fractional-ownership-nfr-for-satellite"
  "multiple-satellite-ownership-dao"
  "decentralized-bandwidth-access-market"
  "decentralized-identity-for-aid"
  "decentralized-identity-for-donor"
  "aid-distribution-management"
  "aid-analysis-platform"
  "aid-tracking-system"
  "decentralized-geo-mapping"
  "auto-data-aggregation-and-reporting-platform"
  "donors-fund-outcomes-verifier"
  "aid-allocator"
  "biometric-id-systems-for-refugees"
  "voucher-management"
  "automated-vaccines-testing-platform"
  "vaccines-research-scholarship"
  "decentraized-aid-funding"
  "entertainment-ip-management"
  "revenue-sharing-manager-among-clubs"
  "media-rights-management"
  "decentralized-stadium-operation"
  "salary-cap-management"
  "automated-players-draft-system"
  "automated-players-transfer-market"
  "players-scouting-marketplace"
  "players-analytics-model-marketpace"
  "business-model-analytics-model-marketpace"
  "independent-league-management"
  "independent-league-sponcorship"
  "scoring-system-for-players"
  "club-game-match-planning-system"
  "salary-negotiation-system"
  "profit-sharing-between-player-and-club"
  "tokenized-stadium"
  "tokenized-arena-marketplace"
  "dao-based-club"
)

FRONTEND_DIR="$HOME/Projects/Talent-Rewards/Stacks-rewards/bitto/business-use-cases/frontend"

for contract in "${CONTRACTS[@]}"; do
  DIR="$FRONTEND_DIR/$contract"
  mkdir -p "$DIR/src"
  
  ENV_NAME=$(echo "$contract" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
  
  cat > "$DIR/package.json" <<EOF
{
  "name": "${contract}-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@stacks/connect": "^7.0.0",
    "@stacks/transactions": "^6.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
EOF
  
  cat > "$DIR/.env.example" <<EOF
REACT_APP_${ENV_NAME}_CONTRACT_ADDRESS=SP000000000000000000000000000
EOF
  
  cat > "$DIR/src/App.tsx" <<'EOF'
import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { makeContractCall, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'CONTRACT_NAME_PLACEHOLDER';

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => setUserData(userData));
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: { name: 'CONTRACT_NAME_PLACEHOLDER', icon: window.location.origin + '/logo.png' },
      redirectTo: '/',
      onFinish: () => setUserData(userSession.loadUserData()),
      userSession,
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>CONTRACT_NAME_PLACEHOLDER</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Address: {userData.profile.stxAddress.mainnet}</p>
          <button onClick={() => userSession.signUserOut('/')}>Disconnect</button>
        </div>
      )}
    </div>
  );
}

export default App;
EOF

  sed -i '' "s/CONTRACT_NAME_PLACEHOLDER/${contract}/g" "$DIR/src/App.tsx"
  
  echo "✓ Created frontend for $contract"
done

echo ""
echo "✓ Generated ${#CONTRACTS[@]} frontends successfully"
