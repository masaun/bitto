import { showConnect, disconnect, openContractCall, request } from '@stacks/connect'
import { 
  Cl, 
  cvToJSON, 
  ClarityValue, 
  PostConditionMode,
  bufferCV,
  stringUtf8CV,
  uintCV,
  principalCV,
  boolCV,
  listCV,
  callReadOnlyFunction,
} from '@stacks/transactions'
import { useState, useEffect, useCallback } from 'react'

// Contract configuration - loaded from environment variables
const CONTRACT_ADDRESS = import.meta.env.VITE_NOTARY_CONTRACT_ADDRESS?.split('.')[0] || ''
const CONTRACT_NAME = import.meta.env.VITE_NOTARY_CONTRACT_ADDRESS?.split('.')[1] || 'notary'

// WalletConnect/Reown project ID - get from https://cloud.reown.com/
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

// Types
interface DocumentDetails {
  'document-uri': { value: string }
  title: { value: string }
  version: { value: number }
  creator: { value: string }
  'created-at': { value: number }
  'is-active': { value: boolean }
  'content-hash': { value: string }
  'contract-hash-at-creation': { value: { value: string } | null }
}

interface SignatureDetails {
  'signed-at': { value: number }
  signature: { value: string }
  'public-key': { value: string }
  'block-height': { value: number }
}

interface NotaryInfo {
  'contract-hash': { value: { value: string } | null }
  owner: { value: string }
  'document-count': { value: number }
  'assets-restricted': { value: boolean }
  'current-time': { value: number }
  'block-height': { value: number }
}

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [notaryInfo, setNotaryInfo] = useState<NotaryInfo | null>(null)
  const [documents, setDocuments] = useState<(DocumentDetails & { id: number })[]>([])
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null)
  const [signatureDetails, setSignatureDetails] = useState<SignatureDetails | null>(null)
  
  // Form states
  const [registerForm, setRegisterForm] = useState({
    documentUri: '',
    title: '',
    contentHash: '',
  })
  const [updateForm, setUpdateForm] = useState({
    documentId: 1,
    newDocumentUri: '',
    newContentHash: '',
  })
  const [signDocumentId, setSignDocumentId] = useState<number>(1)
  const [checkSignatureForm, setCheckSignatureForm] = useState({
    userAddress: '',
    documentId: 1,
  })
  const [setRequiredDocsForm, setSetRequiredDocsForm] = useState({
    contractPrincipal: '',
    documentIds: '',
  })
  const [assetRestriction, setAssetRestriction] = useState<boolean>(false)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'register' | 'sign' | 'admin'>('info')

  // Connect wallet function with WalletConnect (Reown) support via @stacks/connect
  async function connectWallet() {
    try {
      // Use request API with WalletConnect for better wallet selection
      if (WALLET_CONNECT_PROJECT_ID) {
        // Use request API with forceWalletSelect for WalletConnect
        const response = await request(
          { 
            forceWalletSelect: true,
            walletConnectProjectId: WALLET_CONNECT_PROJECT_ID 
          }, 
          'getAddresses'
        )
        
        if (response && response.addresses && response.addresses.length > 0) {
          // Find mainnet address
          const mainnetAddress = response.addresses.find(
            (addr: { address: string }) => addr.address.startsWith('SP')
          )?.address || response.addresses[0].address
          
          setIsConnected(true)
          setUserAddress(mainnetAddress)
          
          // Load initial data
          await loadNotaryInfo()
          await loadDocuments()
        }
      } else {
        // Fallback to showConnect without WalletConnect
        showConnect({
          appDetails: {
            name: 'Notary Contract',
            icon: 'https://stacks.co/img/stx-logo.svg'
          },
          onFinish: async (authData: { userSession: { loadUserData: () => { profile: { stxAddress: { mainnet: string } } } } }) => {
            // Use mainnet address for mainnet deployment
            const address = authData.userSession.loadUserData().profile.stxAddress.mainnet
            setIsConnected(true)
            setUserAddress(address)
            
            // Load initial data
            await loadNotaryInfo()
            await loadDocuments()
          },
          onCancel: () => {
            console.log('Connection cancelled')
          }
        })
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  async function connectWalletKit() {
    try {
      const web3Wallet = await Web3Wallet.init({
        core: {
          projectId: WALLET_CONNECT_PROJECT_ID
        },
        metadata: {
          name: 'Notary',
          description: 'Notary Frontend',
          url: window.location.origin,
          icons: []
        }
      })
      console.log('WalletKit initialized')
    } catch (error) {
      console.error('Failed to initialize WalletKit:', error)
    }
  }

  async function connectAppKit() {
    try {
      const appKit = createAppKit({
        projectId: WALLET_CONNECT_PROJECT_ID,
        chains: [],
        metadata: {
          name: 'Notary',
          description: 'Notary Frontend',
          url: window.location.origin,
          icons: []
        }
      })
      appKit.open()
      console.log('AppKit initialized')
    } catch (error) {
      console.error('Failed to initialize AppKit:', error)
    }
  }

  // Disconnect wallet
  async function disconnectWallet() {
    disconnect()
    setIsConnected(false)
    setUserAddress('')
    setNotaryInfo(null)
    setDocuments([])
  }

  // Load notary contract info
  const loadNotaryInfo = useCallback(async () => {
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-notary-info',
        functionArgs: [],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      setNotaryInfo(json.value)
    } catch (error) {
      console.error('Error loading notary info:', error)
    }
  }, [])

  // Get document count
  async function getDocumentCount(): Promise<number> {
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-document-count',
        functionArgs: [],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      return json.value || 0
    } catch (error) {
      console.error('Error getting document count:', error)
      return 0
    }
  }

  // Get document details
  async function getDocumentDetails(documentId: number): Promise<DocumentDetails | null> {
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-document-details',
        functionArgs: [Cl.uint(documentId)],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      return json.value
    } catch (error) {
      console.error('Error getting document details:', error)
      return null
    }
  }

  // Load all documents
  const loadDocuments = useCallback(async () => {
    try {
      const count = await getDocumentCount()
      const documentPromises = []
      for (let i = 1; i <= count; i++) {
        documentPromises.push(getDocumentDetails(i))
      }

      const documentData = await Promise.all(documentPromises)
      const validDocuments = documentData
        .filter((doc): doc is DocumentDetails => doc !== null)
        .map((doc, index) => ({
          id: index + 1,
          ...doc
        }))
      
      setDocuments(validDocuments)
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }, [])

  // Check if user has signed a document
  async function checkDocumentSigned(user: string, documentId: number): Promise<boolean> {
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'document-signed',
        functionArgs: [Cl.principal(user), Cl.uint(documentId)],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      return json.value || false
    } catch (error) {
      console.error('Error checking document signed:', error)
      return false
    }
  }

  // Get signature details
  async function getSignatureDetails(user: string, documentId: number): Promise<SignatureDetails | null> {
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-signature-details',
        functionArgs: [Cl.principal(user), Cl.uint(documentId)],
        network: 'mainnet',
        senderAddress: CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      return json.value
    } catch (error) {
      console.error('Error getting signature details:', error)
      return null
    }
  }

  // Convert hex string to buffer
  function hexToBuffer(hex: string): Uint8Array {
    const cleanHex = hex.replace(/^0x/, '')
    const bytes = new Uint8Array(cleanHex.length / 2)
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16)
    }
    return bytes
  }

  // ====== Write Functions ======

  // Register a new document
  async function registerDocument() {
    if (!registerForm.documentUri || !registerForm.title || !registerForm.contentHash) {
      alert('Please fill in all fields')
      return
    }
    
    setIsLoading(true)
    try {
      const contentHashBuffer = hexToBuffer(registerForm.contentHash.padEnd(64, '0').slice(0, 64))
      
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-document',
        functionArgs: [
          stringUtf8CV(registerForm.documentUri),
          stringUtf8CV(registerForm.title),
          bufferCV(contentHashBuffer),
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (result: { txId: string }) => {
          console.log('Transaction submitted:', result.txId)
          alert(`Document registration submitted! TxID: ${result.txId}`)
          setRegisterForm({ documentUri: '', title: '', contentHash: '' })
          setTimeout(() => loadDocuments(), 5000)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Error registering document:', error)
      alert('Error registering document')
    } finally {
      setIsLoading(false)
    }
  }

  // Sign a document
  async function signDocument() {
    setIsLoading(true)
    try {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'sign-document',
        functionArgs: [uintCV(signDocumentId)],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (result: { txId: string }) => {
          console.log('Transaction submitted:', result.txId)
          alert(`Document signing submitted! TxID: ${result.txId}`)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Error signing document:', error)
      alert('Error signing document')
    } finally {
      setIsLoading(false)
    }
  }

  // Deactivate a document
  async function deactivateDocument(documentId: number) {
    setIsLoading(true)
    try {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'deactivate-document',
        functionArgs: [uintCV(documentId)],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (result: { txId: string }) => {
          console.log('Transaction submitted:', result.txId)
          alert(`Document deactivation submitted! TxID: ${result.txId}`)
          setTimeout(() => loadDocuments(), 5000)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Error deactivating document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Reactivate a document
  async function reactivateDocument(documentId: number) {
    setIsLoading(true)
    try {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'reactivate-document',
        functionArgs: [uintCV(documentId)],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (result: { txId: string }) => {
          console.log('Transaction submitted:', result.txId)
          alert(`Document reactivation submitted! TxID: ${result.txId}`)
          setTimeout(() => loadDocuments(), 5000)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Error reactivating document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update a document
  async function updateDocument() {
    if (!updateForm.newDocumentUri || !updateForm.newContentHash) {
      alert('Please fill in all fields')
      return
    }
    
    setIsLoading(true)
    try {
      const contentHashBuffer = hexToBuffer(updateForm.newContentHash.padEnd(64, '0').slice(0, 64))
      
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-document',
        functionArgs: [
          uintCV(updateForm.documentId),
          stringUtf8CV(updateForm.newDocumentUri),
          bufferCV(contentHashBuffer),
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (result: { txId: string }) => {
          console.log('Transaction submitted:', result.txId)
          alert(`Document update submitted! TxID: ${result.txId}`)
          setUpdateForm({ documentId: 1, newDocumentUri: '', newContentHash: '' })
          setTimeout(() => loadDocuments(), 5000)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Error updating document:', error)
      alert('Error updating document')
    } finally {
      setIsLoading(false)
    }
  }

  // Set required documents for a contract (owner only)
  async function setRequiredDocuments() {
    if (!setRequiredDocsForm.contractPrincipal || !setRequiredDocsForm.documentIds) {
      alert('Please fill in all fields')
      return
    }
    
    setIsLoading(true)
    try {
      const docIds = setRequiredDocsForm.documentIds.split(',').map((id: string) => uintCV(parseInt(id.trim())))
      
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-required-documents',
        functionArgs: [
          principalCV(setRequiredDocsForm.contractPrincipal),
          listCV(docIds),
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (result: { txId: string }) => {
          console.log('Transaction submitted:', result.txId)
          alert(`Required documents set! TxID: ${result.txId}`)
          setSetRequiredDocsForm({ contractPrincipal: '', documentIds: '' })
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Error setting required documents:', error)
      alert('Error setting required documents')
    } finally {
      setIsLoading(false)
    }
  }

  // Set asset restrictions (owner only)
  async function setAssetRestrictions() {
    setIsLoading(true)
    try {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-asset-restrictions',
        functionArgs: [boolCV(assetRestriction)],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (result: { txId: string }) => {
          console.log('Transaction submitted:', result.txId)
          alert(`Asset restrictions updated! TxID: ${result.txId}`)
          setTimeout(() => loadNotaryInfo(), 5000)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Error setting asset restrictions:', error)
      alert('Error setting asset restrictions')
    } finally {
      setIsLoading(false)
    }
  }

  // Require document signed (check)
  async function requireDocumentSigned() {
    setIsLoading(true)
    try {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'require-document-signed',
        functionArgs: [
          principalCV(checkSignatureForm.userAddress || userAddress),
          uintCV(checkSignatureForm.documentId),
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (result: { txId: string }) => {
          console.log('Transaction submitted:', result.txId)
          alert(`Signature verification submitted! TxID: ${result.txId}`)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Error requiring document signed:', error)
      alert('Error requiring document signed')
    } finally {
      setIsLoading(false)
    }
  }

  // Check signature for a document (read-only)
  async function handleCheckSignature() {
    const userToCheck = checkSignatureForm.userAddress || userAddress
    const isSigned = await checkDocumentSigned(userToCheck, checkSignatureForm.documentId)
    
    if (isSigned) {
      const details = await getSignatureDetails(userToCheck, checkSignatureForm.documentId)
      setSignatureDetails(details)
      alert(`Document ${checkSignatureForm.documentId} IS signed by ${userToCheck}`)
    } else {
      setSignatureDetails(null)
      alert(`Document ${checkSignatureForm.documentId} is NOT signed by ${userToCheck}`)
    }
  }

  // Load data on connect
  useEffect(() => {
    if (isConnected) {
      loadNotaryInfo()
      loadDocuments()
    }
  }, [isConnected, loadNotaryInfo, loadDocuments])

  return (
    <div className="app">
      <header className="header">
        <h1>📜 Notary Contract</h1>
        <p>Legally binding documents on Stacks Mainnet</p>
      </header>

      <div className="wallet-section">
        {isConnected ? (
          <div className="connected">
            <p>Connected: <strong>{userAddress.slice(0, 8)}...{userAddress.slice(-8)}</strong></p>
            <button onClick={disconnectWallet} className="disconnect-btn">
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="connect-container">
            <p className="connect-info">
              Connect your Stacks wallet to interact with the Notary contract.
              <br />
              <small>Supports Leather, Xverse, and WalletConnect-compatible wallets via @stacks/connect</small>
            </p>
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
          </div>
        )}
      </div>

      {isConnected && (
        <>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              📊 Contract Info
            </button>
            <button 
              className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              📄 Documents
            </button>
            <button 
              className={`tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              ➕ Register
            </button>
            <button 
              className={`tab ${activeTab === 'sign' ? 'active' : ''}`}
              onClick={() => setActiveTab('sign')}
            >
              ✍️ Sign
            </button>
            <button 
              className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              ⚙️ Admin
            </button>
          </div>

          <div className="content">
            {/* Contract Info Tab */}
            {activeTab === 'info' && (
              <div className="tab-content">
                <h2>Contract Information</h2>
                <button onClick={loadNotaryInfo} className="refresh-btn" disabled={isLoading}>
                  🔄 Refresh
                </button>
                
                {notaryInfo ? (
                  <div className="info-grid">
                    <div className="info-card">
                      <label>Document Count</label>
                      <span>{notaryInfo['document-count']?.value || 0}</span>
                    </div>
                    <div className="info-card">
                      <label>Assets Restricted</label>
                      <span className={notaryInfo['assets-restricted']?.value ? 'danger' : 'success'}>
                        {notaryInfo['assets-restricted']?.value ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="info-card">
                      <label>Current Block Time</label>
                      <span>{new Date((notaryInfo['current-time']?.value || 0) * 1000).toLocaleString()}</span>
                    </div>
                    <div className="info-card">
                      <label>Block Height</label>
                      <span>{notaryInfo['block-height']?.value || 0}</span>
                    </div>
                    <div className="info-card full-width">
                      <label>Contract Owner</label>
                      <span className="address">{notaryInfo.owner?.value || 'Unknown'}</span>
                    </div>
                  </div>
                ) : (
                  <p>Loading contract info...</p>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="tab-content">
                <div className="section-header">
                  <h2>Registered Documents ({documents.length})</h2>
                  <button onClick={loadDocuments} className="refresh-btn" disabled={isLoading}>
                    🔄 Refresh
                  </button>
                </div>
                
                {documents.length > 0 ? (
                  <div className="documents-list">
                    {documents.map((doc) => (
                      <div key={doc.id} className={`document-card ${doc['is-active']?.value ? '' : 'inactive'}`}>
                        <div className="document-header">
                          <span className="document-id">#{doc.id}</span>
                          <span className={`status ${doc['is-active']?.value ? 'active' : 'inactive'}`}>
                            {doc['is-active']?.value ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </div>
                        <h3>{doc.title?.value}</h3>
                        <div className="document-details">
                          <p><strong>URI:</strong> <a href={doc['document-uri']?.value} target="_blank" rel="noopener noreferrer">{doc['document-uri']?.value}</a></p>
                          <p><strong>Version:</strong> {doc.version?.value}</p>
                          <p><strong>Creator:</strong> <span className="address">{doc.creator?.value}</span></p>
                          <p><strong>Created:</strong> {new Date((doc['created-at']?.value || 0) * 1000).toLocaleString()}</p>
                        </div>
                        <div className="document-actions">
                          <button 
                            onClick={() => { setSignDocumentId(doc.id); setActiveTab('sign'); }}
                            className="action-btn sign"
                          >
                            ✍️ Sign
                          </button>
                          {doc.creator?.value === userAddress && (
                            <>
                              {doc['is-active']?.value ? (
                                <button 
                                  onClick={() => deactivateDocument(doc.id)}
                                  className="action-btn deactivate"
                                  disabled={isLoading}
                                >
                                  ❌ Deactivate
                                </button>
                              ) : (
                                <button 
                                  onClick={() => reactivateDocument(doc.id)}
                                  className="action-btn reactivate"
                                  disabled={isLoading}
                                >
                                  ✅ Reactivate
                                </button>
                              )}
                              <button 
                                onClick={() => { 
                                  setUpdateForm({ 
                                    documentId: doc.id, 
                                    newDocumentUri: doc['document-uri']?.value || '', 
                                    newContentHash: '' 
                                  }); 
                                  setSelectedDocument(doc.id);
                                }}
                                className="action-btn update"
                              >
                                ✏️ Update
                              </button>
                            </>
                          )}
                        </div>
                        
                        {selectedDocument === doc.id && (
                          <div className="update-form">
                            <h4>Update Document #{doc.id}</h4>
                            <input
                              type="text"
                              placeholder="New Document URI (ipfs://...)"
                              value={updateForm.newDocumentUri}
                              onChange={(e) => setUpdateForm({...updateForm, newDocumentUri: e.target.value})}
                            />
                            <input
                              type="text"
                              placeholder="New Content Hash (32 bytes hex)"
                              value={updateForm.newContentHash}
                              onChange={(e) => setUpdateForm({...updateForm, newContentHash: e.target.value})}
                            />
                            <div className="form-actions">
                              <button onClick={updateDocument} disabled={isLoading} className="submit-btn">
                                Update
                              </button>
                              <button onClick={() => setSelectedDocument(null)} className="cancel-btn">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-documents">No documents registered yet.</p>
                )}
              </div>
            )}

            {/* Register Tab */}
            {activeTab === 'register' && (
              <div className="tab-content">
                <h2>Register New Document</h2>
                <div className="form">
                  <div className="form-group">
                    <label>Document URI</label>
                    <input
                      type="text"
                      placeholder="ipfs://Qm... or https://..."
                      value={registerForm.documentUri}
                      onChange={(e) => setRegisterForm({...registerForm, documentUri: e.target.value})}
                    />
                    <small>IPFS link or URL to the legal document</small>
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      placeholder="Document Title"
                      value={registerForm.title}
                      onChange={(e) => setRegisterForm({...registerForm, title: e.target.value})}
                      maxLength={128}
                    />
                    <small>Max 128 characters</small>
                  </div>
                  <div className="form-group">
                    <label>Content Hash</label>
                    <input
                      type="text"
                      placeholder="32-byte hex hash (SHA256)"
                      value={registerForm.contentHash}
                      onChange={(e) => setRegisterForm({...registerForm, contentHash: e.target.value})}
                    />
                    <small>SHA256 hash of the document content for integrity verification</small>
                  </div>
                  <button onClick={registerDocument} disabled={isLoading} className="submit-btn">
                    {isLoading ? 'Registering...' : 'Register Document'}
                  </button>
                </div>
              </div>
            )}

            {/* Sign Tab */}
            {activeTab === 'sign' && (
              <div className="tab-content">
                <h2>Sign Document</h2>
                
                <div className="form">
                  <div className="form-group">
                    <label>Document ID to Sign</label>
                    <input
                      type="number"
                      min={1}
                      value={signDocumentId}
                      onChange={(e) => setSignDocumentId(parseInt(e.target.value))}
                    />
                  </div>
                  <button onClick={signDocument} disabled={isLoading} className="submit-btn">
                    {isLoading ? 'Signing...' : '✍️ Sign Document'}
                  </button>
                </div>

                <hr />

                <h3>Check Signature Status</h3>
                <div className="form">
                  <div className="form-group">
                    <label>User Address (leave empty for your address)</label>
                    <input
                      type="text"
                      placeholder={userAddress}
                      value={checkSignatureForm.userAddress}
                      onChange={(e) => setCheckSignatureForm({...checkSignatureForm, userAddress: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Document ID</label>
                    <input
                      type="number"
                      min={1}
                      value={checkSignatureForm.documentId}
                      onChange={(e) => setCheckSignatureForm({...checkSignatureForm, documentId: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="button-group">
                    <button onClick={handleCheckSignature} className="check-btn">
                      🔍 Check Signature (Read-Only)
                    </button>
                    <button onClick={requireDocumentSigned} disabled={isLoading} className="submit-btn">
                      📋 Require Document Signed (Transaction)
                    </button>
                  </div>
                </div>

                {signatureDetails && (
                  <div className="signature-details">
                    <h4>Signature Details</h4>
                    <div className="info-grid">
                      <div className="info-card">
                        <label>Signed At</label>
                        <span>{new Date((signatureDetails['signed-at']?.value || 0) * 1000).toLocaleString()}</span>
                      </div>
                      <div className="info-card">
                        <label>Block Height</label>
                        <span>{signatureDetails['block-height']?.value}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Tab */}
            {activeTab === 'admin' && (
              <div className="tab-content">
                <h2>Admin Functions</h2>
                <p className="warning">⚠️ These functions require contract owner privileges</p>

                <div className="admin-section">
                  <h3>Set Asset Restrictions</h3>
                  <div className="form">
                    <div className="form-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={assetRestriction}
                          onChange={(e) => setAssetRestriction(e.target.checked)}
                        />
                        <span>Restrict Assets</span>
                      </label>
                      <small>When enabled, document registration and signing will be blocked</small>
                    </div>
                    <button onClick={setAssetRestrictions} disabled={isLoading} className="submit-btn">
                      Update Restrictions
                    </button>
                  </div>
                </div>

                <div className="admin-section">
                  <h3>Set Required Documents for Contract</h3>
                  <div className="form">
                    <div className="form-group">
                      <label>Contract Principal</label>
                      <input
                        type="text"
                        placeholder="SP..."
                        value={setRequiredDocsForm.contractPrincipal}
                        onChange={(e) => setSetRequiredDocsForm({...setRequiredDocsForm, contractPrincipal: e.target.value})}
                      />
                      <small>The contract that will require these documents</small>
                    </div>
                    <div className="form-group">
                      <label>Document IDs (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="1, 2, 3"
                        value={setRequiredDocsForm.documentIds}
                        onChange={(e) => setSetRequiredDocsForm({...setRequiredDocsForm, documentIds: e.target.value})}
                      />
                      <small>Up to 10 document IDs</small>
                    </div>
                    <button onClick={setRequiredDocuments} disabled={isLoading} className="submit-btn">
                      Set Required Documents
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <footer className="footer">
        <p>Notary Contract on Stacks Mainnet • Powered by @stacks/connect with WalletConnect (Reown) support</p>
      </footer>
    </div>
  )
}

export default App
