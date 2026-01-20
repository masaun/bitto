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
  bufferCV,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions'
import { createAppKit } from '@reown/appkit'
import { Web3Wallet } from '@walletconnect/web3wallet'
import { useState, useEffect, useCallback } from 'react'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONSUMABLE_NFT_CONTRACT_ADDRESS?.split('.')[0] || ''
const CONTRACT_NAME = import.meta.env.VITE_CONSUMABLE_NFT_CONTRACT_ADDRESS?.split('.')[1] || 'consumable-nft'
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

interface TokenData {
  id: number
  owner: string
  uri: string
  consumed: boolean
  consumedAt: number | null
  consumedBy: string | null
}

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [baseUri, setBaseUri] = useState<string>('')
  const [owner, setOwner] = useState<string>('')
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  
  const [mintForm, setMintForm] = useState({ recipient: '', uri: '' })
  const [consumeForm, setConsumeForm] = useState({ consumer: '', tokenId: 1, data: '' })
  const [transferForm, setTransferForm] = useState({ tokenId: 1, recipient: '' })
  const [setConsumerForm, setSetConsumerForm] = useState({ consumer: '', authorized: true })
  const [newBaseUri, setNewBaseUri] = useState('')
  const [transferOwnerForm, setTransferOwnerForm] = useState({ newOwner: '' })
  const [tokenIdInput, setTokenIdInput] = useState<number>(1)
  const [checkConsumerAddress, setCheckConsumerAddress] = useState('')
  const [isConsumerResult, setIsConsumerResult] = useState<boolean | null>(null)
  
  const [activeTab, setActiveTab] = useState<'info' | 'tokens' | 'mint' | 'consume' | 'admin'>('info')

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
          setConsumeForm(prev => ({ ...prev, consumer: mainnetAddress }))
          
          await loadContractInfo()
        }
      } else {
        showConnect({
          appDetails: {
            name: 'Consumable NFT - ERC-2135',
            icon: 'https://stacks.co/img/stx-logo.svg'
          },
          onFinish: async (authData: { userSession: { loadUserData: () => { profile: { stxAddress: { mainnet: string } } } } }) => {
            const address = authData.userSession.loadUserData().profile.stxAddress.mainnet
            setIsConnected(true)
            setUserAddress(address)
            setMintForm(prev => ({ ...prev, recipient: address }))
            setConsumeForm(prev => ({ ...prev, consumer: address }))
            
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

  async function connectWalletKit() {
    try {
      const web3Wallet = await Web3Wallet.init({
        core: {
          projectId: WALLET_CONNECT_PROJECT_ID
        },
        metadata: {
          name: 'Consumable NFT',
          description: 'Consumable NFT Frontend',
          url: window.location.origin,
          icons: []
        }
      })
      setMessage({ type: 'success', text: 'WalletKit initialized' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to initialize WalletKit' })
    }
  }

  async function connectAppKit() {
    try {
      const appKit = createAppKit({
        projectId: WALLET_CONNECT_PROJECT_ID,
        chains: [],
        metadata: {
          name: 'Consumable NFT',
          description: 'Consumable NFT Frontend',
          url: window.location.origin,
          icons: []
        }
      })
      appKit.open()
      setMessage({ type: 'success', text: 'AppKit initialized' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to initialize AppKit' })
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

      const ownerResult: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-owner',
        functionArgs: [],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const ownerJson = cvToJSON(ownerResult)
      setOwner(ownerJson.value || '')

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
        const infoResult: ClarityValue = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-token-info',
          functionArgs: [Cl.uint(i)],
          network: 'mainnet',
          senderAddress: CONTRACT_ADDRESS,
        })
        const infoJson = cvToJSON(infoResult)
        
        loadedTokens.push({
          id: i,
          owner: infoJson.value?.owner?.value || '',
          uri: infoJson.value?.uri?.value || '',
          consumed: infoJson.value?.consumed?.value || false,
          consumedAt: infoJson.value?.['consumed-at']?.value || null,
          consumedBy: infoJson.value?.['consumed-by']?.value || null,
        })
      } catch (error) {
        console.error(`Error loading token ${i}:`, error)
      }
    }
    setTokens(loadedTokens)
  }

  async function checkIsConsumer() {
    if (!checkConsumerAddress) return
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'is-authorized-consumer',
        functionArgs: [Cl.principal(checkConsumerAddress)],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(result)
      setIsConsumerResult(json.value || false)
    } catch (error) {
      console.error('Error checking consumer:', error)
      setMessage({ type: 'error', text: 'Failed to check consumer status' })
    }
  }

  async function getTokenDetails() {
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-token-info',
        functionArgs: [Cl.uint(tokenIdInput)],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(result)
      const consumed = json.value?.consumed?.value || false
      setMessage({ 
        type: 'info', 
        text: `Token #${tokenIdInput}: Owner: ${json.value?.owner?.value || 'None'}, Consumed: ${consumed}, URI: ${json.value?.uri?.value || 'N/A'}` 
      })
    } catch (error) {
      console.error('Error getting token:', error)
      setMessage({ type: 'error', text: 'Failed to get token details' })
    }
  }

  async function checkIsConsumable() {
    if (!consumeForm.consumer) return
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'is-consumable-by',
        functionArgs: [
          Cl.principal(consumeForm.consumer),
          Cl.uint(consumeForm.tokenId),
          Cl.uint(1),
        ],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(result)
      setMessage({ 
        type: json.value ? 'success' : 'error', 
        text: `Token #${consumeForm.tokenId} is ${json.value ? 'consumable' : 'NOT consumable'} by ${consumeForm.consumer}` 
      })
    } catch (error) {
      console.error('Error checking consumability:', error)
      setMessage({ type: 'error', text: 'Failed to check consumability' })
    }
  }

  async function handleMint() {
    if (!mintForm.recipient || !mintForm.uri) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'mint',
        functionArgs: [
          principalCV(mintForm.recipient),
          stringUtf8CV(mintForm.uri),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          setMessage({ type: 'success', text: `Transaction submitted: ${data.txId}` })
          setMintForm({ recipient: userAddress, uri: '' })
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error minting:', error)
      setMessage({ type: 'error', text: 'Failed to mint token' })
    }
  }

  async function handleConsume() {
    if (!consumeForm.consumer) {
      setMessage({ type: 'error', text: 'Please enter consumer address' })
      return
    }
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'consume',
        functionArgs: [
          principalCV(consumeForm.consumer),
          uintCV(consumeForm.tokenId),
          uintCV(1),
          bufferCV(Buffer.from(consumeForm.data || 'consumed')),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          setMessage({ type: 'success', text: `Token consumed! Transaction: ${data.txId}` })
          setConsumeForm({ consumer: userAddress, tokenId: 1, data: '' })
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error consuming:', error)
      setMessage({ type: 'error', text: 'Failed to consume token' })
    }
  }

  async function handleTransfer() {
    if (!transferForm.recipient) {
      setMessage({ type: 'error', text: 'Please enter recipient address' })
      return
    }
    try {
      await openContractCall({
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
          setMessage({ type: 'success', text: `Transaction submitted: ${data.txId}` })
          setTransferForm({ tokenId: 1, recipient: '' })
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error transferring:', error)
      setMessage({ type: 'error', text: 'Failed to transfer token' })
    }
  }

  async function handleSetAuthorizedConsumer() {
    if (!setConsumerForm.consumer) {
      setMessage({ type: 'error', text: 'Please enter consumer address' })
      return
    }
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-authorized-consumer',
        functionArgs: [
          principalCV(setConsumerForm.consumer),
          boolCV(setConsumerForm.authorized),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          setMessage({ type: 'success', text: `Transaction submitted: ${data.txId}` })
          setSetConsumerForm({ consumer: '', authorized: true })
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error setting consumer:', error)
      setMessage({ type: 'error', text: 'Failed to set authorized consumer' })
    }
  }

  async function handleSetBaseUri() {
    if (!newBaseUri) {
      setMessage({ type: 'error', text: 'Please enter new base URI' })
      return
    }
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-base-uri',
        functionArgs: [stringAsciiCV(newBaseUri)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          setMessage({ type: 'success', text: `Transaction submitted: ${data.txId}` })
          setNewBaseUri('')
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error setting URI:', error)
      setMessage({ type: 'error', text: 'Failed to set base URI' })
    }
  }

  async function handleTransferOwnership() {
    if (!transferOwnerForm.newOwner) {
      setMessage({ type: 'error', text: 'Please enter new owner address' })
      return
    }
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'transfer-ownership',
        functionArgs: [principalCV(transferOwnerForm.newOwner)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          setMessage({ type: 'success', text: `Transaction submitted: ${data.txId}` })
          setTransferOwnerForm({ newOwner: '' })
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error transferring ownership:', error)
      setMessage({ type: 'error', text: 'Failed to transfer ownership' })
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="container">
      <header>
        <h1>Consumable NFT (ERC-2135)</h1>
        {isConnected ? (
          <div className="connected-indicator">
            <span className="dot"></span>
            <span className="address">{userAddress.slice(0, 8)}...{userAddress.slice(-4)}</span>
            <button onClick={disconnectWallet} className="secondary">Disconnect</button>
          </div>
        ) : (
          <div className="wallet-buttons">
            <button onClick={connectWallet}>Connect (@stacks/connect)</button>
            <button onClick={connectWalletKit}>Connect (WalletKit)</button>
            <button onClick={connectAppKit}>Connect (AppKit)</button>
          </div>
        )}
      </header>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        <button 
          className={activeTab === 'info' ? 'active' : ''} 
          onClick={() => setActiveTab('info')}
        >
          Contract Info
        </button>
        <button 
          className={activeTab === 'tokens' ? 'active' : ''} 
          onClick={() => setActiveTab('tokens')}
        >
          Tokens ({tokenCount})
        </button>
        <button 
          className={activeTab === 'mint' ? 'active' : ''} 
          onClick={() => setActiveTab('mint')}
        >
          Mint & Transfer
        </button>
        <button 
          className={activeTab === 'consume' ? 'active' : ''} 
          onClick={() => setActiveTab('consume')}
        >
          Consume
        </button>
        <button 
          className={activeTab === 'admin' ? 'active' : ''} 
          onClick={() => setActiveTab('admin')}
        >
          Admin
        </button>
      </div>

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="section">
          <h2>Contract Information</h2>
          <div className="card">
            <div className="info-grid">
              <div className="info-item">
                <div className="label">Contract Address</div>
                <div className="value address">{CONTRACT_ADDRESS}.{CONTRACT_NAME}</div>
              </div>
              <div className="info-item">
                <div className="label">Total Tokens</div>
                <div className="value">{tokenCount}</div>
              </div>
              <div className="info-item">
                <div className="label">Base URI</div>
                <div className="value">{baseUri || 'Not set'}</div>
              </div>
              <div className="info-item">
                <div className="label">Contract Owner</div>
                <div className="value address">{owner}</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={loadContractInfo} disabled={isLoading}>
                Refresh
              </button>
            </div>
          </div>

          <h2>Check Token Details</h2>
          <div className="card">
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                min="1"
                value={tokenIdInput}
                onChange={(e) => setTokenIdInput(parseInt(e.target.value) || 1)}
              />
            </div>
            <button onClick={getTokenDetails}>Get Token Details</button>
          </div>

          <h2>Check Authorized Consumer</h2>
          <div className="card">
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={checkConsumerAddress}
                onChange={(e) => setCheckConsumerAddress(e.target.value)}
              />
            </div>
            <button onClick={checkIsConsumer}>Check</button>
            {isConsumerResult !== null && (
              <p style={{ marginTop: '1rem' }}>
                Result: <span className={`status-badge ${isConsumerResult ? 'active' : 'consumed'}`}>
                  {isConsumerResult ? 'Authorized' : 'Not Authorized'}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="section">
          <h2>Consumable Tokens</h2>
          {tokens.length === 0 ? (
            <div className="card">
              <p>No tokens found</p>
            </div>
          ) : (
            <div className="token-grid">
              {tokens.map(token => (
                <div key={token.id} className={`token-card ${token.consumed ? 'consumed' : ''}`}>
                  <div className="token-id">Token #{token.id}</div>
                  <div className="token-detail">
                    <span className="label">Owner: </span>
                    {token.owner ? `${token.owner.slice(0, 12)}...` : 'Burned'}
                  </div>
                  <div className="token-detail">
                    <span className="label">URI: </span>
                    {token.uri ? `${token.uri.slice(0, 25)}...` : 'N/A'}
                  </div>
                  <div className="token-detail">
                    <span className="label">Status: </span>
                    <span className={`status-badge ${token.consumed ? 'consumed' : 'active'}`}>
                      {token.consumed ? 'Consumed' : 'Active'}
                    </span>
                  </div>
                  {token.consumed && token.consumedBy && (
                    <div className="token-detail">
                      <span className="label">Consumed by: </span>
                      {token.consumedBy.slice(0, 12)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'mint' && (
        <div className="section">
          <h2>Mint New Token</h2>
          <div className="card">
            <div className="form-group">
              <label>Recipient Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={mintForm.recipient}
                onChange={(e) => setMintForm(prev => ({ ...prev, recipient: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Token URI</label>
              <input
                type="text"
                placeholder="https://..."
                value={mintForm.uri}
                onChange={(e) => setMintForm(prev => ({ ...prev, uri: e.target.value }))}
              />
            </div>
            <button onClick={handleMint} disabled={!isConnected}>
              Mint Token
            </button>
            {!isConnected && (
              <p style={{ marginTop: '0.5rem', color: '#888' }}>
                Please connect your wallet to mint tokens
              </p>
            )}
          </div>

          <h2>Transfer Token</h2>
          <div className="card">
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                min="1"
                value={transferForm.tokenId}
                onChange={(e) => setTransferForm(prev => ({ ...prev, tokenId: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="form-group">
              <label>Recipient Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={transferForm.recipient}
                onChange={(e) => setTransferForm(prev => ({ ...prev, recipient: e.target.value }))}
              />
            </div>
            <button onClick={handleTransfer} disabled={!isConnected}>
              Transfer
            </button>
          </div>
        </div>
      )}

      {activeTab === 'consume' && (
        <div className="section">
          <h2>Consume Token</h2>
          <div className="card">
            <div className="form-group">
              <label>Consumer Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={consumeForm.consumer}
                onChange={(e) => setConsumeForm(prev => ({ ...prev, consumer: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                min="1"
                value={consumeForm.tokenId}
                onChange={(e) => setConsumeForm(prev => ({ ...prev, tokenId: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="form-group">
              <label>Consumption Data (optional)</label>
              <input
                type="text"
                placeholder="Event ticket used, etc."
                value={consumeForm.data}
                onChange={(e) => setConsumeForm(prev => ({ ...prev, data: e.target.value }))}
              />
            </div>
            <div className="button-group">
              <button onClick={checkIsConsumable} className="secondary">
                Check Consumability
              </button>
              <button onClick={handleConsume} disabled={!isConnected} className="consume">
                Consume Token
              </button>
            </div>
            {!isConnected && (
              <p style={{ marginTop: '0.5rem', color: '#888' }}>
                Please connect your wallet to consume tokens
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="section">
          <h2>Set Authorized Consumer</h2>
          <div className="card">
            <div className="form-group">
              <label>Consumer Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={setConsumerForm.consumer}
                onChange={(e) => setSetConsumerForm(prev => ({ ...prev, consumer: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="authorized"
                  checked={setConsumerForm.authorized}
                  onChange={(e) => setSetConsumerForm(prev => ({ ...prev, authorized: e.target.checked }))}
                />
                <label htmlFor="authorized">Authorized</label>
              </div>
            </div>
            <button onClick={handleSetAuthorizedConsumer} disabled={!isConnected}>
              Set Consumer Status
            </button>
          </div>

          <h2>Set Base URI</h2>
          <div className="card">
            <div className="form-group">
              <label>New Base URI</label>
              <input
                type="text"
                placeholder="https://..."
                value={newBaseUri}
                onChange={(e) => setNewBaseUri(e.target.value)}
              />
            </div>
            <button onClick={handleSetBaseUri} disabled={!isConnected}>
              Update Base URI
            </button>
          </div>

          <h2>Transfer Ownership</h2>
          <div className="card">
            <div className="form-group">
              <label>New Owner Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={transferOwnerForm.newOwner}
                onChange={(e) => setTransferOwnerForm({ newOwner: e.target.value })}
              />
            </div>
            <button onClick={handleTransferOwnership} disabled={!isConnected} className="danger">
              Transfer Ownership
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
