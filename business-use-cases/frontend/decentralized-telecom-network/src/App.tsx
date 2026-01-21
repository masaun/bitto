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
  return { address: addr, name: 'decentralized-telecom-network' }
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
  
  const [createProviderName, setCreateproviderName] = useState<string>('')
  const [createProviderServicetype, setCreateproviderServicetype] = useState<string>('')
  const [addInfrastructureNodeProviderid, setAddinfrastructurenodeProviderid] = useState<string>('')
  const [addInfrastructureNodeNodetype, setAddinfrastructurenodeNodetype] = useState<string>('')
  const [addInfrastructureNodeLocation, setAddinfrastructurenodeLocation] = useState<string>('')
  const [addInfrastructureNodeCapacity, setAddinfrastructurenodeCapacity] = useState<string>('')
  const [subscribeProviderid, setSubscribeProviderid] = useState<string>('')
  const [subscribePayment, setSubscribePayment] = useState<string>('')
  const [rewardNodeProviderid, setRewardnodeProviderid] = useState<string>('')
  const [rewardNodeNodeid, setRewardnodeNodeid] = useState<string>('')
  const [rewardNodeReward, setRewardnodeReward] = useState<string>('')

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

  async function createProvider() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'create-provider',
        functionArgs: [
          Cl.stringAscii(createProviderName),
        Cl.stringAscii(createProviderServicetype)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call create-provider', 'error')
    }
  }

  async function addInfrastructureNode() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'add-infrastructure-node',
        functionArgs: [
          Cl.uint(addInfrastructureNodeProviderid),
        Cl.stringAscii(addInfrastructureNodeNodetype),
        Cl.buffer(Buffer.from(addInfrastructureNodeLocation, 'hex')),
        Cl.uint(addInfrastructureNodeCapacity)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call add-infrastructure-node', 'error')
    }
  }

  async function subscribe() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'subscribe',
        functionArgs: [
          Cl.uint(subscribeProviderid),
        Cl.uint(subscribePayment)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call subscribe', 'error')
    }
  }

  async function rewardNode() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'reward-node',
        functionArgs: [
          Cl.uint(rewardNodeProviderid),
        Cl.uint(rewardNodeNodeid),
        Cl.uint(rewardNodeReward)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call reward-node', 'error')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Decentralized Telecom Network</h1>
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
          <h3>create-provider</h3>
          <p style={{ color: '#666' }}>Create telecom provider</p>
          <input
            type="text"
            placeholder="name (string-ascii)"
            value={createProviderName}
            onChange={(e) => setCreateproviderName(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="service-type (string-ascii)"
            value={createProviderServicetype}
            onChange={(e) => setCreateproviderServicetype(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={createProvider}
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
            Call create-provider
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>add-infrastructure-node</h3>
          <p style={{ color: '#666' }}>Add infrastructure node</p>
          <input
            type="text"
            placeholder="provider-id (uint)"
            value={addInfrastructureNodeProviderid}
            onChange={(e) => setAddinfrastructurenodeProviderid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="node-type (string-ascii)"
            value={addInfrastructureNodeNodetype}
            onChange={(e) => setAddinfrastructurenodeNodetype(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="location (buff)"
            value={addInfrastructureNodeLocation}
            onChange={(e) => setAddinfrastructurenodeLocation(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="capacity (uint)"
            value={addInfrastructureNodeCapacity}
            onChange={(e) => setAddinfrastructurenodeCapacity(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={addInfrastructureNode}
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
            Call add-infrastructure-node
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>subscribe</h3>
          <p style={{ color: '#666' }}>Subscribe to provider</p>
          <input
            type="text"
            placeholder="provider-id (uint)"
            value={subscribeProviderid}
            onChange={(e) => setSubscribeProviderid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="payment (uint)"
            value={subscribePayment}
            onChange={(e) => setSubscribePayment(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={subscribe}
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
            Call subscribe
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>reward-node</h3>
          <p style={{ color: '#666' }}>Reward node</p>
          <input
            type="text"
            placeholder="provider-id (uint)"
            value={rewardNodeProviderid}
            onChange={(e) => setRewardnodeProviderid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="node-id (uint)"
            value={rewardNodeNodeid}
            onChange={(e) => setRewardnodeNodeid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="reward (uint)"
            value={rewardNodeReward}
            onChange={(e) => setRewardnodeReward(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={rewardNode}
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
            Call reward-node
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
