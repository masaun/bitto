import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  uintCV,
  stringAsciiCV,
  principalCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function ProBaseballTicketing() {
  const [userData, setUserData] = useState<any>(null);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [stadium, setStadium] = useState('');
  const [gameTime, setGameTime] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [gameId, setGameId] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seat, setSeat] = useState('');
  const [price, setPrice] = useState('');
  const [newHolder, setNewHolder] = useState('');
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [ticketInfo, setTicketInfo] = useState<any>(null);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Pro Baseball Ticketing',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const createGame = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'create-game',
      functionArgs: [
        stringAsciiCV(homeTeam),
        stringAsciiCV(awayTeam),
        stringAsciiCV(stadium),
        uintCV(gameTime),
        uintCV(totalTickets)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const purchaseTicket = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'purchase-ticket',
      functionArgs: [
        uintCV(gameId),
        stringAsciiCV(section),
        stringAsciiCV(row),
        stringAsciiCV(seat),
        uintCV(price)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const useTicket = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'use-ticket',
      functionArgs: [uintCV(gameId), uintCV(ticketId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const transferTicket = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'transfer-ticket',
      functionArgs: [uintCV(gameId), uintCV(ticketId), principalCV(newHolder)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getGameInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-game-info',
      functionArgs: [uintCV(gameId)],
      network,
      senderAddress: contractAddress,
    });

    setGameInfo(cvToValue(result));
  };

  const getTicketInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-ticket-info',
      functionArgs: [uintCV(gameId), uintCV(ticketId)],
      network,
      senderAddress: contractAddress,
    });

    setTicketInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Pro Baseball Ticketing</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Create Game</h3>
            <input placeholder="Home Team" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
            <input placeholder="Away Team" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
            <input placeholder="Stadium" value={stadium} onChange={(e) => setStadium(e.target.value)} />
            <input placeholder="Game Time" value={gameTime} onChange={(e) => setGameTime(e.target.value)} />
            <input placeholder="Total Tickets" value={totalTickets} onChange={(e) => setTotalTickets(e.target.value)} />
            <button onClick={createGame}>Create</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Purchase Ticket</h3>
            <input placeholder="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)} />
            <input placeholder="Section" value={section} onChange={(e) => setSection(e.target.value)} />
            <input placeholder="Row" value={row} onChange={(e) => setRow(e.target.value)} />
            <input placeholder="Seat" value={seat} onChange={(e) => setSeat(e.target.value)} />
            <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <button onClick={purchaseTicket}>Purchase</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Use Ticket</h3>
            <input placeholder="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)} />
            <input placeholder="Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} />
            <button onClick={useTicket}>Use</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Transfer Ticket</h3>
            <input placeholder="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)} />
            <input placeholder="Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} />
            <input placeholder="New Holder Address" value={newHolder} onChange={(e) => setNewHolder(e.target.value)} />
            <button onClick={transferTicket}>Transfer</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Get Game Info</h3>
            <input placeholder="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)} />
            <button onClick={getGameInfo}>Get</button>
            {gameInfo && <pre>{JSON.stringify(gameInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Get Ticket Info</h3>
            <input placeholder="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)} />
            <input placeholder="Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} />
            <button onClick={getTicketInfo}>Get</button>
            {ticketInfo && <pre>{JSON.stringify(ticketInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
