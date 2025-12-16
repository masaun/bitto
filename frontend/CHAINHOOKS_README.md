# Chainhooks SDK Integration

This implementation provides comprehensive Chainhooks functionality following the Hiro documentation at https://docs.hiro.so/en/tools/chainhooks/fetch.

## Features

### 1. Fetch Chainhooks
- **getChainhooks()** - Fetch all chainhooks with pagination
- **getChainhook(uuid)** - Fetch specific chainhook by UUID
- Pagination support with limit and offset options
- Real-time loading states and error handling

### 2. Event Monitoring
- Real-time token transfer events
- Token approval events  
- Contract events tracking
- WebSocket support for live updates

### 3. Dashboard Interface
- Tabbed interface for events and management
- Interactive chainhook browser with search
- Detailed chainhook information display
- Pagination controls for large datasets

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Key** (optional but recommended):
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your Hiro API key
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

## Usage

### Basic Fetching
```javascript
import { ChainhookClient } from './chainhooks';

const client = new ChainhookClient({
  apiKey: 'your_hiro_api_key',
  network: 'testnet'
});

// Fetch all chainhooks
const chainhooks = await client.getChainhooks();
console.log('Total:', chainhooks.total);
console.log('Results:', chainhooks.results);

// Fetch with pagination
const paginated = await client.getChainhooks({
  limit: 50,
  offset: 100
});

// Fetch specific chainhook
const chainhook = await client.getChainhook('uuid-here');
```

### Using React Hook
```javascript
import { useChainhook } from './chainhooks';

function MyComponent() {
  const { 
    fetchChainhooks, 
    fetchChainhook, 
    isLoading,
    registeredChainhooks 
  } = useChainhook();

  const handleFetch = async () => {
    const result = await fetchChainhooks({ limit: 20 });
    if (result) {
      console.log('Fetched:', result.results);
    }
  };
}
```

## API Reference

### ChainhookClient Options
```typescript
interface ChainhookClientOptions {
  baseUrl?: string;           // Local chainhook server URL
  authToken?: string;         // Local server auth token  
  enableWebSocket?: boolean;  // Enable WebSocket connection
  wsUrl?: string;            // WebSocket URL
  apiKey?: string;           // Hiro API key for SDK
  network?: 'mainnet' | 'testnet'; // Network selection
}
```

### Fetch Options
```typescript
interface FetchChainhooksOptions {
  limit?: number;   // Number of results per page (default: 20)
  offset?: number;  // Starting position (default: 0)
}
```

### Chainhook Information
```typescript
interface ChainhookInfo {
  uuid: string;
  name: string;
  version: number;
  networks: {
    [key: string]: {
      enabled: boolean;
      start_block?: number;
      end_block?: number;
      predicate: any;
      action: any;
    };
  };
  created_at?: string;
  updated_at?: string;
  status?: string;
}
```

## Environment Variables

Create a `.env.local` file with:

```bash
# Required for SDK functionality
REACT_APP_HIRO_API_KEY=your_api_key_here

# Optional configuration
REACT_APP_CHAINHOOK_BASE_URL=http://localhost:20456
REACT_APP_CHAINHOOK_AUTH_TOKEN=your_token_here  
REACT_APP_NETWORK=testnet
```

## Components

### ChainhookDashboard
Main dashboard with tabbed interface for events monitoring and chainhook management.

### ChainhookManager  
Dedicated component for fetching and managing chainhooks:
- Paginated chainhook listing
- UUID-based search
- Detailed chainhook information
- Network status display

### ChainhookProvider
React context provider that wraps the application and provides chainhook functionality.

## Error Handling

The implementation includes comprehensive error handling:
- Network request failures
- Invalid API keys  
- Missing chainhooks
- Pagination boundaries
- WebSocket connection issues

## Without API Key

The components will show helpful warnings and instructions if no API key is configured, allowing users to still use local chainhook server functionality.

## Next Steps

- Set up webhook endpoints for real-time events
- Configure chainhook predicates for specific contract monitoring
- Implement chainhook creation and modification features
- Add authentication for production deployments