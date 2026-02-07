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
const CONTRACT_NAME = 'automated-chief-marketing-officer-in-company'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [cmoAddress, setCmoAddress] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [campaignChannel, setCampaignChannel] = useState('')
  const [campaignBudget, setCampaignBudget] = useState('')
  const [campaignDuration, setCampaignDuration] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [campaignRoi, setCampaignRoi] = useState('')
  const [assetId, setAssetId] = useState('')
  const [assetType, setAssetType] = useState('')
  const [assetValue, setAssetValue] = useState('')
  const [segmentId, setSegmentId] = useState('')
  const [segmentSize, setSegmentSize] = useState('')
  const [segmentLtv, setSegmentLtv] = useState('')
  const [segmentAcqCost, setSegmentAcqCost] = useState('')
  const [metricType, setMetricType] = useState('')
  const [metricValue, setMetricValue] = useState('')
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
        name: 'CMO Management',
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

  const setCmo = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-cmo',
        functionArgs: [principalCV(cmoAddress)],
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

  const launchCampaign = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'launch-campaign',
        functionArgs: [stringUtf8CV(campaignName), stringAsciiCV(campaignChannel), uintCV(parseInt(campaignBudget)), uintCV(parseInt(campaignDuration))],
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

  const updateCampaignRoi = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-campaign-roi',
        functionArgs: [uintCV(parseInt(campaignId)), uintCV(parseInt(campaignRoi))],
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

  const pauseCampaign = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'pause-campaign',
        functionArgs: [uintCV(parseInt(campaignId))],
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

  const registerBrandAsset = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-brand-asset',
        functionArgs: [stringAsciiCV(assetId), stringAsciiCV(assetType), uintCV(parseInt(assetValue))],
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

  const defineCustomerSegment = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'define-customer-segment',
        functionArgs: [stringAsciiCV(segmentId), uintCV(parseInt(segmentSize)), uintCV(parseInt(segmentLtv)), uintCV(parseInt(segmentAcqCost))],
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

  const recordMetric = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'record-metric',
        functionArgs: [uintCV(parseInt(campaignId)), stringAsciiCV(metricType), uintCV(parseInt(metricValue))],
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
      <h1>CMO Management System</h1>
      
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
        <h2>CMO Appointment</h2>
        <input type="text" placeholder="CMO Address" value={cmoAddress} onChange={(e) => setCmoAddress(e.target.value)} />
        <button onClick={setCmo} disabled={!userData}>Set CMO</button>
      </div>

      <div className="section">
        <h2>Marketing Campaigns</h2>
        <input type="text" placeholder="Campaign Name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
        <input type="text" placeholder="Channel" value={campaignChannel} onChange={(e) => setCampaignChannel(e.target.value)} />
        <input type="number" placeholder="Budget" value={campaignBudget} onChange={(e) => setCampaignBudget(e.target.value)} />
        <input type="number" placeholder="Duration (blocks)" value={campaignDuration} onChange={(e) => setCampaignDuration(e.target.value)} />
        <button onClick={launchCampaign} disabled={!userData}>Launch Campaign</button>
        
        <div style={{marginTop: '20px'}}>
          <input type="number" placeholder="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
          <input type="number" placeholder="ROI" value={campaignRoi} onChange={(e) => setCampaignRoi(e.target.value)} />
          <button onClick={updateCampaignRoi} disabled={!userData}>Update ROI</button>
          <button onClick={pauseCampaign} disabled={!userData}>Pause Campaign</button>
        </div>
      </div>

      <div className="section">
        <h2>Brand Assets</h2>
        <input type="text" placeholder="Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
        <input type="text" placeholder="Asset Type" value={assetType} onChange={(e) => setAssetType(e.target.value)} />
        <input type="number" placeholder="Value" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} />
        <button onClick={registerBrandAsset} disabled={!userData}>Register Brand Asset</button>
      </div>

      <div className="section">
        <h2>Customer Segments</h2>
        <input type="text" placeholder="Segment ID" value={segmentId} onChange={(e) => setSegmentId(e.target.value)} />
        <input type="number" placeholder="Size" value={segmentSize} onChange={(e) => setSegmentSize(e.target.value)} />
        <input type="number" placeholder="LTV" value={segmentLtv} onChange={(e) => setSegmentLtv(e.target.value)} />
        <input type="number" placeholder="Acquisition Cost" value={segmentAcqCost} onChange={(e) => setSegmentAcqCost(e.target.value)} />
        <button onClick={defineCustomerSegment} disabled={!userData}>Define Segment</button>
      </div>

      <div className="section">
        <h2>Campaign Metrics</h2>
        <input type="number" placeholder="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
        <input type="text" placeholder="Metric Type" value={metricType} onChange={(e) => setMetricType(e.target.value)} />
        <input type="number" placeholder="Value" value={metricValue} onChange={(e) => setMetricValue(e.target.value)} />
        <button onClick={recordMetric} disabled={!userData}>Record Metric</button>
      </div>
    </div>
  )
}

export default App
