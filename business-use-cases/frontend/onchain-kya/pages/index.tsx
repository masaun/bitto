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
  bufferCVFromString,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function OnchainKYA() {
  const [userData, setUserData] = useState<any>(null);
  const [addressId, setAddressId] = useState('');
  const [wallet, setWallet] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postal, setPostal] = useState('');
  const [proofHash, setProofHash] = useState('');
  const [attemptId, setAttemptId] = useState('');
  const [reason, setReason] = useState('');
  const [addressInfo, setAddressInfo] = useState<any>(null);

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
        name: 'Onchain KYA',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const submitAddressVerification = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'submit-address-verification',
      functionArgs: [
        stringAsciiCV(addressId),
        principalCV(wallet),
        stringAsciiCV(street),
        stringAsciiCV(city),
        stringAsciiCV(country),
        stringAsciiCV(postal),
        bufferCVFromString(proofHash)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const approveAddressVerification = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'approve-address-verification',
      functionArgs: [stringAsciiCV(addressId), uintCV(attemptId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const rejectAddressVerification = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'reject-address-verification',
      functionArgs: [stringAsciiCV(addressId), uintCV(attemptId), stringAsciiCV(reason)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const revokeVerification = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'revoke-verification',
      functionArgs: [stringAsciiCV(addressId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getAddressInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-address-info',
      functionArgs: [stringAsciiCV(addressId)],
      network,
      senderAddress: contractAddress,
    });

    setAddressInfo(cvToValue(result));
  };

  const isAddressVerified = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'is-address-verified',
      functionArgs: [stringAsciiCV(addressId)],
      network,
      senderAddress: contractAddress,
    });

    alert(JSON.stringify(cvToValue(result)));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Onchain KYA</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Submit Address Verification</h3>
            <input placeholder="Address ID" value={addressId} onChange={(e) => setAddressId(e.target.value)} />
            <input placeholder="Wallet Address" value={wallet} onChange={(e) => setWallet(e.target.value)} />
            <input placeholder="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} />
            <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
            <input placeholder="Postal Code" value={postal} onChange={(e) => setPostal(e.target.value)} />
            <input placeholder="Proof Hash" value={proofHash} onChange={(e) => setProofHash(e.target.value)} />
            <button onClick={submitAddressVerification}>Submit</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Approve Address Verification</h3>
            <input placeholder="Address ID" value={addressId} onChange={(e) => setAddressId(e.target.value)} />
            <input placeholder="Attempt ID" value={attemptId} onChange={(e) => setAttemptId(e.target.value)} />
            <button onClick={approveAddressVerification}>Approve</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Reject Address Verification</h3>
            <input placeholder="Address ID" value={addressId} onChange={(e) => setAddressId(e.target.value)} />
            <input placeholder="Attempt ID" value={attemptId} onChange={(e) => setAttemptId(e.target.value)} />
            <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            <button onClick={rejectAddressVerification}>Reject</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Revoke Verification</h3>
            <input placeholder="Address ID" value={addressId} onChange={(e) => setAddressId(e.target.value)} />
            <button onClick={revokeVerification}>Revoke</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Get Address Info</h3>
            <input placeholder="Address ID" value={addressId} onChange={(e) => setAddressId(e.target.value)} />
            <button onClick={getAddressInfo}>Get</button>
            {addressInfo && <pre>{JSON.stringify(addressInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Is Address Verified</h3>
            <input placeholder="Address ID" value={addressId} onChange={(e) => setAddressId(e.target.value)} />
            <button onClick={isAddressVerified}>Check</button>
          </div>
        </div>
      )}
    </div>
  );
}
