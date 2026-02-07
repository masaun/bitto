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
  uintCV,
  bufferCV,
  boolCV
} from '@stacks/transactions'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const CONTRACT_NAME = 'token-curation-platform'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [submit_token_token_address, setSubmitTokenTokenAddress] = useState('')
const [submit_token_description, setSubmitTokenDescription] = useState('')
const [vote_token_token_id, setVoteTokenTokenId] = useState('')
const [vote_token_support, setVoteTokenSupport] = useState('')
const [finalize_curation_token_id, setFinalizeCurationTokenId] = useState('')
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
        name: 'Token Curation Platform',
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

  
  const submit_token = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'submit-token',
        functionArgs: [principalCV(submit_token_token_address), stringUtf8CV(submit_token_description)],
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

  const vote_token = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'vote-token',
        functionArgs: [uintCV(parseInt(vote_token_token_id)), vote_token_support === 'true'],
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

  const finalize_curation = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'finalize-curation',
        functionArgs: [uintCV(parseInt(finalize_curation_token_id))],
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
      <h1>Token Curation Platform</h1>
      
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
        <h2>Contract Functions</h2>
        {% Add UI elements for each function here %}
      </div>
    </div>
  )
}

export default App
