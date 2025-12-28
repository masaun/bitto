import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { Cl, cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions'
import { useState, useEffect } from 'react'
import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''
const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'mainnet'

function parseContract(addr: string): { address: string; name: string } {
  if (addr.includes('.')) {
    const [address, name] = addr.split('.')
    return { address, name }
  }
  return { address: addr, name: 'aggregated-ids-nft' }
}

function getNetwork() {
  switch (NETWORK) {
    case 'testnet': return new StacksTestnet()
    case 'devnet': return new StacksDevnet()
    default: return new StacksMainnet()
  }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [mintRecipient, setMintRecipient] = useState<string>('')
  const [mintUri, setMintUri] = useState<string>('')
  
  const [transferId, setTransferId] = useState<string>('')
  const [transferSender, setTransferSender] = useState<string>('')
  const [transferRecipient, setTransferRecipient] = useState<string>('')
  
  const [rootTokenId, setRootTokenId] = useState<string>('')
  const [identitiesRoot, setIdentitiesRoot] = useState<string>('')
  
  const [verifyTokenId, setVerifyTokenId] = useState<string>('')
  const [verifyUserIds, setVerifyUserIds] = useState<string>('')
  const [verifySignature, setVerifySignature] = useState<string>('')
  
  const [queryTokenId, setQueryTokenId] = useState<string>('')
  const [queryResult, setQueryResult] = useState<any>(null)

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
          Cl.standardPrincipal(mintRecipient),
          Cl.stringAscii(mintUri)
        ]
      })
      showToast('Mint initiated', 'success')
    } catch (error) {
      showToast('Mint failed', 'error')
    }
  }

  async function transfer() {
    if (!transferId || !transferSender || !transferRecipient) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'transfer',
        functionArgs: [
          Cl.uint(Number(transferId)),
          Cl.standardPrincipal(transferSender),
          Cl.standardPrincipal(transferRecipient)
        ]
      })
      showToast('Transfer initiated', 'success')
    } catch (error) {
      showToast('Transfer failed', 'error')
    }
  }

  async function setIdentitiesRoot() {
    if (!rootTokenId || !identitiesRoot) {
      return showToast('Token ID and root required', 'error')
    }
    if (identitiesRoot.length !== 64) {
      return showToast('Root must be 32 bytes (64 hex chars)', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'set-identities-root',
        functionArgs: [
          Cl.uint(Number(rootTokenId)),
          Cl.buffer(Buffer.from(identitiesRoot, 'hex'))
        ]
      })
      showToast('Set identities root initiated', 'success')
    } catch (error) {
      showToast('Set identities root failed', 'error')
    }
  }

  async function verifyIdentitiesBinding() {
    if (!verifyTokenId || !verifyUserIds || !verifySignature) {
      return showToast('All fields required', 'error')
    }
    try {
      const userIdArray = verifyUserIds.split(',').map(id => Cl.stringAscii(id.trim()))
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'verify-identities-binding',
        functionArgs: [
          Cl.uint(Number(verifyTokenId)),
          Cl.list(userIdArray),
          Cl.buffer(Buffer.from(verifySignature, 'hex'))
        ]
      })
      showToast('Verify identities binding initiated', 'success')
    } catch (error) {
      showToast('Verify identities binding failed', 'error')
    }
  }

  async function getIdentitiesRoot() {
    if (!queryTokenId) return showToast('Token ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-identities-root',
        functionArgs: [Cl.uint(Number(queryTokenId))],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  async function getOwner() {
    if (!queryTokenId) return showToast('Token ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-owner',
        functionArgs: [Cl.uint(Number(queryTokenId))],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  async function getLastTokenId() {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-last-token-id',
        functionArgs: [],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Aggregated IDs NFT</h1>
      
      {toast && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: toast.type === 'success' ? '#4caf50' : '#f44336',
          color: 'white',
          borderRadius: '4px'
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        {!connected ? (
          <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Connect Wallet
          </button>
        ) : (
          <div>
            <p>Connected: {userAddress}</p>
            <button onClick={disconnectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
              Disconnect
            </button>
          </div>
        )}
      </div>

      {connected && (
        <>
          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Mint NFT</h3>
            <input
              type="text"
              placeholder="Recipient Address"
              value={mintRecipient}
              onChange={(e) => setMintRecipient(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Token URI"
              value={mintUri}
              onChange={(e) => setMintUri(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={mint} style={{ padding: '10px 20px' }}>
              Mint
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Transfer NFT</h3>
            <input
              type="text"
              placeholder="Token ID"
              value={transferId}
              onChange={(e) => setTransferId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Sender Address"
              value={transferSender}
              onChange={(e) => setTransferSender(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Recipient Address"
              value={transferRecipient}
              onChange={(e) => setTransferRecipient(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={transfer} style={{ padding: '10px 20px' }}>
              Transfer
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Set Identities Root</h3>
            <input
              type="text"
              placeholder="Token ID"
              value={rootTokenId}
              onChange={(e) => setRootTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Identities Root (32 bytes hex)"
              value={identitiesRoot}
              onChange={(e) => setIdentitiesRoot(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={setIdentitiesRoot} style={{ padding: '10px 20px' }}>
              Set Identities Root
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Verify Identities Binding</h3>
            <input
              type="text"
              placeholder="Token ID"
              value={verifyTokenId}
              onChange={(e) => setVerifyTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="User IDs (comma separated)"
              value={verifyUserIds}
              onChange={(e) => setVerifyUserIds(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Signature (hex)"
              value={verifySignature}
              onChange={(e) => setVerifySignature(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={verifyIdentitiesBinding} style={{ padding: '10px 20px' }}>
              Verify Identities Binding
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Query Functions</h3>
            <input
              type="text"
              placeholder="Token ID"
              value={queryTokenId}
              onChange={(e) => setQueryTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={getIdentitiesRoot} style={{ padding: '10px 20px', marginRight: '10px' }}>
              Get Identities Root
            </button>
            <button onClick={getOwner} style={{ padding: '10px 20px', marginRight: '10px' }}>
              Get Owner
            </button>
            <button onClick={getLastTokenId} style={{ padding: '10px 20px' }}>
              Get Last Token ID
            </button>
            {queryResult && (
              <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', overflow: 'auto', marginTop: '10px' }}>
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
