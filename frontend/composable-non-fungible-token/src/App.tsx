import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { Cl, fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions'
import { useState, useEffect } from 'react'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''
const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'mainnet'

function parseContract(addr: string): { address: string; name: string } {
  if (addr.includes('.')) {
    const [address, name] = addr.split('.')
    return { address, name }
  }
  return { address: addr, name: 'composable-non-fungible-token' }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [mintRecipient, setMintRecipient] = useState<string>('')
  const [mintUri, setMintUri] = useState<string>('')
  
  const [transferToken, setTransferToken] = useState<string>('')
  const [transferSender, setTransferSender] = useState<string>('')
  const [transferRecipient, setTransferRecipient] = useState<string>('')
  
  const [addAssetToken, setAddAssetToken] = useState<string>('')
  const [addAssetId, setAddAssetId] = useState<string>('')
  const [addAssetCatalog, setAddAssetCatalog] = useState<string>('')
  const [addAssetGroup, setAddAssetGroup] = useState<string>('')
  
  const [equipToken, setEquipToken] = useState<string>('')
  const [equipChildIndex, setEquipChildIndex] = useState<string>('')
  const [equipAssetId, setEquipAssetId] = useState<string>('')
  const [equipSlotPartId, setEquipSlotPartId] = useState<string>('')
  const [equipChildAssetId, setEquipChildAssetId] = useState<string>('')
  
  const [unequipToken, setUnequipToken] = useState<string>('')
  const [unequipAssetId, setUnequipAssetId] = useState<string>('')
  const [unequipSlotPartId, setUnequipSlotPartId] = useState<string>('')
  
  const [slotPartId, setSlotPartId] = useState<string>('')
  const [slotZIndex, setSlotZIndex] = useState<string>('')
  
  const [fixedPartId, setFixedPartId] = useState<string>('')
  const [fixedZIndex, setFixedZIndex] = useState<string>('')
  const [fixedMetadata, setFixedMetadata] = useState<string>('')
  
  const [queryTokenId, setQueryTokenId] = useState<string>('')
  const [tokenInfo, setTokenInfo] = useState<any>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  function checkConnection() {
    if (isConnected()) {
      const data = getLocalStorage()
      if (data?.addresses?.stx?.[0]?.address) {
        setConnected(true)
        setUserAddress(data.addresses.stx[0].address)
      }
    }
  }

  async function connectWallet() {
    try {
      const response = await connect({
        walletConnectProjectId: WALLET_CONNECT_PROJECT_ID
      })
      if (response.addresses.stx?.[0]?.address) {
        setConnected(true)
        setUserAddress(response.addresses.stx[0].address)
        showToast('Wallet connected successfully', 'success')
      }
    } catch (error) {
      showToast('Failed to connect wallet', 'error')
    }
  }

  function disconnectWallet() {
    disconnect()
    setConnected(false)
    setUserAddress('')
    showToast('Wallet disconnected', 'success')
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const { address: contractAddr, name: contractName } = parseContract(CONTRACT_ADDRESS)

  async function mint() {
    if (!mintRecipient || !mintUri) return showToast('Recipient and URI required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'mint',
        functionArgs: [
          Cl.principal(mintRecipient),
          Cl.stringAscii(mintUri)
        ],
        network: NETWORK
      })
      showToast('Mint transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function transfer() {
    if (!transferToken || !transferSender || !transferRecipient) {
      return showToast('Token, sender, and recipient required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'transfer',
        functionArgs: [
          Cl.uint(transferToken),
          Cl.principal(transferSender),
          Cl.principal(transferRecipient)
        ],
        network: NETWORK
      })
      showToast('Transfer transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function addAsset() {
    if (!addAssetToken || !addAssetId || !addAssetCatalog || !addAssetGroup) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'add-asset',
        functionArgs: [
          Cl.uint(addAssetToken),
          Cl.uint(addAssetId),
          Cl.principal(addAssetCatalog),
          Cl.list([Cl.uint(1), Cl.uint(2)]),
          Cl.uint(addAssetGroup)
        ],
        network: NETWORK
      })
      showToast('Add asset transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function equip() {
    if (!equipToken || !equipChildIndex || !equipAssetId || !equipSlotPartId || !equipChildAssetId) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'equip',
        functionArgs: [
          Cl.uint(equipToken),
          Cl.uint(equipChildIndex),
          Cl.uint(equipAssetId),
          Cl.uint(equipSlotPartId),
          Cl.uint(equipChildAssetId)
        ],
        network: NETWORK
      })
      showToast('Equip transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function unequip() {
    if (!unequipToken || !unequipAssetId || !unequipSlotPartId) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'unequip',
        functionArgs: [
          Cl.uint(unequipToken),
          Cl.uint(unequipAssetId),
          Cl.uint(unequipSlotPartId)
        ],
        network: NETWORK
      })
      showToast('Unequip transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function addSlotPart() {
    if (!slotPartId || !slotZIndex || !userAddress) {
      return showToast('Part ID and z-index required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'add-slot-part',
        functionArgs: [
          Cl.uint(slotPartId),
          Cl.uint(slotZIndex),
          Cl.list([Cl.principal(userAddress)])
        ],
        network: NETWORK
      })
      showToast('Add slot part transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function addFixedPart() {
    if (!fixedPartId || !fixedZIndex || !fixedMetadata) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'add-fixed-part',
        functionArgs: [
          Cl.uint(fixedPartId),
          Cl.uint(fixedZIndex),
          Cl.stringAscii(fixedMetadata)
        ],
        network: NETWORK
      })
      showToast('Add fixed part transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function queryToken() {
    if (!queryTokenId || !contractAddr) return showToast('Token ID required', 'error')
    try {
      const [owner, uri, assets, equipped] = await Promise.all([
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-owner',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-token-uri',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-assets',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-equipped-items',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        })
      ])
      setTokenInfo({
        owner: cvToJSON(owner),
        uri: cvToJSON(uri),
        assets: cvToJSON(assets),
        equipped: cvToJSON(equipped)
      })
    } catch (error) {
      showToast('Failed to query token', 'error')
    }
  }

  return (
    <div className="app">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <header className="header">
        <h1>Composable NFT</h1>
        <p>NFTs with Equippable Multi-Asset Composition</p>
      </header>

      <div className="wallet-section">
        {!connected ? (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <div className="wallet-info">
            <span className="address">{userAddress.slice(0, 8)}...{userAddress.slice(-6)}</span>
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}
      </div>

      <main className="main-content">
        <div className="grid">
          <div className="section">
            <h2>Mint NFT</h2>
            <div className="form-group">
              <label>Recipient</label>
              <input
                type="text"
                placeholder="SP..."
                value={mintRecipient}
                onChange={(e) => setMintRecipient(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>URI</label>
              <input
                type="text"
                placeholder="ipfs://..."
                value={mintUri}
                onChange={(e) => setMintUri(e.target.value)}
              />
            </div>
            <button onClick={mint} disabled={!connected}>Mint</button>
          </div>

          <div className="section">
            <h2>Transfer</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={transferToken}
                onChange={(e) => setTransferToken(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Sender</label>
              <input
                type="text"
                placeholder="SP..."
                value={transferSender}
                onChange={(e) => setTransferSender(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Recipient</label>
              <input
                type="text"
                placeholder="SP..."
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
              />
            </div>
            <button onClick={transfer} disabled={!connected}>Transfer</button>
          </div>

          <div className="section">
            <h2>Add Asset</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={addAssetToken}
                onChange={(e) => setAddAssetToken(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Asset ID</label>
              <input
                type="number"
                value={addAssetId}
                onChange={(e) => setAddAssetId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Catalog Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={addAssetCatalog}
                onChange={(e) => setAddAssetCatalog(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Equippable Group</label>
              <input
                type="number"
                value={addAssetGroup}
                onChange={(e) => setAddAssetGroup(e.target.value)}
              />
            </div>
            <button onClick={addAsset} disabled={!connected}>Add Asset</button>
          </div>

          <div className="section">
            <h2>Equip</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={equipToken}
                onChange={(e) => setEquipToken(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Child Index</label>
              <input
                type="number"
                value={equipChildIndex}
                onChange={(e) => setEquipChildIndex(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Asset ID</label>
              <input
                type="number"
                value={equipAssetId}
                onChange={(e) => setEquipAssetId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Slot Part ID</label>
              <input
                type="number"
                value={equipSlotPartId}
                onChange={(e) => setEquipSlotPartId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Child Asset ID</label>
              <input
                type="number"
                value={equipChildAssetId}
                onChange={(e) => setEquipChildAssetId(e.target.value)}
              />
            </div>
            <button onClick={equip} disabled={!connected}>Equip</button>
          </div>

          <div className="section">
            <h2>Unequip</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={unequipToken}
                onChange={(e) => setUnequipToken(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Asset ID</label>
              <input
                type="number"
                value={unequipAssetId}
                onChange={(e) => setUnequipAssetId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Slot Part ID</label>
              <input
                type="number"
                value={unequipSlotPartId}
                onChange={(e) => setUnequipSlotPartId(e.target.value)}
              />
            </div>
            <button onClick={unequip} disabled={!connected}>Unequip</button>
          </div>

          <div className="section">
            <h2>Add Slot Part</h2>
            <div className="form-group">
              <label>Part ID</label>
              <input
                type="number"
                value={slotPartId}
                onChange={(e) => setSlotPartId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Z-Index</label>
              <input
                type="number"
                value={slotZIndex}
                onChange={(e) => setSlotZIndex(e.target.value)}
              />
            </div>
            <button onClick={addSlotPart} disabled={!connected}>Add Slot Part</button>
          </div>

          <div className="section">
            <h2>Add Fixed Part</h2>
            <div className="form-group">
              <label>Part ID</label>
              <input
                type="number"
                value={fixedPartId}
                onChange={(e) => setFixedPartId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Z-Index</label>
              <input
                type="number"
                value={fixedZIndex}
                onChange={(e) => setFixedZIndex(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Metadata</label>
              <input
                type="text"
                value={fixedMetadata}
                onChange={(e) => setFixedMetadata(e.target.value)}
              />
            </div>
            <button onClick={addFixedPart} disabled={!connected}>Add Fixed Part</button>
          </div>

          <div className="section">
            <h2>Query Token</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={queryTokenId}
                onChange={(e) => setQueryTokenId(e.target.value)}
              />
            </div>
            <button onClick={queryToken}>Query</button>
            {tokenInfo && (
              <div className="info-box">
                <pre>{JSON.stringify(tokenInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
