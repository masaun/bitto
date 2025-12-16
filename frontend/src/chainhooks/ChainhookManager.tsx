import React, { useState, useEffect } from 'react';
import { useChainhook } from './provider';
import { ChainhookInfo, FetchChainhooksOptions } from './types';

export const ChainhookManager: React.FC = () => {
  const {
    fetchChainhooks,
    fetchChainhook,
    refreshChainhooks,
    registeredChainhooks,
    isLoading,
    client
  } = useChainhook();

  const [selectedChainhook, setSelectedChainhook] = useState<ChainhookInfo | null>(null);
  const [allChainhooks, setAllChainhooks] = useState<ChainhookInfo[]>([]);
  const [fetchOptions, setFetchOptions] = useState<FetchChainhooksOptions>({
    limit: 20,
    offset: 0
  });
  const [searchUuid, setSearchUuid] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const hasSDKClient = client?.hasSDKClient() || false;

  // Load chainhooks on component mount
  useEffect(() => {
    if (hasSDKClient) {
      handleFetchChainhooks();
    }
  }, [hasSDKClient]);

  const handleFetchChainhooks = async () => {
    const result = await fetchChainhooks(fetchOptions);
    if (result) {
      setAllChainhooks(result.results);
      setTotalCount(result.total);
    }
  };

  const handleFetchSpecificChainhook = async () => {
    if (!searchUuid.trim()) return;
    
    const result = await fetchChainhook(searchUuid.trim());
    if (result) {
      setSelectedChainhook(result);
    } else {
      alert('Chainhook not found or access denied');
    }
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    const newOffset = direction === 'next' 
      ? fetchOptions.offset + fetchOptions.limit
      : Math.max(0, fetchOptions.offset - fetchOptions.limit);
    
    setFetchOptions(prev => ({ ...prev, offset: newOffset }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFetchOptions(prev => ({ ...prev, limit: newLimit, offset: 0 }));
  };

  if (!hasSDKClient) {
    return (
      <div className="chainhook-manager">
        <h3>Chainhook Manager</h3>
        <div className="no-sdk-warning">
          <p>⚠️ Chainhooks SDK not available</p>
          <p>To fetch chainhooks using the SDK, please:</p>
          <ol>
            <li>Get an API key from <a href="https://platform.hiro.so/" target="_blank" rel="noopener noreferrer">Hiro Platform</a></li>
            <li>Set <code>REACT_APP_HIRO_API_KEY</code> environment variable</li>
            <li>Restart the application</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="chainhook-manager">
      <h3>Chainhook Manager</h3>
      
      {/* Fetch Controls */}
      <div className="fetch-controls">
        <div className="pagination-controls">
          <label>
            Results per page:
            <select 
              value={fetchOptions.limit} 
              onChange={(e) => handleLimitChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          
          <button 
            onClick={handleFetchChainhooks} 
            disabled={isLoading}
            className="fetch-btn"
          >
            {isLoading ? 'Loading...' : 'Fetch Chainhooks'}
          </button>
          
          <button 
            onClick={refreshChainhooks}
            disabled={isLoading}
            className="refresh-btn"
          >
            Refresh
          </button>
        </div>

        <div className="search-controls">
          <input
            type="text"
            value={searchUuid}
            onChange={(e) => setSearchUuid(e.target.value)}
            placeholder="Enter Chainhook UUID"
            className="search-input"
          />
          <button 
            onClick={handleFetchSpecificChainhook}
            disabled={isLoading || !searchUuid.trim()}
            className="search-btn"
          >
            Fetch by UUID
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {totalCount > 0 && (
        <div className="results-summary">
          <p>
            Showing {fetchOptions.offset + 1} - {Math.min(fetchOptions.offset + fetchOptions.limit, totalCount)} of {totalCount} chainhooks
          </p>
          
          <div className="pagination-buttons">
            <button 
              onClick={() => handlePageChange('prev')}
              disabled={fetchOptions.offset === 0}
              className="page-btn"
            >
              Previous
            </button>
            <button 
              onClick={() => handlePageChange('next')}
              disabled={fetchOptions.offset + fetchOptions.limit >= totalCount}
              className="page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Selected Chainhook Details */}
      {selectedChainhook && (
        <div className="selected-chainhook">
          <h4>Selected Chainhook Details</h4>
          <div className="chainhook-details">
            <div className="detail-item">
              <strong>UUID:</strong> {selectedChainhook.uuid}
            </div>
            <div className="detail-item">
              <strong>Name:</strong> {selectedChainhook.name}
            </div>
            <div className="detail-item">
              <strong>Version:</strong> {selectedChainhook.version}
            </div>
            {selectedChainhook.status && (
              <div className="detail-item">
                <strong>Status:</strong> 
                <span className={`status ${selectedChainhook.status.toLowerCase()}`}>
                  {selectedChainhook.status}
                </span>
              </div>
            )}
            {selectedChainhook.created_at && (
              <div className="detail-item">
                <strong>Created:</strong> {new Date(selectedChainhook.created_at).toLocaleString()}
              </div>
            )}
            <div className="detail-item">
              <strong>Networks:</strong>
              <div className="networks">
                {Object.entries(selectedChainhook.networks).map(([network, config]) => (
                  <div key={network} className="network-config">
                    <strong>{network}:</strong> 
                    <span className={`enabled ${config.enabled ? 'yes' : 'no'}`}>
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => setSelectedChainhook(null)} className="close-btn">
            Close Details
          </button>
        </div>
      )}

      {/* Chainhooks List */}
      <div className="chainhooks-list">
        <h4>All Chainhooks ({totalCount})</h4>
        {isLoading ? (
          <div className="loading">Loading chainhooks...</div>
        ) : allChainhooks.length > 0 ? (
          <div className="chainhooks-grid">
            {allChainhooks.map((chainhook) => (
              <div key={chainhook.uuid} className="chainhook-card">
                <div className="chainhook-header">
                  <h5>{chainhook.name}</h5>
                  <span className="version">v{chainhook.version}</span>
                </div>
                <div className="chainhook-uuid">{chainhook.uuid}</div>
                <div className="chainhook-networks">
                  {Object.entries(chainhook.networks).map(([network, config]) => (
                    <span 
                      key={network} 
                      className={`network-badge ${config.enabled ? 'enabled' : 'disabled'}`}
                    >
                      {network}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => setSelectedChainhook(chainhook)}
                  className="view-details-btn"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-chainhooks">
            <p>No chainhooks found.</p>
            <p>Create your first chainhook to get started!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .chainhook-manager {
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

        .no-sdk-warning code {
          background-color: #f8f9fa;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }

        .fetch-controls {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .pagination-controls {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 15px;
        }

        .search-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          flex: 1;
          max-width: 300px;
        }

        .fetch-btn, .refresh-btn, .search-btn, .page-btn, .view-details-btn, .close-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .fetch-btn {
          background-color: #007cba;
          color: white;
        }

        .refresh-btn {
          background-color: #28a745;
          color: white;
        }

        .search-btn {
          background-color: #6f42c1;
          color: white;
        }

        .page-btn {
          background-color: #6c757d;
          color: white;
        }

        .view-details-btn {
          background-color: #17a2b8;
          color: white;
        }

        .close-btn {
          background-color: #dc3545;
          color: white;
        }

        .fetch-btn:hover { background-color: #005a87; }
        .refresh-btn:hover { background-color: #218838; }
        .search-btn:hover { background-color: #5a2d91; }
        .page-btn:hover { background-color: #5a6268; }
        .view-details-btn:hover { background-color: #138496; }
        .close-btn:hover { background-color: #c82333; }

        button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .results-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #e9ecef;
          border-radius: 8px;
          margin: 15px 0;
        }

        .pagination-buttons {
          display: flex;
          gap: 10px;
        }

        .selected-chainhook {
          background: white;
          border: 2px solid #007cba;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .chainhook-details {
          margin: 15px 0;
        }

        .detail-item {
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .status.active {
          background-color: #28a745;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
        }

        .status.inactive {
          background-color: #6c757d;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
        }

        .networks {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-left: 10px;
        }

        .network-config {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .enabled.yes {
          color: #28a745;
          font-weight: bold;
        }

        .enabled.no {
          color: #dc3545;
        }

        .chainhooks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .chainhook-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          transition: box-shadow 0.2s;
        }

        .chainhook-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .chainhook-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .chainhook-header h5 {
          margin: 0;
          color: #333;
        }

        .version {
          background-color: #e9ecef;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
        }

        .chainhook-uuid {
          font-family: monospace;
          font-size: 12px;
          color: #666;
          margin: 10px 0;
          word-break: break-all;
        }

        .chainhook-networks {
          display: flex;
          gap: 5px;
          margin: 15px 0;
        }

        .network-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          text-transform: uppercase;
        }

        .network-badge.enabled {
          background-color: #28a745;
          color: white;
        }

        .network-badge.disabled {
          background-color: #6c757d;
          color: white;
        }

        .no-chainhooks {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #007cba;
        }

        @media (max-width: 768px) {
          .chainhooks-grid {
            grid-template-columns: 1fr;
          }
          
          .pagination-controls, .search-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .results-summary {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};