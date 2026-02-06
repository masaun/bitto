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
const CONTRACT_NAME = 'automated-chief-executive-officer-in-company'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [ceoAddress, setCeoAddress] = useState('')
  const [decisionTitle, setDecisionTitle] = useState('')
  const [decisionType, setDecisionType] = useState('')
  const [decisionId, setDecisionId] = useState('')
  const [headAddress, setHeadAddress] = useState('')
  const [department, setDepartment] = useState('')
  const [fiscalYear, setFiscalYear] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
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
        name: 'CEO Management',
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

  const appointCeo = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'appoint-ceo',
        functionArgs: [principalCV(ceoAddress)],
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

  const createStrategicDecision = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-strategic-decision',
        functionArgs: [stringUtf8CV(decisionTitle), stringAsciiCV(decisionType)],
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

  const executeStrategicDecision = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'execute-strategic-decision',
        functionArgs: [uintCV(parseInt(decisionId))],
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

  const appointDepartmentHead = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'appoint-department-head',
        functionArgs: [principalCV(headAddress), stringAsciiCV(department)],
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

  const removeDepartmentHead = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'remove-department-head',
        functionArgs: [principalCV(headAddress)],
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

  const allocateBudget = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'allocate-budget',
        functionArgs: [stringAsciiCV(department), uintCV(parseInt(fiscalYear)), uintCV(parseInt(budgetAmount))],
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
      <h1>CEO Management System</h1>
      
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
        <h2>CEO Appointment</h2>
        <input
          type="text"
          placeholder="CEO Address"
          value={ceoAddress}
          onChange={(e) => setCeoAddress(e.target.value)}
        />
        <button onClick={appointCeo} disabled={!userData}>Appoint CEO</button>
      </div>

      <div className="section">
        <h2>Strategic Decisions</h2>
        <input
          type="text"
          placeholder="Decision Title"
          value={decisionTitle}
          onChange={(e) => setDecisionTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Decision Type"
          value={decisionType}
          onChange={(e) => setDecisionType(e.target.value)}
        />
        <button onClick={createStrategicDecision} disabled={!userData}>Create Decision</button>
        
        <div style={{marginTop: '20px'}}>
          <input
            type="number"
            placeholder="Decision ID"
            value={decisionId}
            onChange={(e) => setDecisionId(e.target.value)}
          />
          <button onClick={executeStrategicDecision} disabled={!userData}>Execute Decision</button>
        </div>
      </div>

      <div className="section">
        <h2>Department Heads</h2>
        <input
          type="text"
          placeholder="Head Address"
          value={headAddress}
          onChange={(e) => setHeadAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <button onClick={appointDepartmentHead} disabled={!userData}>Appoint Department Head</button>
        <button onClick={removeDepartmentHead} disabled={!userData}>Remove Department Head</button>
      </div>

      <div className="section">
        <h2>Budget Allocation</h2>
        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <input
          type="number"
          placeholder="Fiscal Year"
          value={fiscalYear}
          onChange={(e) => setFiscalYear(e.target.value)}
        />
        <input
          type="number"
          placeholder="Budget Amount"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
        />
        <button onClick={allocateBudget} disabled={!userData}>Allocate Budget</button>
      </div>
    </div>
  )
}

export default App
