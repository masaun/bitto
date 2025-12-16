import React, { useState } from 'react';
import { useChainhook } from './provider';

export const ChainhookEditExamples: React.FC = () => {
  const { 
    updateChainhook, 
    addEventFilter, 
    updateWebhookUrl, 
    fetchChainhookWithDefinition,
    client,
    isLoading 
  } = useChainhook();

  const [exampleUuid, setExampleUuid] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)]);
  };

  const hasSDKClient = client?.hasSDKClient() || false;

  // Example 1: Basic Update
  const handleBasicUpdate = async () => {
    if (!exampleUuid) {
      addResult('❌ Please enter a chainhook UUID');
      return;
    }

    const result = await updateChainhook(exampleUuid, {
      name: 'Updated Chainhook Name',
      options: {
        decode_clarity_values: true
      }
    });

    if (result) {
      addResult('✅ Basic update successful');
    } else {
      addResult('❌ Basic update failed');
    }
  };

  // Example 2: Add Event Filter (Preserving Existing)
  const handleAddEventFilter = async () => {
    if (!exampleUuid) {
      addResult('❌ Please enter a chainhook UUID');
      return;
    }

    const result = await addEventFilter(exampleUuid, {
      type: 'ft_transfer',
      asset_identifier: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.usda-token::usda'
    });

    if (result) {
      addResult('✅ Event filter added successfully');
    } else {
      addResult('❌ Failed to add event filter');
    }
  };

  // Example 3: Update Webhook URL
  const handleUpdateWebhook = async () => {
    if (!exampleUuid) {
      addResult('❌ Please enter a chainhook UUID');
      return;
    }

    const result = await updateWebhookUrl(
      exampleUuid, 
      'https://new-webhook-url.com/events',
      'Bearer new-auth-token'
    );

    if (result) {
      addResult('✅ Webhook URL updated successfully');
    } else {
      addResult('❌ Failed to update webhook URL');
    }
  };

  // Example 4: Multiple Field Update
  const handleMultipleFieldUpdate = async () => {
    if (!exampleUuid) {
      addResult('❌ Please enter a chainhook UUID');
      return;
    }

    // First fetch current definition
    const current = await fetchChainhookWithDefinition(exampleUuid);
    if (!current) {
      addResult('❌ Could not fetch current chainhook');
      return;
    }

    // Update multiple fields
    const result = await updateChainhook(exampleUuid, {
      name: 'Multi-field Updated Chainhook',
      filters: {
        events: [
          ...(current.definition.filters.events || []),
          {
            type: 'stx_transfer',
            sender: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR'
          }
        ]
      },
      action: {
        type: 'http_post',
        url: 'https://updated-webhook.com/events',
        authorization_header: 'Bearer updated-token'
      },
      options: {
        decode_clarity_values: true,
        include_contract_abi: true,
        max_batch_size: 50
      }
    });

    if (result) {
      addResult('✅ Multiple fields updated successfully');
    } else {
      addResult('❌ Failed to update multiple fields');
    }
  };

  // Example 5: Safe Filter Addition (Best Practice)
  const handleSafeFilterAddition = async () => {
    if (!exampleUuid) {
      addResult('❌ Please enter a chainhook UUID');
      return;
    }

    try {
      // ✅ Good: Fetch first
      const current = await fetchChainhookWithDefinition(exampleUuid);
      if (!current) {
        addResult('❌ Could not fetch current definition');
        return;
      }

      const result = await updateChainhook(exampleUuid, {
        filters: {
          events: [
            ...(current.definition.filters.events || []),
            { type: 'contract_call', contract_identifier: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.counter' }
          ]
        }
      });

      if (result) {
        addResult('✅ Safe filter addition successful');
      } else {
        addResult('❌ Safe filter addition failed');
      }
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  };

  if (!hasSDKClient) {
    return (
      <div className="examples-container">
        <h3>Chainhook Edit Examples</h3>
        <div className="no-sdk-warning">
          <p>⚠️ SDK client not available. Please configure your Hiro API key to test these examples.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="examples-container">
      <h3>Chainhook Edit Examples</h3>
      <p>These examples demonstrate the different ways to update chainhooks using the SDK.</p>

      <div className="uuid-input">
        <label>
          Chainhook UUID for testing:
          <input 
            type="text" 
            value={exampleUuid}
            onChange={(e) => setExampleUuid(e.target.value)}
            placeholder="Enter a chainhook UUID to test with..."
          />
        </label>
      </div>

      <div className="examples-grid">
        <div className="example-card">
          <h4>1. Basic Update</h4>
          <p>Update name and options</p>
          <pre>{`await updateChainhook(uuid, {
  name: 'Updated Name',
  options: {
    decode_clarity_values: true
  }
});`}</pre>
          <button 
            onClick={handleBasicUpdate}
            disabled={isLoading || !exampleUuid}
            className="example-btn"
          >
            Test Basic Update
          </button>
        </div>

        <div className="example-card">
          <h4>2. Add Event Filter</h4>
          <p>Add filter while preserving existing ones</p>
          <pre>{`await addEventFilter(uuid, {
  type: 'ft_transfer',
  asset_identifier: 'SP...token::usda'
});`}</pre>
          <button 
            onClick={handleAddEventFilter}
            disabled={isLoading || !exampleUuid}
            className="example-btn"
          >
            Test Add Filter
          </button>
        </div>

        <div className="example-card">
          <h4>3. Update Webhook URL</h4>
          <p>Quick webhook URL update</p>
          <pre>{`await updateWebhookUrl(
  uuid, 
  'https://new-url.com/events',
  'Bearer auth-token'
);`}</pre>
          <button 
            onClick={handleUpdateWebhook}
            disabled={isLoading || !exampleUuid}
            className="example-btn"
          >
            Test Webhook Update
          </button>
        </div>

        <div className="example-card">
          <h4>4. Multiple Fields</h4>
          <p>Update name, filters, action, and options</p>
          <pre>{`await updateChainhook(uuid, {
  name: 'Updated Name',
  filters: { events: [...existing, newFilter] },
  action: { type: 'http_post', url: '...' },
  options: { decode_clarity_values: true }
});`}</pre>
          <button 
            onClick={handleMultipleFieldUpdate}
            disabled={isLoading || !exampleUuid}
            className="example-btn"
          >
            Test Multiple Update
          </button>
        </div>

        <div className="example-card">
          <h4>5. Safe Filter Addition</h4>
          <p>Fetch current definition first (best practice)</p>
          <pre>{`// ✅ Good: Fetch first
const current = await getChainhook(uuid);
await updateChainhook(uuid, {
  filters: {
    events: [...current.filters.events, newFilter]
  }
});`}</pre>
          <button 
            onClick={handleSafeFilterAddition}
            disabled={isLoading || !exampleUuid}
            className="example-btn"
          >
            Test Safe Addition
          </button>
        </div>
      </div>

      <div className="results-section">
        <h4>Results</h4>
        <div className="results-log">
          {results.length === 0 ? (
            <p>No results yet. Try running an example above.</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="result-item">
                {result}
              </div>
            ))
          )}
        </div>
        <button onClick={() => setResults([])} className="clear-btn">
          Clear Results
        </button>
      </div>

      <style jsx>{`
        .examples-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .no-sdk-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .uuid-input {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .uuid-input label {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .uuid-input input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: monospace;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .example-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          background: white;
        }

        .example-card h4 {
          margin: 0 0 10px 0;
          color: #007cba;
        }

        .example-card p {
          color: #666;
          margin: 0 0 15px 0;
        }

        .example-card pre {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
          margin: 15px 0;
          border-left: 3px solid #007cba;
        }

        .example-btn {
          background-color: #007cba;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .example-btn:hover {
          background-color: #005a87;
        }

        .example-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .results-section {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .results-section h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .results-log {
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 15px;
        }

        .result-item {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          font-family: monospace;
          font-size: 13px;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .clear-btn {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .clear-btn:hover {
          background-color: #5a6268;
        }

        @media (max-width: 768px) {
          .examples-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};