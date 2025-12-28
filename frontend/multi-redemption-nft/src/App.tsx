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
  return { address: addr, name: 'multi-redemption-nft' }
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
  
  const [redeemId, setRedeemId] = useState<string>('')
  const [redeemTokenId, setRedeemTokenId] = useState<string>('')
  const [redeemMemo, setRedeemMemo] = useState<string>('')
  
  const [cancelId, setCancelId] = useState<string>('')
  const [cancelTokenId, setCancelTokenId] = useState<string>('')
  const [cancelMemo, setCancelMemo] = useState<string>('')
  
  const [queryOperator, setQueryOperator] = useState<string>('')
  const [queryRedemptionId, setQueryRedemptionId] = useState<string>('')
  const [queryTokenId, setQueryTokenId] = useState<string>('')
  const [queryResult, setQueryResult] = useState<any>(null)
  
  const [ownerQueryId, setOwnerQueryId] = useState<string>('')
  const [ownerResult, setOwnerResult] = useState<any>(null)

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

  async function redeem() {
    if (!redeemId || !redeemTokenId || !redeemMemo) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'redeem',
        functionArgs: [
          Cl.buffer(Buffer.from(redeemId, 'hex')),
          Cl.uint(Number(redeemTokenId)),
          Cl.stringUtf8(redeemMemo)
        ]
      })
      showToast('Redemption initiated', 'success')
    } catch (error) {
      showToast('Redemption failed', 'error')
    }
  }

  async function cancel() {
    if (!cancelId || !cancelTokenId || !cancelMemo) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'cancel',
        functionArgs: [
          Cl.buffer(Buffer.from(cancelId, 'hex')),
          Cl.uint(Number(cancelTokenId)),
          Cl.stringUtf8(cancelMemo)
        ]
      })
      showToast('Cancel initiated', 'success')
    } catch (error) {
      showToast('Cancel failed', 'error')
    }
  }

  async function isRedeemed() {
    if (!queryOperator || !queryRedemptionId || !queryTokenId) {
      return showToast('All fields required', 'error')
    }
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'is-redeemed',
        functionArgs: [
          Cl.standardPrincipal(queryOperator),
          Cl.buffer(Buffer.from(queryRedemptionId, 'hex')),
          Cl.uint(Number(queryTokenId))
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

  async function getOwner() {
    if (!ownerQueryId) return showToast('Token ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-owner',
        functionArgs: [Cl.uint(Number(ownerQueryId))],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setOwnerResult(cvToJSON(result))
      showToast('Query successful', 'success')
    } catch (error) {
      showToast('Query failed', 'error')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Multi-Redemption NFT</h1>
      
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
            <h3>Redeem NFT</h3>
            <input
              type="text"
              placeholder="Redemption ID (hex)"
              value={redeemId}
              onChange={(e) => setRedeemId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Token ID"
              value={redeemTokenId}
              onChange={(e) => setRedeemTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Memo"
              value={redeemMemo}
              onChange={(e) => setRedeemMemo(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={redeem} style={{ padding: '10px 20px' }}>
              Redeem
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Cancel Redemption</h3>
            <input
              type="text"
              placeholder="Redemption ID (hex)"
              value={cancelId}
              onChange={(e) => setCancelId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Token ID"
              value={cancelTokenId}
              onChange={(e) => setCancelTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Memo"
              value={cancelMemo}
              onChange={(e) => setCancelMemo(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={cancel} style={{ padding: '10px 20px' }}>
              Cancel
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Check Redemption Status</h3>
            <input
              type="text"
              placeholder="Operator Address"
              value={queryOperator}
              onChange={(e) => setQueryOperator(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Redemption ID (hex)"
              value={queryRedemptionId}
              onChange={(e) => setQueryRedemptionId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Token ID"
              value={queryTokenId}
              onChange={(e) => setQueryTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={isRedeemed} style={{ padding: '10px 20px', marginBottom: '10px' }}>
              Check Status
            </button>
            {queryResult && (
              <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            )}
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Get NFT Owner</h3>
            <input
              type="text"
              placeholder="Token ID"
              value={ownerQueryId}
              onChange={(e) => setOwnerQueryId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={getOwner} style={{ padding: '10px 20px', marginBottom: '10px' }}>
              Get Owner
            </button>
            {ownerResult && (
              <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(ownerResult, null, 2)}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
