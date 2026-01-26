import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { StacksMainnet } from '@stacks/network'
import { 
  callReadOnlyFunction, 
  makeContractCall, 
  broadcastTransaction,
  AnchorMode,
  stringAsciiCV,
  principalCV,
  uintCV,
  bufferCV
} from '@stacks/transactions'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const CONTRACT_NAME = 'secure-drop-style-whistleblowing-platform'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [contentHash, setContentHash] = useState('')
  const [encrypted, setEncrypted] = useState(true)
  const [submissionId, setSubmissionId] = useState('')
  const [journalistAddress, setJournalistAddress] = useState('')
  const [pgpKey, setPgpKey] = useState('')
  const [riskLevel, setRiskLevel] = useState('')
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData)
      })
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData())
    }
  }, [])

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'SecureDrop Whistleblowing',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData())
      },
      userSession,
    })
  }

  const disconnectWallet = () => {
    userSession.signUserOut()
    setUserData(null)
  }

  const submitLeak = async () => {
    if (!userData) return
    try {
      const hashBuffer = Buffer.from(contentHash.padEnd(64, '0').slice(0, 64), 'hex')
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'submit-leak',
        functionArgs: [bufferCV(hashBuffer), encrypted ? uintCV(1) : uintCV(0)],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
      }
      const transaction = await makeContractCall(txOptions)
      const broadcastResponse = await broadcastTransaction(transaction, network)
      setMessage(`Submission broadcast: ${broadcastResponse.txid}`)
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  const registerJournalist = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-journalist',
        functionArgs: [principalCV(journalistAddress), stringAsciiCV(pgpKey)],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
      }
      const transaction = await makeContractCall(txOptions)
      const broadcastResponse = await broadcastTransaction(transaction, network)
      setMessage(`Transaction broadcast: ${broadcastResponse.txid}`)
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  const grantAccess = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'grant-access',
        functionArgs: [uintCV(parseInt(submissionId)), principalCV(journalistAddress)],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
      }
      const transaction = await makeContractCall(txOptions)
      const broadcastResponse = await broadcastTransaction(transaction, network)
      setMessage(`Transaction broadcast: ${broadcastResponse.txid}`)
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  const updateSubmissionStatus = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-submission-status',
        functionArgs: [uintCV(parseInt(submissionId)), stringAsciiCV(status)],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
      }
      const transaction = await makeContractCall(txOptions)
      const broadcastResponse = await broadcastTransaction(transaction, network)
      setMessage(`Transaction broadcast: ${broadcastResponse.txid}`)
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  const setRiskLevelFn = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-risk-level',
        functionArgs: [uintCV(parseInt(submissionId)), uintCV(parseInt(riskLevel))],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
      }
      const transaction = await makeContractCall(txOptions)
      const broadcastResponse = await broadcastTransaction(transaction, network)
      setMessage(`Transaction broadcast: ${broadcastResponse.txid}`)
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  return (
    <div className="container">
      <h1>SecureDrop Whistleblowing Platform</h1>
      
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      )}

      {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}

      <div className="section">
        <h2>Submit Anonymous Leak</h2>
        <input
          type="text"
          placeholder="Content Hash (hex)"
          value={contentHash}
          onChange={(e) => setContentHash(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={encrypted}
            onChange={(e) => setEncrypted(e.target.checked)}
          />
          Encrypted
        </label>
        <button onClick={submitLeak} disabled={!userData}>Submit Leak</button>
      </div>

      <div className="section">
        <h2>Journalist Management (Admin Only)</h2>
        <input
          type="text"
          placeholder="Journalist Address"
          value={journalistAddress}
          onChange={(e) => setJournalistAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="PGP Public Key"
          value={pgpKey}
          onChange={(e) => setPgpKey(e.target.value)}
        />
        <button onClick={registerJournalist} disabled={!userData}>Register Journalist</button>
      </div>

      <div className="section">
        <h2>Submission Management</h2>
        <input
          type="number"
          placeholder="Submission ID"
          value={submissionId}
          onChange={(e) => setSubmissionId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Journalist Address"
          value={journalistAddress}
          onChange={(e) => setJournalistAddress(e.target.value)}
        />
        <button onClick={grantAccess} disabled={!userData}>Grant Access</button>
        
        <div style={{marginTop: '20px'}}>
          <input
            type="text"
            placeholder="New Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <button onClick={updateSubmissionStatus} disabled={!userData}>Update Status</button>
          
          <input
            type="number"
            placeholder="Risk Level (0-10)"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
          />
          <button onClick={setRiskLevelFn} disabled={!userData}>Set Risk Level</button>
        </div>
      </div>
    </div>
  )
}

export default App
