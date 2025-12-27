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

const CONTRACT_ADDRESS = import.meta.env.VITE_SFT_WITH_SUPPLY_EXTENSION_CONTRACT_ADDRESS?.split('.')[0] || ''
const CONTRACT_NAME = import.meta.env.VITE_SFT_WITH_SUPPLY_EXTENSION_CONTRACT_ADDRESS?.split('.')[1] || 'sft-with-supply-extension'
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

interface TokenBalance {
  tokenId: number
  balance: number
  totalSupply: number
  uri: string
}

interface Transfer {
  tokenId: number
  amount: number
  recipient: string
}

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  
  const [mintForm, setMintForm] = useState({ tokenId: 1, amount: 100, recipient: '' })
  const [transferForm, setTransferForm] = useState({ tokenId: 1, amount: 10, recipient: '' })
  const [burnForm, setBurnForm] = useState({ tokenId: 1, amount: 10 })
  const [uriForm, setUriForm] = useState({ tokenId: 1, uri: '' })
  const [batchTransfers, setBatchTransfers] = useState<Transfer[]>([{ tokenId: 1, amount: 10, recipient: '' }])
  const [queryTokenId, setQueryTokenId] = useState<number>(1)
  
  const [activeTab, setActiveTab] = useState<'info' | 'mint' | 'transfer' | 'burn'>('info')

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
          setMintForm(prev => ({ ...prev, recipient: mainnetAddress }))
          setTransferForm(prev => ({ ...prev, recipient: mainnetAddress }))
          
          await loadBalances(mainnetAddress)
        }
      } else {
        showConnect({
          appDetails: {
            name: 'SFT with Supply Extension',
            icon: 'https://stacks.co/img/stx-logo.svg'
          },
          onFinish: async (authData: { userSession: { loadUserData: () => { profile: { stxAddress: { mainnet: string } } } } }) => {
            const address = authData.userSession.loadUserData().profile.stxAddress.mainnet
            setIsConnected(true)
            setUserAddress(address)
            setMintForm(prev => ({ ...prev, recipient: address }))
            setTransferForm(prev => ({ ...prev, recipient: address }))
            
            await loadBalances(address)
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
    setTokenBalances([])
  }

  const loadBalances = useCallback(async (address: string) => {
    setIsLoading(true)
    const balances: TokenBalance[] = []
    
    for (let i = 1; i <= 10; i++) {
      try {
        const existsResult: ClarityValue = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'exists',
          functionArgs: [Cl.uint(i)],
          network: 'mainnet',
          senderAddress: CONTRACT_ADDRESS,
        })
        const existsJson = cvToJSON(existsResult)
        
        if (existsJson.value?.value) {
          const balanceResult: ClarityValue = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-balance',
            functionArgs: [Cl.uint(i), Cl.principal(address)],
            network: 'mainnet',
            senderAddress: CONTRACT_ADDRESS,
          })
          const balanceJson = cvToJSON(balanceResult)

          const supplyResult: ClarityValue = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-total-supply',
            functionArgs: [Cl.uint(i)],
            network: 'mainnet',
            senderAddress: CONTRACT_ADDRESS,
          })
          const supplyJson = cvToJSON(supplyResult)

          const uriResult: ClarityValue = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-token-uri',
            functionArgs: [Cl.uint(i)],
            network: 'mainnet',
            senderAddress: CONTRACT_ADDRESS,
          })
          const uriJson = cvToJSON(uriResult)

          balances.push({
            tokenId: i,
            balance: balanceJson.value?.value || 0,
            totalSupply: supplyJson.value?.value || 0,
            uri: uriJson.value?.value?.value || '',
          })
        }
      } catch (error) {
        console.error(`Error loading token ${i}:`, error)
      }
    }
    
    setTokenBalances(balances)
    setIsLoading(false)
  }, [])

  async function mint() {
    if (!mintForm.recipient) {
      setMessage({ type: 'error', text: 'Please enter recipient address' })
      return
    }

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'mint',
      functionArgs: [
        uintCV(mintForm.tokenId),
        uintCV(mintForm.amount),
        principalCV(mintForm.recipient),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Mint transaction submitted: ${data.txId}` })
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
        uintCV(transferForm.amount),
        principalCV(userAddress),
        principalCV(transferForm.recipient),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Transfer transaction submitted: ${data.txId}` })
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
      functionArgs: [
        uintCV(burnForm.tokenId),
        uintCV(burnForm.amount),
        principalCV(userAddress),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Burn transaction submitted: ${data.txId}` })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function setTokenUri() {
    if (!uriForm.uri) {
      setMessage({ type: 'error', text: 'Please enter URI' })
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
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  function addBatchTransfer() {
    setBatchTransfers([...batchTransfers, { tokenId: 1, amount: 10, recipient: '' }])
  }

  function removeBatchTransfer(index: number) {
    setBatchTransfers(batchTransfers.filter((_, i) => i !== index))
  }

  function updateBatchTransfer(index: number, field: keyof Transfer, value: any) {
    const updated = [...batchTransfers]
    updated[index] = { ...updated[index], [field]: value }
    setBatchTransfers(updated)
  }

  async function batchTransfer() {
    if (batchTransfers.some(t => !t.recipient)) {
      setMessage({ type: 'error', text: 'Please fill all transfer fields' })
      return
    }

    const transfersList = batchTransfers.map(t => 
      tupleCV({
        'token-id': uintCV(t.tokenId),
        'amount': uintCV(t.amount),
        'recipient': principalCV(t.recipient)
      })
    )

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'batch-transfer',
      functionArgs: [listCV(transfersList)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Batch transfer transaction submitted: ${data.txId}` })
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
        <h1>💎 SFT with Supply Extension</h1>
        <p>Semi-Fungible Token Contract on Stacks Mainnet</p>
      </header>

      <section className="wallet-section">
        {!isConnected ? (
          <div className="connect-container">
            <p className="connect-info">
              Connect your wallet to interact with the SFT contract
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
              Balances
            </button>
            <button 
              className={`tab-btn ${activeTab === 'mint' ? 'active' : ''}`}
              onClick={() => setActiveTab('mint')}
            >
              Mint
            </button>
            <button 
              className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
              onClick={() => setActiveTab('transfer')}
            >
              Transfer
            </button>
            <button 
              className={`tab-btn ${activeTab === 'burn' ? 'active' : ''}`}
              onClick={() => setActiveTab('burn')}
            >
              Burn & Admin
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="card">
              <h2>Token Balances</h2>
              {isLoading ? (
                <div className="loading">Loading...</div>
              ) : tokenBalances.length === 0 ? (
                <div className="empty-state">
                  <p>No tokens found</p>
                </div>
              ) : (
                <div className="token-list">
                  {tokenBalances.map((token) => (
                    <div key={token.tokenId} className="token-item">
                      <div className="token-header">
                        <span className="token-id">Token #{token.tokenId}</span>
                      </div>
                      <div className="token-details">
                        <p><strong>Your Balance:</strong> {token.balance}</p>
                        <p><strong>Total Supply:</strong> {token.totalSupply}</p>
                        <p><strong>URI:</strong> {token.uri || 'No URI'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                className="submit-btn" 
                onClick={() => loadBalances(userAddress)}
                style={{ marginTop: '1rem' }}
              >
                Refresh Balances
              </button>
            </div>
          )}

          {activeTab === 'mint' && (
            <div className="card">
              <h2>Mint Tokens (Owner Only)</h2>
              <div className="row">
                <div className="form-group">
                  <label>Token ID</label>
                  <input
                    type="number"
                    min="1"
                    value={mintForm.tokenId}
                    onChange={(e) => setMintForm({ ...mintForm, tokenId: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={mintForm.amount}
                    onChange={(e) => setMintForm({ ...mintForm, amount: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Recipient</label>
                <input
                  type="text"
                  placeholder="SP..."
                  value={mintForm.recipient}
                  onChange={(e) => setMintForm({ ...mintForm, recipient: e.target.value })}
                />
              </div>
              <button className="submit-btn success" onClick={mint}>
                Mint Tokens
              </button>
            </div>
          )}

          {activeTab === 'transfer' && (
            <>
              <div className="card">
                <h2>Transfer Tokens</h2>
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
                    <label>Amount</label>
                    <input
                      type="number"
                      min="1"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: parseInt(e.target.value) || 1 })}
                    />
                  </div>
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
                <button className="submit-btn" onClick={transfer}>
                  Transfer Tokens
                </button>
              </div>

              <div className="card">
                <h2>Batch Transfer (Owner Only)</h2>
                {batchTransfers.map((transfer, index) => (
                  <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--light-gray)', borderRadius: '8px' }}>
                    <div className="row">
                      <div className="form-group">
                        <label>Token ID</label>
                        <input
                          type="number"
                          min="1"
                          value={transfer.tokenId}
                          onChange={(e) => updateBatchTransfer(index, 'tokenId', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Amount</label>
                        <input
                          type="number"
                          min="1"
                          value={transfer.amount}
                          onChange={(e) => updateBatchTransfer(index, 'amount', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Recipient</label>
                      <input
                        type="text"
                        placeholder="SP..."
                        value={transfer.recipient}
                        onChange={(e) => updateBatchTransfer(index, 'recipient', e.target.value)}
                      />
                    </div>
                    {batchTransfers.length > 1 && (
                      <button 
                        className="action-btn danger" 
                        onClick={() => removeBatchTransfer(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button className="submit-btn" onClick={addBatchTransfer}>
                  + Add Transfer
                </button>
                <button className="submit-btn success" onClick={batchTransfer} style={{ marginTop: '0.5rem' }}>
                  Execute Batch Transfer
                </button>
              </div>
            </>
          )}

          {activeTab === 'burn' && (
            <>
              <div className="card">
                <h2>Burn Tokens</h2>
                <div className="row">
                  <div className="form-group">
                    <label>Token ID</label>
                    <input
                      type="number"
                      min="1"
                      value={burnForm.tokenId}
                      onChange={(e) => setBurnForm({ ...burnForm, tokenId: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      min="1"
                      value={burnForm.amount}
                      onChange={(e) => setBurnForm({ ...burnForm, amount: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <button className="submit-btn danger" onClick={burn}>
                  Burn Tokens
                </button>
              </div>

              <div className="card">
                <h2>Set Token URI (Owner Only)</h2>
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
            </>
          )}
        </main>
      )}
    </div>
  )
}

export default App
