# Stacks Contracts Frontend - Next.js

A comprehensive Next.js frontend for interacting with 2400+ Stacks smart contracts organized across 8 categories.

## Project Structure

```
app/
├── layout.tsx               # Root layout with navigation
├── page.tsx                 # Home page with category overview
├── contracts/
│   ├── page.tsx             # All contracts dashboard
│   ├── [category]/          # Category pages (auction, treasury, governance, etc.)
│   │   ├── page.tsx         # Category overview
│   │   └── [contract]/      # Individual contract pages (2400+ pages)
│   │       └── page.tsx     # Contract interaction UI
│   └── api/
│       └── contracts/       # API routes for contract interactions
lib/
├── stacks.ts                # Stacks network utilities
```

## Contract Categories

- **Auction** (300) - Sealed-bid, Dutch, English, and other auction types
- **Treasury** (300) - Capital management, funds, and vaults
- **Governance** (300) - DAOs, voting systems, and policy enforcement
- **API** (300) - Integration gateways and routers
- **Automation** (300) - Workflow engines and task schedulers
- **Compliance** (300) - KYC, AML, and regulatory monitoring
- **OTC** (300) - Over-the-counter trading and settlement
- **Revenue** (300) - Distribution pools and fee managers

## Getting Started

### Installation

```bash
cd frontend-nextjs
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Build for Production

```bash
npm run build
npm start
```

## Configuration

Create a `.env.local` file with required environment variables:

```
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_APP_NAME=Stacks Contracts
STACKS_API_URL=https://api.testnet.hiro.so
```

For each contract, add its deployed address:

```
NEXT_PUBLIC_AUCTION_HOUSE_ADDRESS=STX...
NEXT_PUBLIC_TREASURY_MANAGER_ADDRESS=STX...
...
```

## Features

- **Contract Browser** - Browse all 2400 contracts organized by category
- **Interactive UI** - Execute contract functions directly from the browser
- **Stacks Integration** - Full integration with @stacks/connect for wallet interactions
- **TypeScript** - Full type safety with TypeScript support
- **Responsive Design** - Mobile-friendly interface
- **Real-time Updates** - Live interaction with contract state

## Technical Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Inline CSS with responsive grid layouts
- **Blockchain**: Stacks (@stacks/connect, @stacks/transactions)
- **Network**: Testnet (configurable to mainnet)

## Usage

1. Open the application homepage
2. Select a category (Auction, Treasury, Governance, etc.)
3. Browse and click on a contract
4. Use the interactive buttons to:
   - **Initialize** - Set up the contract
   - **Execute** - Run contract functions
   - **Query** - Get contract state
   - **Settle** - Finalize operations

## API Routes

Each contract has corresponding API routes for server-side interactions:

```
/api/contracts/[category]/[contract]/initialize
/api/contracts/[category]/[contract]/execute
/api/contracts/[category]/[contract]/query
/api/contracts/[category]/[contract]/settle
```

## Contract Functions

All contracts expose 7 standard functions:

- `initialize()` - Initialize contract state
- `place-bid(amount)` - Execute primary action
- `settle-auction()` - Settle operations
- `get-bid-count()` - Query count
- `get-total-volume()` - Query volume
- `cancel-auction()` - Cancel operations
- `query-auction-info()` - Get full state

## Security

- All wallet interactions use @stacks/connect for secure signing
- Transactions are posted to the Stacks blockchain directly
- No private keys are exposed in the frontend
- Environment variables for sensitive configuration

## License

MIT

## Support

For issues or questions about the Stacks blockchain, visit:
- https://docs.stacks.co
- https://discord.com/invite/zrvWB897XN
