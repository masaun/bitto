# Frontend Applications

This directory contains 20 frontend applications for the Stacks smart contracts. Each frontend includes:

## Features

### Three Wallet Connection Methods
1. **Stacks Connect** (@stacks/connect)
2. **WalletKit SDK** (@walletconnect/web3wallet)
3. **Reown AppKit SDK** (@reown/appkit)

### Environment Configuration
- Uses Vite environment variables with `VITE_` prefix
- `VITE_WALLET_CONNECT_PROJECT_ID` - Your WalletConnect Project ID
- `VITE_{CONTRACT_NAME}_CONTRACT_ADDRESS` - Contract deployment address

### Contract Function Integration
Each frontend implements all public functions of its respective contract.

## Frontend Applications

1. **shared-ownership-nft** - Shared ownership NFT with collaborative decision-making
2. **expirable-token** - Tokens with expiration functionality
3. **ac-registry** - Access control registry system
4. **cappable-token** - Tokens with supply cap management
5. **ai-agent-nft** - NFTs for AI agent authorization
6. **expiration-nft** - NFTs with expiration dates
7. **designate-executor** - Digital will and executor designation
8. **non-addr-held-device-sig-verifier** - Device signature verification
9. **ai-agent-coordination** - Multi-agent coordination system
10. **sb-badge** - Soulbound badge tokens
11. **endorsement** - Digital endorsement system
12. **shareable-rights-nft** - NFTs with delegatable privileges
13. **sc-dependencies-registry** - Smart contract dependencies registry
14. **cap-tf-nft** - NFTs with transfer limits
15. **generic-services-factory** - Service instance factory
16. **acc-bounded-token** - Account-bound tokens
17. **real-estate-nft** - Real estate property NFTs
18. **cultural-historical-token** - Cultural heritage tokens
19. **interoperable-security-token** - Compliant security tokens
20. **rwa** - Real world asset tokens

## Getting Started

For each frontend:

1. Navigate to the frontend directory:
```bash
cd frontend/{contract-name}
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Edit `.env` and add your WalletConnect Project ID:
```
VITE_WALLET_CONNECT_PROJECT_ID=your_actual_project_id
VITE_{CONTRACT}_CONTRACT_ADDRESS=SP000000000000000000002Q6VF78.{contract-name}
```

4. Install dependencies:
```bash
npm install
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:3000

## Project Structure

Each frontend contains:
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite configuration (port 3000)
- `.gitignore` - Git exclusions
- `.env.example` - Environment variable template
- `index.html` - Application HTML structure
- `main.ts` - Application logic with wallet connections and contract functions

## Technology Stack

- **Vite** 5.0.0 - Build tool and dev server
- **TypeScript** 5.3.3 - Type-safe JavaScript
- **@stacks/connect** 7.8.2 - Stacks wallet connection
- **@stacks/transactions** 6.16.1 - Transaction building
- **@stacks/network** 6.16.0 - Network configuration
- **@walletconnect/web3wallet** 1.11.0 - WalletKit SDK
- **@reown/appkit** 1.0.0 - AppKit integration
- **@reown/appkit-adapter-stacks** 1.0.0 - Stacks adapter for AppKit

## Code Style

All code is written without comments, focusing on clear and self-documenting code structure.

## Environment Variables

All environment variables use the `VITE_` prefix as required by Vite for client-side environment variable exposure.
