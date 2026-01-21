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
  return { address: addr, name: 'long-range-wireless-network' }
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
  
  const [deployGatewayName, setDeploygatewayName] = useState<string>('')
  const [deployGatewayLocation, setDeploygatewayLocation] = useState<string>('')
  const [deployGatewayCoverage, setDeploygatewayCoverage] = useState<string>('')
  const [registerIotDeviceGatewayid, setRegisteriotdeviceGatewayid] = useState<string>('')
  const [registerIotDeviceDeviceid, setRegisteriotdeviceDeviceid] = useState<string>('')
  const [registerIotDeviceDevicetype, setRegisteriotdeviceDevicetype] = useState<string>('')
  const [transmitDataGatewayid, setTransmitdataGatewayid] = useState<string>('')
  const [transmitDataDeviceid, setTransmitdataDeviceid] = useState<string>('')
  const [transmitDataData, setTransmitdataData] = useState<string>('')
  const [distributeRewardsGatewayid, setDistributerewardsGatewayid] = useState<string>('')
  const [distributeRewardsReward, setDistributerewardsReward] = useState<string>('')

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

  async function deployGateway() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'deploy-gateway',
        functionArgs: [
          Cl.stringAscii(deployGatewayName),
        Cl.buffer(Buffer.from(deployGatewayLocation, 'hex')),
        Cl.uint(deployGatewayCoverage)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call deploy-gateway', 'error')
    }
  }

  async function registerIotDevice() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'register-iot-device',
        functionArgs: [
          Cl.uint(registerIotDeviceGatewayid),
        Cl.buffer(Buffer.from(registerIotDeviceDeviceid, 'hex')),
        Cl.stringAscii(registerIotDeviceDevicetype)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call register-iot-device', 'error')
    }
  }

  async function transmitData() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'transmit-data',
        functionArgs: [
          Cl.uint(transmitDataGatewayid),
        Cl.uint(transmitDataDeviceid),
        Cl.buffer(Buffer.from(transmitDataData, 'hex'))
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call transmit-data', 'error')
    }
  }

  async function distributeRewards() {
    try {
      const { address, name } = parseContract(CONTRACT_ADDRESS)
      await request({
        network: getNetwork(),
        contractAddress: address,
        contractName: name,
        functionName: 'distribute-rewards',
        functionArgs: [
          Cl.uint(distributeRewardsGatewayid),
        Cl.uint(distributeRewardsReward)
        ],
        onFinish: (data) => {
          showToast('Transaction submitted: ' + data.txId, 'success')
        },
        onCancel: () => {
          showToast('Transaction cancelled', 'error')
        },
      })
    } catch (error) {
      showToast('Failed to call distribute-rewards', 'error')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Long Range Wireless Network</h1>
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
          <h3>deploy-gateway</h3>
          <p style={{ color: '#666' }}>Deploy LoRaWAN gateway</p>
          <input
            type="text"
            placeholder="name (string-ascii)"
            value={deployGatewayName}
            onChange={(e) => setDeploygatewayName(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="location (buff)"
            value={deployGatewayLocation}
            onChange={(e) => setDeploygatewayLocation(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="coverage (uint)"
            value={deployGatewayCoverage}
            onChange={(e) => setDeploygatewayCoverage(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={deployGateway}
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
            Call deploy-gateway
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>register-iot-device</h3>
          <p style={{ color: '#666' }}>Register IoT device</p>
          <input
            type="text"
            placeholder="gateway-id (uint)"
            value={registerIotDeviceGatewayid}
            onChange={(e) => setRegisteriotdeviceGatewayid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="device-id (buff)"
            value={registerIotDeviceDeviceid}
            onChange={(e) => setRegisteriotdeviceDeviceid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="device-type (string-ascii)"
            value={registerIotDeviceDevicetype}
            onChange={(e) => setRegisteriotdeviceDevicetype(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={registerIotDevice}
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
            Call register-iot-device
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>transmit-data</h3>
          <p style={{ color: '#666' }}>Transmit data</p>
          <input
            type="text"
            placeholder="gateway-id (uint)"
            value={transmitDataGatewayid}
            onChange={(e) => setTransmitdataGatewayid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="device-id (uint)"
            value={transmitDataDeviceid}
            onChange={(e) => setTransmitdataDeviceid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="data (buff)"
            value={transmitDataData}
            onChange={(e) => setTransmitdataData(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={transmitData}
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
            Call transmit-data
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>distribute-rewards</h3>
          <p style={{ color: '#666' }}>Distribute rewards</p>
          <input
            type="text"
            placeholder="gateway-id (uint)"
            value={distributeRewardsGatewayid}
            onChange={(e) => setDistributerewardsGatewayid(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="reward (uint)"
            value={distributeRewardsReward}
            onChange={(e) => setDistributerewardsReward(e.target.value)}
            style={{ padding: '8px', margin: '4px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <button
            onClick={distributeRewards}
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
            Call distribute-rewards
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
