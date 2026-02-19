# Frontend Implementations for Business Use Cases 2

This directory contains **312 complete frontend implementations** for all Clarity smart contracts in the business-use-cases-2 project.

## 📁 Structure

Each contract has its own frontend directory with a complete React + TypeScript application:

```
frontend/
├── conditional-payment-registry/
│   ├── index.html          # HTML entry point
│   ├── index.tsx           # React root with Connect provider
│   ├── App.tsx             # Main application component
│   ├── package.json        # Dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   ├── .env                # Environment variables
│   └── .gitignore          # Git ignore rules
├── payment-condition-engine/
│   ├── ...
└── [298 more frontends]
```

## 🚀 Quick Start

### 1. Navigate to a Contract Frontend

```bash
cd frontend/conditional-payment-registry
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Contract Address

Edit the `.env` file and add your deployed contract address:

```env
REACT_APP_CONDITIONAL_PAYMENT_REGISTRY_CONTRACT_ADDRESS=SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.conditional-payment-registry
```

### 4. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## 🛠️ Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 📦 Features

Each frontend implementation includes:

### ✅ Wallet Connection
- Connect/disconnect Stacks wallet using Hiro Wallet or Leather
- Display connected wallet address
- Automatic session management

### ✅ Contract Interaction
- **Register Entry**: Call the `register` function to create new entries
- **Get Entry**: Read-only function to retrieve entries by ID
- Transaction broadcasting to Stacks mainnet
- Real-time transaction status

### ✅ User Interface
- Clean, responsive design
- Form validation
- Loading states
- Error handling
- Transaction ID with Explorer link
- Result display with formatted JSON

## 📚 Available Scripts

In each frontend directory:

| Command | Description |
|---------|-------------|
| `npm start` | Runs development server on port 3000 |
| `npm build` | Creates production build |
| `npm test` | Runs test suite |
| `npm eject` | Ejects from Create React App (⚠️ irreversible) |

## 🔧 Technology Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **@stacks/connect 7.0** - Wallet connection
- **@stacks/connect-react 20.0** - React integration
- **@stacks/transactions 6.0** - Transaction building
- **@stacks/network 6.0** - Network configuration
- **react-scripts 5.0** - Build tooling

## 📝 Contract Standards

All contracts follow a standardized registry pattern:

```clarity
(define-map {contract}_registry uint {creator: principal, data: (string-ascii 256), timestamp: uint})
(define-data-var {contract}_nonce uint u0)
(define-read-only (get-entry (id uint)) ...)
(define-public (register (data (string-ascii 256))) ...)
```

## 🌐 Network Configuration

Frontends are configured for **Stacks mainnet** by default.

To switch to testnet, modify the network in `App.tsx`:

```typescript
import { StacksTestnet } from '@stacks/network';

// Replace StacksMainnet with StacksTestnet
network: new StacksTestnet(),
```

## 🔐 Environment Variables

Each frontend uses specific environment variables:

| Contract | Environment Variable |
|----------|---------------------|
| conditional-payment-registry | `REACT_APP_CONDITIONAL_PAYMENT_REGISTRY_CONTRACT_ADDRESS` |
| payment-condition-engine | `REACT_APP_PAYMENT_CONDITION_ENGINE_CONTRACT_ADDRESS` |
| escrow-vault | `REACT_APP_ESCROW_VAULT_CONTRACT_ADDRESS` |
| ... | ... |

The variable naming convention is:
```
REACT_APP_{CONTRACT_NAME_IN_UPPER_SNAKE_CASE}_CONTRACT_ADDRESS
```

## 🎨 Customization

### Styling

Each App.tsx uses inline styles for simplicity. To customize:

1. Add a CSS file (e.g., `App.css`)
2. Import it in `App.tsx`
3. Replace inline styles with class names

### Branding

Update the app details in `App.tsx`:

```typescript
appDetails: {
  name: 'Your App Name',
  icon: window.location.origin + '/your-logo.png',
}
```

## 🧪 Testing

To run tests for a specific frontend:

```bash
cd frontend/your-contract-name
npm test
```

## 🚀 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
cd frontend/your-contract-name
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
cd frontend/your-contract-name
npm run build
netlify deploy --prod --dir=build
```

### Deploy to GitHub Pages

1. Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/your-repo-name"
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add deploy scripts:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

4. Deploy:
```bash
npm run deploy
```

## 📖 API Reference

### Contract Functions

#### `register(data: string-ascii)`
- **Type**: Public
- **Description**: Registers a new entry with provided data
- **Parameters**: 
  - `data`: ASCII string (max 256 characters)
- **Returns**: Entry ID (uint)

#### `get-entry(id: uint)`
- **Type**: Read-only
- **Description**: Retrieves entry data by ID
- **Parameters**:
  - `id`: Entry ID (uint)
- **Returns**: Entry data or none

## 🐛 Troubleshooting

### "Contract not found" error
- Ensure the contract is deployed to mainnet
- Verify the contract address in `.env` is correct
- Check that the contract name matches exactly

### Wallet not connecting
- Ensure you have Hiro Wallet or Leather extension installed
- Check that you're on the correct network (mainnet/testnet)
- Try clearing browser cache and reconnecting

### Transaction failing
- Verify you have sufficient STX in your wallet
- Check that the input data is valid (max 256 characters)
- Ensure the contract is deployed and accessible

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check Stacks documentation: https://docs.stacks.co
- Join Stacks Discord: https://discord.gg/stacks

---

**Generated**: February 11, 2026  
**Total Frontends**: 312  
**Clarity Version**: 4  
**Network**: Stacks Mainnet
