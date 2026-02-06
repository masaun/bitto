import React, { useState, useEffect } from 'react';
import { authenticate, disconnect, userSession, createETF, purchaseShares, redeemShares, rebalanceETF, updateETFMetadata, setManager } from './stacksService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [etfName, setEtfName] = useState('');
  const [etfSymbol, setEtfSymbol] = useState('');
  const [assetIds, setAssetIds] = useState('');
  const [etfId, setEtfId] = useState('');
  const [shareAmount, setShareAmount] = useState('');
  const [stxAmount, setStxAmount] = useState('');
  const [newManager, setNewManager] = useState('');

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setIsAuthenticated(true);
      setUserData(userSession.loadUserData());
    }
  }, []);

  const handleAuthenticate = () => {
    authenticate();
  };

  const handleDisconnect = () => {
    disconnect();
    setIsAuthenticated(false);
    setUserData(null);
  };

  const handleCreateETF = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assets = assetIds.split(',').map(id => id.trim());
      await createETF(etfName, etfSymbol, assets);
      alert('ETF creation transaction submitted');
    } catch (error) {
      console.error('Error creating ETF:', error);
      alert('Failed to create ETF');
    }
  };

  const handlePurchaseShares = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await purchaseShares(parseInt(etfId), parseInt(shareAmount), parseInt(stxAmount));
      alert('Share purchase transaction submitted');
    } catch (error) {
      console.error('Error purchasing shares:', error);
      alert('Failed to purchase shares');
    }
  };

  const handleRedeemShares = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await redeemShares(parseInt(etfId), parseInt(shareAmount));
      alert('Share redemption transaction submitted');
    } catch (error) {
      console.error('Error redeeming shares:', error);
      alert('Failed to redeem shares');
    }
  };

  const handleRebalanceETF = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assets = assetIds.split(',').map(id => id.trim());
      await rebalanceETF(parseInt(etfId), assets);
      alert('ETF rebalance transaction submitted');
    } catch (error) {
      console.error('Error rebalancing ETF:', error);
      alert('Failed to rebalance ETF');
    }
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateETFMetadata(parseInt(etfId), etfName, etfSymbol);
      alert('Metadata update transaction submitted');
    } catch (error) {
      console.error('Error updating metadata:', error);
      alert('Failed to update metadata');
    }
  };

  const handleSetManager = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setManager(parseInt(etfId), newManager);
      alert('Manager update transaction submitted');
    } catch (error) {
      console.error('Error setting manager:', error);
      alert('Failed to set manager');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>rare earths supply chain</h1>
      
      {!isAuthenticated ? (
        <div>
          <button onClick={handleAuthenticate} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Address:</strong> {userData?.profile?.stxAddress?.mainnet}</p>
            <button onClick={handleDisconnect} style={{ padding: '8px 16px' }}>
              Disconnect
            </button>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Create ETF</h2>
            <form onSubmit={handleCreateETF}>
              <input
                type="text"
                placeholder="ETF Name"
                value={etfName}
                onChange={(e) => setEtfName(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <input
                type="text"
                placeholder="ETF Symbol"
                value={etfSymbol}
                onChange={(e) => setEtfSymbol(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <input
                type="text"
                placeholder="Asset IDs (comma-separated)"
                value={assetIds}
                onChange={(e) => setAssetIds(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <button type="submit" style={{ padding: '10px 20px', marginTop: '10px' }}>
                Create ETF
              </button>
            </form>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Purchase Shares</h2>
            <form onSubmit={handlePurchaseShares}>
              <input
                type="number"
                placeholder="ETF ID"
                value={etfId}
                onChange={(e) => setEtfId(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <input
                type="number"
                placeholder="Share Amount"
                value={shareAmount}
                onChange={(e) => setShareAmount(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <input
                type="number"
                placeholder="STX Amount"
                value={stxAmount}
                onChange={(e) => setStxAmount(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <button type="submit" style={{ padding: '10px 20px', marginTop: '10px' }}>
                Purchase Shares
              </button>
            </form>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Redeem Shares</h2>
            <form onSubmit={handleRedeemShares}>
              <input
                type="number"
                placeholder="ETF ID"
                value={etfId}
                onChange={(e) => setEtfId(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <input
                type="number"
                placeholder="Share Amount"
                value={shareAmount}
                onChange={(e) => setShareAmount(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <button type="submit" style={{ padding: '10px 20px', marginTop: '10px' }}>
                Redeem Shares
              </button>
            </form>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Rebalance ETF</h2>
            <form onSubmit={handleRebalanceETF}>
              <input
                type="number"
                placeholder="ETF ID"
                value={etfId}
                onChange={(e) => setEtfId(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <input
                type="text"
                placeholder="New Asset IDs (comma-separated)"
                value={assetIds}
                onChange={(e) => setAssetIds(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <button type="submit" style={{ padding: '10px 20px', marginTop: '10px' }}>
                Rebalance ETF
              </button>
            </form>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Update Metadata</h2>
            <form onSubmit={handleUpdateMetadata}>
              <input
                type="number"
                placeholder="ETF ID"
                value={etfId}
                onChange={(e) => setEtfId(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <input
                type="text"
                placeholder="New Name"
                value={etfName}
                onChange={(e) => setEtfName(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <input
                type="text"
                placeholder="New Symbol"
                value={etfSymbol}
                onChange={(e) => setEtfSymbol(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <button type="submit" style={{ padding: '10px 20px', marginTop: '10px' }}>
                Update Metadata
              </button>
            </form>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Set Manager</h2>
            <form onSubmit={handleSetManager}>
              <input
                type="number"
                placeholder="ETF ID"
                value={etfId}
                onChange={(e) => setEtfId(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <input
                type="text"
                placeholder="New Manager Address"
                value={newManager}
                onChange={(e) => setNewManager(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                required
              />
              <button type="submit" style={{ padding: '10px 20px', marginTop: '10px' }}>
                Set Manager
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
