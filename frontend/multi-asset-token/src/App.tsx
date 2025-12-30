import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { StacksMainnet } from '@stacks/network'
import { createAppKit } from '@reown/appkit'
import { Web3Wallet } from '@walletconnect/web3wallet'
import {
  uintCV,
  stringAsciiCV,
  principalCV,
  boolCV,
  listCV,
  PostConditionMode,
  AnchorMode,
  makeContractCall,
  callReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV
} from '@stacks/transactions'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })
const network = new StacksMainnet()
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [contractAddress, setContractAddress] = useState('')
  const [contractName, setContractName] = useState('')
  const [lastTokenId, setLastTokenId] = useState('')
  const [activeAssets, setActiveAssets] = useState('')
  const [pendingAssets, setPendingAssets] = useState('')
  const [status, setStatus] = useState('')

  const [mintRecipient, setMintRecipient] = useState('')

  const [transferTokenId, setTransferTokenId] = useState('')
  const [transferSender, setTransferSender] = useState('')
  const [transferRecipient, setTransferRecipient] = useState('')

  const [addAssetTokenId, setAddAssetTokenId] = useState('')
  const [addAssetMetadataUri, setAddAssetMetadataUri] = useState('')
  const [addAssetReplacesId, setAddAssetReplacesId] = useState('')

  const [acceptTokenId, setAcceptTokenId] = useState('')
  const [acceptIndex, setAcceptIndex] = useState('')
  const [acceptAssetId, setAcceptAssetId] = useState('')

  const [rejectTokenId, setRejectTokenId] = useState('')
  const [rejectIndex, setRejectIndex] = useState('')
  const [rejectAssetId, setRejectAssetId] = useState('')

  const [rejectAllTokenId, setRejectAllTokenId] = useState('')
  const [rejectAllMax, setRejectAllMax] = useState('')

  const [priorityTokenId, setPriorityTokenId] = useState('')
  const [priorityValues, setPriorityValues] = useState('')

  const [approveTokenId, setApproveTokenId] = useState('')
  const [approveOperator, setApproveOperator] = useState('')

  const [approveAllOperator, setApproveAllOperator] = useState('')
  const [approveAllValue, setApproveAllValue] = useState(true)

  const [setUriTokenId, setSetUriTokenId] = useState('')
  const [setUriValue, setSetUriValue] = useState('')

  const [burnTokenId, setBurnTokenId] = useState('')

  const [readTokenId, setReadTokenId] = useState('')

  useEffect(() => {
    const fullAddress = import.meta.env.VITE_MULTI_ASSET_TOKEN_CONTRACT_ADDRESS || ''
    const parts = fullAddress.split('.')
    if (parts.length === 2) {
      setContractAddress(parts[0])
      setContractName(parts[1])
    }

    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(data => {
        setUserData(data)
      })
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData())
    }
  }, [])

  const connectWallet = () => {
    const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
    showConnect({
      appDetails: {
        name: 'Multi-Asset Token',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const data = userSession.loadUserData()
        setUserData(data)
      },
      userSession,
      walletConnectProjectId: projectId,
    })
  }

  const connectWalletKit = async () => {
    try {
      const web3Wallet = await Web3Wallet.init({
        core: {
          projectId: WALLET_CONNECT_PROJECT_ID
        },
        metadata: {
          name: 'Multi Asset Token',
          description: 'Multi Asset Token Frontend',
          url: window.location.origin,
          icons: []
        }
      })
      setStatus('WalletKit initialized')
    } catch (error) {
      setStatus('Failed to initialize WalletKit')
    }
  }

  const connectAppKit = async () => {
    try {
      const appKit = createAppKit({
        projectId: WALLET_CONNECT_PROJECT_ID,
        chains: [],
        metadata: {
          name: 'Multi Asset Token',
          description: 'Multi Asset Token Frontend',
          url: window.location.origin,
          icons: []
        }
      })
      appKit.open()
      setStatus('AppKit initialized')
    } catch (error) {
      setStatus('Failed to initialize AppKit')
    }
  }

  const disconnectWallet = () => {
    userSession.signUserOut()
    setUserData(null)
  }

  const handleMint = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting mint transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'mint',
        functionArgs: [principalCV(mintRecipient)],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleTransfer = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting transfer transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'transfer',
        functionArgs: [
          uintCV(transferTokenId),
          standardPrincipalCV(transferSender),
          standardPrincipalCV(transferRecipient)
        ],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleAddAsset = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting add-asset-to-token transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'add-asset-to-token',
        functionArgs: [
          uintCV(addAssetTokenId),
          stringAsciiCV(addAssetMetadataUri),
          uintCV(addAssetReplacesId)
        ],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleAcceptAsset = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting accept-asset transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'accept-asset',
        functionArgs: [
          uintCV(acceptTokenId),
          uintCV(acceptIndex),
          uintCV(acceptAssetId)
        ],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleRejectAsset = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting reject-asset transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'reject-asset',
        functionArgs: [
          uintCV(rejectTokenId),
          uintCV(rejectIndex),
          uintCV(rejectAssetId)
        ],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleRejectAllAssets = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting reject-all-assets transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'reject-all-assets',
        functionArgs: [
          uintCV(rejectAllTokenId),
          uintCV(rejectAllMax)
        ],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleSetPriority = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting set-priority transaction...')

    try {
      const priorities = priorityValues.split(',').map(v => uintCV(v.trim()))
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'set-priority',
        functionArgs: [
          uintCV(priorityTokenId),
          listCV(priorities)
        ],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleApproveForAssets = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting approve-for-assets transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'approve-for-assets',
        functionArgs: [
          principalCV(approveOperator),
          uintCV(approveTokenId)
        ],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleSetApprovalForAllForAssets = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting set-approval-for-all-for-assets transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'set-approval-for-all-for-assets',
        functionArgs: [
          principalCV(approveAllOperator),
          boolCV(approveAllValue)
        ],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleSetTokenUri = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting set-token-uri transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'set-token-uri',
        functionArgs: [
          uintCV(setUriTokenId),
          stringAsciiCV(setUriValue)
        ],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleBurn = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting burn transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'burn',
        functionArgs: [uintCV(burnTokenId)],
        senderKey: userData.profile.stxAddress.mainnet,
        validateWithAbi: false,
        network,
        postConditionMode: PostConditionMode.Allow,
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          setStatus(`Transaction submitted: ${data.txId}`)
        },
        onCancel: () => {
          setStatus('Transaction cancelled')
        },
      }

      await makeContractCall(txOptions)
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleGetLastTokenId = async () => {
    if (!contractAddress || !contractName) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-last-token-id',
        functionArgs: [],
        network,
        senderAddress: contractAddress,
      })
      const jsonResult = cvToJSON(result)
      setLastTokenId(JSON.stringify(jsonResult, null, 2))
    } catch (error) {
      setLastTokenId(`Error: ${error}`)
    }
  }

  const handleGetActiveAssets = async () => {
    if (!contractAddress || !contractName) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-active-assets',
        functionArgs: [uintCV(readTokenId)],
        network,
        senderAddress: contractAddress,
      })
      const jsonResult = cvToJSON(result)
      setActiveAssets(JSON.stringify(jsonResult, null, 2))
    } catch (error) {
      setActiveAssets(`Error: ${error}`)
    }
  }

  const handleGetPendingAssets = async () => {
    if (!contractAddress || !contractName) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-pending-assets',
        functionArgs: [uintCV(readTokenId)],
        network,
        senderAddress: contractAddress,
      })
      const jsonResult = cvToJSON(result)
      setPendingAssets(JSON.stringify(jsonResult, null, 2))
    } catch (error) {
      setPendingAssets(`Error: ${error}`)
    }
  }

  return (
    <div className="container">
      <h1>Multi-Asset Token - Stacks Mainnet</h1>

      <div className="wallet-section">
        {!userData ? (
          <div className="wallet-buttons">
            <button onClick={connectWallet}>Connect (@stacks/connect)</button>
            <button onClick={connectWalletKit}>Connect (WalletKit)</button>
            <button onClick={connectAppKit}>Connect (AppKit)</button>
          </div>
        ) : (
          <div>
            <p>Connected: {userData.profile.stxAddress.mainnet}</p>
            <button onClick={disconnectWallet}>Disconnect</button>
          </div>
        )}
      </div>

      <div className="function-section">
        <h2>Mint NFT</h2>
        <input
          type="text"
          placeholder="Recipient Address"
          value={mintRecipient}
          onChange={(e) => setMintRecipient(e.target.value)}
        />
        <button onClick={handleMint} disabled={!userData}>Mint</button>
      </div>

      <div className="function-section">
        <h2>Transfer NFT</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={transferTokenId}
          onChange={(e) => setTransferTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Sender Address"
          value={transferSender}
          onChange={(e) => setTransferSender(e.target.value)}
        />
        <input
          type="text"
          placeholder="Recipient Address"
          value={transferRecipient}
          onChange={(e) => setTransferRecipient(e.target.value)}
        />
        <button onClick={handleTransfer} disabled={!userData}>Transfer</button>
      </div>

      <div className="function-section">
        <h2>Add Asset to Token</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={addAssetTokenId}
          onChange={(e) => setAddAssetTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Metadata URI"
          value={addAssetMetadataUri}
          onChange={(e) => setAddAssetMetadataUri(e.target.value)}
        />
        <input
          type="text"
          placeholder="Replaces ID (0 if new)"
          value={addAssetReplacesId}
          onChange={(e) => setAddAssetReplacesId(e.target.value)}
        />
        <button onClick={handleAddAsset} disabled={!userData}>Add Asset</button>
      </div>

      <div className="function-section">
        <h2>Accept Asset</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={acceptTokenId}
          onChange={(e) => setAcceptTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Index"
          value={acceptIndex}
          onChange={(e) => setAcceptIndex(e.target.value)}
        />
        <input
          type="text"
          placeholder="Asset ID"
          value={acceptAssetId}
          onChange={(e) => setAcceptAssetId(e.target.value)}
        />
        <button onClick={handleAcceptAsset} disabled={!userData}>Accept Asset</button>
      </div>

      <div className="function-section">
        <h2>Reject Asset</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={rejectTokenId}
          onChange={(e) => setRejectTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Index"
          value={rejectIndex}
          onChange={(e) => setRejectIndex(e.target.value)}
        />
        <input
          type="text"
          placeholder="Asset ID"
          value={rejectAssetId}
          onChange={(e) => setRejectAssetId(e.target.value)}
        />
        <button onClick={handleRejectAsset} disabled={!userData}>Reject Asset</button>
      </div>

      <div className="function-section">
        <h2>Reject All Assets</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={rejectAllTokenId}
          onChange={(e) => setRejectAllTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Max Rejections"
          value={rejectAllMax}
          onChange={(e) => setRejectAllMax(e.target.value)}
        />
        <button onClick={handleRejectAllAssets} disabled={!userData}>Reject All Assets</button>
      </div>

      <div className="function-section">
        <h2>Set Priority</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={priorityTokenId}
          onChange={(e) => setPriorityTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Priorities (comma-separated)"
          value={priorityValues}
          onChange={(e) => setPriorityValues(e.target.value)}
        />
        <button onClick={handleSetPriority} disabled={!userData}>Set Priority</button>
      </div>

      <div className="function-section">
        <h2>Approve for Assets</h2>
        <input
          type="text"
          placeholder="Operator Address"
          value={approveOperator}
          onChange={(e) => setApproveOperator(e.target.value)}
        />
        <input
          type="text"
          placeholder="Token ID"
          value={approveTokenId}
          onChange={(e) => setApproveTokenId(e.target.value)}
        />
        <button onClick={handleApproveForAssets} disabled={!userData}>Approve</button>
      </div>

      <div className="function-section">
        <h2>Set Approval for All for Assets</h2>
        <input
          type="text"
          placeholder="Operator Address"
          value={approveAllOperator}
          onChange={(e) => setApproveAllOperator(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={approveAllValue}
            onChange={(e) => setApproveAllValue(e.target.checked)}
          />
          Approved
        </label>
        <button onClick={handleSetApprovalForAllForAssets} disabled={!userData}>Set Approval For All</button>
      </div>

      <div className="function-section">
        <h2>Set Token URI</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={setUriTokenId}
          onChange={(e) => setSetUriTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="URI"
          value={setUriValue}
          onChange={(e) => setSetUriValue(e.target.value)}
        />
        <button onClick={handleSetTokenUri} disabled={!userData}>Set Token URI</button>
      </div>

      <div className="function-section">
        <h2>Burn NFT</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={burnTokenId}
          onChange={(e) => setBurnTokenId(e.target.value)}
        />
        <button onClick={handleBurn} disabled={!userData}>Burn</button>
      </div>

      <div className="function-section">
        <h2>Read Functions</h2>
        <button onClick={handleGetLastTokenId}>Get Last Token ID</button>
        {lastTokenId && <pre>{lastTokenId}</pre>}
        
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Token ID for queries"
            value={readTokenId}
            onChange={(e) => setReadTokenId(e.target.value)}
          />
          <button onClick={handleGetActiveAssets}>Get Active Assets</button>
          {activeAssets && <pre>{activeAssets}</pre>}
          
          <button onClick={handleGetPendingAssets} style={{ marginTop: '10px' }}>Get Pending Assets</button>
          {pendingAssets && <pre>{pendingAssets}</pre>}
        </div>
      </div>

      {status && (
        <div className="status-section">
          <h3>Status</h3>
          <p>{status}</p>
        </div>
      )}
    </div>
  )
}

export default App
