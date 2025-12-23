import { showConnect, disconnect, openContractCall, request } from '@stacks/connect'
import { 
  Cl, 
  cvToJSON, 
  ClarityValue, 
  PostConditionMode,
  uintCV,
  principalCV,
  boolCV,
  bufferCV,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions'
import { useState, useEffect, useCallback } from 'react'

const CONTRACT_ADDRESS = import.meta.env.VITE_META_PROXY_CONTRACT_ADDRESS?.split('.')[0] || ''
const CONTRACT_NAME = import.meta.env.VITE_META_PROXY_CONTRACT_ADDRESS?.split('.')[1] || 'meta-proxy'
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

interface ProxyData {
  id: number
  implementation: string
  metadataLength: number
  creator: string
  createdAt: number
  initialized: boolean
}

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [proxyCount, setProxyCount] = useState<number>(0)
  const [owner, setOwner] = useState<string>('')
  const [proxies, setProxies] = useState<ProxyData[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  
  const [createProxyForm, setCreateProxyForm] = useState({ implementation: '', metadata: '' })
  const [initializeForm, setInitializeForm] = useState({ proxyId: 1 })
  const [updateImplForm, setUpdateImplForm] = useState({ proxyId: 1, newImplementation: '' })
  const [setDeployerForm, setSetDeployerForm] = useState({ deployer: '', authorized: true })
  const [transferOwnerForm, setTransferOwnerForm] = useState({ newOwner: '' })
  const [checkDeployerAddress, setCheckDeployerAddress] = useState('')
  const [isDeployerResult, setIsDeployerResult] = useState<boolean | null>(null)
  const [proxyIdInput, setProxyIdInput] = useState<number>(1)
  
  const [activeTab, setActiveTab] = useState<'info' | 'proxies' | 'create' | 'actions' | 'admin'>('info')

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
            name: 'Meta Proxy - ERC-3448',
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
    setProxies([])
    setProxyCount(0)
  }

  const loadContractInfo = useCallback(async () => {
    setIsLoading(true)
    try {
      const countResult: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-proxy-count',
        functionArgs: [],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const countJson = cvToJSON(countResult)
      setProxyCount(countJson.value || 0)

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

      await loadProxies(countJson.value || 0)
    } catch (error) {
      console.error('Error loading contract info:', error)
    }
    setIsLoading(false)
  }, [])

  async function loadProxies(count: number) {
    const loadedProxies: ProxyData[] = []
    for (let i = 1; i <= Math.min(count, 20); i++) {
      try {
        const proxyResult: ClarityValue = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-proxy',
          functionArgs: [Cl.uint(i)],
          network: 'mainnet',
          senderAddress: CONTRACT_ADDRESS,
        })
        const proxyJson = cvToJSON(proxyResult)
        
        if (proxyJson.value) {
          loadedProxies.push({
            id: i,
            implementation: proxyJson.value.implementation?.value || '',
            metadataLength: proxyJson.value['metadata-length']?.value || 0,
            creator: proxyJson.value.creator?.value || '',
            createdAt: proxyJson.value['created-at']?.value || 0,
            initialized: proxyJson.value.initialized?.value || false,
          })
        }
      } catch (error) {
        console.error(`Error loading proxy ${i}:`, error)
      }
    }
    setProxies(loadedProxies)
  }

  async function checkIsDeployer() {
    if (!checkDeployerAddress) return
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'is-authorized-deployer',
        functionArgs: [Cl.principal(checkDeployerAddress)],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(result)
      setIsDeployerResult(json.value || false)
    } catch (error) {
      console.error('Error checking deployer:', error)
      setMessage({ type: 'error', text: 'Failed to check deployer status' })
    }
  }

  async function getProxyDetails() {
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-proxy',
        functionArgs: [Cl.uint(proxyIdInput)],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(result)
      if (json.value) {
        setMessage({ 
          type: 'info', 
          text: `Proxy #${proxyIdInput}: Implementation: ${json.value.implementation?.value}, Creator: ${json.value.creator?.value}, Initialized: ${json.value.initialized?.value}` 
        })
      } else {
        setMessage({ type: 'error', text: 'Proxy not found' })
      }
    } catch (error) {
      console.error('Error getting proxy:', error)
      setMessage({ type: 'error', text: 'Failed to get proxy details' })
    }
  }

  async function handleCreateProxy() {
    if (!createProxyForm.implementation || !createProxyForm.metadata) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-proxy',
        functionArgs: [
          principalCV(createProxyForm.implementation),
          bufferCV(Buffer.from(createProxyForm.metadata)),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          setMessage({ type: 'success', text: `Transaction submitted: ${data.txId}` })
          setCreateProxyForm({ implementation: '', metadata: '' })
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error creating proxy:', error)
      setMessage({ type: 'error', text: 'Failed to create proxy' })
    }
  }

  async function handleInitializeProxy() {
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'initialize-proxy',
        functionArgs: [uintCV(initializeForm.proxyId)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          setMessage({ type: 'success', text: `Transaction submitted: ${data.txId}` })
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error initializing proxy:', error)
      setMessage({ type: 'error', text: 'Failed to initialize proxy' })
    }
  }

  async function handleUpdateImplementation() {
    if (!updateImplForm.newImplementation) {
      setMessage({ type: 'error', text: 'Please enter new implementation address' })
      return
    }
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-implementation',
        functionArgs: [
          uintCV(updateImplForm.proxyId),
          principalCV(updateImplForm.newImplementation),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          setMessage({ type: 'success', text: `Transaction submitted: ${data.txId}` })
          setUpdateImplForm({ proxyId: 1, newImplementation: '' })
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error updating implementation:', error)
      setMessage({ type: 'error', text: 'Failed to update implementation' })
    }
  }

  async function handleSetAuthorizedDeployer() {
    if (!setDeployerForm.deployer) {
      setMessage({ type: 'error', text: 'Please enter deployer address' })
      return
    }
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-authorized-deployer',
        functionArgs: [
          principalCV(setDeployerForm.deployer),
          boolCV(setDeployerForm.authorized),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          setMessage({ type: 'success', text: `Transaction submitted: ${data.txId}` })
          setSetDeployerForm({ deployer: '', authorized: true })
        },
        onCancel: () => {
          setMessage({ type: 'info', text: 'Transaction cancelled' })
        }
      })
    } catch (error) {
      console.error('Error setting deployer:', error)
      setMessage({ type: 'error', text: 'Failed to set authorized deployer' })
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
        <h1>Meta Proxy (ERC-3448)</h1>
        {isConnected ? (
          <div className="connected-indicator">
            <span className="dot"></span>
            <span className="address">{userAddress.slice(0, 8)}...{userAddress.slice(-4)}</span>
            <button onClick={disconnectWallet} className="secondary">Disconnect</button>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
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
          className={activeTab === 'proxies' ? 'active' : ''} 
          onClick={() => setActiveTab('proxies')}
        >
          Proxies ({proxyCount})
        </button>
        <button 
          className={activeTab === 'create' ? 'active' : ''} 
          onClick={() => setActiveTab('create')}
        >
          Create Proxy
        </button>
        <button 
          className={activeTab === 'actions' ? 'active' : ''} 
          onClick={() => setActiveTab('actions')}
        >
          Actions
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
                <div className="label">Total Proxies</div>
                <div className="value">{proxyCount}</div>
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

          <h2>Check Proxy Details</h2>
          <div className="card">
            <div className="form-group">
              <label>Proxy ID</label>
              <input
                type="number"
                min="1"
                value={proxyIdInput}
                onChange={(e) => setProxyIdInput(parseInt(e.target.value) || 1)}
              />
            </div>
            <button onClick={getProxyDetails}>Get Proxy Details</button>
          </div>

          <h2>Check Authorized Deployer</h2>
          <div className="card">
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={checkDeployerAddress}
                onChange={(e) => setCheckDeployerAddress(e.target.value)}
              />
            </div>
            <button onClick={checkIsDeployer}>Check</button>
            {isDeployerResult !== null && (
              <p style={{ marginTop: '1rem' }}>
                Result: <span className={`status-badge ${isDeployerResult ? 'initialized' : 'pending'}`}>
                  {isDeployerResult ? 'Authorized' : 'Not Authorized'}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'proxies' && (
        <div className="section">
          <h2>Deployed Proxies</h2>
          {proxies.length === 0 ? (
            <div className="card">
              <p>No proxies found</p>
            </div>
          ) : (
            <div className="proxy-grid">
              {proxies.map(proxy => (
                <div key={proxy.id} className="proxy-card">
                  <div className="proxy-id">Proxy #{proxy.id}</div>
                  <div className="proxy-detail">
                    <span className="label">Implementation: </span>
                    {proxy.implementation.slice(0, 20)}...
                  </div>
                  <div className="proxy-detail">
                    <span className="label">Creator: </span>
                    {proxy.creator.slice(0, 15)}...
                  </div>
                  <div className="proxy-detail">
                    <span className="label">Metadata Length: </span>
                    {proxy.metadataLength} bytes
                  </div>
                  <div className="proxy-detail">
                    <span className="label">Status: </span>
                    <span className={`status-badge ${proxy.initialized ? 'initialized' : 'pending'}`}>
                      {proxy.initialized ? 'Initialized' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="section">
          <h2>Create New Proxy</h2>
          <div className="card">
            <div className="form-group">
              <label>Implementation Contract</label>
              <input
                type="text"
                placeholder="SP...contract-name"
                value={createProxyForm.implementation}
                onChange={(e) => setCreateProxyForm(prev => ({ ...prev, implementation: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Metadata</label>
              <textarea
                placeholder="Enter metadata (will be stored as buffer)"
                value={createProxyForm.metadata}
                onChange={(e) => setCreateProxyForm(prev => ({ ...prev, metadata: e.target.value }))}
              />
            </div>
            <button onClick={handleCreateProxy} disabled={!isConnected}>
              Create Proxy
            </button>
            {!isConnected && (
              <p style={{ marginTop: '0.5rem', color: '#888' }}>
                Please connect your wallet to create a proxy
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="section">
          <h2>Initialize Proxy</h2>
          <div className="card">
            <div className="form-group">
              <label>Proxy ID</label>
              <input
                type="number"
                min="1"
                value={initializeForm.proxyId}
                onChange={(e) => setInitializeForm({ proxyId: parseInt(e.target.value) || 1 })}
              />
            </div>
            <button onClick={handleInitializeProxy} disabled={!isConnected}>
              Initialize
            </button>
          </div>

          <h2>Update Implementation</h2>
          <div className="card">
            <div className="form-group">
              <label>Proxy ID</label>
              <input
                type="number"
                min="1"
                value={updateImplForm.proxyId}
                onChange={(e) => setUpdateImplForm(prev => ({ ...prev, proxyId: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="form-group">
              <label>New Implementation Contract</label>
              <input
                type="text"
                placeholder="SP...contract-name"
                value={updateImplForm.newImplementation}
                onChange={(e) => setUpdateImplForm(prev => ({ ...prev, newImplementation: e.target.value }))}
              />
            </div>
            <button onClick={handleUpdateImplementation} disabled={!isConnected}>
              Update Implementation
            </button>
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="section">
          <h2>Set Authorized Deployer</h2>
          <div className="card">
            <div className="form-group">
              <label>Deployer Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={setDeployerForm.deployer}
                onChange={(e) => setSetDeployerForm(prev => ({ ...prev, deployer: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="authorized"
                  checked={setDeployerForm.authorized}
                  onChange={(e) => setSetDeployerForm(prev => ({ ...prev, authorized: e.target.checked }))}
                />
                <label htmlFor="authorized">Authorized</label>
              </div>
            </div>
            <button onClick={handleSetAuthorizedDeployer} disabled={!isConnected}>
              Set Deployer Status
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
