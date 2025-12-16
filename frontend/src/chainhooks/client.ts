import axios from 'axios';
import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';
import { 
  ChainhookPayload, 
  TokenTransferEvent, 
  TokenApprovalEvent, 
  ContractEvent,
  ChainhookInfo,
  ChainhooksList,
  FetchChainhooksOptions
} from './types';
import { ChainhookEventProcessor } from './processor';

export interface ChainhookClientOptions {
  baseUrl?: string;
  authToken?: string;
  enableWebSocket?: boolean;
  wsUrl?: string;
  apiKey?: string;
  network?: 'mainnet' | 'testnet';
}

export class ChainhookClient {
  private baseUrl: string;
  private authToken: string;
  private processor: ChainhookEventProcessor;
  private eventHandlers: Map<string, Function[]> = new Map();
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private isConnecting: boolean = false;
  private chainhooksClient: ChainhooksClient | null = null;

  constructor(options: ChainhookClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:20456';
    this.authToken = options.authToken || '';
    this.processor = new ChainhookEventProcessor();

    // Initialize Chainhooks SDK client if API key is provided
    if (options.apiKey) {
      const baseUrl = options.network === 'mainnet' 
        ? CHAINHOOKS_BASE_URL.mainnet 
        : CHAINHOOKS_BASE_URL.testnet;
      
      this.chainhooksClient = new ChainhooksClient({
        baseUrl,
        apiKey: options.apiKey
      });
    }

    if (options.enableWebSocket && options.wsUrl) {
      this.connectWebSocket(options.wsUrl);
    }
  }

  // Simple event emitter implementation
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  off(event: string, handler?: Function): void {
    if (!handler) {
      this.eventHandlers.delete(event);
    } else {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  /**
   * Register a chainhook specification
   */
  async registerChainhook(spec: any): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/chainhooks`,
        spec,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
          }
        }
      );
      
      console.log('Chainhook registered successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to register chainhook:', error);
      return false;
    }
  }

  /**
   * Remove a chainhook by UUID
   */
  async removeChainhook(uuid: string): Promise<boolean> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/v1/chainhooks/${uuid}`,
        {
          headers: {
            ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
          }
        }
      );
      
      console.log('Chainhook removed successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to remove chainhook:', error);
      return false;
    }
  }

  /**
   * List all registered chainhooks
   */
  async listChainhooks(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/chainhooks`,
        {
          headers: {
            ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
          }
        }
      );
      
      return response.data || [];
    } catch (error) {
      console.error('Failed to list chainhooks:', error);
      return [];
    }
  }

  /**
   * Process incoming webhook payload
   */
  processWebhookPayload(payload: ChainhookPayload): void {
    try {
      const { transfers, approvals, contractEvents } = this.processor.processPayload(payload);

      // Emit events for different types
      transfers.forEach(transfer => {
        this.emit('tokenTransfer', transfer);
        this.emit('event', { type: 'transfer', data: transfer });
      });

      approvals.forEach(approval => {
        this.emit('tokenApproval', approval);
        this.emit('event', { type: 'approval', data: approval });
      });

      contractEvents.forEach(event => {
        this.emit('contractEvent', event);
        this.emit('event', { type: 'contract', data: event });
      });

    } catch (error) {
      console.error('Error processing webhook payload:', error);
      this.emit('error', error);
    }
  }

  /**
   * Connect to WebSocket for real-time events
   */
  private connectWebSocket(wsUrl: string): void {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    
    try {
      this.ws = new window.WebSocket(wsUrl);

      this.ws.on('open', () => {
        console.log('Connected to Chainhook WebSocket');
        this.isConnecting = false;
        this.emit('connected');
      });

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as ChainhookPayload;
          this.processWebhookPayload(payload);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from Chainhook WebSocket');
        this.isConnecting = false;
        this.emit('disconnected');
        
        // Attempt to reconnect
        setTimeout(() => {
          if (!this.ws || this.ws.readyState === window.WebSocket.CLOSED) {
            this.connectWebSocket(wsUrl);
          }
        }, this.reconnectInterval);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
      this.emit('error', error);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get event processor instance for utility functions
   */
  getProcessor(): ChainhookEventProcessor {
    return this.processor;
  }

  /**
   * Fetch all chainhooks with pagination options
   */
  async getChainhooks(options?: FetchChainhooksOptions): Promise<ChainhooksList | null> {
    if (!this.chainhooksClient) {
      console.error('Chainhooks SDK client not initialized. Provide API key in constructor.');
      return null;
    }

    try {
      const result = await this.chainhooksClient.getChainhooks(options);
      console.log('Fetched chainhooks:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch chainhooks:', error);
      return null;
    }
  }

  /**
   * Fetch a specific chainhook by UUID
   */
  async getChainhook(uuid: string): Promise<ChainhookInfo | null> {
    if (!this.chainhooksClient) {
      console.error('Chainhooks SDK client not initialized. Provide API key in constructor.');
      return null;
    }

    try {
      const result = await this.chainhooksClient.getChainhook(uuid);
      console.log('Fetched chainhook:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch chainhook:', error);
      return null;
    }
  }

  /**
   * Check if Chainhooks SDK client is available
   */
  hasSDKClient(): boolean {
    return this.chainhooksClient !== null;
  }

  /**
   * Helper method to create a simple HTTP webhook handler
   */
  createWebhookHandler() {
    return (req: any, res: any) => {
      try {
        const payload = req.body as ChainhookPayload;
        this.processWebhookPayload(payload);
        res.status(200).json({ status: 'ok' });
      } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }
}