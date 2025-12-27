import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { StacksMainnet } from '@stacks/network'
import {
  uintCV,
  stringAsciiCV,
  principalCV,
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

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [contractAddress, setContractAddress] = useState('')
  const [contractName, setContractName] = useState('')
  const [lastTokenId, setLastTokenId] = useState('')
  const [tokenState, setTokenState] = useState('')
  const [stateFingerprint, setStateFingerprint] = useState('')
  const [status, setStatus] = useState('')

  const [mintRecipient, setMintRecipient] = useState('')
  const [mintAssetType, setMintAssetType] = useState('')
  const [mintAssetValue, setMintAssetValue] = useState('')
  const [mintMetadataUri, setMintMetadataUri] = useState('')

  const [transferTokenId, setTransferTokenId] = useState('')
  const [transferSender, setTransferSender] = useState('')
  const [transferRecipient, setTransferRecipient] = useState('')

  const [updateTokenId, setUpdateTokenId] = useState('')
  const [updateAssetType, setUpdateAssetType] = useState('')
  const [updateAssetValue, setUpdateAssetValue] = useState('')
  const [updateMetadataUri, setUpdateMetadataUri] = useState('')

  const [setUriTokenId, setSetUriTokenId] = useState('')
  const [setUriValue, setSetUriValue] = useState('')

  const [burnTokenId, setBurnTokenId] = useState('')

  const [readTokenId, setReadTokenId] = useState('')

  useEffect(() => {
    const fullAddress = import.meta.env.VITE_NFT_WITH_STATE_FINGERPRINT_CONTRACT_ADDRESS || ''
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
        name: 'NFT State Fingerprint',
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
        functionArgs: [
          principalCV(mintRecipient),
          stringAsciiCV(mintAssetType),
          uintCV(mintAssetValue),
          stringAsciiCV(mintMetadataUri)
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

  const handleUpdateState = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting update-state transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'update-state',
        functionArgs: [
          uintCV(updateTokenId),
          stringAsciiCV(updateAssetType),
          uintCV(updateAssetValue),
          stringAsciiCV(updateMetadataUri)
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

  const handleGetTokenState = async () => {
    if (!contractAddress || !contractName) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-token-state',
        functionArgs: [uintCV(readTokenId)],
        network,
        senderAddress: contractAddress,
      })
      const jsonResult = cvToJSON(result)
      setTokenState(JSON.stringify(jsonResult, null, 2))
    } catch (error) {
      setTokenState(`Error: ${error}`)
    }
  }

  const handleGetStateFingerprint = async () => {
    if (!contractAddress || !contractName) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-state-fingerprint',
        functionArgs: [uintCV(readTokenId)],
        network,
        senderAddress: contractAddress,
      })
      const jsonResult = cvToJSON(result)
      setStateFingerprint(JSON.stringify(jsonResult, null, 2))
    } catch (error) {
      setStateFingerprint(`Error: ${error}`)
    }
  }

  return (
    <div className="container">
      <h1>NFT State Fingerprint - Stacks Mainnet</h1>

      <div className="wallet-section">
        {!userData ? (
          <button onClick={connectWallet}>Connect Wallet</button>
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
        <input
          type="text"
          placeholder="Asset Type"
          value={mintAssetType}
          onChange={(e) => setMintAssetType(e.target.value)}
        />
        <input
          type="text"
          placeholder="Asset Value"
          value={mintAssetValue}
          onChange={(e) => setMintAssetValue(e.target.value)}
        />
        <input
          type="text"
          placeholder="Metadata URI"
          value={mintMetadataUri}
          onChange={(e) => setMintMetadataUri(e.target.value)}
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
        <h2>Update State</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={updateTokenId}
          onChange={(e) => setUpdateTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Asset Type"
          value={updateAssetType}
          onChange={(e) => setUpdateAssetType(e.target.value)}
        />
        <input
          type="text"
          placeholder="Asset Value"
          value={updateAssetValue}
          onChange={(e) => setUpdateAssetValue(e.target.value)}
        />
        <input
          type="text"
          placeholder="Metadata URI"
          value={updateMetadataUri}
          onChange={(e) => setUpdateMetadataUri(e.target.value)}
        />
        <button onClick={handleUpdateState} disabled={!userData}>Update State</button>
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
          <button onClick={handleGetTokenState}>Get Token State</button>
          {tokenState && <pre>{tokenState}</pre>}
          
          <button onClick={handleGetStateFingerprint} style={{ marginTop: '10px' }}>Get State Fingerprint</button>
          {stateFingerprint && <pre>{stateFingerprint}</pre>}
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
