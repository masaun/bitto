import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { StacksMainnet } from '@stacks/network'
import { 
  callReadOnlyFunction, 
  makeContractCall, 
  broadcastTransaction,
  AnchorMode,
  stringAsciiCV,
  stringUtf8CV,
  principalCV,
  uintCV
} from '@stacks/transactions'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const CONTRACT_NAME = 'automated-directors-and-board-members-in-company'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [memberAddress, setMemberAddress] = useState('')
  const [position, setPosition] = useState('')
  const [votingPower, setVotingPower] = useState('')
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalId, setProposalId] = useState('')
  const [quorum, setQuorum] = useState('')
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
        name: 'Board of Directors',
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

  const addBoardMember = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'add-board-member',
        functionArgs: [principalCV(memberAddress), stringAsciiCV(position), uintCV(parseInt(votingPower))],
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

  const removeBoardMember = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'remove-board-member',
        functionArgs: [principalCV(memberAddress)],
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

  const updateVotingPower = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-voting-power',
        functionArgs: [principalCV(memberAddress), uintCV(parseInt(votingPower))],
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

  const createBoardProposal = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-board-proposal',
        functionArgs: [stringUtf8CV(proposalTitle)],
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

  const castVote = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'cast-vote',
        functionArgs: [uintCV(parseInt(proposalId))],
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

  const finalizeProposal = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'finalize-proposal',
        functionArgs: [uintCV(parseInt(proposalId))],
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

  const setQuorumThreshold = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-quorum',
        functionArgs: [uintCV(parseInt(quorum))],
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
      <h1>Board of Directors Management</h1>
      
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
        <h2>Board Member Management</h2>
        <input
          type="text"
          placeholder="Member Address"
          value={memberAddress}
          onChange={(e) => setMemberAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <input
          type="number"
          placeholder="Voting Power"
          value={votingPower}
          onChange={(e) => setVotingPower(e.target.value)}
        />
        <button onClick={addBoardMember} disabled={!userData}>Add Board Member</button>
        <button onClick={removeBoardMember} disabled={!userData}>Remove Board Member</button>
        <button onClick={updateVotingPower} disabled={!userData}>Update Voting Power</button>
      </div>

      <div className="section">
        <h2>Board Proposals</h2>
        <input
          type="text"
          placeholder="Proposal Title"
          value={proposalTitle}
          onChange={(e) => setProposalTitle(e.target.value)}
        />
        <button onClick={createBoardProposal} disabled={!userData}>Create Board Proposal</button>
        
        <div style={{marginTop: '20px'}}>
          <input
            type="number"
            placeholder="Proposal ID"
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value)}
          />
          <button onClick={castVote} disabled={!userData}>Cast Vote</button>
          <button onClick={finalizeProposal} disabled={!userData}>Finalize Proposal</button>
        </div>
      </div>

      <div className="section">
        <h2>Quorum Settings</h2>
        <input
          type="number"
          placeholder="Quorum Threshold (0-100)"
          value={quorum}
          onChange={(e) => setQuorum(e.target.value)}
        />
        <button onClick={setQuorumThreshold} disabled={!userData}>Set Quorum</button>
      </div>
    </div>
  )
}

export default App
