import { showConnect, disconnect, openContractCall, request } from '@stacks/connect'
import { 
  Cl, 
  cvToJSON, 
  ClarityValue, 
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  listCV,
  tupleCV,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions'
import { useState, useEffect, useCallback } from 'react'

const CONTRACT_ADDRESS = import.meta.env.VITE_MULTIVERSE_NON_FUNGIBLE_TOKEN_CONTRACT_ADDRESS?.split('.')[0] || ''
const CONTRACT_NAME = import.meta.env.VITE_MULTIVERSE_NON_FUNGIBLE_TOKEN_CONTRACT_ADDRESS?.split('.')[1] || 'multiverse-non-fungible-token'
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

interface TokenData {
  id: number
  owner: string
  uri: string
}

interface DelegateToken {
  contractAddress: string
  tokenId: number
  quantity: number
}

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  
  const [delegates, setDelegates] = useState<DelegateToken[]>([{
    contractAddress: '',
    tokenId: 1,
    quantity: 1
  }])
  const [bundleTokenId, setBundleTokenId] = useState<number>(1)
  const [unbundleTokenId, setUnbundleTokenId] = useState<number>(1)
  const [transferForm, setTransferForm] = useState({ tokenId: 1, recipient: '' })
  const [uriForm, setUriForm] = useState({ tokenId: 1, uri: '' })
  const [burnTokenId, setBurnTokenId] = useState<number>(1)
  
  const [activeTab, setActiveTab] = useState<'info' | 'tokens' | 'bundle' | 'actions'>('info')

  async function connectWallet() {
    try {
      if (WALLET_CONNECT_PROJECT_ID) {
        const response = await request(
          { 
            forceWalletSelect: true,
            walletConnectProjectId: WALLET_CONNECT_PROJECT_ID 
          }, 
          'getAddresses'
        )
        
        if (response && response.addresses && response.addresses.length > 0) {
          const mainnetAddress = response.addresses.find(
            (addr: { address: string }) => addr.address.startsWith('SP')
          )?.address || response.addresses[0].address
          
          setIsConnected(true)
          setUserAddress(mainnetAddress)
          
          await loadContractInfo()
        }
      } else {
        showConnect({
          appDetails: {
            name: 'Multiverse NFT',
            icon: 'https://stacks.co/img/stx-logo.svg'
          },
          onFinish: async (authData: { userSession: { loadUserData: () => { profile: { stxAddress: { mainnet: string } } } } }) => {
            const address = authData.userSession.loadUserData().profile.stxAddress.mainnet
            setIsConnected(true)
            setUserAddress(address)
            
            await loadContractInfo()
          },
          onCancel: () => {
            console.log('Connection cancelled')
          }
        })
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setMessage({ type: 'error', text: 'Failed to connect wallet' })
    }
  }

  async function disconnectWallet() {
    disconnect()
    setIsConnected(false)
    setUserAddress('')
    setTokens([])
    setTokenCount(0)
  }

  const loadContractInfo = useCallback(async () => {
    setIsLoading(true)
    try {
      const countResult: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-last-token-id',
        functionArgs: [],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const countJson = cvToJSON(countResult)
      setTokenCount(countJson.value?.value || 0)

      await loadTokens(countJson.value?.value || 0)
    } catch (error) {
      console.error('Error loading contract info:', error)
    }
    setIsLoading(false)
  }, [])

  async function loadTokens(count: number) {
    const loadedTokens: TokenData[] = []
    for (let i = 1; i <= Math.min(count, 20); i++) {
      try {
        const ownerResult: ClarityValue = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-owner',
          functionArgs: [Cl.uint(i)],
          network: 'mainnet',
          senderAddress: CONTRACT_ADDRESS,
        })
        const ownerJson = cvToJSON(ownerResult)
        
        if (ownerJson.value?.value) {
          const uriResult: ClarityValue = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-token-uri',
            functionArgs: [Cl.uint(i)],
            network: 'mainnet',
            senderAddress: CONTRACT_ADDRESS,
          })
          const uriJson = cvToJSON(uriResult)

          loadedTokens.push({
            id: i,
            owner: ownerJson.value.value,
            uri: uriJson.value?.value || '',
          })
        }
      } catch (error) {
        console.error(`Error loading token ${i}:`, error)
      }
    }
    setTokens(loadedTokens)
  }

  function addDelegateField() {
    setDelegates([...delegates, { contractAddress: '', tokenId: 1, quantity: 1 }])
  }

  function removeDelegateField(index: number) {
    setDelegates(delegates.filter((_, i) => i !== index))
  }

  function updateDelegate(index: number, field: keyof DelegateToken, value: any) {
    const updated = [...delegates]
    updated[index] = { ...updated[index], [field]: value }
    setDelegates(updated)
  }

  async function initBundle() {
    if (delegates.some(d => !d.contractAddress)) {
      setMessage({ type: 'error', text: 'Please fill all delegate fields' })
      return
    }

    const delegatesList = delegates.map(d => 
      tupleCV({
        'contract-address': principalCV(d.contractAddress),
        'token-id': uintCV(d.tokenId),
        'quantity': uintCV(d.quantity)
      })
    )

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'init-bundle',
      functionArgs: [listCV(delegatesList)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Init bundle transaction submitted: ${data.txId}` })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function bundle() {
    if (delegates.some(d => !d.contractAddress)) {
      setMessage({ type: 'error', text: 'Please fill all delegate fields' })
      return
    }

    const delegatesList = delegates.map(d => 
      tupleCV({
        'contract-address': principalCV(d.contractAddress),
        'token-id': uintCV(d.tokenId),
        'quantity': uintCV(d.quantity)
      })
    )

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'bundle',
      functionArgs: [uintCV(bundleTokenId), listCV(delegatesList)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Bundle transaction submitted: ${data.txId}` })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function unbundle() {
    if (delegates.some(d => !d.contractAddress)) {
      setMessage({ type: 'error', text: 'Please fill all delegate fields' })
      return
    }

    const delegatesList = delegates.map(d => 
      tupleCV({
        'contract-address': principalCV(d.contractAddress),
        'token-id': uintCV(d.tokenId),
        'quantity': uintCV(d.quantity)
      })
    )

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'unbundle',
      functionArgs: [uintCV(unbundleTokenId), listCV(delegatesList)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Unbundle transaction submitted: ${data.txId}` })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function transfer() {
    if (!transferForm.recipient) {
      setMessage({ type: 'error', text: 'Please enter recipient address' })
      return
    }

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'transfer',
      functionArgs: [
        uintCV(transferForm.tokenId),
        principalCV(userAddress),
        principalCV(transferForm.recipient),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Transfer transaction submitted: ${data.txId}` })
        setTransferForm({ tokenId: 1, recipient: '' })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function setTokenUri() {
    if (!uriForm.uri) {
      setMessage({ type: 'error', text: 'Please enter token URI' })
      return
    }

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'set-token-uri',
      functionArgs: [
        uintCV(uriForm.tokenId),
        stringAsciiCV(uriForm.uri),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Set URI transaction submitted: ${data.txId}` })
        setUriForm({ tokenId: 1, uri: '' })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function burn() {
    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'burn',
      functionArgs: [uintCV(burnTokenId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Burn transaction submitted: ${data.txId}` })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="app">
      <header className="header">
        <h1>🌌 Multiverse NFT</h1>
        <p>Multi-Asset NFT Bundling on Stacks Mainnet</p>
      </header>

      <section className="wallet-section">
        {!isConnected ? (
          <div className="connect-container">
            <p className="connect-info">
              Connect your wallet to interact with the Multiverse NFT contract
            </p>
            <button className="connect-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="connected">
            <span className="address">{userAddress}</span>
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}
      </section>

      {isConnected && (
        <main className="main-content">
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Contract Info
            </button>
            <button 
              className={`tab-btn ${activeTab === 'tokens' ? 'active' : ''}`}
              onClick={() => setActiveTab('tokens')}
            >
              Tokens
            </button>
            <button 
              className={`tab-btn ${activeTab === 'bundle' ? 'active' : ''}`}
              onClick={() => setActiveTab('bundle')}
            >
              Bundle/Unbundle
            </button>
            <button 
              className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              Actions
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="card">
              <h2>Contract Information</h2>
              {isLoading ? (
                <div className="loading">Loading...</div>
              ) : (
                <div className="info-grid">
                  <div className="info-item">
                    <label>Contract Address</label>
                    <span>{CONTRACT_ADDRESS}</span>
                  </div>
                  <div className="info-item">
                    <label>Contract Name</label>
                    <span>{CONTRACT_NAME}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Tokens</label>
                    <span>{tokenCount}</span>
                  </div>
                </div>
              )}
              
              <button 
                className="submit-btn" 
                onClick={loadContractInfo}
                style={{ marginTop: '1rem' }}
              >
                Refresh Data
              </button>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="card">
              <h2>Token List</h2>
              {isLoading ? (
                <div className="loading">Loading tokens...</div>
              ) : tokens.length === 0 ? (
                <div className="empty-state">
                  <p>No tokens minted yet</p>
                </div>
              ) : (
                <div className="token-list">
                  {tokens.map((token) => (
                    <div key={token.id} className="token-item">
                      <div className="token-header">
                        <span className="token-id">Token #{token.id}</span>
                      </div>
                      <div className="token-details">
                        <p><strong>Owner:</strong> {token.owner}</p>
                        <p><strong>URI:</strong> {token.uri || 'No URI'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bundle' && (
            <>
              <div className="card">
                <h2>Initialize Bundle (Create New NFT)</h2>
                <h3>Delegate Tokens</h3>
                {delegates.map((delegate, index) => (
                  <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--light-gray)', borderRadius: '8px' }}>
                    <div className="form-group">
                      <label>Contract Address</label>
                      <input
                        type="text"
                        placeholder="SP..."
                        value={delegate.contractAddress}
                        onChange={(e) => updateDelegate(index, 'contractAddress', e.target.value)}
                      />
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>Token ID</label>
                        <input
                          type="number"
                          min="1"
                          value={delegate.tokenId}
                          onChange={(e) => updateDelegate(index, 'tokenId', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={delegate.quantity}
                          onChange={(e) => updateDelegate(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    {delegates.length > 1 && (
                      <button 
                        className="action-btn danger" 
                        onClick={() => removeDelegateField(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button className="submit-btn" onClick={addDelegateField}>
                  + Add Delegate Token
                </button>
                <button className="submit-btn success" onClick={initBundle} style={{ marginTop: '0.5rem' }}>
                  Initialize Bundle
                </button>
              </div>

              <div className="card">
                <h2>Bundle Tokens (Add to Existing NFT)</h2>
                <div className="form-group">
                  <label>Multiverse Token ID</label>
                  <input
                    type="number"
                    min="1"
                    value={bundleTokenId}
                    onChange={(e) => setBundleTokenId(parseInt(e.target.value) || 1)}
                  />
                </div>
                <button className="submit-btn" onClick={bundle}>
                  Bundle Tokens
                </button>
              </div>

              <div className="card">
                <h2>Unbundle Tokens (Remove from NFT)</h2>
                <div className="form-group">
                  <label>Multiverse Token ID</label>
                  <input
                    type="number"
                    min="1"
                    value={unbundleTokenId}
                    onChange={(e) => setUnbundleTokenId(parseInt(e.target.value) || 1)}
                  />
                </div>
                <button className="submit-btn warning" onClick={unbundle}>
                  Unbundle Tokens
                </button>
              </div>
            </>
          )}

          {activeTab === 'actions' && (
            <>
              <div className="card">
                <h2>Transfer Token</h2>
                <div className="row">
                  <div className="form-group">
                    <label>Token ID</label>
                    <input
                      type="number"
                      min="1"
                      value={transferForm.tokenId}
                      onChange={(e) => setTransferForm({ ...transferForm, tokenId: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Recipient</label>
                    <input
                      type="text"
                      placeholder="SP..."
                      value={transferForm.recipient}
                      onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
                    />
                  </div>
                </div>
                <button className="submit-btn" onClick={transfer}>
                  Transfer Token
                </button>
              </div>

              <div className="card">
                <h2>Set Token URI</h2>
                <div className="row">
                  <div className="form-group">
                    <label>Token ID</label>
                    <input
                      type="number"
                      min="1"
                      value={uriForm.tokenId}
                      onChange={(e) => setUriForm({ ...uriForm, tokenId: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>URI (max 256 chars)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={uriForm.uri}
                      onChange={(e) => setUriForm({ ...uriForm, uri: e.target.value.slice(0, 256) })}
                    />
                  </div>
                </div>
                <button className="submit-btn" onClick={setTokenUri}>
                  Set Token URI
                </button>
              </div>

              <div className="card">
                <h2>Burn Token</h2>
                <div className="form-group">
                  <label>Token ID</label>
                  <input
                    type="number"
                    min="1"
                    value={burnTokenId}
                    onChange={(e) => setBurnTokenId(parseInt(e.target.value) || 1)}
                  />
                </div>
                <button className="submit-btn danger" onClick={burn}>
                  Burn Token
                </button>
              </div>
            </>
          )}
        </main>
      )}
    </div>
  )
}

export default App
