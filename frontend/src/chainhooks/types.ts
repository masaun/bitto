// Chainhook types and interfaces
export interface ChainhookEvent {
  event_index: number;
  event_type: string;
  contract_event?: {
    contract_identifier: string;
    topic: string;
    value: any;
  };
  ft_event?: {
    asset_identifier: string;
    action: string;
    sender?: string;
    recipient?: string;
    amount: string;
  };
  nft_event?: {
    asset_identifier: string;
    action: string;
    sender?: string;
    recipient?: string;
    value: any;
  };
}

export interface ChainhookPayload {
  apply: Array<{
    block_identifier: {
      index: number;
      hash: string;
    };
    parent_block_identifier: {
      index: number;
      hash: string;
    };
    timestamp: number;
    transactions: Array<{
      transaction_identifier: {
        hash: string;
      };
      operations: any[];
      events: ChainhookEvent[];
      metadata: {
        success: boolean;
        result?: string;
        description?: string;
      };
    }>;
    metadata: any;
  }>;
  rollback?: Array<{
    block_identifier: {
      index: number;
      hash: string;
    };
  }>;
}

export interface TokenTransferEvent {
  txId: string;
  blockHeight: number;
  timestamp: number;
  sender: string;
  recipient: string;
  amount: string;
  eventType: 'transfer' | 'mint' | 'burn';
  contractAddress: string;
}

export interface TokenApprovalEvent {
  txId: string;
  blockHeight: number;
  timestamp: number;
  owner: string;
  spender: string;
  amount: string;
  contractAddress: string;
}

export interface ContractEvent {
  txId: string;
  blockHeight: number;
  timestamp: number;
  contractAddress: string;
  topic: string;
  value: any;
  eventIndex: number;
}

export interface ChainhookInfo {
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

export interface ChainhooksList {
  total: number;
  results: ChainhookInfo[];
  limit: number;
  offset: number;
}

export interface FetchChainhooksOptions {
  limit?: number;
  offset?: number;
}