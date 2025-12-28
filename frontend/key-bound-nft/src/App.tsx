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
  return { address: addr, name: 'key-bound-nft' }
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
  
  const [transferId, setTransferId] = useState<string>('')
  const [transferSender, setTransferSender] = useState<string>('')
  const [transferRecipient, setTransferRecipient] = useState<string>('')
  
  const [keyWallet1, setKeyWallet1] = useState<string>('')
  const [keyWallet2, setKeyWallet2] = useState<string>('')
  
  const [resetHolder, setResetHolder] = useState<string>('')
  
  const [fallbackHolder, setFallbackHolder] = useState<string>('')
  
  const [allowTransferTokenId, setAllowTransferTokenId] = useState<string>('')
  const [allowTransferTime, setAllowTransferTime] = useState<string>('')
  const [allowTransferTo, setAllowTransferTo] = useState<string>('')
  const [allowTransferAny, setAllowTransferAny] = useState<boolean>(false)
  
  const [allowApprovalTime, setAllowApprovalTime] = useState<string>('')
  const [allowApprovalNum, setAllowApprovalNum] = useState<string>('')
  
  const [queryAccount, setQueryAccount] = useState<string>('')
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
    if (!mintRecipient) return showToast('Recipient required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'mint',
        functionArgs: [Cl.standardPrincipal(mintRecipient)]
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

  async function addBindings() {
    if (!keyWallet1 || !keyWallet2) return showToast('Both key wallets required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'add-bindings',
        functionArgs: [
          Cl.standardPrincipal(keyWallet1),
          Cl.standardPrincipal(keyWallet2)
        ]
      })
      showToast('Add bindings initiated', 'success')
    } catch (error) {
      showToast('Add bindings failed', 'error')
    }
  }

  async function resetBindings() {
    if (!resetHolder) return showToast('Holder address required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'reset-bindings',
        functionArgs: [Cl.standardPrincipal(resetHolder)]
      })
      showToast('Reset initiated', 'success')
    } catch (error) {
      showToast('Reset failed', 'error')
    }
  }

  async function safeFallback() {
    if (!fallbackHolder) return showToast('Holder address required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'safe-fallback',
        functionArgs: [Cl.standardPrincipal(fallbackHolder)]
      })
      showToast('Fallback initiated', 'success')
    } catch (error) {
      showToast('Fallback failed', 'error')
    }
  }

  async function allowTransfer() {
    if (!allowTransferTokenId || !allowTransferTime || !allowTransferTo) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'allow-transfer',
        functionArgs: [
          Cl.uint(Number(allowTransferTokenId)),
          Cl.uint(Number(allowTransferTime)),
          Cl.standardPrincipal(allowTransferTo),
          Cl.bool(allowTransferAny)
        ]
      })
      showToast('Allow transfer initiated', 'success')
    } catch (error) {
      showToast('Allow transfer failed', 'error')
    }
  }

  async function allowApproval() {
    if (!allowApprovalTime || !allowApprovalNum) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'allow-approval',
        functionArgs: [
          Cl.uint(Number(allowApprovalTime)),
          Cl.uint(Number(allowApprovalNum))
        ]
      })
      showToast('Allow approval initiated', 'success')
    } catch (error) {
      showToast('Allow approval failed', 'error')
    }
  }

  async function getBindings() {
    if (!queryAccount) return showToast('Account required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-bindings',
        functionArgs: [Cl.standardPrincipal(queryAccount)],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  async function isSecureWallet() {
    if (!queryAccount) return showToast('Account required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'is-secure-wallet',
        functionArgs: [Cl.standardPrincipal(queryAccount)],
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
      <h1>Key-Bound NFT</h1>
      
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
            <h3>Add Key Wallet Bindings</h3>
            <input
              type="text"
              placeholder="Key Wallet 1"
              value={keyWallet1}
              onChange={(e) => setKeyWallet1(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Key Wallet 2"
              value={keyWallet2}
              onChange={(e) => setKeyWallet2(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={addBindings} style={{ padding: '10px 20px' }}>
              Add Bindings
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Reset Bindings</h3>
            <input
              type="text"
              placeholder="Holder Address"
              value={resetHolder}
              onChange={(e) => setResetHolder(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={resetBindings} style={{ padding: '10px 20px' }}>
              Reset Bindings
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Safe Fallback</h3>
            <input
              type="text"
              placeholder="Holder Address"
              value={fallbackHolder}
              onChange={(e) => setFallbackHolder(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={safeFallback} style={{ padding: '10px 20px' }}>
              Activate Fallback
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Allow Transfer</h3>
            <input
              type="text"
              placeholder="Token ID"
              value={allowTransferTokenId}
              onChange={(e) => setAllowTransferTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Time"
              value={allowTransferTime}
              onChange={(e) => setAllowTransferTime(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="To Address"
              value={allowTransferTo}
              onChange={(e) => setAllowTransferTo(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={allowTransferAny}
                onChange={(e) => setAllowTransferAny(e.target.checked)}
              />
              {' '}Any Token
            </label>
            <button onClick={allowTransfer} style={{ padding: '10px 20px' }}>
              Allow Transfer
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Allow Approval</h3>
            <input
              type="text"
              placeholder="Time"
              value={allowApprovalTime}
              onChange={(e) => setAllowApprovalTime(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Number of Transfers"
              value={allowApprovalNum}
              onChange={(e) => setAllowApprovalNum(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={allowApproval} style={{ padding: '10px 20px' }}>
              Allow Approval
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Query Account</h3>
            <input
              type="text"
              placeholder="Account Address"
              value={queryAccount}
              onChange={(e) => setQueryAccount(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={getBindings} style={{ padding: '10px 20px', marginRight: '10px' }}>
              Get Bindings
            </button>
            <button onClick={isSecureWallet} style={{ padding: '10px 20px' }}>
              Is Secure Wallet
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
