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