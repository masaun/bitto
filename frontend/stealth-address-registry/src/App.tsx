import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { Cl, cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions'
import { useState, useEffect } from 'react'
import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network'
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
  return { address: addr, name: 'stealth-address-registry' }
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
  
  const [schemeId, setSchemeId] = useState<string>('')
  const [metaAddress, setMetaAddress] = useState<string>('')
  
  const [registrant, setRegistrant] = useState<string>('')
  const [onBehalfSchemeId, setOnBehalfSchemeId] = useState<string>('')
  const [onBehalfMetaAddress, setOnBehalfMetaAddress] = useState<string>('')
  const [signature, setSignature] = useState<string>('')
  
  const [queryRegistrant, setQueryRegistrant] = useState<string>('')
  const [querySchemeId, setQuerySchemeId] = useState<string>('')
  const [queryResult, setQueryResult] = useState<any>(null)
  
  const [nonceAddress, setNonceAddress] = useState<string>('')
  const [nonceResult, setNonceResult] = useState<any>(null)

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
          name: 'Stealth Address Registry',
          description: 'Stealth Address Registry Frontend',
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
          name: 'Stealth Address Registry',
          description: 'Stealth Address Registry Frontend',
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

  async function registerKeys() {
    if (!schemeId || !metaAddress) return showToast('Scheme ID and meta-address required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'register-keys',
        functionArgs: [
          Cl.uint(Number(schemeId)),
          Cl.buffer(Buffer.from(metaAddress, 'hex'))
        ]
      })
      showToast('Registration initiated', 'success')
    } catch (error) {
      showToast('Registration failed', 'error')
    }
  }

  async function registerKeysOnBehalf() {
    if (!registrant || !onBehalfSchemeId || !onBehalfMetaAddress || !signature) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'register-keys-on-behalf',
        functionArgs: [
          Cl.standardPrincipal(registrant),
          Cl.uint(Number(onBehalfSchemeId)),
          Cl.buffer(Buffer.from(onBehalfMetaAddress, 'hex')),
          Cl.buffer(Buffer.from(signature, 'hex'))
        ]
      })
      showToast('Registration on behalf initiated', 'success')
    } catch (error) {
      showToast('Registration failed', 'error')
    }
  }

  async function incrementNonce() {
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'increment-nonce',
        functionArgs: []
      })
      showToast('Nonce increment initiated', 'success')
    } catch (error) {
      showToast('Increment failed', 'error')
    }
  }

  async function getStealthMetaAddress() {
    if (!queryRegistrant || !querySchemeId) return showToast('Registrant and scheme ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-stealth-meta-address',
        functionArgs: [
          Cl.standardPrincipal(queryRegistrant),
          Cl.uint(Number(querySchemeId))
        ],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  async function getNonce() {
    if (!nonceAddress) return showToast('Address required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-nonce',
        functionArgs: [Cl.standardPrincipal(nonceAddress)],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setNonceResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Stealth Address Registry</h1>
      
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
            <h3>Register Keys</h3>
            <input
              type="text"
              placeholder="Scheme ID"
              value={schemeId}
              onChange={(e) => setSchemeId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Meta Address (hex)"
              value={metaAddress}
              onChange={(e) => setMetaAddress(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={registerKeys} style={{ padding: '10px 20px' }}>
              Register
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Register Keys On Behalf</h3>
            <input
              type="text"
              placeholder="Registrant Address"
              value={registrant}
              onChange={(e) => setRegistrant(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Scheme ID"
              value={onBehalfSchemeId}
              onChange={(e) => setOnBehalfSchemeId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Meta Address (hex)"
              value={onBehalfMetaAddress}
              onChange={(e) => setOnBehalfMetaAddress(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Signature (hex)"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={registerKeysOnBehalf} style={{ padding: '10px 20px' }}>
              Register On Behalf
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Increment Nonce</h3>
            <button onClick={incrementNonce} style={{ padding: '10px 20px' }}>
              Increment Nonce
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Get Stealth Meta Address</h3>
            <input
              type="text"
              placeholder="Registrant Address"
              value={queryRegistrant}
              onChange={(e) => setQueryRegistrant(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Scheme ID"
              value={querySchemeId}
              onChange={(e) => setQuerySchemeId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={getStealthMetaAddress} style={{ padding: '10px 20px', marginBottom: '10px' }}>
              Query
            </button>
            {queryResult && (
              <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            )}
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Get Nonce</h3>
            <input
              type="text"
              placeholder="Address"
              value={nonceAddress}
              onChange={(e) => setNonceAddress(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={getNonce} style={{ padding: '10px 20px', marginBottom: '10px' }}>
              Query Nonce
            </button>
            {nonceResult && (
              <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(nonceResult, null, 2)}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
