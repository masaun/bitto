import React, { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, makeContractCall, standardPrincipalCV, uintCV, stringAsciiCV, broadcastTransaction } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

const CONTRACT_ADDRESS = process.env.HYDROGEN_FACILITY_LEASEBACK_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'hydrogen-facility-leaseback';

export default function App() {
  const [userData, setUserData] = useState(null);
  const [assetId, setAssetId] = useState('');
  const [buyer, setBuyer] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [leaseRate, setLeaseRate] = useState('');
  const [term, setTerm] = useState('');
  const [leasebackId, setLeasebackId] = useState('');
  const [leasebackData, setLeasebackData] = useState(null);
  const [loading, setLoading] = useState(false);

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
      appDetails: { name: 'hydrogen-facility-leaseback', icon: window.location.origin + '/logo.png' },
      redirectTo: '/',
      onFinish: () => { setUserData(userSession.loadUserData()); },
      userSession,
    });
  };

  const originateLeaseback = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'originate-leaseback',
        functionArgs: [stringAsciiCV(assetId), standardPrincipalCV(buyer), uintCV(salePrice), uintCV(leaseRate), uintCV(term)],
        senderKey: userData.appPrivateKey,
        network,
        postConditionMode: 1,
      };
      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network });
      alert('Transaction broadcast: ' + result.txid);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveLeaseback = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'approve-leaseback',
        functionArgs: [uintCV(leasebackId)],
        senderKey: userData.appPrivateKey,
        network,
        postConditionMode: 1,
      };
      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network });
      alert('Transaction broadcast: ' + result.txid);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const settleLeaseback = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'settle-leaseback',
        functionArgs: [uintCV(leasebackId)],
        senderKey: userData.appPrivateKey,
        network,
        postConditionMode: 1,
      };
      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network });
      alert('Transaction broadcast: ' + result.txid);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const terminateLeaseback = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'terminate-leaseback',
        functionArgs: [uintCV(leasebackId)],
        senderKey: userData.appPrivateKey,
        network,
        postConditionMode: 1,
      };
      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network });
      alert('Transaction broadcast: ' + result.txid);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getLeaseback = async () => {
    setLoading(true);
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-leaseback',
        functionArgs: [uintCV(leasebackId)],
        network,
        senderAddress: userData?.profile?.stxAddress?.mainnet || CONTRACT_ADDRESS,
      });
      setLeasebackData(result);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getLeasebackCount = async () => {
    setLoading(true);
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-leaseback-count',
        functionArgs: [],
        network,
        senderAddress: userData?.profile?.stxAddress?.mainnet || CONTRACT_ADDRESS,
      });
      alert('Total Leasebacks: ' + result.value);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>hydrogen-facility-leaseback</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          <div style={{ marginTop: '20px' }}>
            <h2>Originate Leaseback</h2>
            <input placeholder="Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
            <input placeholder="Buyer Address" value={buyer} onChange={(e) => setBuyer(e.target.value)} />
            <input placeholder="Sale Price" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
            <input placeholder="Lease Rate" type="number" value={leaseRate} onChange={(e) => setLeaseRate(e.target.value)} />
            <input placeholder="Term" type="number" value={term} onChange={(e) => setTerm(e.target.value)} />
            <button onClick={originateLeaseback} disabled={loading}>Originate</button>
          </div>
          <div style={{ marginTop: '20px' }}>
            <h2>Manage Leaseback</h2>
            <input placeholder="Leaseback ID" type="number" value={leasebackId} onChange={(e) => setLeasebackId(e.target.value)} />
            <button onClick={approveLeaseback} disabled={loading}>Approve</button>
            <button onClick={settleLeaseback} disabled={loading}>Settle</button>
            <button onClick={terminateLeaseback} disabled={loading}>Terminate</button>
            <button onClick={getLeaseback} disabled={loading}>Get Details</button>
            <button onClick={getLeasebackCount} disabled={loading}>Get Count</button>
          </div>
          {leasebackData && (
            <div style={{ marginTop: '20px' }}>
              <h3>Leaseback Data</h3>
              <pre>{JSON.stringify(leasebackData, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
