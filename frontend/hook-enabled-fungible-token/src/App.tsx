import { connect, disconnect, request, ContractCallOptions } from '@stacks/connect'
import { 
  Cl, 
  cvToJSON, 
  ClarityValue, 
  PostConditionMode,
  callReadOnlyFunction,
} from '@stacks/transactions'
import { useState, useEffect, useCallback } from 'react'

// Contract configuration - loaded from environment variables
const HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS?.split('.')[0] || ''
const CONTRACT_NAME = import.meta.env.VITE_HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS?.split('.')[1] || 'hook-enabled-fungible-token'

// WalletConnect/Reown project ID
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''

// Types
interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  granularity: number
  'total-supply': number
  owner: string
}

interface ContractStatus {
  paused: boolean
  'assets-restricted': boolean
  'total-supply': number
  'total-minted': number
  'total-burned': number
  granularity: number
  'operation-nonce': number
  'event-nonce': number
  'current-block-time': number
}

interface TransferOperation {
  operator: string
  from: string
  to: string
  amount: number
  'user-data': string
  'operator-data': string
  timestamp: number
  'hooks-called': boolean
  'signature-verified': boolean
}

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [contractStatus, setContractStatus] = useState<ContractStatus | null>(null)
  const [userBalance, setUserBalance] = useState<string>('0')
  const [operatorStatus, setOperatorStatus] = useState<boolean>(false)
  
  // Form states
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: '',
    userData: ''
  })
  const [operatorSendForm, setOperatorSendForm] = useState({
    from: '',
    to: '',
    amount: '',
    userData: '',
    operatorData: ''
  })
  const [burnForm, setBurnForm] = useState({
    amount: '',
    userData: ''
  })
  const [operatorBurnForm, setOperatorBurnForm] = useState({
    from: '',
    amount: '',
    userData: '',
    operatorData: ''
  })
  const [mintForm, setMintForm] = useState({
    to: '',
    amount: '',
    operatorData: ''
  })
  const [operatorAddress, setOperatorAddress] = useState<string>('')
  const [checkOperatorForm, setCheckOperatorForm] = useState({
    operator: '',
    holder: ''
  })
  const [hookForm, setHookForm] = useState({
    implementer: ''
  })
  const [balanceCheckAddress, setBalanceCheckAddress] = useState<string>('')
  const [checkedBalance, setCheckedBalance] = useState<string | null>(null)
  const [transferOpId, setTransferOpId] = useState<string>('')
  const [transferOperation, setTransferOperation] = useState<TransferOperation | null>(null)
  const [assetRestriction, setAssetRestriction] = useState<boolean>(false)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'info' | 'transfer' | 'operators' | 'hooks' | 'admin'>('info')

  // Connect wallet using WalletConnect via @stacks/connect
  async function connectWallet() {
    try {
      // Use connect with WalletConnect project ID as per @stacks/connect docs
      const response = await connect({
        walletConnectProjectId: WALLET_CONNECT_PROJECT_ID
      })
      
      if (response && response.addresses && response.addresses.length > 0) {
        // Find mainnet address (starts with SP)
        const mainnetAddress = response.addresses.find(
          (addr: { address: string }) => addr.address.startsWith('SP')
        )?.address || response.addresses[0].address
        
        setIsConnected(true)
        setUserAddress(mainnetAddress)
        
        // Load initial data
        await loadTokenInfo()
        await loadContractStatus()
        await loadUserBalance(mainnetAddress)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  // Connect with wallet selection (forceWalletSelect)
  async function connectWithWalletSelect() {
    try {
      const response = await request(
        { 
          forceWalletSelect: true,
          walletConnectProjectId: WALLET_CONNECT_PROJECT_ID 
        }, 
        'getAddresses'
      )
      
      if (response && response.addresses && response.addresses.length > 0) {
        const mainnetAddress = response.addresses.find(
          (addr: { address: string }) => addr.address.startsWith('SP')
        )?.address || response.addresses[0].address
        
        setIsConnected(true)
        setUserAddress(mainnetAddress)
        
        await loadTokenInfo()
        await loadContractStatus()
        await loadUserBalance(mainnetAddress)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  // Disconnect wallet
  async function disconnectWallet() {
    disconnect()
    setIsConnected(false)
    setUserAddress('')
    setTokenInfo(null)
    setContractStatus(null)
    setUserBalance('0')
  }

  // Load token info
  const loadTokenInfo = useCallback(async () => {
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-token-info',
        functionArgs: [],
        network: 'mainnet',
        senderAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      setTokenInfo(json.value)
    } catch (error) {
      console.error('Error loading token info:', error)
    }
  }, [])

  // Load contract status
  const loadContractStatus = useCallback(async () => {
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-contract-status',
        functionArgs: [],
        network: 'mainnet',
        senderAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      setContractStatus(json.value)
    } catch (error) {
      console.error('Error loading contract status:', error)
    }
  }, [])

  // Load user balance
  async function loadUserBalance(address: string) {
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-balance',
        functionArgs: [Cl.principal(address)],
        network: 'mainnet',
        senderAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      const balance = json.value?.value || '0'
      setUserBalance(balance)
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  // Check balance for any address
  async function checkBalance() {
    if (!balanceCheckAddress) return
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-balance',
        functionArgs: [Cl.principal(balanceCheckAddress)],
        network: 'mainnet',
        senderAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      setCheckedBalance(json.value?.value || '0')
    } catch (error) {
      console.error('Error checking balance:', error)
    }
  }

  // Check if operator
  async function checkIsOperator() {
    if (!checkOperatorForm.operator || !checkOperatorForm.holder) return
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'is-operator-for',
        functionArgs: [
          Cl.principal(checkOperatorForm.operator),
          Cl.principal(checkOperatorForm.holder)
        ],
        network: 'mainnet',
        senderAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      setOperatorStatus(json.value || false)
      alert(`Operator status: ${json.value ? 'Yes' : 'No'}`)
    } catch (error) {
      console.error('Error checking operator:', error)
    }
  }

  // Get transfer operation
  async function getTransferOperation() {
    if (!transferOpId) return
    try {
      const result: ClarityValue = await callReadOnlyFunction({
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-transfer-operation',
        functionArgs: [Cl.uint(parseInt(transferOpId))],
        network: 'mainnet',
        senderAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      setTransferOperation(json.value)
    } catch (error) {
      console.error('Error getting transfer operation:', error)
    }
  }

  // Helper to convert string to buffer
  function stringToBuffer(str: string): Uint8Array {
    const encoder = new TextEncoder()
    const encoded = encoder.encode(str)
    // Pad or truncate to 256 bytes
    const buffer = new Uint8Array(256)
    buffer.set(encoded.slice(0, 256))
    return buffer
  }

  // Send tokens
  async function handleSendTokens() {
    if (!sendForm.to || !sendForm.amount) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'send-tokens',
        functionArgs: [
          Cl.principal(sendForm.to),
          Cl.uint(BigInt(sendForm.amount)),
          Cl.bufferFromHex(Buffer.from(stringToBuffer(sendForm.userData)).toString('hex'))
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Transaction submitted: ${data.txId}`)
          setSendForm({ to: '', amount: '', userData: '' })
          loadUserBalance(userAddress)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error sending tokens:', error)
      alert('Error sending tokens')
    } finally {
      setIsLoading(false)
    }
  }

  // Operator send
  async function handleOperatorSend() {
    if (!operatorSendForm.from || !operatorSendForm.to || !operatorSendForm.amount) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'operator-send',
        functionArgs: [
          Cl.principal(operatorSendForm.from),
          Cl.principal(operatorSendForm.to),
          Cl.uint(BigInt(operatorSendForm.amount)),
          Cl.bufferFromHex(Buffer.from(stringToBuffer(operatorSendForm.userData)).toString('hex')),
          Cl.bufferFromHex(Buffer.from(stringToBuffer(operatorSendForm.operatorData)).toString('hex'))
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Transaction submitted: ${data.txId}`)
          setOperatorSendForm({ from: '', to: '', amount: '', userData: '', operatorData: '' })
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error in operator send:', error)
      alert('Error in operator send')
    } finally {
      setIsLoading(false)
    }
  }

  // Burn tokens
  async function handleBurn() {
    if (!burnForm.amount) {
      alert('Please enter amount to burn')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'burn',
        functionArgs: [
          Cl.uint(BigInt(burnForm.amount)),
          Cl.bufferFromHex(Buffer.from(stringToBuffer(burnForm.userData)).toString('hex'))
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Transaction submitted: ${data.txId}`)
          setBurnForm({ amount: '', userData: '' })
          loadUserBalance(userAddress)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error burning tokens:', error)
      alert('Error burning tokens')
    } finally {
      setIsLoading(false)
    }
  }

  // Operator burn
  async function handleOperatorBurn() {
    if (!operatorBurnForm.from || !operatorBurnForm.amount) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'operator-burn',
        functionArgs: [
          Cl.principal(operatorBurnForm.from),
          Cl.uint(BigInt(operatorBurnForm.amount)),
          Cl.bufferFromHex(Buffer.from(stringToBuffer(operatorBurnForm.userData)).toString('hex')),
          Cl.bufferFromHex(Buffer.from(stringToBuffer(operatorBurnForm.operatorData)).toString('hex'))
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Transaction submitted: ${data.txId}`)
          setOperatorBurnForm({ from: '', amount: '', userData: '', operatorData: '' })
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error in operator burn:', error)
      alert('Error in operator burn')
    } finally {
      setIsLoading(false)
    }
  }

  // Mint tokens (owner only)
  async function handleMint() {
    if (!mintForm.to || !mintForm.amount) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'mint',
        functionArgs: [
          Cl.principal(mintForm.to),
          Cl.uint(BigInt(mintForm.amount)),
          Cl.bufferFromHex(Buffer.from(stringToBuffer(mintForm.operatorData)).toString('hex'))
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Transaction submitted: ${data.txId}`)
          setMintForm({ to: '', amount: '', operatorData: '' })
          loadContractStatus()
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error minting tokens:', error)
      alert('Error minting tokens')
    } finally {
      setIsLoading(false)
    }
  }

  // Authorize operator
  async function handleAuthorizeOperator() {
    if (!operatorAddress) {
      alert('Please enter operator address')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'authorize-operator',
        functionArgs: [Cl.principal(operatorAddress)],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Operator authorized: ${data.txId}`)
          setOperatorAddress('')
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error authorizing operator:', error)
      alert('Error authorizing operator')
    } finally {
      setIsLoading(false)
    }
  }

  // Revoke operator
  async function handleRevokeOperator() {
    if (!operatorAddress) {
      alert('Please enter operator address')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'revoke-operator',
        functionArgs: [Cl.principal(operatorAddress)],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Operator revoked: ${data.txId}`)
          setOperatorAddress('')
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error revoking operator:', error)
      alert('Error revoking operator')
    } finally {
      setIsLoading(false)
    }
  }

  // Register tokens-to-send hook
  async function handleRegisterTokensToSendHook() {
    if (!hookForm.implementer) {
      alert('Please enter hook implementer address')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-tokens-to-send-hook',
        functionArgs: [Cl.principal(hookForm.implementer)],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Hook registered: ${data.txId}`)
          setHookForm({ implementer: '' })
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error registering hook:', error)
      alert('Error registering hook')
    } finally {
      setIsLoading(false)
    }
  }

  // Register tokens-received hook
  async function handleRegisterTokensReceivedHook() {
    if (!hookForm.implementer) {
      alert('Please enter hook implementer address')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-tokens-received-hook',
        functionArgs: [Cl.principal(hookForm.implementer)],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Hook registered: ${data.txId}`)
          setHookForm({ implementer: '' })
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error registering hook:', error)
      alert('Error registering hook')
    } finally {
      setIsLoading(false)
    }
  }

  // Unregister tokens-to-send hook
  async function handleUnregisterTokensToSendHook() {
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'unregister-tokens-to-send-hook',
        functionArgs: [],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Hook unregistered: ${data.txId}`)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error unregistering hook:', error)
      alert('Error unregistering hook')
    } finally {
      setIsLoading(false)
    }
  }

  // Unregister tokens-received hook
  async function handleUnregisterTokensReceivedHook() {
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'unregister-tokens-received-hook',
        functionArgs: [],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Hook unregistered: ${data.txId}`)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error unregistering hook:', error)
      alert('Error unregistering hook')
    } finally {
      setIsLoading(false)
    }
  }

  // Pause contract (owner only)
  async function handlePauseContract() {
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'pause-contract',
        functionArgs: [],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Contract paused: ${data.txId}`)
          loadContractStatus()
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error pausing contract:', error)
      alert('Error pausing contract')
    } finally {
      setIsLoading(false)
    }
  }

  // Unpause contract (owner only)
  async function handleUnpauseContract() {
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'unpause-contract',
        functionArgs: [],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Contract unpaused: ${data.txId}`)
          loadContractStatus()
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error unpausing contract:', error)
      alert('Error unpausing contract')
    } finally {
      setIsLoading(false)
    }
  }

  // Set asset restrictions (owner only)
  async function handleSetAssetRestrictions() {
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-asset-restrictions',
        functionArgs: [Cl.bool(assetRestriction)],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Asset restrictions updated: ${data.txId}`)
          loadContractStatus()
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error setting asset restrictions:', error)
      alert('Error setting asset restrictions')
    } finally {
      setIsLoading(false)
    }
  }

  // Transfer (ERC-20 compatible)
  async function handleTransfer() {
    if (!sendForm.to || !sendForm.amount) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsLoading(true)
    try {
      const options: ContractCallOptions = {
        contractAddress: HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'transfer',
        functionArgs: [
          Cl.principal(sendForm.to),
          Cl.uint(BigInt(sendForm.amount)),
          sendForm.userData ? Cl.some(Cl.bufferFromHex(Buffer.from(sendForm.userData).toString('hex'))) : Cl.none()
        ],
        network: 'mainnet',
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: { txId: string }) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Transfer submitted: ${data.txId}`)
          setSendForm({ to: '', amount: '', userData: '' })
          loadUserBalance(userAddress)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      }
      
      await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        options
      )
    } catch (error) {
      console.error('Error in transfer:', error)
      alert('Error in transfer')
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on connection
  useEffect(() => {
    if (isConnected && userAddress) {
      loadTokenInfo()
      loadContractStatus()
      loadUserBalance(userAddress)
    }
  }, [isConnected, userAddress, loadTokenInfo, loadContractStatus])

  // Format large numbers
  function formatTokenAmount(amount: string | number): string {
    const num = typeof amount === 'string' ? BigInt(amount) : BigInt(amount)
    const decimals = 18n
    const divisor = 10n ** decimals
    const whole = num / divisor
    const fraction = num % divisor
    const fractionStr = fraction.toString().padStart(18, '0').slice(0, 4)
    return `${whole.toLocaleString()}.${fractionStr}`
  }

  return (
    <div className="app">
      <header>
        <h1>🪝 Hook-Enabled Token</h1>
        <p className="subtitle">ERC-777 Inspired Fungible Token on Stacks</p>
        
        {!isConnected ? (
          <div className="connect-buttons">
            <button onClick={connectWallet} className="connect-btn">
              Connect with WalletConnect
            </button>
            <button onClick={connectWithWalletSelect} className="connect-btn secondary">
              Select Wallet
            </button>
          </div>
        ) : (
          <div className="wallet-info">
            <p>Connected: <span className="address">{userAddress.slice(0, 8)}...{userAddress.slice(-4)}</span></p>
            <p>Balance: <span className="balance">{formatTokenAmount(userBalance)} HOOK</span></p>
            <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
          </div>
        )}
      </header>

      {isConnected && (
        <main>
          <nav className="tabs">
            <button 
              className={activeTab === 'info' ? 'active' : ''} 
              onClick={() => setActiveTab('info')}
            >
              Token Info
            </button>
            <button 
              className={activeTab === 'transfer' ? 'active' : ''} 
              onClick={() => setActiveTab('transfer')}
            >
              Transfer
            </button>
            <button 
              className={activeTab === 'operators' ? 'active' : ''} 
              onClick={() => setActiveTab('operators')}
            >
              Operators
            </button>
            <button 
              className={activeTab === 'hooks' ? 'active' : ''} 
              onClick={() => setActiveTab('hooks')}
            >
              Hooks
            </button>
            <button 
              className={activeTab === 'admin' ? 'active' : ''} 
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </button>
          </nav>

          {/* Token Info Tab */}
          {activeTab === 'info' && (
            <section className="tab-content">
              <h2>Token Information</h2>
              
              {tokenInfo && (
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{tokenInfo.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Symbol:</label>
                    <span>{tokenInfo.symbol}</span>
                  </div>
                  <div className="info-item">
                    <label>Decimals:</label>
                    <span>{tokenInfo.decimals}</span>
                  </div>
                  <div className="info-item">
                    <label>Granularity:</label>
                    <span>{tokenInfo.granularity}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Supply:</label>
                    <span>{formatTokenAmount(tokenInfo['total-supply'])} HOOK</span>
                  </div>
                </div>
              )}

              <h3>Contract Status</h3>
              {contractStatus && (
                <div className="info-grid">
                  <div className="info-item">
                    <label>Paused:</label>
                    <span className={contractStatus.paused ? 'warning' : 'success'}>
                      {contractStatus.paused ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Assets Restricted:</label>
                    <span className={contractStatus['assets-restricted'] ? 'warning' : 'success'}>
                      {contractStatus['assets-restricted'] ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Total Minted:</label>
                    <span>{formatTokenAmount(contractStatus['total-minted'])}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Burned:</label>
                    <span>{formatTokenAmount(contractStatus['total-burned'])}</span>
                  </div>
                  <div className="info-item">
                    <label>Operation Nonce:</label>
                    <span>{contractStatus['operation-nonce']}</span>
                  </div>
                </div>
              )}

              <h3>Check Balance</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enter address to check"
                  value={balanceCheckAddress}
                  onChange={(e) => setBalanceCheckAddress(e.target.value)}
                />
                <button onClick={checkBalance}>Check Balance</button>
                {checkedBalance && (
                  <p className="result">Balance: {formatTokenAmount(checkedBalance)} HOOK</p>
                )}
              </div>

              <h3>Get Transfer Operation</h3>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Operation ID"
                  value={transferOpId}
                  onChange={(e) => setTransferOpId(e.target.value)}
                />
                <button onClick={getTransferOperation}>Get Details</button>
                {transferOperation && (
                  <div className="result">
                    <p>From: {transferOperation.from}</p>
                    <p>To: {transferOperation.to}</p>
                    <p>Amount: {formatTokenAmount(transferOperation.amount)}</p>
                    <p>Hooks Called: {transferOperation['hooks-called'] ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>

              <button onClick={() => { loadTokenInfo(); loadContractStatus(); }} className="refresh-btn">
                Refresh Data
              </button>
            </section>
          )}

          {/* Transfer Tab */}
          {activeTab === 'transfer' && (
            <section className="tab-content">
              <h2>Send Tokens (ERC-777 Style)</h2>
              <div className="form-section">
                <div className="form-group">
                  <label>Recipient:</label>
                  <input
                    type="text"
                    placeholder="SP..."
                    value={sendForm.to}
                    onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Amount (wei):</label>
                  <input
                    type="text"
                    placeholder="1000000000000000000"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>User Data (optional):</label>
                  <input
                    type="text"
                    placeholder="Optional metadata"
                    value={sendForm.userData}
                    onChange={(e) => setSendForm({ ...sendForm, userData: e.target.value })}
                  />
                </div>
                <div className="button-group">
                  <button onClick={handleSendTokens} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Send (ERC-777)'}
                  </button>
                  <button onClick={handleTransfer} disabled={isLoading} className="secondary">
                    {isLoading ? 'Processing...' : 'Transfer (ERC-20)'}
                  </button>
                </div>
              </div>

              <h2>Operator Send</h2>
              <div className="form-section">
                <div className="form-group">
                  <label>From:</label>
                  <input
                    type="text"
                    placeholder="SP..."
                    value={operatorSendForm.from}
                    onChange={(e) => setOperatorSendForm({ ...operatorSendForm, from: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>To:</label>
                  <input
                    type="text"
                    placeholder="SP..."
                    value={operatorSendForm.to}
                    onChange={(e) => setOperatorSendForm({ ...operatorSendForm, to: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Amount (wei):</label>
                  <input
                    type="text"
                    placeholder="1000000000000000000"
                    value={operatorSendForm.amount}
                    onChange={(e) => setOperatorSendForm({ ...operatorSendForm, amount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>User Data:</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={operatorSendForm.userData}
                    onChange={(e) => setOperatorSendForm({ ...operatorSendForm, userData: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Operator Data:</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={operatorSendForm.operatorData}
                    onChange={(e) => setOperatorSendForm({ ...operatorSendForm, operatorData: e.target.value })}
                  />
                </div>
                <button onClick={handleOperatorSend} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Operator Send'}
                </button>
              </div>

              <h2>Burn Tokens</h2>
              <div className="form-section">
                <div className="form-group">
                  <label>Amount (wei):</label>
                  <input
                    type="text"
                    placeholder="1000000000000000000"
                    value={burnForm.amount}
                    onChange={(e) => setBurnForm({ ...burnForm, amount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>User Data:</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={burnForm.userData}
                    onChange={(e) => setBurnForm({ ...burnForm, userData: e.target.value })}
                  />
                </div>
                <button onClick={handleBurn} disabled={isLoading} className="danger">
                  {isLoading ? 'Processing...' : 'Burn Tokens'}
                </button>
              </div>

              <h2>Operator Burn</h2>
              <div className="form-section">
                <div className="form-group">
                  <label>From:</label>
                  <input
                    type="text"
                    placeholder="SP..."
                    value={operatorBurnForm.from}
                    onChange={(e) => setOperatorBurnForm({ ...operatorBurnForm, from: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Amount (wei):</label>
                  <input
                    type="text"
                    placeholder="1000000000000000000"
                    value={operatorBurnForm.amount}
                    onChange={(e) => setOperatorBurnForm({ ...operatorBurnForm, amount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>User Data:</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={operatorBurnForm.userData}
                    onChange={(e) => setOperatorBurnForm({ ...operatorBurnForm, userData: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Operator Data:</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={operatorBurnForm.operatorData}
                    onChange={(e) => setOperatorBurnForm({ ...operatorBurnForm, operatorData: e.target.value })}
                  />
                </div>
                <button onClick={handleOperatorBurn} disabled={isLoading} className="danger">
                  {isLoading ? 'Processing...' : 'Operator Burn'}
                </button>
              </div>
            </section>
          )}

          {/* Operators Tab */}
          {activeTab === 'operators' && (
            <section className="tab-content">
              <h2>Manage Operators</h2>
              
              <div className="form-section">
                <h3>Authorize / Revoke Operator</h3>
                <div className="form-group">
                  <label>Operator Address:</label>
                  <input
                    type="text"
                    placeholder="SP..."
                    value={operatorAddress}
                    onChange={(e) => setOperatorAddress(e.target.value)}
                  />
                </div>
                <div className="button-group">
                  <button onClick={handleAuthorizeOperator} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Authorize Operator'}
                  </button>
                  <button onClick={handleRevokeOperator} disabled={isLoading} className="danger">
                    {isLoading ? 'Processing...' : 'Revoke Operator'}
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h3>Check Operator Status</h3>
                <div className="form-group">
                  <label>Operator:</label>
                  <input
                    type="text"
                    placeholder="SP..."
                    value={checkOperatorForm.operator}
                    onChange={(e) => setCheckOperatorForm({ ...checkOperatorForm, operator: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Holder:</label>
                  <input
                    type="text"
                    placeholder="SP..."
                    value={checkOperatorForm.holder}
                    onChange={(e) => setCheckOperatorForm({ ...checkOperatorForm, holder: e.target.value })}
                  />
                </div>
                <button onClick={checkIsOperator}>Check Operator Status</button>
              </div>
            </section>
          )}

          {/* Hooks Tab */}
          {activeTab === 'hooks' && (
            <section className="tab-content">
              <h2>Token Hooks (ERC-1820 Style)</h2>
              
              <div className="form-section">
                <h3>Register Hook Implementer</h3>
                <div className="form-group">
                  <label>Hook Implementer Contract:</label>
                  <input
                    type="text"
                    placeholder="SP...contract-name"
                    value={hookForm.implementer}
                    onChange={(e) => setHookForm({ implementer: e.target.value })}
                  />
                </div>
                <div className="button-group">
                  <button onClick={handleRegisterTokensToSendHook} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Register TokensToSend Hook'}
                  </button>
                  <button onClick={handleRegisterTokensReceivedHook} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Register TokensReceived Hook'}
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h3>Unregister Hooks</h3>
                <div className="button-group">
                  <button onClick={handleUnregisterTokensToSendHook} disabled={isLoading} className="danger">
                    {isLoading ? 'Processing...' : 'Unregister TokensToSend Hook'}
                  </button>
                  <button onClick={handleUnregisterTokensReceivedHook} disabled={isLoading} className="danger">
                    {isLoading ? 'Processing...' : 'Unregister TokensReceived Hook'}
                  </button>
                </div>
              </div>

              <div className="info-box">
                <h4>About Hooks</h4>
                <p>
                  <strong>TokensToSend:</strong> Called before tokens are sent from your address. 
                  Use this to implement custom logic when tokens leave your account.
                </p>
                <p>
                  <strong>TokensReceived:</strong> Called after tokens are received to your address.
                  Use this to implement custom logic when tokens arrive.
                </p>
              </div>
            </section>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && (
            <section className="tab-content">
              <h2>Admin Functions (Owner Only)</h2>
              
              <div className="form-section">
                <h3>Mint Tokens</h3>
                <div className="form-group">
                  <label>Recipient:</label>
                  <input
                    type="text"
                    placeholder="SP..."
                    value={mintForm.to}
                    onChange={(e) => setMintForm({ ...mintForm, to: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Amount (wei):</label>
                  <input
                    type="text"
                    placeholder="1000000000000000000"
                    value={mintForm.amount}
                    onChange={(e) => setMintForm({ ...mintForm, amount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Operator Data:</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={mintForm.operatorData}
                    onChange={(e) => setMintForm({ ...mintForm, operatorData: e.target.value })}
                  />
                </div>
                <button onClick={handleMint} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Mint Tokens'}
                </button>
              </div>

              <div className="form-section">
                <h3>Contract Control</h3>
                <div className="button-group">
                  <button onClick={handlePauseContract} disabled={isLoading} className="warning">
                    {isLoading ? 'Processing...' : 'Pause Contract'}
                  </button>
                  <button onClick={handleUnpauseContract} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Unpause Contract'}
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h3>Asset Restrictions</h3>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={assetRestriction}
                      onChange={(e) => setAssetRestriction(e.target.checked)}
                    />
                    Restrict Assets
                  </label>
                </div>
                <button onClick={handleSetAssetRestrictions} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Update Asset Restrictions'}
                </button>
              </div>

              <div className="warning-box">
                <p>⚠️ These functions are restricted to the contract owner only.</p>
              </div>
            </section>
          )}
        </main>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing transaction...</p>
        </div>
      )}
    </div>
  )
}

export default App
