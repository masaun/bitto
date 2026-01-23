import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function SportsPlayerIpMgmt() {
  const [userData, setUserData] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [sport, setSport] = useState('');
  const [ipType, setIpType] = useState('');
  const [description, setDescription] = useState('');
  const [ipId, setIpId] = useState('');
  const [licensee, setLicensee] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [royaltyRate, setRoyaltyRate] = useState('');
  const [duration, setDuration] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [amount, setAmount] = useState('');
  const [ipInfo, setIpInfo] = useState<any>(null);
  const [licenseInfo, setLicenseInfo] = useState<any>(null);
  const [royaltyPayment, setRoyaltyPayment] = useState<any>(null);

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
        name: 'Sports Player IP Management',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const registerIp = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'register-ip',
      functionArgs: [
        stringAsciiCV(playerName),
        stringAsciiCV(sport),
        stringAsciiCV(ipType),
        stringAsciiCV(description)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const grantLicense = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'grant-license',
      functionArgs: [
        uintCV(ipId),
        principalCV(licensee),
        stringAsciiCV(licenseType),
        uintCV(royaltyRate),
        uintCV(duration)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const recordRoyaltyPayment = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'record-royalty-payment',
      functionArgs: [
        uintCV(ipId),
        uintCV(paymentId),
        principalCV(licensee),
        uintCV(amount)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const revokeLicense = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'revoke-license',
      functionArgs: [uintCV(licenseId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getIpInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-ip-info',
      functionArgs: [uintCV(ipId)],
      network,
      senderAddress: contractAddress,
    });

    setIpInfo(cvToValue(result));
  };

  const getLicenseInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-license-info',
      functionArgs: [uintCV(licenseId)],
      network,
      senderAddress: contractAddress,
    });

    setLicenseInfo(cvToValue(result));
  };

  const getRoyaltyPayment = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-royalty-payment',
      functionArgs: [uintCV(ipId), uintCV(paymentId)],
      network,
      senderAddress: contractAddress,
    });

    setRoyaltyPayment(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Sports Player IP Management</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Register IP</h2>
            <input placeholder="Player Name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
            <input placeholder="Sport" value={sport} onChange={(e) => setSport(e.target.value)} />
            <input placeholder="IP Type" value={ipType} onChange={(e) => setIpType(e.target.value)} />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button onClick={registerIp}>Register IP</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Grant License</h2>
            <input placeholder="IP ID" value={ipId} onChange={(e) => setIpId(e.target.value)} />
            <input placeholder="Licensee" value={licensee} onChange={(e) => setLicensee(e.target.value)} />
            <input placeholder="License Type" value={licenseType} onChange={(e) => setLicenseType(e.target.value)} />
            <input placeholder="Royalty Rate" value={royaltyRate} onChange={(e) => setRoyaltyRate(e.target.value)} />
            <input placeholder="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <button onClick={grantLicense}>Grant License</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Record Royalty Payment</h2>
            <input placeholder="IP ID" value={ipId} onChange={(e) => setIpId(e.target.value)} />
            <input placeholder="Payment ID" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} />
            <input placeholder="Licensee" value={licensee} onChange={(e) => setLicensee(e.target.value)} />
            <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button onClick={recordRoyaltyPayment}>Record Royalty Payment</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Revoke License</h2>
            <input placeholder="License ID" value={licenseId} onChange={(e) => setLicenseId(e.target.value)} />
            <button onClick={revokeLicense}>Revoke License</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get IP Info</h2>
            <input placeholder="IP ID" value={ipId} onChange={(e) => setIpId(e.target.value)} />
            <button onClick={getIpInfo}>Get IP Info</button>
            {ipInfo && <pre>{JSON.stringify(ipInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get License Info</h2>
            <input placeholder="License ID" value={licenseId} onChange={(e) => setLicenseId(e.target.value)} />
            <button onClick={getLicenseInfo}>Get License Info</button>
            {licenseInfo && <pre>{JSON.stringify(licenseInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Royalty Payment</h2>
            <input placeholder="IP ID" value={ipId} onChange={(e) => setIpId(e.target.value)} />
            <input placeholder="Payment ID" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} />
            <button onClick={getRoyaltyPayment}>Get Royalty Payment</button>
            {royaltyPayment && <pre>{JSON.stringify(royaltyPayment, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
