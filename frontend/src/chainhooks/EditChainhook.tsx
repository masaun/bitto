import React, { useState, useEffect } from 'react';
import { useChainhook } from './provider';
import { 
  ChainhookWithDefinition, 
  UpdateChainhookRequest, 
  ChainhookFilter, 
  ChainhookAction,
  ChainhookOptions 
} from './types';

interface EditChainhookProps {
  chainhook: ChainhookWithDefinition;
  onUpdate: (updated: ChainhookWithDefinition) => void;
  onCancel: () => void;
}

export const EditChainhook: React.FC<EditChainhookProps> = ({ 
  chainhook, 
  onUpdate, 
  onCancel 
}) => {
  const { updateChainhook, addEventFilter, updateWebhookUrl, isLoading } = useChainhook();
  
  const [formData, setFormData] = useState<UpdateChainhookRequest>({
    name: chainhook.definition.name,
    version: chainhook.definition.version,
    filters: {
      events: chainhook.definition.filters.events || []
    },
    action: chainhook.definition.action,
    options: chainhook.definition.options || {}
  });

  const [newFilter, setNewFilter] = useState<ChainhookFilter>({
    type: 'ft_transfer',
    asset_identifier: '',
    sender: '',
    recipient: ''
  });

  const [quickActions, setQuickActions] = useState({
    newWebhookUrl: '',
    newAuthHeader: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof UpdateChainhookRequest],
        [field]: value
      }
    }));
  };

  const handleFilterChange = (field: keyof ChainhookFilter, value: string) => {
    setNewFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFilter = async () => {
    if (!newFilter.type) return;
    
    const result = await addEventFilter(chainhook.uuid, newFilter);
    if (result) {
      onUpdate(result);
      setNewFilter({
        type: 'ft_transfer',
        asset_identifier: '',
        sender: '',
        recipient: ''
      });
    }
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = formData.filters?.events?.filter((_, i) => i !== index) || [];
    handleNestedInputChange('filters', 'events', updatedFilters);
  };

  const handleUpdateWebhookUrl = async () => {
    if (!quickActions.newWebhookUrl) return;
    
    const result = await updateWebhookUrl(
      chainhook.uuid, 
      quickActions.newWebhookUrl,
      quickActions.newAuthHeader || undefined
    );
    
    if (result) {
      onUpdate(result);
      setQuickActions({ newWebhookUrl: '', newAuthHeader: '' });
    }
  };

  const handleFullUpdate = async () => {
    const result = await updateChainhook(chainhook.uuid, formData);
    if (result) {
      onUpdate(result);
    }
  };

  return (
    <div className="edit-chainhook">
      <div className="edit-header">
        <h3>Edit Chainhook</h3>
        <div className="edit-actions">
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
          <button onClick={handleFullUpdate} disabled={isLoading} className="save-btn">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="edit-content">
        {/* Basic Information */}
        <div className="edit-section">
          <h4>Basic Information</h4>
          <div className="form-row">
            <label>
              UUID (Read-only):
              <input type="text" value={chainhook.uuid} disabled />
            </label>
          </div>
          <div className="form-row">
            <label>
              Name:
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Version:
              <input 
                type="number" 
                value={formData.version || ''} 
                onChange={(e) => handleInputChange('version', parseInt(e.target.value))}
              />
            </label>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="edit-section">
          <h4>Quick Actions</h4>
          <div className="quick-action">
            <h5>Update Webhook URL</h5>
            <div className="form-row">
              <input
                type="url"
                placeholder="New webhook URL"
                value={quickActions.newWebhookUrl}
                onChange={(e) => setQuickActions(prev => ({ ...prev, newWebhookUrl: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Authorization header (optional)"
                value={quickActions.newAuthHeader}
                onChange={(e) => setQuickActions(prev => ({ ...prev, newAuthHeader: e.target.value }))}
              />
              <button 
                onClick={handleUpdateWebhookUrl}
                disabled={!quickActions.newWebhookUrl || isLoading}
                className="action-btn"
              >
                Update URL
              </button>
            </div>
          </div>
        </div>

        {/* Current Filters */}
        <div className="edit-section">
          <h4>Current Event Filters</h4>
          {formData.filters?.events?.length ? (
            <div className="filters-list">
              {formData.filters.events.map((filter, index) => (
                <div key={index} className="filter-item">
                  <div className="filter-details">
                    <strong>Type:</strong> {filter.type}
                    {filter.asset_identifier && (
                      <><strong>Asset:</strong> {filter.asset_identifier}</>
                    )}
                    {filter.sender && <><strong>Sender:</strong> {filter.sender}</>}
                    {filter.recipient && <><strong>Recipient:</strong> {filter.recipient}</>}
                    {filter.contract_identifier && (
                      <><strong>Contract:</strong> {filter.contract_identifier}</>
                    )}
                    {filter.method && <><strong>Method:</strong> {filter.method}</>}
                  </div>
                  <button 
                    onClick={() => handleRemoveFilter(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No event filters configured</p>
          )}
        </div>

        {/* Add New Filter */}
        <div className="edit-section">
          <h4>Add New Event Filter</h4>
          <div className="form-grid">
            <label>
              Filter Type:
              <select 
                value={newFilter.type} 
                onChange={(e) => handleFilterChange('type', e.target.value as any)}
              >
                <option value="ft_transfer">FT Transfer</option>
                <option value="nft_transfer">NFT Transfer</option>
                <option value="stx_transfer">STX Transfer</option>
                <option value="contract_call">Contract Call</option>
                <option value="contract_deployment">Contract Deployment</option>
                <option value="print_event">Print Event</option>
              </select>
            </label>

            {(newFilter.type === 'ft_transfer' || newFilter.type === 'nft_transfer') && (
              <label>
                Asset Identifier:
                <input 
                  type="text" 
                  placeholder="SP...ABC.token::usdc"
                  value={newFilter.asset_identifier || ''} 
                  onChange={(e) => handleFilterChange('asset_identifier', e.target.value)}
                />
              </label>
            )}

            {(newFilter.type === 'contract_call' || newFilter.type === 'contract_deployment') && (
              <label>
                Contract Identifier:
                <input 
                  type="text" 
                  placeholder="SP...XYZ.counter"
                  value={newFilter.contract_identifier || ''} 
                  onChange={(e) => handleFilterChange('contract_identifier', e.target.value)}
                />
              </label>
            )}

            {newFilter.type === 'contract_call' && (
              <label>
                Method (optional):
                <input 
                  type="text" 
                  placeholder="increment"
                  value={newFilter.method || ''} 
                  onChange={(e) => handleFilterChange('method', e.target.value)}
                />
              </label>
            )}

            <label>
              Sender (optional):
              <input 
                type="text" 
                placeholder="SP...SENDER"
                value={newFilter.sender || ''} 
                onChange={(e) => handleFilterChange('sender', e.target.value)}
              />
            </label>

            <label>
              Recipient (optional):
              <input 
                type="text" 
                placeholder="SP...RECIPIENT"
                value={newFilter.recipient || ''} 
                onChange={(e) => handleFilterChange('recipient', e.target.value)}
              />
            </label>
          </div>
          <button 
            onClick={handleAddFilter}
            disabled={!newFilter.type || isLoading}
            className="add-filter-btn"
          >
            Add Filter
          </button>
        </div>

        {/* Action Configuration */}
        <div className="edit-section">
          <h4>Action Configuration</h4>
          <div className="form-row">
            <label>
              Action Type:
              <select 
                value={formData.action?.type || 'http_post'} 
                onChange={(e) => handleNestedInputChange('action', 'type', e.target.value)}
              >
                <option value="http_post">HTTP POST</option>
                <option value="file_append">File Append</option>
              </select>
            </label>
          </div>
          
          {formData.action?.type === 'http_post' && (
            <>
              <div className="form-row">
                <label>
                  Webhook URL:
                  <input 
                    type="url" 
                    value={formData.action.url || ''} 
                    onChange={(e) => handleNestedInputChange('action', 'url', e.target.value)}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Authorization Header:
                  <input 
                    type="text" 
                    value={formData.action.authorization_header || ''} 
                    onChange={(e) => handleNestedInputChange('action', 'authorization_header', e.target.value)}
                  />
                </label>
              </div>
            </>
          )}

          {formData.action?.type === 'file_append' && (
            <div className="form-row">
              <label>
                File Path:
                <input 
                  type="text" 
                  value={formData.action.file_path || ''} 
                  onChange={(e) => handleNestedInputChange('action', 'file_path', e.target.value)}
                />
              </label>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="edit-section">
          <h4>Options</h4>
          <div className="form-row">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.options?.decode_clarity_values || false} 
                onChange={(e) => handleNestedInputChange('options', 'decode_clarity_values', e.target.checked)}
              />
              Decode Clarity Values
            </label>
          </div>
          <div className="form-row">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.options?.include_contract_abi || false} 
                onChange={(e) => handleNestedInputChange('options', 'include_contract_abi', e.target.checked)}
              />
              Include Contract ABI
            </label>
          </div>
          <div className="form-row">
            <label>
              Max Batch Size:
              <input 
                type="number" 
                min="1"
                max="1000"
                value={formData.options?.max_batch_size || ''} 
                onChange={(e) => handleNestedInputChange('options', 'max_batch_size', parseInt(e.target.value))}
              />
            </label>
          </div>
        </div>
      </div>

      <style jsx>{`
        .edit-chainhook {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .edit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .edit-header h3 {
          margin: 0;
          color: #333;
        }

        .edit-actions {
          display: flex;
          gap: 10px;
        }

        .edit-content {
          padding: 20px;
        }

        .edit-section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }

        .edit-section h4 {
          margin: 0 0 15px 0;
          color: #333;
          border-bottom: 2px solid #007cba;
          padding-bottom: 5px;
        }

        .edit-section h5 {
          margin: 0 0 10px 0;
          color: #666;
        }

        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          align-items: center;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-row label, .form-grid label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }

        .checkbox-label {
          flex-direction: row !important;
          align-items: center;
        }

        .checkbox-label input {
          width: auto !important;
          margin-right: 8px;
        }

        input, select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        input:disabled {
          background-color: #f5f5f5;
          color: #666;
        }

        .filters-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .filter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: #f9f9f9;
        }

        .filter-details {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .filter-details strong {
          margin-right: 5px;
        }

        .quick-action {
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
          background: #f8f9fa;
        }

        .cancel-btn {
          background-color: #6c757d;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .save-btn {
          background-color: #28a745;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .action-btn {
          background-color: #007cba;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .add-filter-btn {
          background-color: #17a2b8;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .remove-btn {
          background-color: #dc3545;
          color: white;
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s;
        }

        .cancel-btn:hover { background-color: #5a6268; }
        .save-btn:hover { background-color: #218838; }
        .action-btn:hover { background-color: #005a87; }
        .add-filter-btn:hover { background-color: #138496; }
        .remove-btn:hover { background-color: #c82333; }

        button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .edit-header {
            flex-direction: column;
            gap: 15px;
          }

          .form-row {
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .filter-item {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};