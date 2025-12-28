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
  return { address: addr, name: 'hierarchical-non-fungible-token' }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [mintRecipient, setMintRecipient] = useState<string>('')
  const [mintUri, setMintUri] = useState<string>('')
  
  const [mintChildParentId, setMintChildParentId] = useState<string>('')
  const [mintChildRecipient, setMintChildRecipient] = useState<string>('')
  const [mintChildUri, setMintChildUri] = useState<string>('')
  
  const [transferToken, setTransferToken] = useState<string>('')
  const [transferSender, setTransferSender] = useState<string>('')
  const [transferRecipient, setTransferRecipient] = useState<string>('')
  
  const [transferParentNewId, setTransferParentNewId] = useState<string>('')
  const [transferParentToken, setTransferParentToken] = useState<string>('')
  
  const [burnToken, setBurnToken] = useState<string>('')
  
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

  async function mintChild() {
    if (!mintChildParentId || !mintChildRecipient || !mintChildUri) {
      return showToast('Parent ID, recipient, and URI required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'mint-child',
        functionArgs: [
          Cl.uint(mintChildParentId),
          Cl.principal(mintChildRecipient),
          Cl.stringAscii(mintChildUri)
        ],
        network: NETWORK
      })
      showToast('Mint child transaction submitted', 'success')
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

  async function transferParent() {
    if (!transferParentNewId || !transferParentToken) {
      return showToast('New parent ID and token required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'transfer-parent',
        functionArgs: [
          Cl.uint(transferParentNewId),
          Cl.uint(transferParentToken)
        ],
        network: NETWORK
      })
      showToast('Transfer parent transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function burn() {
    if (!burnToken) return showToast('Token ID required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'burn',
        functionArgs: [Cl.uint(burnToken)],
        network: NETWORK
      })
      showToast('Burn transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function queryToken() {
    if (!queryTokenId || !contractAddr) return showToast('Token ID required', 'error')
    try {
      const [owner, uri, parent, children, isRoot, isLeaf] = await Promise.all([
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
          functionName: 'parent-of',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'children-of',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'is-root',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'is-leaf',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        })
      ])
      setTokenInfo({
        owner: cvToJSON(owner),
        uri: cvToJSON(uri),
        parent: cvToJSON(parent),
        children: cvToJSON(children),
        isRoot: cvToJSON(isRoot),
        isLeaf: cvToJSON(isLeaf)
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
        <h1>Hierarchical NFT</h1>
        <p>Tree-Structured NFTs with Parent-Child Hierarchy</p>
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
            <h2>Mint Child</h2>
            <div className="form-group">
              <label>Parent Token ID</label>
              <input
                type="number"
                value={mintChildParentId}
                onChange={(e) => setMintChildParentId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Recipient</label>
              <input
                type="text"
                placeholder="SP..."
                value={mintChildRecipient}
                onChange={(e) => setMintChildRecipient(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>URI</label>
              <input
                type="text"
                placeholder="ipfs://..."
                value={mintChildUri}
                onChange={(e) => setMintChildUri(e.target.value)}
              />
            </div>
            <button onClick={mintChild} disabled={!connected}>Mint Child</button>
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
            <h2>Transfer Parent</h2>
            <div className="form-group">
              <label>New Parent ID</label>
              <input
                type="number"
                value={transferParentNewId}
                onChange={(e) => setTransferParentNewId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={transferParentToken}
                onChange={(e) => setTransferParentToken(e.target.value)}
              />
            </div>
            <button onClick={transferParent} disabled={!connected}>Transfer Parent</button>
          </div>

          <div className="section">
            <h2>Burn</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={burnToken}
                onChange={(e) => setBurnToken(e.target.value)}
              />
            </div>
            <button onClick={burn} disabled={!connected}>Burn</button>
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
