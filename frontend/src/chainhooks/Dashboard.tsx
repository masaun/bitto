import React, { useState } from 'react';
import { useChainhook } from './provider';
import { ChainhookManager } from './ChainhookManager';
import { ChainhookEditExamples } from './ChainhookEditExamples';

export const ChainhookDashboard: React.FC = () => {
  const {
    isConnected,
    recentTransfers,
    recentApprovals,
    totalTransfers,
    totalVolume,
    registerChainhook,
    clearEvents
  } = useChainhook();

  const [activeTab, setActiveTab] = useState<'events' | 'manager' | 'examples'>('events');

  const processor = useChainhook().client?.getProcessor();

  const handleRegisterChainhook = async () => {
    const success = await registerChainhook();
    if (success) {
      alert('Chainhook registered successfully!');
    } else {
      alert('Failed to register chainhook. Check console for details.');
    }
  };

  return (
    <div className="chainhook-dashboard">
      <div className="dashboard-header">
        <h2>Chainhooks Dashboard</h2>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events Monitor
        </button>
        <button 
          className={`tab ${activeTab === 'manager' ? 'active' : ''}`}
          onClick={() => setActiveTab('manager')}
        >
          Manage Chainhooks
        </button>
        <button 
          className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          Edit Examples
        </button>
      </div>

      {activeTab === 'events' && (
        <>
          <div className="dashboard-actions">
            <button onClick={handleRegisterChainhook} disabled={isConnected}>
              Register Chainhook
            </button>
            <button onClick={clearEvents}>
              Clear Events
            </button>
          </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Transfers</h3>
          <div className="stat-value">{totalTransfers}</div>
        </div>
        <div className="stat-card">
          <h3>Total Volume</h3>
          <div className="stat-value">
            {processor?.formatAmount(totalVolume.toString()) || '0'} TOKENS
          </div>
        </div>
        <div className="stat-card">
          <h3>Recent Events</h3>
          <div className="stat-value">{recentTransfers.length}</div>
        </div>
      </div>

      <div className="events-section">
        <div className="event-category">
          <h3>Recent Transfers</h3>
          <div className="event-list">
            {recentTransfers.length === 0 ? (
              <div className="no-events">No transfers yet</div>
            ) : (
              recentTransfers.slice(0, 10).map((transfer, index) => (
                <div key={`${transfer.txId}-${index}`} className="event-item">
                  <div className="event-type">
                    <span className={`event-badge ${transfer.eventType}`}>
                      {transfer.eventType.toUpperCase()}
                    </span>
                  </div>
                  <div className="event-details">
                    <div className="event-addresses">
                      {transfer.eventType === 'mint' ? (
                        <span>Minted to: {processor?.formatAddress(transfer.recipient)}</span>
                      ) : transfer.eventType === 'burn' ? (
                        <span>Burned from: {processor?.formatAddress(transfer.sender)}</span>
                      ) : (
                        <span>
                          {processor?.formatAddress(transfer.sender)} → {processor?.formatAddress(transfer.recipient)}
                        </span>
                      )}
                    </div>
                    <div className="event-amount">
                      {processor?.formatAmount(transfer.amount)} TOKENS
                    </div>
                  </div>
                  <div className="event-meta">
                    <div className="event-time">
                      {processor?.formatTimestamp(transfer.timestamp)}
                    </div>
                    <div className="event-block">
                      Block #{transfer.blockHeight}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="event-category">
          <h3>Recent Approvals</h3>
          <div className="event-list">
            {recentApprovals.length === 0 ? (
              <div className="no-events">No approvals yet</div>
            ) : (
              recentApprovals.slice(0, 10).map((approval, index) => (
                <div key={`${approval.txId}-${index}`} className="event-item">
                  <div className="event-type">
                    <span className="event-badge approval">APPROVAL</span>
                  </div>
                  <div className="event-details">
                    <div className="event-addresses">
                      {processor?.formatAddress(approval.owner)} → {processor?.formatAddress(approval.spender)}
                    </div>
                    <div className="event-amount">
                      {processor?.formatAmount(approval.amount)} TOKENS
                    </div>
                  </div>
                  <div className="event-meta">
                    <div className="event-time">
                      {processor?.formatTimestamp(approval.timestamp)}
                    </div>
                    <div className="event-block">
                      Block #{approval.blockHeight}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === 'manager' && (
        <ChainhookManager />
      )}

      {activeTab === 'examples' && (
        <ChainhookEditExamples />
      )}

      <style jsx>{`
        .chainhook-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
        }

        .dashboard-tabs {
          display: flex;
          gap: 5px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .tab {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          color: #666;
        }

        .tab:hover {
          background-color: #f8f9fa;
          color: #333;
        }

        .tab.active {
          color: #007cba;
          border-bottom-color: #007cba;
          font-weight: bold;
        }

        .dashboard-header h2 {
          margin: 0;
          color: #333;
        }

        .connection-status {
          display: flex;
          align-items: center;
        }

        .status-indicator {
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-indicator.connected {
          background-color: #4caf50;
          color: white;
        }

        .status-indicator.disconnected {
          background-color: #f44336;
          color: white;
        }

        .dashboard-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .dashboard-actions button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          background-color: #007cba;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .dashboard-actions button:hover {
          background-color: #005a87;
        }

        .dashboard-actions button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }

        .events-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .event-category h3 {
          margin-bottom: 15px;
          color: #333;
          border-bottom: 2px solid #007cba;
          padding-bottom: 5px;
        }

        .event-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .no-events {
          text-align: center;
          color: #666;
          padding: 40px 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }

        .event-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
          transition: box-shadow 0.2s;
        }

        .event-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .event-type {
          margin-bottom: 10px;
        }

        .event-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .event-badge.transfer {
          background-color: #2196f3;
          color: white;
        }

        .event-badge.mint {
          background-color: #4caf50;
          color: white;
        }

        .event-badge.burn {
          background-color: #ff9800;
          color: white;
        }

        .event-badge.approval {
          background-color: #9c27b0;
          color: white;
        }

        .event-details {
          margin-bottom: 10px;
        }

        .event-addresses {
          font-family: monospace;
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }

        .event-amount {
          font-weight: bold;
          color: #333;
        }

        .event-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #888;
        }

        @media (max-width: 768px) {
          .events-section {
            grid-template-columns: 1fr;
          }
          
          .dashboard-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};