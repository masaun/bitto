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
  return { address: addr, name: 'time-non-fungible-token' }
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [mintRecipient, setMintRecipient] = useState<string>('')
  const [mintStart, setMintStart] = useState<string>('')
  const [mintEnd, setMintEnd] = useState<string>('')
  const [mintUri, setMintUri] = useState<string>('')
  
  const [mintAssetRecipient, setMintAssetRecipient] = useState<string>('')
  const [mintAssetId, setMintAssetId] = useState<string>('')
  const [mintAssetStart, setMintAssetStart] = useState<string>('')
  const [mintAssetEnd, setMintAssetEnd] = useState<string>('')
  const [mintAssetUri, setMintAssetUri] = useState<string>('')
  
  const [transferTokenId, setTransferTokenId] = useState<string>('')
  const [transferRecipient, setTransferRecipient] = useState<string>('')
  
  const [approveTokenId, setApproveTokenId] = useState<string>('')
  const [approveSpender, setApproveSpender] = useState<string>('')
  
  const [approvalOperator, setApprovalOperator] = useState<string>('')
  const [approvalApproved, setApprovalApproved] = useState<boolean>(true)
  
  const [splitTokenId, setSplitTokenId] = useState<string>('')
  const [splitTime, setSplitTime] = useState<string>('')
  
  const [mergeTokenId1, setMergeTokenId1] = useState<string>('')
  const [mergeTokenId2, setMergeTokenId2] = useState<string>('')
  
  const [burnTokenId, setBurnTokenId] = useState<string>('')
  
  const [tokenId, setTokenId] = useState<string>('')
  const [tokenInfo, setTokenInfo] = useState<any>(null)

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
    if (!mintRecipient || !mintStart || !mintEnd || !mintUri) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'mint',
        functionArgs: [
          Cl.principal(mintRecipient),
          Cl.uint(parseInt(mintStart)),
          Cl.uint(parseInt(mintEnd)),
          Cl.stringAscii(mintUri)
        ],
        network: NETWORK
      })
      showToast('Mint transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function mintWithAssetId() {
    if (!mintAssetRecipient || !mintAssetId || !mintAssetStart || !mintAssetEnd || !mintAssetUri) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'mint-with-asset-id',
        functionArgs: [
          Cl.principal(mintAssetRecipient),
          Cl.uint(parseInt(mintAssetId)),
          Cl.uint(parseInt(mintAssetStart)),
          Cl.uint(parseInt(mintAssetEnd)),
          Cl.stringAscii(mintAssetUri)
        ],
        network: NETWORK
      })
      showToast('Mint with asset ID transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function transfer() {
    if (!transferTokenId || !transferRecipient) return showToast('Token ID and recipient required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'transfer',
        functionArgs: [
          Cl.uint(parseInt(transferTokenId)),
          Cl.principal(transferRecipient)
        ],
        network: NETWORK
      })
      showToast('Transfer transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function approve() {
    if (!approveTokenId || !approveSpender) return showToast('Token ID and spender required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'approve',
        functionArgs: [
          Cl.uint(parseInt(approveTokenId)),
          Cl.principal(approveSpender)
        ],
        network: NETWORK
      })
      showToast('Approve transaction submitted', 'success')
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

  async function split() {
    if (!splitTokenId || !splitTime) return showToast('Token ID and split time required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'split',
        functionArgs: [
          Cl.uint(parseInt(splitTokenId)),
          Cl.uint(parseInt(splitTime))
        ],
        network: NETWORK
      })
      showToast('Split transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function mergeTokens() {
    if (!mergeTokenId1 || !mergeTokenId2) return showToast('Both token IDs required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'merge-tokens',
        functionArgs: [
          Cl.uint(parseInt(mergeTokenId1)),
          Cl.uint(parseInt(mergeTokenId2))
        ],
        network: NETWORK
      })
      showToast('Merge transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function burn() {
    if (!burnTokenId) return showToast('Token ID required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'burn',
        functionArgs: [Cl.uint(parseInt(burnTokenId))],
        network: NETWORK
      })
      showToast('Burn transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function fetchTokenInfo() {
    if (!tokenId || !contractAddr) return showToast('Token ID required', 'error')
    try {
      const [token, isValid, remaining] = await Promise.all([
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'get-token',
          functionArgs: [Cl.uint(parseInt(tokenId))],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'is-valid-now',
          functionArgs: [Cl.uint(parseInt(tokenId))],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        }),
        fetchCallReadOnlyFunction({
          contractAddress: contractAddr,
          contractName: contractName,
          functionName: 'time-remaining',
          functionArgs: [Cl.uint(parseInt(tokenId))],
          network: NETWORK,
          senderAddress: userAddress || contractAddr
        })
      ])
      setTokenInfo({
        token: cvToJSON(token),
        isValid: cvToJSON(isValid),
        remaining: cvToJSON(remaining)
      })
    } catch (error) {
      showToast('Failed to fetch token info', 'error')
    }
  }

  function getTimeStatus(tokenData: any): { status: string; className: string } {
    const now = Math.floor(Date.now() / 1000)
    const startTime = parseInt(tokenData?.value?.['start-time']?.value || '0')
    const endTime = parseInt(tokenData?.value?.['end-time']?.value || '0')
    
    if (now < startTime) return { status: 'Pending', className: 'status-pending' }
    if (now > endTime) return { status: 'Expired', className: 'status-expired' }
    return { status: 'Valid', className: 'status-valid' }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Time NFT</h1>
        <p>ERC-5007 Time-Bounded NFTs on Stacks</p>
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
            <h2>Mint Time NFT</h2>
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
              <label>Start Time (Unix timestamp)</label>
              <input
                type="number"
                placeholder={String(Math.floor(Date.now() / 1000))}
                value={mintStart}
                onChange={(e) => setMintStart(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Time (Unix timestamp)</label>
              <input
                type="number"
                placeholder={String(Math.floor(Date.now() / 1000) + 86400 * 30)}
                value={mintEnd}
                onChange={(e) => setMintEnd(e.target.value)}
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
            <h2>Mint with Asset ID</h2>
            <div className="form-group">
              <label>Recipient</label>
              <input
                type="text"
                placeholder="SP..."
                value={mintAssetRecipient}
                onChange={(e) => setMintAssetRecipient(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Asset ID</label>
              <input
                type="number"
                placeholder="1"
                value={mintAssetId}
                onChange={(e) => setMintAssetId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Start Time (Unix)</label>
              <input
                type="number"
                placeholder={String(Math.floor(Date.now() / 1000))}
                value={mintAssetStart}
                onChange={(e) => setMintAssetStart(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Time (Unix)</label>
              <input
                type="number"
                placeholder={String(Math.floor(Date.now() / 1000) + 86400 * 30)}
                value={mintAssetEnd}
                onChange={(e) => setMintAssetEnd(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>URI</label>
              <input
                type="text"
                placeholder="https://..."
                value={mintAssetUri}
                onChange={(e) => setMintAssetUri(e.target.value)}
              />
            </div>
            <button className="btn" onClick={mintWithAssetId} disabled={!connected}>
              Mint with Asset ID
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
              <label>Recipient</label>
              <input
                type="text"
                placeholder="SP..."
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
              />
            </div>
            <button className="btn" onClick={transfer} disabled={!connected}>
              Transfer
            </button>
          </div>

          <div className="section">
            <h2>Approvals</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                placeholder="1"
                value={approveTokenId}
                onChange={(e) => setApproveTokenId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Spender</label>
              <input
                type="text"
                placeholder="SP..."
                value={approveSpender}
                onChange={(e) => setApproveSpender(e.target.value)}
              />
            </div>
            <button className="btn" onClick={approve} disabled={!connected}>
              Approve
            </button>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Operator (For All)</label>
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
              Set Approval For All
            </button>
          </div>

          <div className="section">
            <h2>Split Token</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                placeholder="1"
                value={splitTokenId}
                onChange={(e) => setSplitTokenId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Split Time (Unix timestamp)</label>
              <input
                type="number"
                placeholder={String(Math.floor(Date.now() / 1000) + 86400 * 15)}
                value={splitTime}
                onChange={(e) => setSplitTime(e.target.value)}
              />
            </div>
            <button className="btn" onClick={split} disabled={!connected}>
              Split
            </button>
          </div>

          <div className="section">
            <h2>Merge Tokens</h2>
            <div className="form-group">
              <label>Token ID 1</label>
              <input
                type="number"
                placeholder="1"
                value={mergeTokenId1}
                onChange={(e) => setMergeTokenId1(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Token ID 2</label>
              <input
                type="number"
                placeholder="2"
                value={mergeTokenId2}
                onChange={(e) => setMergeTokenId2(e.target.value)}
              />
            </div>
            <button className="btn" onClick={mergeTokens} disabled={!connected}>
              Merge
            </button>
          </div>

          <div className="section">
            <h2>Burn Token</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                placeholder="1"
                value={burnTokenId}
                onChange={(e) => setBurnTokenId(e.target.value)}
              />
            </div>
            <button className="btn btn-danger" onClick={burn} disabled={!connected}>
              Burn
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
              Fetch Info
            </button>
            {tokenInfo?.token?.value && (
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">Owner</span>
                  <span className="info-value">{tokenInfo.token.value.owner?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Asset ID</span>
                  <span className="info-value">{tokenInfo.token.value['asset-id']?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Start Time</span>
                  <span className="info-value">
                    {tokenInfo.token.value['start-time']?.value}
                    <span className="time-display">
                      {' '}({formatTimestamp(parseInt(tokenInfo.token.value['start-time']?.value || '0'))})
                    </span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">End Time</span>
                  <span className="info-value">
                    {tokenInfo.token.value['end-time']?.value}
                    <span className="time-display">
                      {' '}({formatTimestamp(parseInt(tokenInfo.token.value['end-time']?.value || '0'))})
                    </span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status</span>
                  <span className={getTimeStatus(tokenInfo.token).className}>
                    {getTimeStatus(tokenInfo.token).status}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Time Remaining</span>
                  <span className="info-value">
                    {tokenInfo.remaining?.value?.value || '0'} seconds
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">URI</span>
                  <span className="info-value">{tokenInfo.token.value.uri?.value}</span>
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
