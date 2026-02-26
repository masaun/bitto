# Next.js Stacks Contracts Frontend - Quick Start Guide

## Installation

```bash
cd frontend-nextjs
npm install
```

## Environment Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your contract addresses and configuration.

## Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Files

### Core Application
- `app/page.tsx` - Home page showing categories
- `app/layout.tsx` - Root layout with navigation
- `app/contracts/[category]/page.tsx` - Category page showing all contracts
- `app/contracts/[category]/[contract]/page.tsx` - Individual contract UI (2400 pages)

### API Routes
- `app/api/contracts/[category]/[contract]/route.ts` - Contract API endpoints (3866 routes)

### Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `.env.local.example` - Environment variables template
- `lib/stacks.ts` - Stacks blockchain utilities

### Documentation
- `README.md` - Full documentation

## Features

- **2400+ Contract Pages** - Interactive UI for all contracts
- **8 Categories** - Auction, Treasury, Governance, API, Automation, Compliance, OTC, Revenue
- **Stacks Integration** - @stacks/connect wallet integration
- **TypeScript** - Full type safety
- **API Routes** - Server-side contract interaction endpoints
- **Responsive Design** - Mobile-friendly UI

## Contract Interaction

Each contract page provides:
1. **Initialize** - Set up contract state
2. **Execute** - Run contract functions  
3. **Query** - Get contract state
4. **Settle** - Finalize operations

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Clear Next.js cache
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Check Stacks network
Verify `NEXT_PUBLIC_STACKS_NETWORK` is set to `testnet` or `mainnet`

## Architecture

```
frontend-nextjs/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── contracts/
│   │   ├── page.tsx            # All categories overview
│   │   ├── [category]/
│   │   │   ├── page.tsx        # Category page
│   │   │   └── [contract]/
│   │   │       └── page.tsx    # Contract page (×3866)
│   │   └── api/
│   │       └── contracts/
│   │           └── [category]/
│   │               └── [contract]/
│   │                   └── route.ts  # API endpoint (×3866)
│   └── layout.tsx
├── lib/
│   └── stacks.ts               # Stacks utilities
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md

```

## Next.js App Router

This project uses Next.js 14 App Router (not Pages Router):
- Routes based on file structure in `app/` directory
- `page.tsx` files render at URL paths
- `route.ts` files handle API requests
- Dynamic routes with `[param]` syntax

## Performance Optimization

- Automatic code splitting
- Image optimization
- CSS-in-JS optimization
- Fast refresh during development
- Production bundle analysis: `npm run build -- --analyze`

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Stacks Documentation](https://docs.stacks.co)
- [Stacks Discord Community](https://discord.com/invite/zrvWB897XN)
