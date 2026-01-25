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
  boolCV
} from '@stacks/transactions'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const CONTRACT_NAME = 'automated-leadership-team-in-company'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [memberAddress, setMemberAddress] = useState('')
  const [role, setRole] = useState('')
  const [proposalDesc, setProposalDesc] = useState('')
  const [proposalId, setProposalId] = useState('')
  const [voteFor, setVoteFor] = useState(true)
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
        name: 'Automated Leadership Team',
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

  const getOwner = async () => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-owner',
        functionArgs: [],
        network,
        senderAddress: CONTRACT_ADDRESS,
      })
      setMessage(`Owner: ${result}`)
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  const getMember = async (address: string) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-member',
        functionArgs: [principalCV(address)],
        network,
        senderAddress: CONTRACT_ADDRESS,
      })
      setMessage(`Member data: ${JSON.stringify(result)}`)
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  const appointMember = async () => {
    if (!userData) return

    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'appoint-member',
        functionArgs: [principalCV(memberAddress), stringAsciiCV(role)],
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

  const removeMember = async (address: string) => {
    if (!userData) return

    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'remove-member',
        functionArgs: [principalCV(address)],
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

  const createProposal = async () => {
    if (!userData) return

    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-proposal',
        functionArgs: [stringAsciiCV(proposalDesc)],
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

  const voteProposal = async () => {
    if (!userData) return

    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'vote-proposal',
        functionArgs: [uintCV(parseInt(proposalId)), boolCV(voteFor)],
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

  const executeProposal = async (id: string) => {
    if (!userData) return

    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'execute-proposal',
        functionArgs: [uintCV(parseInt(id))],
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
      <h1>Automated Leadership Team</h1>
      
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
        <h2>Read Functions</h2>
        <button onClick={getOwner}>Get Owner</button>
        <div>
          <input
            type="text"
            placeholder="Member Address"
            value={memberAddress}
            onChange={(e) => setMemberAddress(e.target.value)}
          />
          <button onClick={() => getMember(memberAddress)}>Get Member</button>
        </div>
      </div>

      <div className="section">
        <h2>Appoint Member</h2>
        <input
          type="text"
          placeholder="Member Address"
          value={memberAddress}
          onChange={(e) => setMemberAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <button onClick={appointMember} disabled={!userData}>Appoint Member</button>
        <button onClick={() => removeMember(memberAddress)} disabled={!userData}>Remove Member</button>
      </div>

      <div className="section">
        <h2>Proposals</h2>
        <textarea
          placeholder="Proposal Description"
          value={proposalDesc}
          onChange={(e) => setProposalDesc(e.target.value)}
        />
        <button onClick={createProposal} disabled={!userData}>Create Proposal</button>
        
        <div style={{marginTop: '20px'}}>
          <input
            type="number"
            placeholder="Proposal ID"
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value)}
          />
          <div>
            <label>
              <input
                type="radio"
                checked={voteFor}
                onChange={() => setVoteFor(true)}
              />
              Vote For
            </label>
            <label style={{marginLeft: '10px'}}>
              <input
                type="radio"
                checked={!voteFor}
                onChange={() => setVoteFor(false)}
              />
              Vote Against
            </label>
          </div>
          <button onClick={voteProposal} disabled={!userData}>Vote on Proposal</button>
          <button onClick={() => executeProposal(proposalId)} disabled={!userData}>Execute Proposal</button>
        </div>
      </div>
    </div>
  )
}

export default App
