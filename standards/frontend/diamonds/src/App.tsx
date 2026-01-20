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
  return { address: addr, name: 'diamonds' }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [addFacetAddr, setAddFacetAddr] = useState<string>('')
  const [addFacetSelector, setAddFacetSelector] = useState<string>('')
  const [addFacetImmutable, setAddFacetImmutable] = useState<boolean>(false)
  
  const [replaceFacetAddr, setReplaceFacetAddr] = useState<string>('')
  const [replaceSelector, setReplaceSelector] = useState<string>('')
  
  const [removeSelector, setRemoveSelector] = useState<string>('')
  
  const [newOwner, setNewOwner] = useState<string>('')
  const [signerAddr, setSignerAddr] = useState<string>('')
  
  const [diamondInfo, setDiamondInfo] = useState<any>(null)
  const [lookupSelector, setLookupSelector] = useState<string>('')
  const [facetResult, setFacetResult] = useState<any>(null)

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
          name: 'Diamonds',
          description: 'Diamonds Frontend',
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
          name: 'Diamonds',
          description: 'Diamonds Frontend',
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

  async function addFacet() {
    if (!addFacetAddr || !addFacetSelector) return showToast('Facet address and selector required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'add-facet',
        functionArgs: [
          Cl.principal(addFacetAddr),
          Cl.bufferFromHex(addFacetSelector.padEnd(8, '0').slice(0, 8)),
          Cl.bool(addFacetImmutable)
        ],
        network: NETWORK
      })
      showToast('Add facet transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function replaceFacet() {
    if (!replaceFacetAddr || !replaceSelector) return showToast('Facet address and selector required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'replace-facet',
        functionArgs: [
          Cl.principal(replaceFacetAddr),
          Cl.bufferFromHex(replaceSelector.padEnd(8, '0').slice(0, 8))
        ],
        network: NETWORK
      })
      showToast('Replace facet transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function removeFacet() {
    if (!removeSelector) return showToast('Selector required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'remove-facet',
        functionArgs: [Cl.bufferFromHex(removeSelector.padEnd(8, '0').slice(0, 8))],
        network: NETWORK
      })
      showToast('Remove facet transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function freezeDiamond() {
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'freeze-diamond',
        functionArgs: [],
        network: NETWORK
      })
      showToast('Freeze diamond transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function transferOwnership() {
    if (!newOwner) return showToast('New owner address required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'transfer-ownership',
        functionArgs: [Cl.principal(newOwner)],
        network: NETWORK
      })
      showToast('Transfer ownership transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function authorizeSigner() {
    if (!signerAddr) return showToast('Signer address required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'authorize-signer',
        functionArgs: [Cl.principal(signerAddr)],
        network: NETWORK
      })
      showToast('Authorize signer transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function revokeSigner() {
    if (!signerAddr) return showToast('Signer address required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'revoke-signer',
        functionArgs: [Cl.principal(signerAddr)],
        network: NETWORK
      })
      showToast('Revoke signer transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function fetchDiamondInfo() {
    if (!contractAddr) return
    try {
      const [owner, frozen, nonce, restricted] = await Promise.all([
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-diamond-owner',
          functionArgs: [],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'is-diamond-frozen',
          functionArgs: [],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-cut-nonce',
          functionArgs: [],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'check-restrictions',
          functionArgs: [],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        })
      ])
      setDiamondInfo({
        owner: cvToJSON(owner),
        frozen: cvToJSON(frozen),
        nonce: cvToJSON(nonce),
        restricted: cvToJSON(restricted)
      })
    } catch (error) {
      showToast('Failed to fetch diamond info', 'error')
    }
  }

  async function lookupFacet() {
    if (!lookupSelector || !contractAddr) return showToast('Selector required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'facet-address',
        functionArgs: [Cl.bufferFromHex(lookupSelector.padEnd(8, '0').slice(0, 8))],
        network: NETWORK,
        senderAddress: userAddress || contractAddr
      })
      setFacetResult(cvToJSON(result))
    } catch (error) {
      showToast('Failed to lookup facet', 'error')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Diamonds</h1>
        <p>ERC-2535 Multi-Facet Proxy on Stacks</p>
      </header>

      <div className="wallet-section">
        {!connected ? (
          <div className="wallet-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
            <h2>Add Facet</h2>
            <div className="form-group">
              <label>Facet Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={addFacetAddr}
                onChange={(e) => setAddFacetAddr(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Selector (4 bytes hex)</label>
              <input
                type="text"
                placeholder="abcd1234"
                value={addFacetSelector}
                onChange={(e) => setAddFacetSelector(e.target.value)}
              />
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="immutable"
                checked={addFacetImmutable}
                onChange={(e) => setAddFacetImmutable(e.target.checked)}
              />
              <label htmlFor="immutable">Immutable</label>
            </div>
            <button className="btn" onClick={addFacet} disabled={!connected}>
              Add Facet
            </button>
          </div>

          <div className="section">
            <h2>Replace Facet</h2>
            <div className="form-group">
              <label>New Facet Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={replaceFacetAddr}
                onChange={(e) => setReplaceFacetAddr(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Selector (4 bytes hex)</label>
              <input
                type="text"
                placeholder="abcd1234"
                value={replaceSelector}
                onChange={(e) => setReplaceSelector(e.target.value)}
              />
            </div>
            <button className="btn" onClick={replaceFacet} disabled={!connected}>
              Replace Facet
            </button>
          </div>

          <div className="section">
            <h2>Remove Facet</h2>
            <div className="form-group">
              <label>Selector (4 bytes hex)</label>
              <input
                type="text"
                placeholder="abcd1234"
                value={removeSelector}
                onChange={(e) => setRemoveSelector(e.target.value)}
              />
            </div>
            <button className="btn" onClick={removeFacet} disabled={!connected}>
              Remove Facet
            </button>
          </div>

          <div className="section">
            <h2>Ownership</h2>
            <div className="form-group">
              <label>New Owner Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
              />
            </div>
            <button className="btn" onClick={transferOwnership} disabled={!connected}>
              Transfer Ownership
            </button>
            <button className="btn" onClick={freezeDiamond} disabled={!connected} style={{ marginLeft: '0.5rem', background: '#ef4444' }}>
              Freeze Diamond
            </button>
          </div>

          <div className="section">
            <h2>Signer Management</h2>
            <div className="form-group">
              <label>Signer Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={signerAddr}
                onChange={(e) => setSignerAddr(e.target.value)}
              />
            </div>
            <button className="btn" onClick={authorizeSigner} disabled={!connected}>
              Authorize
            </button>
            <button className="btn" onClick={revokeSigner} disabled={!connected} style={{ marginLeft: '0.5rem', background: '#ef4444' }}>
              Revoke
            </button>
          </div>

          <div className="section">
            <h2>Lookup Facet</h2>
            <div className="form-group">
              <label>Selector (4 bytes hex)</label>
              <input
                type="text"
                placeholder="abcd1234"
                value={lookupSelector}
                onChange={(e) => setLookupSelector(e.target.value)}
              />
            </div>
            <button className="btn" onClick={lookupFacet}>
              Lookup
            </button>
            {facetResult && (
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">Facet Address</span>
                  <span className="info-value">{facetResult.value || 'Not found'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="section">
            <h2>Diamond Info</h2>
            <button className="btn" onClick={fetchDiamondInfo}>
              Fetch Info
            </button>
            {diamondInfo && (
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">Owner</span>
                  <span className="info-value">{diamondInfo.owner?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Frozen</span>
                  <span className="info-value">{String(diamondInfo.frozen?.value)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Cut Nonce</span>
                  <span className="info-value">{diamondInfo.nonce?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Restricted</span>
                  <span className="info-value">{String(diamondInfo.restricted?.value)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
