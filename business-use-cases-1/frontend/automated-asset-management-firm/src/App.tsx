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
const CONTRACT_NAME = 'automated-asset-management-firm'
const network = new StacksMainnet()

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [create_portfolio_name, setCreatePortfolioName] = useState('')
const [create_portfolio_strategy, setCreatePortfolioStrategy] = useState('')
const [add_asset_portfolio_id, setAddAssetPortfolioId] = useState('')
const [add_asset_asset_symbol, setAddAssetAssetSymbol] = useState('')
const [add_asset_quantity, setAddAssetQuantity] = useState('')
const [execute_trade_portfolio_id, setExecuteTradePortfolioId] = useState('')
const [execute_trade_asset, setExecuteTradeAsset] = useState('')
const [execute_trade_quantity, setExecuteTradeQuantity] = useState('')
const [execute_trade_action, setExecuteTradeAction] = useState('')
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
        name: 'Asset Management Firm',
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

  
  const create_portfolio = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-portfolio',
        functionArgs: [stringUtf8CV(create_portfolio_name), stringAsciiCV(create_portfolio_strategy)],
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

  const add_asset = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'add-asset',
        functionArgs: [uintCV(parseInt(add_asset_portfolio_id)), stringAsciiCV(add_asset_asset_symbol), uintCV(parseInt(add_asset_quantity))],
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

  const execute_trade = async () => {
    if (!userData) return
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'execute-trade',
        functionArgs: [uintCV(parseInt(execute_trade_portfolio_id)), stringAsciiCV(execute_trade_asset), uintCV(parseInt(execute_trade_quantity)), stringAsciiCV(execute_trade_action)],
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
      <h1>Asset Management Firm</h1>
      
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
