#!/bin/bash

CONTRACTS=(
  "pro-football-ticketing:3009"
  "pro-basketball-ticketing:3010"
  "semiconductor-manufacturing:3011"
  "semiconductor-design-process:3012"
  "wafer-fabrication-process:3013"
  "chip-atp-process:3014"
  "battery-electric-bus-production:3015"
  "lithium-battery-monitoring:3016"
  "humanoid-robot-production:3017"
  "robotics-oem:3018"
  "robotics-data-sharing:3019"
  "robot-deployment-planing-system:3020"
  "robot-supply-chain-network:3021"
  "robot-maintainance-automation:3022"
  "home-battery-storage:3023"
  "aircraft-assembly-process:3024"
  "tokenized-artwork-exchange:3025"
  "sports-player-ip-mgmt:3026"
  "tokenized-sports-club:3027"
  "onchain-kyb:3028"
  "onchain-kyt:3029"
)

for CONTRACT_PORT in "${CONTRACTS[@]}"; do
  CONTRACT="${CONTRACT_PORT%:*}"
  PORT="${CONTRACT_PORT#*:}"
  DIR="/Users/unomasanori/Projects/Talent-Rewards/Stacks-rewards/bitto/business-use-cases/frontend/$CONTRACT"
  
  cat > "$DIR/.gitignore" << 'EOF'
.next
node_modules
.env
.env.local
.env.production
.env.development
out
dist
build
EOF

  cat > "$DIR/next.config.js" << 'EOF'
module.exports = {
  reactStrictMode: true,
}
EOF

  cat > "$DIR/package.json" << EOF
{
  "name": "$CONTRACT-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p $PORT",
    "build": "next build",
    "start": "next start -p $PORT"
  },
  "dependencies": {
    "@stacks/connect": "^7.8.2",
    "@stacks/transactions": "^6.13.0",
    "@stacks/network": "^6.13.0",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@types/react": "^18.2.48",
    "@types/node": "^20.11.5",
    "@types/react-dom": "^18.2.18"
  }
}
EOF

  cat > "$DIR/tsconfig.json" << 'EOF'
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
EOF

  echo "✓ Created config files for $CONTRACT"
done

echo ""
echo "All configuration files created successfully!"
