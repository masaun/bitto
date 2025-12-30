import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { StacksMainnet } from '@stacks/network'
import {
  uintCV,
  stringAsciiCV,
  principalCV,
  boolCV,
  PostConditionMode,
  AnchorMode,
  makeContractCall,
  callReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV
} from '@stacks/transactions'
import { createAppKit } from '@reown/appkit'
import { Web3Wallet } from '@walletconnect/web3wallet'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [contractAddress, setContractAddress] = useState('')
  const [contractName, setContractName] = useState('')
  const [lastTokenId, setLastTokenId] = useState('')
  const [vestingPeriod, setVestingPeriod] = useState('')
  const [claimedPayout, setClaimedPayout] = useState('')
  const [vestedPayout, setVestedPayout] = useState('')
  const [claimablePayout, setClaimablePayout] = useState('')
  const [status, setStatus] = useState('')

  const [mintRecipient, setMintRecipient] = useState('')
  const [mintPayoutToken, setMintPayoutToken] = useState('')
  const [mintTotalAmount, setMintTotalAmount] = useState('')
  const [mintVestingStart, setMintVestingStart] = useState('')
  const [mintVestingEnd, setMintVestingEnd] = useState('')

  const [transferTokenId, setTransferTokenId] = useState('')
  const [transferSender, setTransferSender] = useState('')
  const [transferRecipient, setTransferRecipient] = useState('')

  const [claimTokenId, setClaimTokenId] = useState('')

  const [approvalTokenId, setApprovalTokenId] = useState('')
  const [approvalOperator, setApprovalOperator] = useState('')
  const [approvalValue, setApprovalValue] = useState(true)

  const [approvalAllOperator, setApprovalAllOperator] = useState('')
  const [approvalAllValue, setApprovalAllValue] = useState(true)

  const [setUriTokenId, setSetUriTokenId] = useState('')
  const [setUriValue, setSetUriValue] = useState('')

  const [burnTokenId, setBurnTokenId] = useState('')

  const [readTokenId, setReadTokenId] = useState('')

  useEffect(() => {
    const fullAddress = import.meta.env.VITE_VESTING_NFT_CONTRACT_ADDRESS || ''
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
        name: 'Vesting NFT',
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
      const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
      const web3Wallet = await Web3Wallet.init({
        core: {
          projectId: projectId
        },
        metadata: {
          name: 'Vesting NFT',
          description: 'Vesting NFT Frontend',
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
      const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
      const appKit = createAppKit({
        projectId: projectId,
        chains: [],
        metadata: {
          name: 'Vesting NFT',
          description: 'Vesting NFT Frontend',
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
        functionArgs: [
          principalCV(mintRecipient),
          principalCV(mintPayoutToken),
          uintCV(mintTotalAmount),
          uintCV(mintVestingStart),
          uintCV(mintVestingEnd)
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

  const handleClaim = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting claim transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'claim',
        functionArgs: [uintCV(claimTokenId)],
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

  const handleSetClaimApproval = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting set-claim-approval transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'set-claim-approval',
        functionArgs: [
          principalCV(approvalOperator),
          boolCV(approvalValue),
          uintCV(approvalTokenId)
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

  const handleSetClaimApprovalForAll = async () => {
    if (!userData || !contractAddress || !contractName) return
    setStatus('Submitting set-claim-approval-for-all transaction...')

    try {
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'set-claim-approval-for-all',
        functionArgs: [
          principalCV(approvalAllOperator),
          boolCV(approvalAllValue)
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

  const handleGetVestingPeriod = async () => {
    if (!contractAddress || !contractName) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-vesting-period',
        functionArgs: [uintCV(readTokenId)],
        network,
        senderAddress: contractAddress,
      })
      const jsonResult = cvToJSON(result)
      setVestingPeriod(JSON.stringify(jsonResult, null, 2))
    } catch (error) {
      setVestingPeriod(`Error: ${error}`)
    }
  }

  const handleGetClaimedPayout = async () => {
    if (!contractAddress || !contractName) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'claimed-payout',
        functionArgs: [uintCV(readTokenId)],
        network,
        senderAddress: contractAddress,
      })
      const jsonResult = cvToJSON(result)
      setClaimedPayout(JSON.stringify(jsonResult, null, 2))
    } catch (error) {
      setClaimedPayout(`Error: ${error}`)
    }
  }

  const handleGetVestedPayout = async () => {
    if (!contractAddress || !contractName) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'vested-payout',
        functionArgs: [uintCV(readTokenId)],
        network,
        senderAddress: contractAddress,
      })
      const jsonResult = cvToJSON(result)
      setVestedPayout(JSON.stringify(jsonResult, null, 2))
    } catch (error) {
      setVestedPayout(`Error: ${error}`)
    }
  }

  const handleGetClaimablePayout = async () => {
    if (!contractAddress || !contractName) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'claimable-payout',
        functionArgs: [uintCV(readTokenId)],
        network,
        senderAddress: contractAddress,
      })
      const jsonResult = cvToJSON(result)
      setClaimablePayout(JSON.stringify(jsonResult, null, 2))
    } catch (error) {
      setClaimablePayout(`Error: ${error}`)
    }
  }

  return (
    <div className="container">
      <h1>Vesting NFT - Stacks Mainnet</h1>

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
        <h2>Mint Vesting NFT</h2>
        <input
          type="text"
          placeholder="Recipient Address"
          value={mintRecipient}
          onChange={(e) => setMintRecipient(e.target.value)}
        />
        <input
          type="text"
          placeholder="Payout Token Contract"
          value={mintPayoutToken}
          onChange={(e) => setMintPayoutToken(e.target.value)}
        />
        <input
          type="text"
          placeholder="Total Amount"
          value={mintTotalAmount}
          onChange={(e) => setMintTotalAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Vesting Start (timestamp)"
          value={mintVestingStart}
          onChange={(e) => setMintVestingStart(e.target.value)}
        />
        <input
          type="text"
          placeholder="Vesting End (timestamp)"
          value={mintVestingEnd}
          onChange={(e) => setMintVestingEnd(e.target.value)}
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
        <h2>Claim Vested Tokens</h2>
        <input
          type="text"
          placeholder="Token ID"
          value={claimTokenId}
          onChange={(e) => setClaimTokenId(e.target.value)}
        />
        <button onClick={handleClaim} disabled={!userData}>Claim</button>
      </div>

      <div className="function-section">
        <h2>Set Claim Approval</h2>
        <input
          type="text"
          placeholder="Operator Address"
          value={approvalOperator}
          onChange={(e) => setApprovalOperator(e.target.value)}
        />
        <input
          type="text"
          placeholder="Token ID"
          value={approvalTokenId}
          onChange={(e) => setApprovalTokenId(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={approvalValue}
            onChange={(e) => setApprovalValue(e.target.checked)}
          />
          Approved
        </label>
        <button onClick={handleSetClaimApproval} disabled={!userData}>Set Approval</button>
      </div>

      <div className="function-section">
        <h2>Set Claim Approval For All</h2>
        <input
          type="text"
          placeholder="Operator Address"
          value={approvalAllOperator}
          onChange={(e) => setApprovalAllOperator(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={approvalAllValue}
            onChange={(e) => setApprovalAllValue(e.target.checked)}
          />
          Approved
        </label>
        <button onClick={handleSetClaimApprovalForAll} disabled={!userData}>Set Approval For All</button>
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
          <button onClick={handleGetVestingPeriod}>Get Vesting Period</button>
          {vestingPeriod && <pre>{vestingPeriod}</pre>}
          
          <button onClick={handleGetClaimedPayout} style={{ marginTop: '10px' }}>Get Claimed Payout</button>
          {claimedPayout && <pre>{claimedPayout}</pre>}
          
          <button onClick={handleGetVestedPayout} style={{ marginTop: '10px' }}>Get Vested Payout</button>
          {vestedPayout && <pre>{vestedPayout}</pre>}
          
          <button onClick={handleGetClaimablePayout} style={{ marginTop: '10px' }}>Get Claimable Payout</button>
          {claimablePayout && <pre>{claimablePayout}</pre>}
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
