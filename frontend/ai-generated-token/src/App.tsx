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
  return { address: addr, name: 'ai-generated-token' }
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
  const [mintPrompt, setMintPrompt] = useState<string>('')
  
  const [transferId, setTransferId] = useState<string>('')
  const [transferSender, setTransferSender] = useState<string>('')
  const [transferRecipient, setTransferRecipient] = useState<string>('')
  
  const [aigcTokenId, setAigcTokenId] = useState<string>('')
  const [aigcPrompt, setAigcPrompt] = useState<string>('')
  const [aigcData, setAigcData] = useState<string>('')
  const [aigcProof, setAigcProof] = useState<string>('')
  
  const [updateTokenId, setUpdateTokenId] = useState<string>('')
  const [updatePrompt, setUpdatePrompt] = useState<string>('')
  const [updateData, setUpdateData] = useState<string>('')
  
  const [verifyPrompt, setVerifyPrompt] = useState<string>('')
  const [verifyData, setVerifyData] = useState<string>('')
  const [verifyProof, setVerifyProof] = useState<string>('')
  
  const [proofType, setProofType] = useState<string>('')
  
  const [queryTokenId, setQueryTokenId] = useState<string>('')
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
    if (!mintRecipient || !mintPrompt) return showToast('Recipient and prompt required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'mint',
        functionArgs: [
          Cl.standardPrincipal(mintRecipient),
          Cl.buffer(Buffer.from(mintPrompt, 'utf8'))
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

  async function addAigcData() {
    if (!aigcTokenId || !aigcPrompt || !aigcData || !aigcProof) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'add-aigc-data',
        functionArgs: [
          Cl.uint(Number(aigcTokenId)),
          Cl.buffer(Buffer.from(aigcPrompt, 'utf8')),
          Cl.buffer(Buffer.from(aigcData, 'utf8')),
          Cl.buffer(Buffer.from(aigcProof, 'hex'))
        ]
      })
      showToast('Add AIGC data initiated', 'success')
    } catch (error) {
      showToast('Add AIGC data failed', 'error')
    }
  }

  async function updateAigcData() {
    if (!updateTokenId || !updatePrompt || !updateData) {
      return showToast('All fields required', 'error')
    }
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'update-aigc-data',
        functionArgs: [
          Cl.uint(Number(updateTokenId)),
          Cl.buffer(Buffer.from(updatePrompt, 'utf8')),
          Cl.buffer(Buffer.from(updateData, 'utf8'))
        ]
      })
      showToast('Update AIGC data initiated', 'success')
    } catch (error) {
      showToast('Update AIGC data failed', 'error')
    }
  }

  async function verify() {
    if (!verifyPrompt || !verifyData || !verifyProof) {
      return showToast('All fields required', 'error')
    }
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'verify',
        functionArgs: [
          Cl.buffer(Buffer.from(verifyPrompt, 'utf8')),
          Cl.buffer(Buffer.from(verifyData, 'utf8')),
          Cl.buffer(Buffer.from(verifyProof, 'hex'))
        ],
        network: getNetwork(),
        senderAddress: userAddress || contractAddr
      })
      setQueryResult(cvToJSON(result))
      showToast('Verification successful', 'success')
    } catch (error) {
      showToast('Verification failed', 'error')
    }
  }

  async function setProofTypeFunc() {
    if (!proofType) return showToast('Proof type required', 'error')
    try {
      await request('stx_callContract', {
        contract: `${contractAddr}.${contractName}`,
        functionName: 'set-proof-type',
        functionArgs: [Cl.stringAscii(proofType)]
      })
      showToast('Set proof type initiated', 'success')
    } catch (error) {
      showToast('Set proof type failed', 'error')
    }
  }

  async function getTokenData() {
    if (!queryTokenId) return showToast('Token ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-token-data',
        functionArgs: [Cl.uint(Number(queryTokenId))],
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
    if (!queryTokenId) return showToast('Token ID required', 'error')
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-owner',
        functionArgs: [Cl.uint(Number(queryTokenId))],
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
      <h1>AI-Generated Token</h1>
      
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
            <h3>Mint Token</h3>
            <input
              type="text"
              placeholder="Recipient Address"
              value={mintRecipient}
              onChange={(e) => setMintRecipient(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <textarea
              placeholder="AI Prompt"
              value={mintPrompt}
              onChange={(e) => setMintPrompt(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px' }}
            />
            <button onClick={mint} style={{ padding: '10px 20px' }}>
              Mint
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Transfer Token</h3>
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
            <h3>Add AIGC Data</h3>
            <input
              type="text"
              placeholder="Token ID"
              value={aigcTokenId}
              onChange={(e) => setAigcTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <textarea
              placeholder="Prompt"
              value={aigcPrompt}
              onChange={(e) => setAigcPrompt(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px' }}
            />
            <textarea
              placeholder="AIGC Data"
              value={aigcData}
              onChange={(e) => setAigcData(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px' }}
            />
            <input
              type="text"
              placeholder="Proof (hex)"
              value={aigcProof}
              onChange={(e) => setAigcProof(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={addAigcData} style={{ padding: '10px 20px' }}>
              Add AIGC Data
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Update AIGC Data</h3>
            <input
              type="text"
              placeholder="Token ID"
              value={updateTokenId}
              onChange={(e) => setUpdateTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <textarea
              placeholder="New Prompt"
              value={updatePrompt}
              onChange={(e) => setUpdatePrompt(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px' }}
            />
            <textarea
              placeholder="New AIGC Data"
              value={updateData}
              onChange={(e) => setUpdateData(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px' }}
            />
            <button onClick={updateAigcData} style={{ padding: '10px 20px' }}>
              Update AIGC Data
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Verify Proof</h3>
            <textarea
              placeholder="Prompt"
              value={verifyPrompt}
              onChange={(e) => setVerifyPrompt(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px' }}
            />
            <textarea
              placeholder="AIGC Data"
              value={verifyData}
              onChange={(e) => setVerifyData(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px' }}
            />
            <input
              type="text"
              placeholder="Proof (hex)"
              value={verifyProof}
              onChange={(e) => setVerifyProof(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={verify} style={{ padding: '10px 20px', marginBottom: '10px' }}>
              Verify
            </button>
            {queryResult && (
              <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            )}
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Set Proof Type</h3>
            <input
              type="text"
              placeholder="Proof Type (zkml or opml)"
              value={proofType}
              onChange={(e) => setProofType(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={setProofTypeFunc} style={{ padding: '10px 20px' }}>
              Set Proof Type
            </button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>Query Token</h3>
            <input
              type="text"
              placeholder="Token ID"
              value={queryTokenId}
              onChange={(e) => setQueryTokenId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={getTokenData} style={{ padding: '10px 20px', marginRight: '10px' }}>
              Get Token Data
            </button>
            <button onClick={getOwner} style={{ padding: '10px 20px' }}>
              Get Owner
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
