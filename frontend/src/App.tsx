import { showConnect, disconnect, openContractCall } from '@stacks/connect'
import { Cl, Pc, fetchCallReadOnlyFunction, cvToJSON, ClarityValue, PostConditionMode } from '@stacks/transactions'
import { useState, useEffect } from 'react'

// Contract configuration - update this with your deployed contract address
const CONTRACT_ADDRESS = 'ST1V95DB4JK47QVPJBXCEN6MT35JK84CQ4F1GK7WZ'
const CONTRACT_NAME = 'message-board-v2'
const SBTC_CONTRACT = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token'

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [bns, setBns] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [messageCount, setMessageCount] = useState<number>(0)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [sbtcBalance, setSbtcBalance] = useState<number>(0)

  // Connect wallet function
  async function connectWallet() {
    try {
      showConnect({
        appDetails: {
          name: 'Message Board',
          icon: 'https://stacks.co/img/stx-logo.svg'
        },
        onFinish: async (authData: any) => {
          const address = authData.userSession.loadUserData().profile.stxAddress.testnet
          setIsConnected(true)
          setUserAddress(address)
          
          const bnsName = await getBns(address)
          setBns(bnsName)
          
          // Check sBTC balance and load messages after connecting
          const balance = await checkSBTCBalance()
          setSbtcBalance(balance)
          await loadMessages()
        },
        onCancel: () => {
          console.log('Connection cancelled')
        }
      })
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  // Disconnect wallet function
  async function disconnectWallet() {
    disconnect()
    setIsConnected(false)
    setUserAddress('')
    setBns('')
  }

  // Get BNS name for an address
  async function getBns(stxAddress: string): Promise<string> {
    try {
      const response = await fetch(`https://api.bnsv2.com/testnet/names/address/${stxAddress}/valid`)
      const data = await response.json()
      return data.names?.[0]?.full_name || ''
    } catch (error) {
      console.error('Error fetching BNS:', error)
      return ''
    }
  }

  // Check user's sBTC balance
  async function checkSBTCBalance(): Promise<number> {
    if (!userAddress) return 0
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT',
        contractName: 'sbtc-token',
        functionName: 'get-balance',
        functionArgs: [Cl.principal(userAddress)],
        network: 'testnet',
        senderAddress: userAddress,
      })
      const json = cvToJSON(result)
      return json.value?.value || 0
    } catch (error) {
      console.error('Error checking sBTC balance:', error)
      return 0
    }
  }

  // Add a new message
  async function addMessage() {
    if (!content.trim() || !userAddress) return
    
    setIsLoading(true)
    try {
      // Check sBTC balance first
      const balance = await checkSBTCBalance()
      console.log('User sBTC balance:', balance)
      
      if (balance < 1) {
        alert('Insufficient sBTC balance. You need at least 1 satoshi of sBTC to post a message. Get testnet sBTC from https://platform.hiro.so/')
        return
      }
      
      // Add post-condition to protect user assets
      const postConditions = [
        Pc.principal(userAddress)
          .willSendEq(1)
          .ft(SBTC_CONTRACT, 'sbtc-token')
      ]
      
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'add-message',
        functionArgs: [Cl.stringUtf8(content)],
        network: 'testnet',
        postConditions: postConditions,
        postConditionMode: PostConditionMode.Allow,
        sponsored: false,
        onFinish: (result: any) => {
          console.log('Transaction result:', result)
          setContent('')
          
          // Reload messages after a delay to allow transaction to confirm
          setTimeout(() => {
            loadMessages()
          }, 5000)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
      
    } catch (error) {
      console.error('Error adding message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get message count at current block
  async function getMessageCountAtBlock(): Promise<number> {
    try {
      const response = await fetch('https://api.testnet.hiro.so/v2/info')
      const data = await response.json()
      const stacksBlockHeight = data.stacks_tip_height

      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-message-count-at-block',
        functionArgs: [Cl.uint(stacksBlockHeight)],
        network: 'testnet',
        senderAddress: CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      return json.value?.value?.value || 0
    } catch (error) {
      console.error('Error getting message count:', error)
      return 0
    }
  }

  // Get a specific message by ID
  async function getMessage(id: number): Promise<any> {
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-message',
        functionArgs: [Cl.uint(id)],
        network: 'testnet',
        senderAddress: CONTRACT_ADDRESS,
      })

      const json = cvToJSON(result)
      return json.value
    } catch (error) {
      console.error('Error getting message:', error)
      return null
    }
  }

  // Load all messages
  async function loadMessages() {
    try {
      const count = await getMessageCountAtBlock()
      setMessageCount(count)

      const messagePromises = []
      for (let i = 1; i <= count; i++) {
        messagePromises.push(getMessage(i))
      }

      const messageData = await Promise.all(messagePromises)
      const validMessages = messageData
        .filter(msg => msg !== null)
        .map((msg, index) => ({
          id: index + 1,
          ...msg
        }))
      
      setMessages(validMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Load messages on component mount
  useEffect(() => {
    if (isConnected) {
      loadMessages()
    }
  }, [isConnected])

  return (
    <div className="app">
      <header className="header">
        <h1>🟧 Stacks Dev Quickstart Message Board</h1>
        <p>Share your message on Bitcoin via Stacks for 1 satoshi of sBTC!</p>
      </header>

      <div className="wallet-section">
        {isConnected ? (
          <div className="connected">
            <p>Connected as: <strong>{bns || userAddress}</strong></p>
            <p>sBTC Balance: <strong>{sbtcBalance} satoshis</strong></p>
            {sbtcBalance < 1 && (
              <p style={{color: 'red'}}>
                ⚠️ You need sBTC tokens to post messages. Get testnet sBTC from{' '}
                <a href="https://platform.hiro.so/" target="_blank" rel="noopener noreferrer">
                  Hiro Platform
                </a>
              </p>
            )}
            <button onClick={disconnectWallet} className="disconnect-btn">
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <button onClick={connectWallet} className="connect-btn">
            Connect Leather Wallet
          </button>
        )}
      </div>

      {isConnected && (
        <>
          <div className="add-message-section">
            <h2>Add New Message</h2>
            <div className="input-container">
              <input 
                type="text" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your message (max 280 characters)"
                maxLength={280}
                disabled={isLoading}
              />
              <button 
                onClick={addMessage}
                disabled={!content.trim() || isLoading}
                className="add-btn"
              >
                {isLoading ? 'Adding...' : 'Add Message (1 sat sBTC)'}
              </button>
            </div>
            <small>Cost: 1 satoshi of sBTC per message</small>
          </div>

          <div className="messages-section">
            <div className="messages-header">
              <h2>Messages ({messageCount})</h2>
              <button onClick={loadMessages} className="refresh-btn">
                🔄 Refresh
              </button>
            </div>

            {messages.length > 0 ? (
              <div className="messages-list">
                {messages.map((message) => (
                  <div key={message.id} className="message-card">
                    <div className="message-header">
                      <span className="message-id">#{message.id}</span>
                      <span className="message-time">Block: {message.time?.value}</span>
                    </div>
                    <div className="message-content">
                      {message.message?.value}
                    </div>
                    <div className="message-author">
                      By: {message.author?.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-messages">No messages yet. Be the first to add one!</p>
            )}
          </div>
        </>
      )}

      <footer className="footer">
        <p>Built with Stacks.js • Contract: {CONTRACT_ADDRESS}.{CONTRACT_NAME}</p>
      </footer>
    </div>
  )
}

export default App