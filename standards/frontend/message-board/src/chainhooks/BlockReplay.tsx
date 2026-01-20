import React, { useState, useEffect } from 'react';
import { useChainhook } from './provider';
import { ChainhookInfo, BlockReplayParams, ChainhookPayload } from './types';

export const BlockReplay: React.FC = () => {
  const { client } = useChainhook();
  const [chainhooks, setChainhooks] = useState<ChainhookInfo[]>([]);
  const [selectedChainhook, setSelectedChainhook] = useState<string>('');
  const [blockHeight, setBlockHeight] = useState<string>('');
  const [blockHash, setBlockHash] = useState<string>('');
  const [replayMethod, setReplayMethod] = useState<'height' | 'hash'>('height');
  const [replayResult, setReplayResult] = useState<ChainhookPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchChainhooks = async () => {
      if (!client) return;
      
      try {
        const result = await client.getChainhooks({ limit: 100 });
        if (result) {
          setChainhooks(result.results);
        }
      } catch (err) {
        console.error('Failed to fetch chainhooks:', err);
      }
    };

    fetchChainhooks();
  }, [client]);

  const handleReplayBlock = async () => {
    if (!client || !selectedChainhook) {
      setError('Please select a chainhook');
      return;
    }

    const params: BlockReplayParams = {};
    
    if (replayMethod === 'height') {
      if (!blockHeight || isNaN(Number(blockHeight))) {
        setError('Please enter a valid block height');
        return;
      }
      params.block_height = Number(blockHeight);
    } else {
      if (!blockHash) {
        setError('Please enter a block hash');
        return;
      }
      params.index_block_hash = blockHash;
    }

    setIsLoading(true);
    setError('');
    setReplayResult(null);

    try {
      const result = await client.replayBlock(selectedChainhook, params);
      setReplayResult(result);
    } catch (err) {
      console.error('Block replay failed:', err);
      setError('Block replay failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatResult = (result: ChainhookPayload) => {
    return JSON.stringify(result, null, 2);
  };

  return (
    <div className="block-replay">
      <div className="block-replay-header">
        <h3>Replay a Block</h3>
        <p>Evaluate a chainhook against a specific historical block to test or reprocess data.</p>
      </div>

      <div className="block-replay-form">
        <div className="form-group">
          <label htmlFor="chainhook-select">Select Chainhook:</label>
          <select
            id="chainhook-select"
            value={selectedChainhook}
            onChange={(e) => setSelectedChainhook(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Choose a chainhook...</option>
            {chainhooks.map((chainhook) => (
              <option key={chainhook.uuid} value={chainhook.uuid}>
                {chainhook.name} ({chainhook.uuid})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Replay Method:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="height"
                checked={replayMethod === 'height'}
                onChange={(e) => setReplayMethod(e.target.value as 'height')}
                disabled={isLoading}
              />
              By Block Height
            </label>
            <label>
              <input
                type="radio"
                value="hash"
                checked={replayMethod === 'hash'}
                onChange={(e) => setReplayMethod(e.target.value as 'hash')}
                disabled={isLoading}
              />
              By Block Hash
            </label>
          </div>
        </div>

        {replayMethod === 'height' ? (
          <div className="form-group">
            <label htmlFor="block-height">Block Height:</label>
            <input
              id="block-height"
              type="number"
              value={blockHeight}
              onChange={(e) => setBlockHeight(e.target.value)}
              placeholder="e.g., 100000"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="block-hash">Block Hash:</label>
            <input
              id="block-hash"
              type="text"
              value={blockHash}
              onChange={(e) => setBlockHash(e.target.value)}
              placeholder="e.g., 0x1a2b3c4d..."
              disabled={isLoading}
            />
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleReplayBlock}
          disabled={isLoading || !selectedChainhook}
          className="replay-button"
        >
          {isLoading ? 'Replaying...' : 'Replay Block'}
        </button>
      </div>

      {replayResult && (
        <div className="replay-result">
          <h4>Replay Result:</h4>
          <div className="result-summary">
            <p>
              <strong>Blocks Applied:</strong> {replayResult.apply?.length || 0}
            </p>
            {replayResult.rollback && (
              <p>
                <strong>Blocks Rolled Back:</strong> {replayResult.rollback.length}
              </p>
            )}
            {replayResult.apply && replayResult.apply.length > 0 && (
              <p>
                <strong>Total Transactions:</strong>{' '}
                {replayResult.apply.reduce((sum, block) => sum + block.transactions.length, 0)}
              </p>
            )}
          </div>
          
          <details className="result-details">
            <summary>View Full Result (JSON)</summary>
            <pre className="result-json">
              {formatResult(replayResult)}
            </pre>
          </details>
        </div>
      )}

      <div className="block-replay-help">
        <h4>About Block Replay</h4>
        <p>
          Block replay allows you to test your chainhooks against historical blocks. This is useful for:
        </p>
        <ul>
          <li>Testing chainhook logic against known block data</li>
          <li>Debugging chainhook configurations</li>
          <li>Re-processing historical events after chainhook updates</li>
          <li>Validating chainhook behavior before deployment</li>
        </ul>
        <p>
          You can replay by either block height (e.g., 100000) or block hash. The result will show
          what events your chainhook would have detected in that specific block.
        </p>
      </div>
    </div>
  );
};