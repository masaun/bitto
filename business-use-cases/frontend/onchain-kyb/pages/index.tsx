import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  stringAsciiCV,
  principalCV,
  bufferCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function OnchainKyb() {
  const [userData, setUserData] = useState<any>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [documentsHash, setDocumentsHash] = useState('');
  const [business, setBusiness] = useState('');
  const [verifier, setVerifier] = useState('');
  const [isVerifier, setIsVerifier] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [verificationRecord, setVerificationRecord] = useState<any>(null);

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
        name: 'Onchain KYB',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const submitBusinessVerification = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'submit-business-verification',
      functionArgs: [
        stringAsciiCV(businessName),
        stringAsciiCV(businessType),
        stringAsciiCV(registrationNumber),
        bufferCV(Buffer.from(documentsHash, 'hex'))
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const approveVerification = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'approve-verification',
      functionArgs: [principalCV(business)],
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
      functionArgs: [principalCV(business)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateVerifierRole = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-verifier-role',
      functionArgs: [
        principalCV(verifier),
        boolCV(isVerifier)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateDocumentsHash = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-documents-hash',
      functionArgs: [bufferCV(Buffer.from(documentsHash, 'hex'))],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getBusinessInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-business-info',
      functionArgs: [principalCV(business)],
      network,
      senderAddress: contractAddress,
    });

    setBusinessInfo(cvToValue(result));
  };

  const getVerificationRecord = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-verification-record',
      functionArgs: [principalCV(business)],
      network,
      senderAddress: contractAddress,
    });

    setVerificationRecord(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Onchain KYB</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Submit Business Verification</h2>
            <input placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            <input placeholder="Business Type" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
            <input placeholder="Registration Number" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
            <input placeholder="Documents Hash" value={documentsHash} onChange={(e) => setDocumentsHash(e.target.value)} />
            <button onClick={submitBusinessVerification}>Submit Business Verification</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Approve Verification</h2>
            <input placeholder="Business" value={business} onChange={(e) => setBusiness(e.target.value)} />
            <button onClick={approveVerification}>Approve Verification</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Revoke Verification</h2>
            <input placeholder="Business" value={business} onChange={(e) => setBusiness(e.target.value)} />
            <button onClick={revokeVerification}>Revoke Verification</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Verifier Role</h2>
            <input placeholder="Verifier" value={verifier} onChange={(e) => setVerifier(e.target.value)} />
            <label>
              <input type="checkbox" checked={isVerifier} onChange={(e) => setIsVerifier(e.target.checked)} />
              Is Verifier
            </label>
            <button onClick={updateVerifierRole}>Update Verifier Role</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Update Documents Hash</h2>
            <input placeholder="Documents Hash" value={documentsHash} onChange={(e) => setDocumentsHash(e.target.value)} />
            <button onClick={updateDocumentsHash}>Update Documents Hash</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Business Info</h2>
            <input placeholder="Business" value={business} onChange={(e) => setBusiness(e.target.value)} />
            <button onClick={getBusinessInfo}>Get Business Info</button>
            {businessInfo && <pre>{JSON.stringify(businessInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Verification Record</h2>
            <input placeholder="Business" value={business} onChange={(e) => setBusiness(e.target.value)} />
            <button onClick={getVerificationRecord}>Get Verification Record</button>
            {verificationRecord && <pre>{JSON.stringify(verificationRecord, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
