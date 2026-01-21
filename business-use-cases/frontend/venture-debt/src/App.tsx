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
  return { address: addr, name: 'venture-debt' }
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
  
  const [issueVentureDebtLender, setIssueventuredebtLender] = useState<string>('')
  const [issueVentureDebtAmount, setIssueventuredebtAmount] = useState<string>('')
  const [issueVentureDebtRate, setIssueventuredebtRate] = useState<string>('')
  const [issueVentureDebtWarrantcoverage, setIssueventuredebtWarrantcoverage] = useState<string>('')
  const [issueVentureDebtEquitykicker, setIssueventuredebtEquitykicker] = useState<string>('')
  const [issueVentureDebtRunway, setIssueventuredebtRunway] = useState<string>('')
  const [issueVentureDebtMaturity, setIssueventuredebtMaturity] = useState<string>('')
  const [disburseFundsDebtid, setDisbursefundsDebtid] = useState<string>('')
  const [issueWarrantDebtid, setIssuewarrantDebtid] = useState<string>('')
  const [issueWarrantHolder, setIssuewarrantHolder] = useState<string>('')
  const [issueWarrantStrike, setIssuewarrantStrike] = useState<string>('')
  const [issueWarrantShares, setIssuewarrantShares] = useState<string>('')
  const [repayDebtid, setRepayDebtid] = useState<string>('')
  const [repayAmount, setRepayAmount] = useState<string>('')
  const [exerciseWarrantDebtid, setExercisewarrantDebtid] = useState<string>('')
  const [exerciseWarrantWarrantid, setExercisewarrantWarrantid] = useState<string>('')
  const [exerciseWarrantPayment, setExercisewarrantPayment] = useState<string>('')

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

  async function issueVentureDebt() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'issue-venture-debt',
        functionArgs: [
          Cl.principal(issueVentureDebtLender),
        Cl.uint(issueVentureDebtAmount),
        Cl.uint(issueVentureDebtRate),
        Cl.uint(issueVentureDebtWarrantcoverage),
        Cl.uint(issueVentureDebtEquitykicker),
        Cl.uint(issueVentureDebtRunway),
        Cl.uint(issueVentureDebtMaturity)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call issue-venture-debt', 'error')
    }
  }

  async function disburseFunds() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'disburse-funds',
        functionArgs: [
          Cl.uint(disburseFundsDebtid)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call disburse-funds', 'error')
    }
  }

  async function issueWarrant() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'issue-warrant',
        functionArgs: [
          Cl.uint(issueWarrantDebtid),
        Cl.principal(issueWarrantHolder),
        Cl.uint(issueWarrantStrike),
        Cl.uint(issueWarrantShares)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call issue-warrant', 'error')
    }
  }

  async function repay() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'repay',
        functionArgs: [
          Cl.uint(repayDebtid),
        Cl.uint(repayAmount)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call repay', 'error')
    }
  }

  async function exerciseWarrant() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'exercise-warrant',
        functionArgs: [
          Cl.uint(exerciseWarrantDebtid),
        Cl.uint(exerciseWarrantWarrantid),
        Cl.uint(exerciseWarrantPayment)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call exercise-warrant', 'error')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Venture Debt</h1>
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
          <h3>issue-venture-debt</h3>
          <p style={{ color: '#666' }}>Issue venture debt with warrants</p>
          <input
            type="text"
            placeholder="lender (principal)"
            value={issueVentureDebtLender}
            onChange={(e) => setIssueventuredebtLender(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="amount (uint)"
            value={issueVentureDebtAmount}
            onChange={(e) => setIssueventuredebtAmount(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="rate (uint)"
            value={issueVentureDebtRate}
            onChange={(e) => setIssueventuredebtRate(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="warrant-coverage (uint)"
            value={issueVentureDebtWarrantcoverage}
            onChange={(e) => setIssueventuredebtWarrantcoverage(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="equity-kicker (uint)"
            value={issueVentureDebtEquitykicker}
            onChange={(e) => setIssueventuredebtEquitykicker(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="runway (uint)"
            value={issueVentureDebtRunway}
            onChange={(e) => setIssueventuredebtRunway(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="maturity (uint)"
            value={issueVentureDebtMaturity}
            onChange={(e) => setIssueventuredebtMaturity(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={issueVentureDebt}
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
            Call issue-venture-debt
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>disburse-funds</h3>
          <p style={{ color: '#666' }}>Disburse debt funds</p>
          <input
            type="text"
            placeholder="debt-id (uint)"
            value={disburseFundsDebtid}
            onChange={(e) => setDisbursefundsDebtid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={disburseFunds}
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
            Call disburse-funds
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>issue-warrant</h3>
          <p style={{ color: '#666' }}>Issue warrant to holder</p>
          <input
            type="text"
            placeholder="debt-id (uint)"
            value={issueWarrantDebtid}
            onChange={(e) => setIssuewarrantDebtid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="holder (principal)"
            value={issueWarrantHolder}
            onChange={(e) => setIssuewarrantHolder(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="strike (uint)"
            value={issueWarrantStrike}
            onChange={(e) => setIssuewarrantStrike(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="shares (uint)"
            value={issueWarrantShares}
            onChange={(e) => setIssuewarrantShares(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={issueWarrant}
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
            Call issue-warrant
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>repay</h3>
          <p style={{ color: '#666' }}>Repay debt</p>
          <input
            type="text"
            placeholder="debt-id (uint)"
            value={repayDebtid}
            onChange={(e) => setRepayDebtid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="amount (uint)"
            value={repayAmount}
            onChange={(e) => setRepayAmount(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={repay}
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
            Call repay
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>exercise-warrant</h3>
          <p style={{ color: '#666' }}>Exercise warrant</p>
          <input
            type="text"
            placeholder="debt-id (uint)"
            value={exerciseWarrantDebtid}
            onChange={(e) => setExercisewarrantDebtid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="warrant-id (uint)"
            value={exerciseWarrantWarrantid}
            onChange={(e) => setExercisewarrantWarrantid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="payment (uint)"
            value={exerciseWarrantPayment}
            onChange={(e) => setExercisewarrantPayment(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={exerciseWarrant}
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
            Call exercise-warrant
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
