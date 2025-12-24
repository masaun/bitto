import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { Cl, fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions'
import { useState, useEffect } from 'react'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''
const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'mainnet'

function parseContract(addr: string): { address: string; name: string } {
  if (addr.includes('.')) {
    const [address, name] = addr.split('.')
    return { address, name }
  }
  return { address: addr, name: 'rental-nft-with-user-extension' }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [mintRecipient, setMintRecipient] = useState<string>('')
  const [mintAmount, setMintAmount] = useState<string>('')
  const [mintUri, setMintUri] = useState<string>('')
  
  const [transferTokenId, setTransferTokenId] = useState<string>('')
  const [transferFrom, setTransferFrom] = useState<string>('')
  const [transferTo, setTransferTo] = useState<string>('')
  const [transferAmount, setTransferAmount] = useState<string>('')
  
  const [approvalOperator, setApprovalOperator] = useState<string>('')
  const [approvalApproved, setApprovalApproved] = useState<boolean>(true)
  
  const [createRecordTokenId, setCreateRecordTokenId] = useState<string>('')
  const [createRecordAmount, setCreateRecordAmount] = useState<string>('')
  const [createRecordUser, setCreateRecordUser] = useState<string>('')
  const [createRecordExpiry, setCreateRecordExpiry] = useState<string>('')
  
  const [deleteRecordId, setDeleteRecordId] = useState<string>('')
  
  const [extendRecordId, setExtendRecordId] = useState<string>('')
  const [extendExpiry, setExtendExpiry] = useState<string>('')
  
  const [tokenId, setTokenId] = useState<string>('')
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  
  const [recordId, setRecordId] = useState<string>('')
  const [recordInfo, setRecordInfo] = useState<any>(null)

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
    if (!mintRecipient || !mintAmount || !mintUri) return showToast('All fields required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'mint',
        functionArgs: [
          Cl.principal(mintRecipient),
          Cl.uint(parseInt(mintAmount)),
          Cl.stringAscii(mintUri)
        ],
        network: NETWORK
      })
      showToast('Mint transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function transfer() {
    if (!transferTokenId || !transferFrom || !transferTo || !transferAmount) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'transfer',
        functionArgs: [
          Cl.uint(parseInt(transferTokenId)),
          Cl.principal(transferFrom),
          Cl.principal(transferTo),
          Cl.uint(parseInt(transferAmount))
        ],
        network: NETWORK
      })
      showToast('Transfer transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function setApprovalForAll() {
    if (!approvalOperator) return showToast('Operator required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'set-approval-for-all',
        functionArgs: [
          Cl.principal(approvalOperator),
          Cl.bool(approvalApproved)
        ],
        network: NETWORK
      })
      showToast('Set approval transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function createUserRecord() {
    if (!createRecordTokenId || !createRecordAmount || !createRecordUser || !createRecordExpiry) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'create-user-record',
        functionArgs: [
          Cl.uint(parseInt(createRecordTokenId)),
          Cl.uint(parseInt(createRecordAmount)),
          Cl.principal(createRecordUser),
          Cl.uint(parseInt(createRecordExpiry))
        ],
        network: NETWORK
      })
      showToast('Create user record transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function deleteUserRecord() {
    if (!deleteRecordId) return showToast('Record ID required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'delete-user-record',
        functionArgs: [Cl.uint(parseInt(deleteRecordId))],
        network: NETWORK
      })
      showToast('Delete user record transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function extendRental() {
    if (!extendRecordId || !extendExpiry) return showToast('Record ID and expiry required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'extend-rental',
        functionArgs: [
          Cl.uint(parseInt(extendRecordId)),
          Cl.uint(parseInt(extendExpiry))
        ],
        network: NETWORK
      })
      showToast('Extend rental transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function batchDeleteExpiredRecords() {
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'batch-delete-expired-records',
        functionArgs: [Cl.list([])],
        network: NETWORK
      })
      showToast('Batch delete transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function fetchTokenInfo() {
    if (!tokenId || !contractAddr) return showToast('Token ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-token',
        functionArgs: [Cl.uint(parseInt(tokenId))],
        network: NETWORK,
        senderAddress: userAddress || contractAddr
      })
      setTokenInfo(cvToJSON(result))
    } catch (error) {
      showToast('Failed to fetch token info', 'error')
    }
  }

  async function fetchRecordInfo() {
    if (!recordId || !contractAddr) return showToast('Record ID required', 'error')
    try {
      const [record, isValid] = await Promise.all([
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'user-record-of',
          functionArgs: [Cl.uint(parseInt(recordId))],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'is-record-valid',
          functionArgs: [Cl.uint(parseInt(recordId))],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        })
      ])
      setRecordInfo({
        record: cvToJSON(record),
        isValid: cvToJSON(isValid)
      })
    } catch (error) {
      showToast('Failed to fetch record info', 'error')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Rental NFT</h1>
        <p>ERC-5006 Rental NFT with User Extension</p>
      </header>

      <div className="wallet-section">
        {!connected ? (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
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
            <h2>Mint Token</h2>
            <div className="form-group">
              <label>Recipient</label>
              <input
                type="text"
                placeholder="SP..."
                value={mintRecipient}
                onChange={(e) => setMintRecipient(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                placeholder="100"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>URI</label>
              <input
                type="text"
                placeholder="https://..."
                value={mintUri}
                onChange={(e) => setMintUri(e.target.value)}
              />
            </div>
            <button className="btn" onClick={mint} disabled={!connected}>
              Mint
            </button>
          </div>

          <div className="section">
            <h2>Transfer</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                placeholder="1"
                value={transferTokenId}
                onChange={(e) => setTransferTokenId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>From</label>
              <input
                type="text"
                placeholder="SP..."
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>To</label>
              <input
                type="text"
                placeholder="SP..."
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                placeholder="10"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>
            <button className="btn" onClick={transfer} disabled={!connected}>
              Transfer
            </button>
          </div>

          <div className="section">
            <h2>Operator Approval</h2>
            <div className="form-group">
              <label>Operator Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={approvalOperator}
                onChange={(e) => setApprovalOperator(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={approvalApproved}
                  onChange={(e) => setApprovalApproved(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Approved
              </label>
            </div>
            <button className="btn" onClick={setApprovalForAll} disabled={!connected}>
              Set Approval
            </button>
          </div>

          <div className="section">
            <h2>Create User Record</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                placeholder="1"
                value={createRecordTokenId}
                onChange={(e) => setCreateRecordTokenId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                placeholder="10"
                value={createRecordAmount}
                onChange={(e) => setCreateRecordAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>User Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={createRecordUser}
                onChange={(e) => setCreateRecordUser(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Expiry (Unix timestamp)</label>
              <input
                type="number"
                placeholder="1735689600"
                value={createRecordExpiry}
                onChange={(e) => setCreateRecordExpiry(e.target.value)}
              />
            </div>
            <button className="btn" onClick={createUserRecord} disabled={!connected}>
              Create Record
            </button>
          </div>

          <div className="section">
            <h2>Manage Records</h2>
            <div className="form-group">
              <label>Record ID (Delete)</label>
              <input
                type="number"
                placeholder="1"
                value={deleteRecordId}
                onChange={(e) => setDeleteRecordId(e.target.value)}
              />
            </div>
            <button className="btn btn-danger" onClick={deleteUserRecord} disabled={!connected}>
              Delete Record
            </button>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Record ID (Extend)</label>
              <input
                type="number"
                placeholder="1"
                value={extendRecordId}
                onChange={(e) => setExtendRecordId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>New Expiry (Unix timestamp)</label>
              <input
                type="number"
                placeholder="1767225600"
                value={extendExpiry}
                onChange={(e) => setExtendExpiry(e.target.value)}
              />
            </div>
            <button className="btn" onClick={extendRental} disabled={!connected}>
              Extend Rental
            </button>
            <button className="btn btn-danger" onClick={batchDeleteExpiredRecords} disabled={!connected}>
              Batch Delete Expired
            </button>
          </div>

          <div className="section">
            <h2>Token Info</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                placeholder="1"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
            </div>
            <button className="btn" onClick={fetchTokenInfo}>
              Fetch Token
            </button>
            {tokenInfo?.value && (
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">Owner</span>
                  <span className="info-value">{tokenInfo.value.owner?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Balance</span>
                  <span className="info-value">{tokenInfo.value.balance?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">URI</span>
                  <span className="info-value">{tokenInfo.value.uri?.value}</span>
                </div>
              </div>
            )}
          </div>

          <div className="section">
            <h2>Record Info</h2>
            <div className="form-group">
              <label>Record ID</label>
              <input
                type="number"
                placeholder="1"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
              />
            </div>
            <button className="btn" onClick={fetchRecordInfo}>
              Fetch Record
            </button>
            {recordInfo?.record?.value && (
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">Token ID</span>
                  <span className="info-value">{recordInfo.record.value['token-id']?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Owner</span>
                  <span className="info-value">{recordInfo.record.value.owner?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">User</span>
                  <span className="info-value">{recordInfo.record.value.user?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Amount</span>
                  <span className="info-value">{recordInfo.record.value.amount?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Expiry</span>
                  <span className="info-value">{recordInfo.record.value.expiry?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status</span>
                  <span className={recordInfo.isValid?.value ? 'status-valid' : 'status-expired'}>
                    {recordInfo.isValid?.value ? 'Valid' : 'Expired'}
                  </span>
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
