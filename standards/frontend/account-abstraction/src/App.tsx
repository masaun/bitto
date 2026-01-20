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
  return { address: addr, name: 'account-abstraction' }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [publicKey, setPublicKey] = useState<string>('')
  const [depositAccount, setDepositAccount] = useState<string>('')
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [withdrawAccount, setWithdrawAccount] = useState<string>('')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [executeOpHash, setExecuteOpHash] = useState<string>('')
  const [executeSig, setExecuteSig] = useState<string>('')
  
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [entryPointInfo, setEntryPointInfo] = useState<any>(null)

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
          name: 'Account Abstraction',
          description: 'Account Abstraction Frontend',
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
          name: 'Account Abstraction',
          description: 'Account Abstraction Frontend',
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

  async function createAccount() {
    if (!publicKey) return showToast('Public key required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'create-account',
        functionArgs: [Cl.bufferFromHex(publicKey)],
        network: NETWORK
      })
      showToast('Create account transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function depositTo() {
    if (!depositAccount || !depositAmount) return showToast('Account and amount required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'deposit-to',
        functionArgs: [Cl.principal(depositAccount), Cl.uint(parseInt(depositAmount))],
        network: NETWORK
      })
      showToast('Deposit transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function withdrawTo() {
    if (!withdrawAccount || !withdrawAmount) return showToast('Account and amount required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'withdraw-to',
        functionArgs: [Cl.principal(withdrawAccount), Cl.uint(parseInt(withdrawAmount))],
        network: NETWORK
      })
      showToast('Withdraw transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function executeUserOp() {
    if (!executeOpHash || !executeSig) return showToast('Op hash and signature required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'execute-user-op',
        functionArgs: [Cl.bufferFromHex(executeOpHash), Cl.bufferFromHex(executeSig)],
        network: NETWORK
      })
      showToast('Execute user op transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function toggleEntryPoint() {
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'toggle-entry-point',
        functionArgs: [],
        network: NETWORK
      })
      showToast('Toggle entry point transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function fetchAccountInfo() {
    if (!userAddress || !contractAddr) return
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-account-info',
        functionArgs: [Cl.principal(userAddress)],
        network: NETWORK,
        senderAddress: userAddress
      })
      setAccountInfo(cvToJSON(result))
    } catch (error) {
      showToast('Failed to fetch account info', 'error')
    }
  }

  async function fetchEntryPointInfo() {
    if (!contractAddr) return
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-entry-point-info',
        functionArgs: [],
        network: NETWORK,
        senderAddress: userAddress || contractAddr
      })
      setEntryPointInfo(cvToJSON(result))
    } catch (error) {
      showToast('Failed to fetch entry point info', 'error')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Account Abstraction</h1>
        <p>ERC-4337 Smart Accounts on Stacks</p>
      </header>

      <div className="wallet-section">
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
            <h2>Create Smart Account</h2>
            <div className="form-group">
              <label>Public Key (33 bytes hex)</label>
              <input
                type="text"
                placeholder="0x..."
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
              />
            </div>
            <button className="btn" onClick={createAccount} disabled={!connected}>
              Create Account
            </button>
          </div>

          <div className="section">
            <h2>Deposit STX</h2>
            <div className="form-group">
              <label>Account Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={depositAccount}
                onChange={(e) => setDepositAccount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Amount (microSTX)</label>
              <input
                type="number"
                placeholder="1000000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <button className="btn" onClick={depositTo} disabled={!connected}>
              Deposit
            </button>
          </div>

          <div className="section">
            <h2>Withdraw STX</h2>
            <div className="form-group">
              <label>Recipient Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Amount (microSTX)</label>
              <input
                type="number"
                placeholder="1000000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <button className="btn" onClick={withdrawTo} disabled={!connected}>
              Withdraw
            </button>
          </div>

          <div className="section">
            <h2>Execute User Operation</h2>
            <div className="form-group">
              <label>Op Hash (32 bytes hex)</label>
              <input
                type="text"
                placeholder="0x..."
                value={executeOpHash}
                onChange={(e) => setExecuteOpHash(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Signature (64 bytes hex)</label>
              <input
                type="text"
                placeholder="0x..."
                value={executeSig}
                onChange={(e) => setExecuteSig(e.target.value)}
              />
            </div>
            <button className="btn" onClick={executeUserOp} disabled={!connected}>
              Execute
            </button>
          </div>

          <div className="section">
            <h2>Admin Controls</h2>
            <button className="btn" onClick={toggleEntryPoint} disabled={!connected}>
              Toggle Entry Point
            </button>
          </div>

          <div className="section">
            <h2>Read Contract State</h2>
            <button className="btn" onClick={fetchAccountInfo} disabled={!connected}>
              Get My Account Info
            </button>
            <button className="btn" onClick={fetchEntryPointInfo} style={{ marginLeft: '0.5rem' }}>
              Get Entry Point Info
            </button>
            {accountInfo && (
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">Exists</span>
                  <span className="info-value">{String(accountInfo.value?.exists?.value)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nonce</span>
                  <span className="info-value">{accountInfo.value?.nonce?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Deposit</span>
                  <span className="info-value">{accountInfo.value?.deposit?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Active</span>
                  <span className="info-value">{String(accountInfo.value?.['is-active']?.value)}</span>
                </div>
              </div>
            )}
            {entryPointInfo && (
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">Owner</span>
                  <span className="info-value">{entryPointInfo.value?.owner?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Enabled</span>
                  <span className="info-value">{String(entryPointInfo.value?.enabled?.value)}</span>
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
