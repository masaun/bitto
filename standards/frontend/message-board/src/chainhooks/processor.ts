import { ChainhookPayload, TokenTransferEvent, TokenApprovalEvent, ContractEvent } from './types';

export class ChainhookEventProcessor {
  /**
   * Process incoming chainhook payload and extract relevant events
   */
  public processPayload(payload: ChainhookPayload): {
    transfers: TokenTransferEvent[];
    approvals: TokenApprovalEvent[];
    contractEvents: ContractEvent[];
  } {
    const transfers: TokenTransferEvent[] = [];
    const approvals: TokenApprovalEvent[] = [];
    const contractEvents: ContractEvent[] = [];

    // Process apply events (new blocks)
    if (payload.apply) {
      payload.apply.forEach((block) => {
        block.transactions.forEach((tx) => {
          if (tx.metadata.success) {
            tx.events.forEach((event, index) => {
              // Process fungible token events
              if (event.ft_event) {
                const ftEvent = event.ft_event;
                if (ftEvent.asset_identifier.includes('fungible-token')) {
                  const transferEvent: TokenTransferEvent = {
                    txId: tx.transaction_identifier.hash,
                    blockHeight: block.block_identifier.index,
                    timestamp: block.timestamp,
                    sender: ftEvent.sender || '',
                    recipient: ftEvent.recipient || '',
                    amount: ftEvent.amount,
                    eventType: this.mapFtEventType(ftEvent.action),
                    contractAddress: ftEvent.asset_identifier.split('::')[0]
                  };
                  transfers.push(transferEvent);
                }
              }

              // Process contract events (for approval events)
              if (event.contract_event) {
                const contractEvent = event.contract_event;
                if (contractEvent.contract_identifier.includes('fungible-token')) {
                  const eventData: ContractEvent = {
                    txId: tx.transaction_identifier.hash,
                    blockHeight: block.block_identifier.index,
                    timestamp: block.timestamp,
                    contractAddress: contractEvent.contract_identifier,
                    topic: contractEvent.topic,
                    value: contractEvent.value,
                    eventIndex: index
                  };

                  contractEvents.push(eventData);

                  // Check if this is an approval event
                  if (contractEvent.topic === 'print' && contractEvent.value?.type === 'approval') {
                    const approvalEvent: TokenApprovalEvent = {
                      txId: tx.transaction_identifier.hash,
                      blockHeight: block.block_identifier.index,
                      timestamp: block.timestamp,
                      owner: contractEvent.value.owner,
                      spender: contractEvent.value.spender,
                      amount: contractEvent.value.amount,
                      contractAddress: contractEvent.contract_identifier
                    };
                    approvals.push(approvalEvent);
                  }
                }
              }
            });
          }
        });
      });
    }

    return { transfers, approvals, contractEvents };
  }

  /**
   * Map fungible token event action to our event type
   */
  private mapFtEventType(action: string): 'transfer' | 'mint' | 'burn' {
    switch (action) {
      case 'mint':
        return 'mint';
      case 'burn':
        return 'burn';
      case 'transfer':
      default:
        return 'transfer';
    }
  }

  /**
   * Format amount for display (assuming 6 decimal places)
   */
  public formatAmount(amount: string, decimals: number = 6): string {
    const num = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const whole = num / divisor;
    const remainder = num % divisor;
    
    if (remainder === 0n) {
      return whole.toString();
    }
    
    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmed = remainderStr.replace(/0+$/, '');
    return `${whole}.${trimmed}`;
  }

  /**
   * Format address for display
   */
  public formatAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Format timestamp for display
   */
  public formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }
}