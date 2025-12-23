import { showConnect, disconnect, openContractCall, request } from '@stacks/connect'
import { 
  Cl, 
  cvToJSON, 
  ClarityValue, 
  PostConditionMode,
  stringUtf8CV,
  stringAsciiCV,
  uintCV,
  principalCV,
  boolCV,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions'
import { useState, useEffect, useCallback } from 'react'

const CONTRACT_ADDRESS = import.meta.env.VITE_MINIMAL_SOULBOUND_NFT_CONTRACT_ADDRESS?.split('.')[0] || ''
const CONTRACT_NAME = import.meta.env.VITE_MINIMAL_SOULBOUND_NFT_CONTRACT_ADDRESS?.split('.')[1] || 'minimal-soulbound-nft'
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

interface TokenData {
  id: number
  owner: string
  uri: string
  locked: boolean
  mintedAt: number
}

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [baseUri, setBaseUri] = useState<string>('')
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  
  const [mintForm, setMintForm] = useState({ recipient: '', uri: '' })
  const [transferForm, setTransferForm] = useState({ tokenId: 1, recipient: '' })
  const [setMinterForm, setSetMinterForm] = useState({ account: '', status: true })
  const [newBaseUri, setNewBaseUri] = useState('')
  const [tokenIdInput, setTokenIdInput] = useState<number>(1)
  const [checkMinterAddress, setCheckMinterAddress] = useState('')
  const [isMinterResult, setIsMinterResult] = useState<boolean | null>(null)
  
  const [activeTab, setActiveTab] = useState<'info' | 'tokens' | 'mint' | 'actions' | 'admin'>('info')

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
          
          await loadContractInfo()
        }
      } else {
        showConnect({
          appDetails: {
            name: 'Minimal Soulbound NFT',
            icon: 'https://stacks.co/img/stx-logo.svg'
          },
          onFinish: async (authData: { userSession: { loadUserData: () => { profile: { stxAddress: { mainnet: string } } } } }) => {
            const address = authData.userSession.loadUserData().profile.stxAddress.mainnet
            setIsConnected(true)
            setUserAddress(address)
            setMintForm(prev => ({ ...prev, recipient: address }))
            
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
        functionName: 'get-token-count',
        functionArgs: [],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const countJson = cvToJSON(countResult)
      setTokenCount(countJson.value || 0)

      const uriResult: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-base-uri',
        functionArgs: [],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const uriJson = cvToJSON(uriResult)
      setBaseUri(uriJson.value || '')

      await loadTokens(countJson.value || 0)
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
        
        if (ownerJson.value) {
          const lockedResult: ClarityValue = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'locked',
            functionArgs: [Cl.uint(i)],
            network: 'mainnet',
            senderAddress: CONTRACT_ADDRESS,
          })
          const lockedJson = cvToJSON(lockedResult)

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
            owner: ownerJson.value,
            uri: uriJson.value?.value || '',
            locked: lockedJson.value?.value || false,
            mintedAt: 0,
          })
        }
      } catch (error) {
        console.error(`Error loading token ${i}:`, error)
      }
    }
    setTokens(loadedTokens)
  }

  async function checkIsMinter() {
    if (!checkMinterAddress) return
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'is-minter',
        functionArgs: [Cl.principal(checkMinterAddress)],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(result)
      setIsMinterResult(json.value || false)
    } catch (error) {
      console.error('Error checking minter:', error)
      setMessage({ type: 'error', text: 'Failed to check minter status' })
    }
  }

  async function mint() {
    if (!mintForm.recipient || !mintForm.uri) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'mint',
      functionArgs: [
        principalCV(mintForm.recipient),
        stringUtf8CV(mintForm.uri),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Mint transaction submitted: ${data.txId}` })
        setMintForm({ recipient: userAddress, uri: '' })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function burn(tokenId: number) {
    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'burn',
      functionArgs: [uintCV(tokenId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Burn transaction submitted: ${data.txId}` })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function unlock(tokenId: number) {
    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'unlock',
      functionArgs: [uintCV(tokenId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Unlock transaction submitted: ${data.txId}` })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function lock(tokenId: number) {
    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'lock',
      functionArgs: [uintCV(tokenId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Lock transaction submitted: ${data.txId}` })
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

  async function setMinter() {
    if (!setMinterForm.account) {
      setMessage({ type: 'error', text: 'Please enter account address' })
      return
    }

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'set-minter',
      functionArgs: [
        principalCV(setMinterForm.account),
        boolCV(setMinterForm.status),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Set minter transaction submitted: ${data.txId}` })
        setSetMinterForm({ account: '', status: true })
      },
      onCancel: () => {
        setMessage({ type: 'info', text: 'Transaction cancelled' })
      }
    })
  }

  async function updateBaseUri() {
    if (!newBaseUri) {
      setMessage({ type: 'error', text: 'Please enter new base URI' })
      return
    }

    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'set-base-uri',
      functionArgs: [stringAsciiCV(newBaseUri)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: { txId: string }) => {
        setMessage({ type: 'success', text: `Set base URI transaction submitted: ${data.txId}` })
        setNewBaseUri('')
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
        <h1>🔗 Minimal Soulbound NFT</h1>
        <p>ERC-5192 Implementation on Stacks Mainnet</p>
      </header>

      <section className="wallet-section">
        {!isConnected ? (
          <div className="connect-container">
            <p className="connect-info">
              Connect your wallet to interact with the Soulbound NFT contract
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
              className={`tab-btn ${activeTab === 'mint' ? 'active' : ''}`}
              onClick={() => setActiveTab('mint')}
            >
              Mint
            </button>
            <button 
              className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              Actions
            </button>
            <button 
              className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              Admin
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
                  <div className="info-item">
                    <label>Base URI</label>
                    <span>{baseUri || 'Not set'}</span>
                  </div>
                </div>
              )}
              
              <h3>Check Minter Status</h3>
              <div className="row">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter address to check"
                    value={checkMinterAddress}
                    onChange={(e) => setCheckMinterAddress(e.target.value)}
                  />
                </div>
              </div>
              <button className="submit-btn" onClick={checkIsMinter}>
                Check Minter
              </button>
              {isMinterResult !== null && (
                <div className={`message ${isMinterResult ? 'success' : 'info'}`} style={{ marginTop: '1rem' }}>
                  {isMinterResult ? 'This address is a minter' : 'This address is not a minter'}
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
                    <div key={token.id} className={`token-item ${token.locked ? 'locked' : 'unlocked'}`}>
                      <div className="token-header">
                        <span className="token-id">Token #{token.id}</span>
                        <span className={`token-status ${token.locked ? 'locked' : 'unlocked'}`}>
                          {token.locked ? '🔒 Locked' : '🔓 Unlocked'}
                        </span>
                      </div>
                      <div className="token-details">
                        <p><strong>Owner:</strong> {token.owner}</p>
                        <p><strong>URI:</strong> {token.uri || 'No URI'}</p>
                      </div>
                      {token.owner === userAddress && (
                        <div className="action-buttons">
                          <button 
                            className="action-btn danger" 
                            onClick={() => burn(token.id)}
                          >
                            Burn
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mint' && (
            <div className="card">
              <h2>Mint New Soulbound NFT</h2>
              <div className="form-group">
                <label>Recipient Address</label>
                <input
                  type="text"
                  placeholder="SP..."
                  value={mintForm.recipient}
                  onChange={(e) => setMintForm({ ...mintForm, recipient: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Token URI (max 64 chars)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={mintForm.uri}
                  onChange={(e) => setMintForm({ ...mintForm, uri: e.target.value.slice(0, 64) })}
                />
              </div>
              <button className="submit-btn success" onClick={mint}>
                Mint Token
              </button>
            </div>
          )}

          {activeTab === 'actions' && (
            <>
              <div className="card">
                <h2>Lock / Unlock Token (Owner Only)</h2>
                <div className="form-group">
                  <label>Token ID</label>
                  <input
                    type="number"
                    min="1"
                    value={tokenIdInput}
                    onChange={(e) => setTokenIdInput(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="action-buttons">
                  <button 
                    className="action-btn success" 
                    onClick={() => unlock(tokenIdInput)}
                  >
                    Unlock Token
                  </button>
                  <button 
                    className="action-btn warning" 
                    onClick={() => lock(tokenIdInput)}
                  >
                    Lock Token
                  </button>
                </div>
              </div>

              <div className="card">
                <h2>Transfer Token (Only if Unlocked)</h2>
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
                <h2>Burn Token</h2>
                <div className="form-group">
                  <label>Token ID to Burn</label>
                  <input
                    type="number"
                    min="1"
                    value={tokenIdInput}
                    onChange={(e) => setTokenIdInput(parseInt(e.target.value) || 1)}
                  />
                </div>
                <button className="submit-btn danger" onClick={() => burn(tokenIdInput)}>
                  Burn Token
                </button>
              </div>
            </>
          )}

          {activeTab === 'admin' && (
            <>
              <div className="card">
                <h2>Set Minter (Contract Owner Only)</h2>
                <div className="form-group">
                  <label>Account Address</label>
                  <input
                    type="text"
                    placeholder="SP..."
                    value={setMinterForm.account}
                    onChange={(e) => setSetMinterForm({ ...setMinterForm, account: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Minter Status</label>
                  <select
                    value={setMinterForm.status ? 'true' : 'false'}
                    onChange={(e) => setSetMinterForm({ ...setMinterForm, status: e.target.value === 'true' })}
                  >
                    <option value="true">Enable Minter</option>
                    <option value="false">Disable Minter</option>
                  </select>
                </div>
                <button className="submit-btn" onClick={setMinter}>
                  Set Minter Status
                </button>
              </div>

              <div className="card">
                <h2>Set Base URI (Contract Owner Only)</h2>
                <div className="form-group">
                  <label>New Base URI (max 64 ASCII chars)</label>
                  <input
                    type="text"
                    placeholder="https://api.example.com/nft/"
                    value={newBaseUri}
                    onChange={(e) => setNewBaseUri(e.target.value.slice(0, 64))}
                  />
                </div>
                <button className="submit-btn" onClick={updateBaseUri}>
                  Update Base URI
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
