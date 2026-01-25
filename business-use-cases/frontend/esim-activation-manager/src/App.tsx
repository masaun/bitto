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
const CONTRACT_NAME = 'esim-activation-manager'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [register_profile_iccid, setRegisterProfileIccid] = useState('')
const [register_profile_operator, setRegisterProfileOperator] = useState('')
const [activate_esim_iccid, setActivateEsimIccid] = useState('')
const [activate_esim_device_id, setActivateEsimDeviceId] = useState('')
const [deactivate_esim_iccid, setDeactivateEsimIccid] = useState('')
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
        name: 'eSIM Activation Manager',
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

  
  const register_profile = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-profile',
        functionArgs: [stringAsciiCV(register_profile_iccid), stringAsciiCV(register_profile_operator)],
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

  const activate_esim = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'activate-esim',
        functionArgs: [stringAsciiCV(activate_esim_iccid), stringAsciiCV(activate_esim_device_id)],
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

  const deactivate_esim = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'deactivate-esim',
        functionArgs: [stringAsciiCV(deactivate_esim_iccid)],
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
      <h1>eSIM Activation Manager</h1>
      
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
