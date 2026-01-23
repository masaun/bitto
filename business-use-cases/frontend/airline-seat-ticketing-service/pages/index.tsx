import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  uintCV, 
  stringAsciiCV,
  callReadOnlyFunction,
  makeContractCall,
  AnchorMode
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [flightId, setFlightId] = useState('');
  const [airline, setAirline] = useState('');
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    setMounted(true);
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
        name: 'Airline Seat Ticketing',
        icon: 'https://stacks.org/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const handleCreateFlight = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'create-flight',
      functionArgs: [
        stringAsciiCV(flightId),
        stringAsciiCV(airline),
        stringAsciiCV(departure),
        stringAsciiCV(destination),
        uintCV(departureTime),
        uintCV(totalSeats)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleBookSeat = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'book-seat',
      functionArgs: [
        stringAsciiCV(flightId),
        stringAsciiCV(seatNumber),
        stringAsciiCV(passengerName)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleCheckIn = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'check-in',
      functionArgs: [stringAsciiCV(flightId), stringAsciiCV(seatNumber)],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleCancelBooking = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'cancel-booking',
      functionArgs: [stringAsciiCV(flightId), stringAsciiCV(seatNumber)],
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    };

    try {
      await makeContractCall(txOptions);
      setResult('Transaction submitted');
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleGetFlightInfo = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-flight-info',
        functionArgs: [stringAsciiCV(flightId)],
        senderAddress: contractAddress,
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleGetBooking = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-booking',
        functionArgs: [stringAsciiCV(flightId), stringAsciiCV(seatNumber)],
        senderAddress: contractAddress,
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Airline Seat Ticketing</h1>
      
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Create Flight</h3>
            <input placeholder="Flight ID" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
            <input placeholder="Airline" value={airline} onChange={(e) => setAirline(e.target.value)} />
            <input placeholder="Departure" value={departure} onChange={(e) => setDeparture(e.target.value)} />
            <input placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
            <input placeholder="Departure Time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
            <input placeholder="Total Seats" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} />
            <button onClick={handleCreateFlight}>Create</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Book Seat</h3>
            <input placeholder="Flight ID" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
            <input placeholder="Seat Number" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
            <input placeholder="Passenger Name" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
            <button onClick={handleBookSeat}>Book</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Check In</h3>
            <input placeholder="Flight ID" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
            <input placeholder="Seat Number" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
            <button onClick={handleCheckIn}>Check In</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Cancel Booking</h3>
            <input placeholder="Flight ID" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
            <input placeholder="Seat Number" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
            <button onClick={handleCancelBooking}>Cancel</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Flight Info</h3>
            <input placeholder="Flight ID" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
            <button onClick={handleGetFlightInfo}>Query</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Booking</h3>
            <input placeholder="Flight ID" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
            <input placeholder="Seat Number" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
            <button onClick={handleGetBooking}>Query</button>
          </div>

          {result && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', background: '#f5f5f5' }}>
              <h3>Result</h3>
              <pre>{result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
