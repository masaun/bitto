// Example usage of the Block Replay functionality

import { ChainhookClient, BlockReplayParams } from './chainhooks';

/**
 * Example 1: Replay block by height
 */
async function replayBlockByHeight() {
  // Initialize the client (you'll need to provide your API key)
  const client = new ChainhookClient({
    chainhooksApiKey: 'your-api-key-here'
  });

  // Parameters to replay block 100000
  const params: BlockReplayParams = {
    block_height: 100000
  };

  try {
    const result = await client.replayBlock('your-chainhook-uuid', params);
    
    if (result) {
      console.log('Block replay successful!');
      console.log('Blocks applied:', result.apply?.length || 0);
      
      // Process the results
      result.apply?.forEach((block, index) => {
        console.log(`Block ${index + 1}:`, {
          blockIndex: block.block_identifier.index,
          blockHash: block.block_identifier.hash,
          transactionCount: block.transactions.length,
          timestamp: new Date(block.timestamp * 1000).toISOString()
        });

        // Check for events in each transaction
        block.transactions.forEach((tx) => {
          if (tx.events.length > 0) {
            console.log(`  Transaction ${tx.transaction_identifier.hash}:`, tx.events);
          }
        });
      });
    } else {
      console.error('Block replay failed');
    }
  } catch (error) {
    console.error('Error during block replay:', error);
  }
}

/**
 * Example 2: Replay block by hash
 */
async function replayBlockByHash() {
  const client = new ChainhookClient({
    chainhooksApiKey: 'your-api-key-here'
  });

  const params: BlockReplayParams = {
    index_block_hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890'
  };

  try {
    const result = await client.replayBlock('your-chainhook-uuid', params);
    
    if (result) {
      console.log('Block replay by hash successful!');
      // Process results as needed...
    }
  } catch (error) {
    console.error('Error during block replay by hash:', error);
  }
}

/**
 * Example 3: Using with React component
 */
import React, { useState } from 'react';
import { useChainhook } from './chainhooks/provider';

export const SimpleBlockReplay: React.FC = () => {
  const { client } = useChainhook();
  const [blockHeight, setBlockHeight] = useState('');
  const [chainhookUuid, setChainhookUuid] = useState('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReplay = async () => {
    if (!client || !blockHeight || !chainhookUuid) return;

    setIsLoading(true);
    try {
      const replayResult = await client.replayBlock(chainhookUuid, {
        block_height: parseInt(blockHeight)
      });
      
      setResult(JSON.stringify(replayResult, null, 2));
    } catch (error) {
      console.error('Replay failed:', error);
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Simple Block Replay</h3>
      <div>
        <input
          type="text"
          placeholder="Chainhook UUID"
          value={chainhookUuid}
          onChange={(e) => setChainhookUuid(e.target.value)}
        />
        <input
          type="number"
          placeholder="Block Height"
          value={blockHeight}
          onChange={(e) => setBlockHeight(e.target.value)}
        />
        <button onClick={handleReplay} disabled={isLoading}>
          {isLoading ? 'Replaying...' : 'Replay Block'}
        </button>
      </div>
      
      {result && (
        <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
          {result}
        </pre>
      )}
    </div>
  );
};

export { replayBlockByHeight, replayBlockByHash, SimpleBlockReplay };