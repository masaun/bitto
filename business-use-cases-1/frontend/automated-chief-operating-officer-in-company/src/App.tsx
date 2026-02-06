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
const CONTRACT_NAME = 'automated-chief-operating-officer-in-company'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [cooAddress, setCooAddress] = useState('')
  const [processName, setProcessName] = useState('')
  const [processDept, setProcessDept] = useState('')
  const [processCost, setProcessCost] = useState('')
  const [processId, setProcessId] = useState('')
  const [processEfficiency, setProcessEfficiency] = useState('')
  const [processStatus, setProcessStatus] = useState('')
  const [vendorAddress, setVendorAddress] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [vendorCategory, setVendorCategory] = useState('')
  const [vendorRating, setVendorRating] = useState('')
  const [itemId, setItemId] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [itemReorder, setItemReorder] = useState('')
  const [itemCost, setItemCost] = useState('')
  const [kpiDept, setKpiDept] = useState('')
  const [kpiMetric, setKpiMetric] = useState('')
  const [kpiPeriod, setKpiPeriod] = useState('')
  const [kpiValue, setKpiValue] = useState('')
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
        name: 'COO Management',
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

  const setCoo = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-coo',
        functionArgs: [principalCV(cooAddress)],
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

  const createProcess = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-process',
        functionArgs: [stringUtf8CV(processName), stringAsciiCV(processDept), uintCV(parseInt(processCost))],
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

  const updateProcessEfficiency = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-process-efficiency',
        functionArgs: [uintCV(parseInt(processId)), uintCV(parseInt(processEfficiency))],
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

  const updateProcessStatus = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-process-status',
        functionArgs: [uintCV(parseInt(processId)), stringAsciiCV(processStatus)],
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

  const onboardVendor = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'onboard-vendor',
        functionArgs: [principalCV(vendorAddress), stringAsciiCV(vendorName), stringAsciiCV(vendorCategory)],
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

  const updateVendorRating = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-vendor-rating',
        functionArgs: [principalCV(vendorAddress), uintCV(parseInt(vendorRating))],
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

  const manageInventory = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'manage-inventory',
        functionArgs: [stringAsciiCV(itemId), uintCV(parseInt(itemQuantity)), uintCV(parseInt(itemReorder)), uintCV(parseInt(itemCost))],
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

  const setKpi = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-kpi',
        functionArgs: [stringAsciiCV(kpiDept), stringAsciiCV(kpiMetric), uintCV(parseInt(kpiPeriod)), uintCV(parseInt(kpiValue))],
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
      <h1>COO Management System</h1>
      
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
        <h2>COO Appointment</h2>
        <input type="text" placeholder="COO Address" value={cooAddress} onChange={(e) => setCooAddress(e.target.value)} />
        <button onClick={setCoo} disabled={!userData}>Set COO</button>
      </div>

      <div className="section">
        <h2>Operational Processes</h2>
        <input type="text" placeholder="Process Name" value={processName} onChange={(e) => setProcessName(e.target.value)} />
        <input type="text" placeholder="Department" value={processDept} onChange={(e) => setProcessDept(e.target.value)} />
        <input type="number" placeholder="Cost" value={processCost} onChange={(e) => setProcessCost(e.target.value)} />
        <button onClick={createProcess} disabled={!userData}>Create Process</button>
        
        <div style={{marginTop: '20px'}}>
          <input type="number" placeholder="Process ID" value={processId} onChange={(e) => setProcessId(e.target.value)} />
          <input type="number" placeholder="Efficiency (0-100)" value={processEfficiency} onChange={(e) => setProcessEfficiency(e.target.value)} />
          <button onClick={updateProcessEfficiency} disabled={!userData}>Update Efficiency</button>
          <input type="text" placeholder="Status" value={processStatus} onChange={(e) => setProcessStatus(e.target.value)} />
          <button onClick={updateProcessStatus} disabled={!userData}>Update Status</button>
        </div>
      </div>

      <div className="section">
        <h2>Supply Chain Vendors</h2>
        <input type="text" placeholder="Vendor Address" value={vendorAddress} onChange={(e) => setVendorAddress(e.target.value)} />
        <input type="text" placeholder="Vendor Name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
        <input type="text" placeholder="Category" value={vendorCategory} onChange={(e) => setVendorCategory(e.target.value)} />
        <button onClick={onboardVendor} disabled={!userData}>Onboard Vendor</button>
        
        <div style={{marginTop: '20px'}}>
          <input type="number" placeholder="Rating (0-100)" value={vendorRating} onChange={(e) => setVendorRating(e.target.value)} />
          <button onClick={updateVendorRating} disabled={!userData}>Update Rating</button>
        </div>
      </div>

      <div className="section">
        <h2>Inventory Management</h2>
        <input type="text" placeholder="Item ID" value={itemId} onChange={(e) => setItemId(e.target.value)} />
        <input type="number" placeholder="Quantity" value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value)} />
        <input type="number" placeholder="Reorder Level" value={itemReorder} onChange={(e) => setItemReorder(e.target.value)} />
        <input type="number" placeholder="Unit Cost" value={itemCost} onChange={(e) => setItemCost(e.target.value)} />
        <button onClick={manageInventory} disabled={!userData}>Manage Inventory</button>
      </div>

      <div className="section">
        <h2>KPI Metrics</h2>
        <input type="text" placeholder="Department" value={kpiDept} onChange={(e) => setKpiDept(e.target.value)} />
        <input type="text" placeholder="Metric" value={kpiMetric} onChange={(e) => setKpiMetric(e.target.value)} />
        <input type="number" placeholder="Period" value={kpiPeriod} onChange={(e) => setKpiPeriod(e.target.value)} />
        <input type="number" placeholder="Value" value={kpiValue} onChange={(e) => setKpiValue(e.target.value)} />
        <button onClick={setKpi} disabled={!userData}>Set KPI</button>
      </div>
    </div>
  )
}

export default App
