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
  return { address: addr, name: 'carbon-credit-tokenization' }
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
  
  const [issueCreditsRecipient, setIssuecreditsRecipient] = useState<string>('')
  const [issueCreditsAmount, setIssuecreditsAmount] = useState<string>('')
  const [issueCreditsProjecttype, setIssuecreditsProjecttype] = useState<string>('')
  const [issueCreditsVerification, setIssuecreditsVerification] = useState<string>('')
  const [tradeCreditsCreditid, setTradecreditsCreditid] = useState<string>('')
  const [tradeCreditsRecipient, setTradecreditsRecipient] = useState<string>('')
  const [tradeCreditsAmount, setTradecreditsAmount] = useState<string>('')
  const [retireCreditsCreditid, setRetirecreditsCreditid] = useState<string>('')
  const [retireCreditsAmount, setRetirecreditsAmount] = useState<string>('')

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

  async function disconnectWallet() {
    try {
      await disconnect()
      setConnected(false)
      setUserAddress('')
      showToast('Wallet disconnected', 'success')
    } catch (error) {
      showToast('Failed to disconnect wallet', 'error')
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  async function issueCredits() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'issue-credits',
        functionArgs: [
          Cl.principal(issueCreditsRecipient),
        Cl.uint(issueCreditsAmount),
        Cl.stringAscii(issueCreditsProjecttype),
        Cl.buffer(Buffer.from(issueCreditsVerification, 'hex'))
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call issue-credits', 'error')
    }
  }

  async function tradeCredits() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'trade-credits',
        functionArgs: [
          Cl.uint(tradeCreditsCreditid),
        Cl.principal(tradeCreditsRecipient),
        Cl.uint(tradeCreditsAmount)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call trade-credits', 'error')
    }
  }

  async function retireCredits() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'retire-credits',
        functionArgs: [
          Cl.uint(retireCreditsCreditid),
        Cl.uint(retireCreditsAmount)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call retire-credits', 'error')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Carbon Credit Tokenization</h1>
        <p style={{ color: '#666' }}>Contract: {CONTRACT_ADDRESS || 'Not configured'}</p>
        <p style={{ color: '#666' }}>Network: {NETWORK}</p>
      </div>

      {toast && (
        <div style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: toast.type === 'success' ? '#d4edda' : '#f8d7da',
          color: toast.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${toast.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          {toast.message}
        </div>
      ))}

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {!connected ? (
          <button
            onClick={connectWallet}
            style={{
              padding: '10px 30px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <p>Connected: {userAddress}</p>
            <button
              onClick={disconnectWallet}
              style={{
                padding: '10px 30px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Disconnect
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Contract Functions</h2>
        
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>issue-credits</h3>
          <p style={{ color: '#666' }}>Issue carbon credits</p>
          <input
            type="text"
            placeholder="recipient (principal)"
            value={issueCreditsRecipient}
            onChange={(e) => setIssuecreditsRecipient(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="amount (uint)"
            value={issueCreditsAmount}
            onChange={(e) => setIssuecreditsAmount(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="project-type (string-ascii)"
            value={issueCreditsProjecttype}
            onChange={(e) => setIssuecreditsProjecttype(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="verification (buff)"
            value={issueCreditsVerification}
            onChange={(e) => setIssuecreditsVerification(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={issueCredits}
            disabled={!connected}
            style={{ 
              padding: '10px 20px', 
              marginTop: '8px',
              backgroundColor: connected ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: connected ? 'pointer' : 'not-allowed' 
            }}
          >
            Call issue-credits
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>trade-credits</h3>
          <p style={{ color: '#666' }}>Trade carbon credits</p>
          <input
            type="text"
            placeholder="credit-id (uint)"
            value={tradeCreditsCreditid}
            onChange={(e) => setTradecreditsCreditid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="recipient (principal)"
            value={tradeCreditsRecipient}
            onChange={(e) => setTradecreditsRecipient(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="amount (uint)"
            value={tradeCreditsAmount}
            onChange={(e) => setTradecreditsAmount(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={tradeCredits}
            disabled={!connected}
            style={{ 
              padding: '10px 20px', 
              marginTop: '8px',
              backgroundColor: connected ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: connected ? 'pointer' : 'not-allowed' 
            }}
          >
            Call trade-credits
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>retire-credits</h3>
          <p style={{ color: '#666' }}>Retire carbon credits</p>
          <input
            type="text"
            placeholder="credit-id (uint)"
            value={retireCreditsCreditid}
            onChange={(e) => setRetirecreditsCreditid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="amount (uint)"
            value={retireCreditsAmount}
            onChange={(e) => setRetirecreditsAmount(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={retireCredits}
            disabled={!connected}
            style={{ 
              padding: '10px 20px', 
              marginTop: '8px',
              backgroundColor: connected ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: connected ? 'pointer' : 'not-allowed' 
            }}
          >
            Call retire-credits
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
