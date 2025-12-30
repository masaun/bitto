import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { Cl, fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions'
import { useState, useEffect } from 'react'
import { createAppKit } from '@reown/appkit'
import { Web3Wallet } from '@walletconnect/web3wallet'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''
const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'mainnet'

function parseContract(addr: string): { address: string; name: string } {
  if (addr.includes('.')) {
    const [address, name] = addr.split('.')
    return { address, name }
  }
  return { address: addr, name: 'nestable-nft' }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [mintRecipient, setMintRecipient] = useState<string>('')
  const [mintUri, setMintUri] = useState<string>('')
  
  const [nestMintParentId, setNestMintParentId] = useState<string>('')
  const [nestMintRecipient, setNestMintRecipient] = useState<string>('')
  const [nestMintUri, setNestMintUri] = useState<string>('')
  
  const [transferToken, setTransferToken] = useState<string>('')
  const [transferSender, setTransferSender] = useState<string>('')
  const [transferRecipient, setTransferRecipient] = useState<string>('')
  
  const [nestTransferToken, setNestTransferToken] = useState<string>('')
  const [nestTransferSender, setNestTransferSender] = useState<string>('')
  const [nestTransferParentId, setNestTransferParentId] = useState<string>('')
  
  const [acceptParentId, setAcceptParentId] = useState<string>('')
  const [acceptChildIndex, setAcceptChildIndex] = useState<string>('')
  const [acceptChildId, setAcceptChildId] = useState<string>('')
  const [acceptChildContract, setAcceptChildContract] = useState<string>('')
  
  const [rejectParentId, setRejectParentId] = useState<string>('')
  const [rejectMaxRejections, setRejectMaxRejections] = useState<string>('')
  
  const [burnToken, setBurnToken] = useState<string>('')
  const [burnMaxRecursive, setBurnMaxRecursive] = useState<string>('')
  
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

  async function connectWalletKit() {
    try {
      const web3Wallet = await Web3Wallet.init({
        core: {
          projectId: WALLET_CONNECT_PROJECT_ID
        },
        metadata: {
          name: 'Nestable NFT',
          description: 'Nestable NFT Frontend',
          url: window.location.origin,
          icons: []
        }
      })
      showToast('WalletKit initialized', 'success')
    } catch (error) {
      showToast('Failed to initialize WalletKit', 'error')
    }
  }

  async function connectAppKit() {
    try {
      const appKit = createAppKit({
        projectId: WALLET_CONNECT_PROJECT_ID,
        chains: [],
        metadata: {
          name: 'Nestable NFT',
          description: 'Nestable NFT Frontend',
          url: window.location.origin,
          icons: []
        }
      })
      appKit.open()
      showToast('AppKit initialized', 'success')
    } catch (error) {
      showToast('Failed to initialize AppKit', 'error')
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

  async function nestMint() {
    if (!nestMintParentId || !nestMintRecipient || !nestMintUri) {
      return showToast('Parent ID, recipient, and URI required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'nest-mint',
        functionArgs: [
          Cl.uint(nestMintParentId),
          Cl.principal(nestMintRecipient),
          Cl.stringAscii(nestMintUri)
        ],
        network: NETWORK
      })
      showToast('Nest mint transaction submitted', 'success')
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

  async function nestTransfer() {
    if (!nestTransferToken || !nestTransferSender || !nestTransferParentId) {
      return showToast('Token, sender, and parent ID required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'nest-transfer',
        functionArgs: [
          Cl.uint(nestTransferToken),
          Cl.principal(nestTransferSender),
          Cl.uint(nestTransferParentId)
        ],
        network: NETWORK
      })
      showToast('Nest transfer transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function acceptChild() {
    if (!acceptParentId || !acceptChildIndex || !acceptChildId || !acceptChildContract) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'accept-child',
        functionArgs: [
          Cl.uint(acceptParentId),
          Cl.uint(acceptChildIndex),
          Cl.uint(acceptChildId),
          Cl.principal(acceptChildContract)
        ],
        network: NETWORK
      })
      showToast('Accept child transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function rejectAllChildren() {
    if (!rejectParentId || !rejectMaxRejections) {
      return showToast('Parent ID and max rejections required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'reject-all-children',
        functionArgs: [
          Cl.uint(rejectParentId),
          Cl.uint(rejectMaxRejections)
        ],
        network: NETWORK
      })
      showToast('Reject children transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function burn() {
    if (!burnToken || !burnMaxRecursive) {
      return showToast('Token and max recursive burns required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'burn',
        functionArgs: [
          Cl.uint(burnToken),
          Cl.uint(burnMaxRecursive)
        ],
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
      const [owner, uri, directOwner, children, pending] = await Promise.all([
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
          functionName: 'get-direct-owner',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-children',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-pending-children',
          functionArgs: [Cl.uint(queryTokenId)],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        })
      ])
      setTokenInfo({
        owner: cvToJSON(owner),
        uri: cvToJSON(uri),
        directOwner: cvToJSON(directOwner),
        children: cvToJSON(children),
        pending: cvToJSON(pending)
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
        <h1>Nestable NFT</h1>
        <p>Hierarchical NFT with Parent-Child Relationships</p>
      </header>

      <div className="wallet-section">
        {!connected ? (
          <div className="wallet-buttons">
            <button className="connect-btn" onClick={connectWallet}>
              Connect (@stacks/connect)
            </button>
            <button className="connect-btn" onClick={connectWalletKit}>
              Connect (WalletKit)
            </button>
            <button className="connect-btn" onClick={connectAppKit}>
              Connect (AppKit)
            </button>
          </div>
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
            <h2>Nest Mint</h2>
            <div className="form-group">
              <label>Parent Token ID</label>
              <input
                type="number"
                value={nestMintParentId}
                onChange={(e) => setNestMintParentId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Recipient</label>
              <input
                type="text"
                placeholder="SP..."
                value={nestMintRecipient}
                onChange={(e) => setNestMintRecipient(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>URI</label>
              <input
                type="text"
                placeholder="ipfs://..."
                value={nestMintUri}
                onChange={(e) => setNestMintUri(e.target.value)}
              />
            </div>
            <button onClick={nestMint} disabled={!connected}>Nest Mint</button>
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
            <h2>Nest Transfer</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                value={nestTransferToken}
                onChange={(e) => setNestTransferToken(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Sender</label>
              <input
                type="text"
                placeholder="SP..."
                value={nestTransferSender}
                onChange={(e) => setNestTransferSender(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Parent Token ID</label>
              <input
                type="number"
                value={nestTransferParentId}
                onChange={(e) => setNestTransferParentId(e.target.value)}
              />
            </div>
            <button onClick={nestTransfer} disabled={!connected}>Nest Transfer</button>
          </div>

          <div className="section">
            <h2>Accept Child</h2>
            <div className="form-group">
              <label>Parent Token ID</label>
              <input
                type="number"
                value={acceptParentId}
                onChange={(e) => setAcceptParentId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Child Index</label>
              <input
                type="number"
                value={acceptChildIndex}
                onChange={(e) => setAcceptChildIndex(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Child Token ID</label>
              <input
                type="number"
                value={acceptChildId}
                onChange={(e) => setAcceptChildId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Child Contract</label>
              <input
                type="text"
                placeholder="SP..."
                value={acceptChildContract}
                onChange={(e) => setAcceptChildContract(e.target.value)}
              />
            </div>
            <button onClick={acceptChild} disabled={!connected}>Accept Child</button>
          </div>

          <div className="section">
            <h2>Reject All Children</h2>
            <div className="form-group">
              <label>Parent Token ID</label>
              <input
                type="number"
                value={rejectParentId}
                onChange={(e) => setRejectParentId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Max Rejections</label>
              <input
                type="number"
                value={rejectMaxRejections}
                onChange={(e) => setRejectMaxRejections(e.target.value)}
              />
            </div>
            <button onClick={rejectAllChildren} disabled={!connected}>Reject All</button>
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
            <div className="form-group">
              <label>Max Recursive Burns</label>
              <input
                type="number"
                value={burnMaxRecursive}
                onChange={(e) => setBurnMaxRecursive(e.target.value)}
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
