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
  return { address: addr, name: 'infrastructure-debt' }
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
  
  const [issueLender, setIssueLender] = useState<string>('')
  const [issuePrincipal, setIssuePrincipal] = useState<string>('')
  const [issueInterestRate, setIssueInterestRate] = useState<string>('')
  const [issueMaturityBlock, setIssueMaturityBlock] = useState<string>('')
  
  const [paymentDebtId, setPaymentDebtId] = useState<string>('')
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  
  const [repayDebtId, setRepayDebtId] = useState<string>('')
  
  const [defaultDebtId, setDefaultDebtId] = useState<string>('')
  
  const [queryDebtId, setQueryDebtId] = useState<string>('')
  const [queryBorrower, setQueryBorrower] = useState<string>('')
  const [queryLender, setQueryLender] = useState<string>('')
  const [queryPaymentDebtId, setQueryPaymentDebtId] = useState<string>('')
  const [queryPaymentId, setQueryPaymentId] = useState<string>('')
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

  async function connectWalletKit() {
    try {
      const web3Wallet = await Web3Wallet.init({
        core: {
          projectId: WALLET_CONNECT_PROJECT_ID
        },
        metadata: {
          name: 'Infrastructure Debt',
          description: 'Infrastructure Debt Frontend',
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
          name: 'Infrastructure Debt',
          description: 'Infrastructure Debt Frontend',
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

  async function issueDebt() {
    if (!issueLender || !issuePrincipal || !issueInterestRate || !issueMaturityBlock) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'issue-debt',
        functionArgs: [
          Cl.standardPrincipal(issueLender),
          Cl.uint(Number(issuePrincipal)),
          Cl.uint(Number(issueInterestRate)),
          Cl.uint(Number(issueMaturityBlock))
        ]
      })
      showToast('Issue debt initiated', 'success')
    } catch (error) {
      showToast('Issue debt failed', 'error')
    }
  }

  async function makePayment() {
    if (!paymentDebtId || !paymentAmount) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'make-payment',
        functionArgs: [
          Cl.uint(Number(paymentDebtId)),
          Cl.uint(Number(paymentAmount))
        ]
      })
      showToast('Payment initiated', 'success')
    } catch (error) {
      showToast('Payment failed', 'error')
    }
  }

  async function repayFull() {
    if (!repayDebtId) return showToast('Debt ID required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'repay-full',
        functionArgs: [Cl.uint(Number(repayDebtId))]
      })
      showToast('Full repayment initiated', 'success')
    } catch (error) {
      showToast('Repayment failed', 'error')
    }
  }

  async function markDefault() {
    if (!defaultDebtId) return showToast('Debt ID required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'mark-default',
        functionArgs: [Cl.uint(Number(defaultDebtId))]
      })
      showToast('Mark default initiated', 'success')
    } catch (error) {
      showToast('Mark default failed', 'error')
    }
  }

  async function getDebt() {
    if (!queryDebtId) return showToast('Debt ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-debt',
        functionArgs: [Cl.uint(Number(queryDebtId))],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  async function getPayment() {
    if (!queryPaymentDebtId || !queryPaymentId) {
      return showToast('Debt ID and Payment ID required', 'error')
    }
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-payment',
        functionArgs: [
          Cl.uint(Number(queryPaymentDebtId)),
          Cl.uint(Number(queryPaymentId))
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

  async function getBorrowerDebts() {
    if (!queryBorrower) return showToast('Borrower address required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-borrower-debts',
        functionArgs: [Cl.standardPrincipal(queryBorrower)],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  async function getLenderDebts() {
    if (!queryLender) return showToast('Lender address required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-lender-debts',
        functionArgs: [Cl.standardPrincipal(queryLender)],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  async function calculateTotalDue() {
    if (!queryDebtId) return showToast('Debt ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'calculate-total-due',
        functionArgs: [Cl.uint(Number(queryDebtId))],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  async function getDebtStatus() {
    if (!queryDebtId) return showToast('Debt ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-debt-status',
        functionArgs: [Cl.uint(Number(queryDebtId))],
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
      <h1>Infrastructure Debt</h1>
      
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
          <div className="wallet-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
              Connect (@stacks/connect)
            </button>
            <button onClick={connectWalletKit} style={{ padding: '10px 20px', fontSize: '16px' }}>
              Connect (WalletKit)
            </button>
            <button onClick={connectAppKit} style={{ padding: '10px 20px', fontSize: '16px' }}>
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
            <h3>Issue Debt</h3>
            <input
              type="text"
              placeholder="Lender Address"
              value={issueLender}
              onChange={(e) => setIssueLender(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Principal Amount"
              value={issuePrincipal}
              onChange={(e) => setIssuePrincipal(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Interest Rate (basis points)"
              value={issueInterestRate}
              onChange={(e) => setIssueInterestRate(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Maturity Block"
              value={issueMaturityBlock}
              onChange={(e) => setIssueMaturityBlock(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={issueDebt} style={{ padding: '10px 20px' }}>
              Issue Debt
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Make Payment</h3>
            <input
              type="text"
              placeholder="Debt ID"
              value={paymentDebtId}
              onChange={(e) => setPaymentDebtId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Payment Amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={makePayment} style={{ padding: '10px 20px' }}>
              Make Payment
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Repay Full Debt</h3>
            <input
              type="text"
              placeholder="Debt ID"
              value={repayDebtId}
              onChange={(e) => setRepayDebtId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={repayFull} style={{ padding: '10px 20px' }}>
              Repay Full
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Mark Default</h3>
            <input
              type="text"
              placeholder="Debt ID"
              value={defaultDebtId}
              onChange={(e) => setDefaultDebtId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={markDefault} style={{ padding: '10px 20px' }}>
              Mark as Default
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Query Functions</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <h4>Get Debt</h4>
              <input
                type="text"
                placeholder="Debt ID"
                value={queryDebtId}
                onChange={(e) => setQueryDebtId(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button onClick={getDebt} style={{ padding: '10px 20px', marginRight: '10px' }}>
                Get Debt
              </button>
              <button onClick={calculateTotalDue} style={{ padding: '10px 20px', marginRight: '10px' }}>
                Calculate Total Due
              </button>
              <button onClick={getDebtStatus} style={{ padding: '10px 20px' }}>
                Get Debt Status
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h4>Get Payment</h4>
              <input
                type="text"
                placeholder="Debt ID"
                value={queryPaymentDebtId}
                onChange={(e) => setQueryPaymentDebtId(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <input
                type="text"
                placeholder="Payment ID"
                value={queryPaymentId}
                onChange={(e) => setQueryPaymentId(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button onClick={getPayment} style={{ padding: '10px 20px' }}>
                Get Payment
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h4>Get Borrower Debts</h4>
              <input
                type="text"
                placeholder="Borrower Address"
                value={queryBorrower}
                onChange={(e) => setQueryBorrower(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button onClick={getBorrowerDebts} style={{ padding: '10px 20px' }}>
                Get Borrower Debts
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h4>Get Lender Debts</h4>
              <input
                type="text"
                placeholder="Lender Address"
                value={queryLender}
                onChange={(e) => setQueryLender(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button onClick={getLenderDebts} style={{ padding: '10px 20px' }}>
                Get Lender Debts
              </button>
            </div>

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
