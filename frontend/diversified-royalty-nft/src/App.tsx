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
  return { address: addr, name: 'diversified-royalty-nft' }
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
  
  const [listToken, setListToken] = useState<string>('')
  const [listPrice, setListPrice] = useState<string>('')
  const [listExpires, setListExpires] = useState<string>('')
  
  const [delistToken, setDelistToken] = useState<string>('')
  
  const [buyToken, setBuyToken] = useState<string>('')
  const [buyPrice, setBuyPrice] = useState<string>('')
  
  const [royaltyRecipient, setRoyaltyRecipient] = useState<string>('')
  const [royaltyPercent, setRoyaltyPercent] = useState<string>('')
  
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

  async function listItem() {
    if (!listToken || !listPrice || !listExpires) {
      return showToast('Token, price, and expiry required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'list-item',
        functionArgs: [
          Cl.uint(listToken),
          Cl.uint(listPrice),
          Cl.uint(listExpires),
          Cl.none()
        ],
        network: NETWORK
      })
      showToast('List transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function delistItem() {
    if (!delistToken) return showToast('Token ID required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'delist-item',
        functionArgs: [Cl.uint(delistToken)],
        network: NETWORK
      })
      showToast('Delist transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function buyItem() {
    if (!buyToken || !buyPrice) return showToast('Token and price required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'buy-item',
        functionArgs: [
          Cl.uint(buyToken),
          Cl.uint(buyPrice),
          Cl.none()
        ],
        network: NETWORK
      })
      showToast('Buy transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function setRoyalty() {
    if (!royaltyRecipient || !royaltyPercent) {
      return showToast('Recipient and percent required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'set-royalty',
        functionArgs: [
          Cl.principal(royaltyRecipient),
          Cl.uint(royaltyPercent)
        ],
        network: NETWORK
      })
      showToast('Set royalty transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function queryToken() {
    if (!queryTokenId || !contractAddr) return showToast('Token ID required', 'error')
    try {
      const [owner, uri, listing] = await Promise.all([
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
          functionName: 'get-listing',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        })
      ])
      setTokenInfo({
        owner: cvToJSON(owner),
        uri: cvToJSON(uri),
        listing: cvToJSON(listing)
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
        <h1>Diversified Royalty NFT</h1>
        <p>NFT with Dynamic Royalty System</p>
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
            <h2>List Item</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={listToken}
                onChange={(e) => setListToken(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Price (microSTX)</label>
              <input
                type="number"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Expires (block time)</label>
              <input
                type="number"
                value={listExpires}
                onChange={(e) => setListExpires(e.target.value)}
              />
            </div>
            <button onClick={listItem} disabled={!connected}>List</button>
          </div>

          <div className="section">
            <h2>Delist Item</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={delistToken}
                onChange={(e) => setDelistToken(e.target.value)}
              />
            </div>
            <button onClick={delistItem} disabled={!connected}>Delist</button>
          </div>

          <div className="section">
            <h2>Buy Item</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={buyToken}
                onChange={(e) => setBuyToken(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Price (microSTX)</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </div>
            <button onClick={buyItem} disabled={!connected}>Buy</button>
          </div>

          <div className="section">
            <h2>Set Royalty</h2>
            <div className="form-group">
              <label>Recipient</label>
              <input
                type="text"
                placeholder="SP..."
                value={royaltyRecipient}
                onChange={(e) => setRoyaltyRecipient(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Percent (basis points)</label>
              <input
                type="number"
                placeholder="250 = 2.5%"
                value={royaltyPercent}
                onChange={(e) => setRoyaltyPercent(e.target.value)}
              />
            </div>
            <button onClick={setRoyalty} disabled={!connected}>Set Royalty</button>
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
