import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { ChainhookClient } from './client';
import { 
  TokenTransferEvent, 
  TokenApprovalEvent, 
  ContractEvent,
  ChainhookInfo,
  ChainhooksList,
  FetchChainhooksOptions
} from './types';
import chainhookSpec from './fungible-token.chainhook.json';

interface ChainhookContextType {
  client: ChainhookClient | null;
  isConnected: boolean;
  recentTransfers: TokenTransferEvent[];
  recentApprovals: TokenApprovalEvent[];
  recentEvents: ContractEvent[];
  totalTransfers: number;
  totalVolume: bigint;
  registeredChainhooks: ChainhookInfo[];
  isLoading: boolean;
  registerChainhook: () => Promise<boolean>;
  fetchChainhooks: (options?: FetchChainhooksOptions) => Promise<ChainhooksList | null>;
  fetchChainhook: (uuid: string) => Promise<ChainhookInfo | null>;
  refreshChainhooks: () => Promise<void>;
  clearEvents: () => void;
}

const ChainhookContext = createContext<ChainhookContextType | undefined>(undefined);

export const useChainhook = (): ChainhookContextType => {
  const context = useContext(ChainhookContext);
  if (!context) {
    throw new Error('useChainhook must be used within a ChainhookProvider');
  }
  return context;
};

interface ChainhookProviderProps {
  children: ReactNode;
  maxRecentEvents?: number;
}

export const ChainhookProvider: React.FC<ChainhookProviderProps> = ({ 
  children, 
  maxRecentEvents = 50 
}) => {
  const [client, setClient] = useState<ChainhookClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [recentTransfers, setRecentTransfers] = useState<TokenTransferEvent[]>([]);
  const [recentApprovals, setRecentApprovals] = useState<TokenApprovalEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<ContractEvent[]>([]);
  const [totalTransfers, setTotalTransfers] = useState(0);
  const [totalVolume, setTotalVolume] = useState<bigint>(0n);
  const [registeredChainhooks, setRegisteredChainhooks] = useState<ChainhookInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize chainhook client
  useEffect(() => {
    const chainhookClient = new ChainhookClient({
      baseUrl: 'http://localhost:20456',
      enableWebSocket: false, // For now, we'll use HTTP webhooks
      authToken: 'fungible-token-webhook',
      apiKey: process.env.REACT_APP_HIRO_API_KEY, // Optional: for SDK features
      network: 'testnet'
    });

    // Set up event listeners
    chainhookClient.on('connected', () => {
      console.log('Chainhook client connected');
      setIsConnected(true);
    });

    chainhookClient.on('disconnected', () => {
      console.log('Chainhook client disconnected');
      setIsConnected(false);
    });

    chainhookClient.on('tokenTransfer', (transfer: TokenTransferEvent) => {
      console.log('New token transfer:', transfer);
      
      setRecentTransfers(prev => {
        const updated = [transfer, ...prev].slice(0, maxRecentEvents);
        return updated;
      });
      
      setTotalTransfers(prev => prev + 1);
      
      // Update volume (only for transfers, not mint/burn)
      if (transfer.eventType === 'transfer' && transfer.amount) {
        setTotalVolume(prev => prev + BigInt(transfer.amount));
      }
    });

    chainhookClient.on('tokenApproval', (approval: TokenApprovalEvent) => {
      console.log('New token approval:', approval);
      
      setRecentApprovals(prev => {
        const updated = [approval, ...prev].slice(0, maxRecentEvents);
        return updated;
      });
    });

    chainhookClient.on('contractEvent', (event: ContractEvent) => {
      console.log('New contract event:', event);
      
      setRecentEvents(prev => {
        const updated = [event, ...prev].slice(0, maxRecentEvents);
        return updated;
      });
    });

    chainhookClient.on('error', (error: any) => {
      console.error('Chainhook client error:', error);
    });

    setClient(chainhookClient);

    return () => {
      chainhookClient.disconnect();
    };
  }, [maxRecentEvents]);

  const registerChainhook = useCallback(async (): Promise<boolean> => {
    if (!client) {
      console.error('Chainhook client not initialized');
      return false;
    }

    try {
      const success = await client.registerChainhook(chainhookSpec);
      if (success) {
        console.log('Chainhook registered successfully');
        // In a real implementation, you might want to set isConnected based on actual connection status
        setIsConnected(true);
      }
      return success;
    } catch (error) {
      console.error('Failed to register chainhook:', error);
      return false;
    }
  }, [client]);

  const fetchChainhooks = useCallback(async (options?: FetchChainhooksOptions): Promise<ChainhooksList | null> => {
    if (!client) return null;
    
    setIsLoading(true);
    try {
      const result = await client.getChainhooks(options);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const fetchChainhook = useCallback(async (uuid: string): Promise<ChainhookInfo | null> => {
    if (!client) return null;
    
    setIsLoading(true);
    try {
      const result = await client.getChainhook(uuid);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const refreshChainhooks = useCallback(async (): Promise<void> => {
    if (!client) return;
    
    setIsLoading(true);
    try {
      const result = await client.getChainhooks();
      if (result) {
        setRegisteredChainhooks(result.results);
      }
    } catch (error) {
      console.error('Failed to refresh chainhooks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const clearEvents = useCallback(() => {
    setRecentTransfers([]);
    setRecentApprovals([]);
    setRecentEvents([]);
    setTotalTransfers(0);
    setTotalVolume(0n);
    setRegisteredChainhooks([]);
  }, []);

  const contextValue: ChainhookContextType = {
    client,
    isConnected,
    recentTransfers,
    recentApprovals,
    recentEvents,
    totalTransfers,
    totalVolume,
    registeredChainhooks,
    isLoading,
    registerChainhook,
    fetchChainhooks,
    fetchChainhook,
    refreshChainhooks,
    clearEvents
  };

  return (
    <ChainhookContext.Provider value={contextValue}>
      {children}
    </ChainhookContext.Provider>
  );
};