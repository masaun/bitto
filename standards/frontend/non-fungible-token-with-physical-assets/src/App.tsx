import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { Cl, fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions'
import { useState, useEffect } from 'react'
import { createAppKit } from '@reown/appkit'
import { Web3Wallet } from '@walletconnect/web3wallet'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''
const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'mainnet'

const STATE_NAMES = [
  'Not Assigned',
  'Waiting for Owner',
  'Engaged with Owner',
  'Waiting for User',
  'Engaged with User',
  'User Assigned'
]

function parseContract(addr: string): { address: string; name: string } {
  if (addr.includes('.')) {
    const [address, name] = addr.split('.')
    return { address, name }
  }
  return { address: addr, name: 'non-fungible-token-with-physical-assets' }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [mintRecipient, setMintRecipient] = useState<string>('')
  const [mintAssetAddr, setMintAssetAddr] = useState<string>('')
  const [mintUri, setMintUri] = useState<string>('')
  
  const [transferTokenId, setTransferTokenId] = useState<string>('')
  const [transferRecipient, setTransferRecipient] = useState<string>('')
  
  const [setUserTokenId, setSetUserTokenId] = useState<string>('')
  const [setUserAddr, setSetUserAddr] = useState<string>('')
  
  const [engagementTokenId, setEngagementTokenId] = useState<string>('')
  const [engagementData, setEngagementData] = useState<string>('')
  const [engagementHash, setEngagementHash] = useState<string>('')
  
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

  async function connectWalletKit() {
    try {
      const web3Wallet = await Web3Wallet.init({
        core: {
          projectId: WALLET_CONNECT_PROJECT_ID
        },
        metadata: {
          name: 'Non-Fungible Token with Physical Assets',
          description: 'Non-Fungible Token with Physical Assets Frontend',
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
          name: 'Non-Fungible Token with Physical Assets',
          description: 'Non-Fungible Token with Physical Assets Frontend',
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

  async function mint() {
    if (!mintRecipient || !mintUri) return showToast('Recipient and URI required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'mint',
        functionArgs: [
          Cl.principal(mintRecipient),
          mintAssetAddr ? Cl.some(Cl.principal(mintAssetAddr)) : Cl.none(),
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

  async function setUser() {
    if (!setUserTokenId || !setUserAddr) return showToast('Token ID and user address required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'set-user',
        functionArgs: [
          Cl.uint(parseInt(setUserTokenId)),
          Cl.principal(setUserAddr)
        ],
        network: NETWORK
      })
      showToast('Set user transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function startOwnerEngagement() {
    if (!engagementTokenId || !engagementData) return showToast('Token ID and data required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'start-owner-engagement',
        functionArgs: [
          Cl.uint(parseInt(engagementTokenId)),
          Cl.bufferFromHex(engagementData.padEnd(66, '0').slice(0, 66))
        ],
        network: NETWORK
      })
      showToast('Start owner engagement transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function ownerEngagement() {
    if (!engagementTokenId || !engagementHash) return showToast('Token ID and hash required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'owner-engagement',
        functionArgs: [
          Cl.uint(parseInt(engagementTokenId)),
          Cl.bufferFromHex(engagementHash.padEnd(64, '0').slice(0, 64))
        ],
        network: NETWORK
      })
      showToast('Owner engagement transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function startUserEngagement() {
    if (!engagementTokenId || !engagementData) return showToast('Token ID and data required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'start-user-engagement',
        functionArgs: [
          Cl.uint(parseInt(engagementTokenId)),
          Cl.bufferFromHex(engagementData.padEnd(66, '0').slice(0, 66))
        ],
        network: NETWORK
      })
      showToast('Start user engagement transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function userEngagement() {
    if (!engagementTokenId || !engagementHash) return showToast('Token ID and hash required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'user-engagement',
        functionArgs: [
          Cl.uint(parseInt(engagementTokenId)),
          Cl.bufferFromHex(engagementHash.padEnd(64, '0').slice(0, 64))
        ],
        network: NETWORK
      })
      showToast('User engagement transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function checkTimeout() {
    if (!engagementTokenId) return showToast('Token ID required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'check-timeout',
        functionArgs: [Cl.uint(parseInt(engagementTokenId))],
        network: NETWORK
      })
      showToast('Check timeout transaction submitted', 'success')
    } catch (error) {
      showToast('Transaction failed', 'error')
    }
  }

  async function unassignUser() {
    if (!engagementTokenId) return showToast('Token ID required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'unassign-user',
        functionArgs: [Cl.uint(parseInt(engagementTokenId))],
        network: NETWORK
      })
      showToast('Unassign user transaction submitted', 'success')
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

  return (
    <div className="app">
      <header className="header">
        <h1>Physical Asset NFT</h1>
        <p>ERC-4519 NFTs Linked to Physical Assets</p>
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
            <h2>Mint NFT</h2>
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
              <label>Asset Address (Optional)</label>
              <input
                type="text"
                placeholder="SP... (physical asset identifier)"
                value={mintAssetAddr}
                onChange={(e) => setMintAssetAddr(e.target.value)}
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
            <h2>Set User</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                placeholder="1"
                value={setUserTokenId}
                onChange={(e) => setSetUserTokenId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>User Address</label>
              <input
                type="text"
                placeholder="SP..."
                value={setUserAddr}
                onChange={(e) => setSetUserAddr(e.target.value)}
              />
            </div>
            <button className="btn" onClick={setUser} disabled={!connected}>
              Set User
            </button>
          </div>

          <div className="section">
            <h2>Engagement</h2>
            <div className="form-group">
              <label>Token ID</label>
              <input
                type="number"
                placeholder="1"
                value={engagementTokenId}
                onChange={(e) => setEngagementTokenId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Data Engagement (33 bytes hex)</label>
              <input
                type="text"
                placeholder="0x..."
                value={engagementData}
                onChange={(e) => setEngagementData(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Hash (32 bytes hex)</label>
              <input
                type="text"
                placeholder="0x..."
                value={engagementHash}
                onChange={(e) => setEngagementHash(e.target.value)}
              />
            </div>
            <button className="btn" onClick={startOwnerEngagement} disabled={!connected}>
              Start Owner Engagement
            </button>
            <button className="btn" onClick={ownerEngagement} disabled={!connected}>
              Owner Engagement
            </button>
            <button className="btn" onClick={startUserEngagement} disabled={!connected}>
              Start User Engagement
            </button>
            <button className="btn" onClick={userEngagement} disabled={!connected}>
              User Engagement
            </button>
            <button className="btn btn-warning" onClick={checkTimeout} disabled={!connected}>
              Check Timeout
            </button>
            <button className="btn btn-warning" onClick={unassignUser} disabled={!connected}>
              Unassign User
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
            {tokenInfo?.value && (
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">Owner</span>
                  <span className="info-value">{tokenInfo.value.owner?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">User</span>
                  <span className="info-value">{tokenInfo.value.user?.value?.value || 'None'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">State</span>
                  <span className={`state-badge state-${tokenInfo.value.state?.value}`}>
                    {STATE_NAMES[parseInt(tokenInfo.value.state?.value)] || 'Unknown'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">URI</span>
                  <span className="info-value">{tokenInfo.value.uri?.value}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Timeout</span>
                  <span className="info-value">{tokenInfo.value.timeout?.value}</span>
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
