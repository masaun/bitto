import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  uintCV, 
  stringAsciiCV,
  bufferCV,
  callReadOnlyFunction,
  makeContractCall,
  AnchorMode
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpHash, setOtpHash] = useState('');
  const [requestId, setRequestId] = useState('');
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
        name: 'SMS One-Time Password',
        icon: 'https://stacks.org/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const handleGenerateOtp = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const hashBuffer = new TextEncoder().encode(otpHash).slice(0, 32);
    const paddedHash = new Uint8Array(32);
    paddedHash.set(hashBuffer);

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'generate-otp-request',
      functionArgs: [stringAsciiCV(phoneNumber), bufferCV(paddedHash)],
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

  const handleVerifyOtp = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const hashBuffer = new TextEncoder().encode(otpHash).slice(0, 32);
    const paddedHash = new Uint8Array(32);
    paddedHash.set(hashBuffer);

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'verify-otp',
      functionArgs: [stringAsciiCV(phoneNumber), uintCV(requestId), bufferCV(paddedHash)],
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

  const handleRevokeOtp = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: 'revoke-otp',
      functionArgs: [stringAsciiCV(phoneNumber), uintCV(requestId)],
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

  const handleGetOtpStatus = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-otp-status',
        functionArgs: [stringAsciiCV(phoneNumber), uintCV(requestId)],
        senderAddress: contractAddress,
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleIsVerified = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'is-verified',
        functionArgs: [stringAsciiCV(phoneNumber), uintCV(requestId)],
        senderAddress: contractAddress,
      });
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  const handleGetRequestNonce = async () => {
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-request-nonce',
        functionArgs: [],
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
      <h1>SMS One-Time Password</h1>
      
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Generate OTP Request</h3>
            <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            <input placeholder="OTP Hash" value={otpHash} onChange={(e) => setOtpHash(e.target.value)} />
            <button onClick={handleGenerateOtp}>Generate</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Verify OTP</h3>
            <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            <input placeholder="Request ID" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
            <input placeholder="OTP Hash" value={otpHash} onChange={(e) => setOtpHash(e.target.value)} />
            <button onClick={handleVerifyOtp}>Verify</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Revoke OTP</h3>
            <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            <input placeholder="Request ID" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
            <button onClick={handleRevokeOtp}>Revoke</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get OTP Status</h3>
            <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            <input placeholder="Request ID" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
            <button onClick={handleGetOtpStatus}>Query</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Is Verified</h3>
            <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            <input placeholder="Request ID" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
            <button onClick={handleIsVerified}>Check</button>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Get Request Nonce</h3>
            <button onClick={handleGetRequestNonce}>Query</button>
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
