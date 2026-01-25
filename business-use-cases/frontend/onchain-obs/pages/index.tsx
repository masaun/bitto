import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  uintCV,
  stringAsciiCV,
  boolCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export default function OnchainOBS() {
  const [userData, setUserData] = useState<any>(null);
  const [entityId, setEntityId] = useState('');
  const [entityName, setEntityName] = useState('');
  const [entityType, setEntityType] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [hasMatch, setHasMatch] = useState(false);
  const [matchId, setMatchId] = useState('');
  const [listName, setListName] = useState('');
  const [confidence, setConfidence] = useState('');
  const [details, setDetails] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [screeningInfo, setScreeningInfo] = useState<any>(null);
  const [matchInfo, setMatchInfo] = useState<any>(null);

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
        name: 'Onchain OBS',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const screenEntity = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'screen-entity',
      functionArgs: [
        stringAsciiCV(entityId),
        stringAsciiCV(entityName),
        stringAsciiCV(entityType),
        stringAsciiCV(riskLevel),
        boolCV(hasMatch)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const recordMatch = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'record-match',
      functionArgs: [
        stringAsciiCV(entityId),
        uintCV(matchId),
        stringAsciiCV(listName),
        uintCV(confidence),
        stringAsciiCV(details)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const resolveMatch = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'resolve-match',
      functionArgs: [stringAsciiCV(entityId), uintCV(matchId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const updateRiskLevel = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'update-risk-level',
      functionArgs: [stringAsciiCV(entityId), stringAsciiCV(newLevel)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getScreeningInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-screening-info',
      functionArgs: [stringAsciiCV(entityId)],
      network,
      senderAddress: contractAddress,
    });

    setScreeningInfo(cvToValue(result));
  };

  const getMatchInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-match-info',
      functionArgs: [stringAsciiCV(entityId), uintCV(matchId)],
      network,
      senderAddress: contractAddress,
    });

    setMatchInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Onchain OBS</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>
          
          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Screen Entity</h3>
            <input placeholder="Entity ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
            <input placeholder="Entity Name" value={entityName} onChange={(e) => setEntityName(e.target.value)} />
            <input placeholder="Entity Type" value={entityType} onChange={(e) => setEntityType(e.target.value)} />
            <input placeholder="Risk Level" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)} />
            <label>
              <input type="checkbox" checked={hasMatch} onChange={(e) => setHasMatch(e.target.checked)} />
              Has Match
            </label>
            <button onClick={screenEntity}>Screen</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Record Match</h3>
            <input placeholder="Entity ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
            <input placeholder="Match ID" value={matchId} onChange={(e) => setMatchId(e.target.value)} />
            <input placeholder="List Name" value={listName} onChange={(e) => setListName(e.target.value)} />
            <input placeholder="Confidence" value={confidence} onChange={(e) => setConfidence(e.target.value)} />
            <input placeholder="Details" value={details} onChange={(e) => setDetails(e.target.value)} />
            <button onClick={recordMatch}>Record</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Resolve Match</h3>
            <input placeholder="Entity ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
            <input placeholder="Match ID" value={matchId} onChange={(e) => setMatchId(e.target.value)} />
            <button onClick={resolveMatch}>Resolve</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Update Risk Level</h3>
            <input placeholder="Entity ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
            <input placeholder="New Level" value={newLevel} onChange={(e) => setNewLevel(e.target.value)} />
            <button onClick={updateRiskLevel}>Update</button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Get Screening Info</h3>
            <input placeholder="Entity ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
            <button onClick={getScreeningInfo}>Get</button>
            {screeningInfo && <pre>{JSON.stringify(screeningInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Get Match Info</h3>
            <input placeholder="Entity ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
            <input placeholder="Match ID" value={matchId} onChange={(e) => setMatchId(e.target.value)} />
            <button onClick={getMatchInfo}>Get</button>
            {matchInfo && <pre>{JSON.stringify(matchInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
