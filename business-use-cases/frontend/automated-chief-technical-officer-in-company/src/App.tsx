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
const CONTRACT_NAME = 'automated-chief-technical-officer-in-company'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [ctoAddress, setCtoAddress] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectBudget, setProjectBudget] = useState('')
  const [projectDuration, setProjectDuration] = useState('')
  const [projectId, setProjectId] = useState('')
  const [projectStatus, setProjectStatus] = useState('')
  const [teamId, setTeamId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamLead, setTeamLead] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [resourceAmount, setResourceAmount] = useState('')
  const [auditorAddress, setAuditorAddress] = useState('')
  const [auditScope, setAuditScope] = useState('')
  const [auditId, setAuditId] = useState('')
  const [auditFindings, setAuditFindings] = useState('')
  const [auditSeverity, setAuditSeverity] = useState('')
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
        name: 'CTO Management',
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

  const setCto = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-cto',
        functionArgs: [principalCV(ctoAddress)],
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

  const createTechProject = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-tech-project',
        functionArgs: [stringUtf8CV(projectName), uintCV(parseInt(projectBudget)), uintCV(parseInt(projectDuration))],
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

  const updateProjectStatus = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-project-status',
        functionArgs: [uintCV(parseInt(projectId)), stringAsciiCV(projectStatus)],
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

  const createEngineeringTeam = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-engineering-team',
        functionArgs: [principalCV(teamId), stringAsciiCV(teamName), principalCV(teamLead), uintCV(parseInt(teamSize))],
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

  const allocateInfrastructure = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'allocate-infrastructure',
        functionArgs: [stringAsciiCV(resourceId), stringAsciiCV(resourceType), uintCV(parseInt(resourceAmount))],
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

  const initiateSecurityAudit = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'initiate-security-audit',
        functionArgs: [principalCV(auditorAddress), stringUtf8CV(auditScope)],
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

  const completeSecurityAudit = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'complete-security-audit',
        functionArgs: [uintCV(parseInt(auditId)), uintCV(parseInt(auditFindings)), stringAsciiCV(auditSeverity)],
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
      <h1>CTO Management System</h1>
      
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
        <h2>CTO Appointment</h2>
        <input type="text" placeholder="CTO Address" value={ctoAddress} onChange={(e) => setCtoAddress(e.target.value)} />
        <button onClick={setCto} disabled={!userData}>Set CTO</button>
      </div>

      <div className="section">
        <h2>Tech Projects</h2>
        <input type="text" placeholder="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        <input type="number" placeholder="Budget" value={projectBudget} onChange={(e) => setProjectBudget(e.target.value)} />
        <input type="number" placeholder="Duration (blocks)" value={projectDuration} onChange={(e) => setProjectDuration(e.target.value)} />
        <button onClick={createTechProject} disabled={!userData}>Create Project</button>
        
        <div style={{marginTop: '20px'}}>
          <input type="number" placeholder="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
          <input type="text" placeholder="New Status" value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)} />
          <button onClick={updateProjectStatus} disabled={!userData}>Update Status</button>
        </div>
      </div>

      <div className="section">
        <h2>Engineering Teams</h2>
        <input type="text" placeholder="Team ID (address)" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
        <input type="text" placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
        <input type="text" placeholder="Team Lead Address" value={teamLead} onChange={(e) => setTeamLead(e.target.value)} />
        <input type="number" placeholder="Team Size" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
        <button onClick={createEngineeringTeam} disabled={!userData}>Create Team</button>
      </div>

      <div className="section">
        <h2>Infrastructure Resources</h2>
        <input type="text" placeholder="Resource ID" value={resourceId} onChange={(e) => setResourceId(e.target.value)} />
        <input type="text" placeholder="Resource Type" value={resourceType} onChange={(e) => setResourceType(e.target.value)} />
        <input type="number" placeholder="Amount" value={resourceAmount} onChange={(e) => setResourceAmount(e.target.value)} />
        <button onClick={allocateInfrastructure} disabled={!userData}>Allocate Infrastructure</button>
      </div>

      <div className="section">
        <h2>Security Audits</h2>
        <input type="text" placeholder="Auditor Address" value={auditorAddress} onChange={(e) => setAuditorAddress(e.target.value)} />
        <input type="text" placeholder="Audit Scope" value={auditScope} onChange={(e) => setAuditScope(e.target.value)} />
        <button onClick={initiateSecurityAudit} disabled={!userData}>Initiate Audit</button>
        
        <div style={{marginTop: '20px'}}>
          <input type="number" placeholder="Audit ID" value={auditId} onChange={(e) => setAuditId(e.target.value)} />
          <input type="number" placeholder="Findings Count" value={auditFindings} onChange={(e) => setAuditFindings(e.target.value)} />
          <input type="text" placeholder="Severity" value={auditSeverity} onChange={(e) => setAuditSeverity(e.target.value)} />
          <button onClick={completeSecurityAudit} disabled={!userData}>Complete Audit</button>
        </div>
      </div>
    </div>
  )
}

export default App
