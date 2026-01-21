import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { Cl, cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions'
import { useState, useEffect } from 'react'
import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network'
import { createAppKit } from '@reown/appkit'
import { Web3Wallet } from '@walletconnect/web3wallet'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''
const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'mainnet'

function parseContract(addr: string): { address: string; name: string } {
  if (addr.includes('.')) {
    const [address, name] = addr.split('.')
    return { address, name }
  }
  return { address: addr, name: 'decentralized-cellular-network' }
}

function getNetwork() {
  switch (NETWORK) {
    case 'testnet': return new StacksTestnet()
    case 'devnet': return new StacksDevnet()
    default: return new StacksMainnet()
  }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [createNetworkName, setCreatenetworkName] = useState<string>('')
  const [createNetworkCoverage, setCreatenetworkCoverage] = useState<string>('')
  const [createNetworkRewardpool, setCreatenetworkRewardpool] = useState<string>('')
  const [registerNodeNetworkid, setRegisternodeNetworkid] = useState<string>('')
  const [registerNodeLocation, setRegisternodeLocation] = useState<string>('')
  const [startDataSessionNetworkid, setStartdatasessionNetworkid] = useState<string>('')
  const [startDataSessionDataamount, setStartdatasessionDataamount] = useState<string>('')
  const [startDataSessionPayment, setStartdatasessionPayment] = useState<string>('')
  const [distributeNodeRewardsNetworkid, setDistributenoderewardsNetworkid] = useState<string>('')
  const [distributeNodeRewardsNodeid, setDistributenoderewardsNodeid] = useState<string>('')
  const [distributeNodeRewardsReward, setDistributenoderewardsReward] = useState<string>('')
  const [updateNodeStatusNetworkid, setUpdatenodestatusNetworkid] = useState<string>('')
  const [updateNodeStatusNodeid, setUpdatenodestatusNodeid] = useState<string>('')
  const [updateNodeStatusOnline, setUpdatenodestatusOnline] = useState<string>('')
  const [updateNodeStatusDatarelayed, setUpdatenodestatusDatarelayed] = useState<string>('')

  useEffect(() => {
    checkConnection()
  }, [])

  function checkConnection() {
    if (isConnected()) {
      const data = getLocalStorage()
      if (data?.addresses?.stx?.[0]?.address) {
        setConnected(true)
        setUserAddress(data.addresses.stx[0].address)
      }
    }
  }

  async function connectWallet() {
    try {
      const response = await connect({
        walletConnectProjectId: WALLET_CONNECT_PROJECT_ID
      })
      if (response.addresses.stx?.[0]?.address) {
        setConnected(true)
        setUserAddress(response.addresses.stx[0].address)
        showToast('Wallet connected successfully', 'success')
      }
    } catch (error) {
      showToast('Failed to connect wallet', 'error')
    }
  }

  async function disconnectWallet() {
    try {
      await disconnect()
      setConnected(false)
      setUserAddress('')
      showToast('Wallet disconnected', 'success')
    } catch (error) {
      showToast('Failed to disconnect wallet', 'error')
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  async function createNetwork() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'create-network',
        functionArgs: [
          Cl.stringAscii(createNetworkName),
        Cl.uint(createNetworkCoverage),
        Cl.uint(createNetworkRewardpool)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call create-network', 'error')
    }
  }

  async function registerNode() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'register-node',
        functionArgs: [
          Cl.uint(registerNodeNetworkid),
        Cl.buffer(Buffer.from(registerNodeLocation, 'hex'))
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call register-node', 'error')
    }
  }

  async function startDataSession() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'start-data-session',
        functionArgs: [
          Cl.uint(startDataSessionNetworkid),
        Cl.uint(startDataSessionDataamount),
        Cl.uint(startDataSessionPayment)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call start-data-session', 'error')
    }
  }

  async function distributeNodeRewards() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'distribute-node-rewards',
        functionArgs: [
          Cl.uint(distributeNodeRewardsNetworkid),
        Cl.uint(distributeNodeRewardsNodeid),
        Cl.uint(distributeNodeRewardsReward)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call distribute-node-rewards', 'error')
    }
  }

  async function updateNodeStatus() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'update-node-status',
        functionArgs: [
          Cl.uint(updateNodeStatusNetworkid),
        Cl.uint(updateNodeStatusNodeid),
        Cl.bool(updateNodeStatusOnline === 'true'),
        Cl.uint(updateNodeStatusDatarelayed)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call update-node-status', 'error')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Decentralized Cellular Network</h1>
        <p style={{ color: '#666' }}>Contract: {CONTRACT_ADDRESS || 'Not configured'}</p>
        <p style={{ color: '#666' }}>Network: {NETWORK}</p>
      </div>

      {toast && (
        <div style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: toast.type === 'success' ? '#d4edda' : '#f8d7da',
          color: toast.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${toast.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          {toast.message}
        </div>
      ))}

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {!connected ? (
          <button
            onClick={connectWallet}
            style={{
              padding: '10px 30px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <p>Connected: {userAddress}</p>
            <button
              onClick={disconnectWallet}
              style={{
                padding: '10px 30px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Disconnect
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Contract Functions</h2>
        
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>create-network</h3>
          <p style={{ color: '#666' }}>Create cellular network</p>
          <input
            type="text"
            placeholder="name (string-ascii)"
            value={createNetworkName}
            onChange={(e) => setCreatenetworkName(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="coverage (uint)"
            value={createNetworkCoverage}
            onChange={(e) => setCreatenetworkCoverage(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="reward-pool (uint)"
            value={createNetworkRewardpool}
            onChange={(e) => setCreatenetworkRewardpool(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={createNetwork}
            disabled={!connected}
            style={{ 
              padding: '10px 20px', 
              marginTop: '8px',
              backgroundColor: connected ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: connected ? 'pointer' : 'not-allowed' 
            }}
          >
            Call create-network
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>register-node</h3>
          <p style={{ color: '#666' }}>Register network node</p>
          <input
            type="text"
            placeholder="network-id (uint)"
            value={registerNodeNetworkid}
            onChange={(e) => setRegisternodeNetworkid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="location (buff)"
            value={registerNodeLocation}
            onChange={(e) => setRegisternodeLocation(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={registerNode}
            disabled={!connected}
            style={{ 
              padding: '10px 20px', 
              marginTop: '8px',
              backgroundColor: connected ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: connected ? 'pointer' : 'not-allowed' 
            }}
          >
            Call register-node
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>start-data-session</h3>
          <p style={{ color: '#666' }}>Start data session</p>
          <input
            type="text"
            placeholder="network-id (uint)"
            value={startDataSessionNetworkid}
            onChange={(e) => setStartdatasessionNetworkid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="data-amount (uint)"
            value={startDataSessionDataamount}
            onChange={(e) => setStartdatasessionDataamount(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="payment (uint)"
            value={startDataSessionPayment}
            onChange={(e) => setStartdatasessionPayment(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={startDataSession}
            disabled={!connected}
            style={{ 
              padding: '10px 20px', 
              marginTop: '8px',
              backgroundColor: connected ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: connected ? 'pointer' : 'not-allowed' 
            }}
          >
            Call start-data-session
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>distribute-node-rewards</h3>
          <p style={{ color: '#666' }}>Distribute node rewards</p>
          <input
            type="text"
            placeholder="network-id (uint)"
            value={distributeNodeRewardsNetworkid}
            onChange={(e) => setDistributenoderewardsNetworkid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="node-id (uint)"
            value={distributeNodeRewardsNodeid}
            onChange={(e) => setDistributenoderewardsNodeid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="reward (uint)"
            value={distributeNodeRewardsReward}
            onChange={(e) => setDistributenoderewardsReward(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={distributeNodeRewards}
            disabled={!connected}
            style={{ 
              padding: '10px 20px', 
              marginTop: '8px',
              backgroundColor: connected ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: connected ? 'pointer' : 'not-allowed' 
            }}
          >
            Call distribute-node-rewards
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>update-node-status</h3>
          <p style={{ color: '#666' }}>Update node status</p>
          <input
            type="text"
            placeholder="network-id (uint)"
            value={updateNodeStatusNetworkid}
            onChange={(e) => setUpdatenodestatusNetworkid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="node-id (uint)"
            value={updateNodeStatusNodeid}
            onChange={(e) => setUpdatenodestatusNodeid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="online (bool)"
            value={updateNodeStatusOnline}
            onChange={(e) => setUpdatenodestatusOnline(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="data-relayed (uint)"
            value={updateNodeStatusDatarelayed}
            onChange={(e) => setUpdatenodestatusDatarelayed(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={updateNodeStatus}
            disabled={!connected}
            style={{ 
              padding: '10px 20px', 
              marginTop: '8px',
              backgroundColor: connected ? '#007bff' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: connected ? 'pointer' : 'not-allowed' 
            }}
          >
            Call update-node-status
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
