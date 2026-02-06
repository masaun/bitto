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

export default function TokenizedSportsClub() {
  const [userData, setUserData] = useState<any>(null);
  const [clubName, setClubName] = useState('');
  const [sport, setSport] = useState('');
  const [totalTokens, setTotalTokens] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [clubId, setClubId] = useState('');
  const [tokens, setTokens] = useState('');
  const [recipient, setRecipient] = useState('');
  const [proposalId, setProposalId] = useState('');
  const [description, setDescription] = useState('');
  const [votingPeriod, setVotingPeriod] = useState('');
  const [holder, setHolder] = useState('');
  const [clubInfo, setClubInfo] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [proposal, setProposal] = useState<any>(null);

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
        name: 'Tokenized Sports Club',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const createClub = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'create-club',
      functionArgs: [
        stringAsciiCV(clubName),
        stringAsciiCV(sport),
        uintCV(totalTokens),
        uintCV(tokenPrice)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const purchaseTokens = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'purchase-tokens',
      functionArgs: [
        uintCV(clubId),
        uintCV(tokens)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const transferTokens = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'transfer-tokens',
      functionArgs: [
        uintCV(clubId),
        uintCV(tokens),
        principalCV(recipient)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const createProposal = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'create-proposal',
      functionArgs: [
        uintCV(clubId),
        stringAsciiCV(description),
        uintCV(votingPeriod)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getClubInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-club-info',
      functionArgs: [uintCV(clubId)],
      network,
      senderAddress: contractAddress,
    });

    setClubInfo(cvToValue(result));
  };

  const getBalance = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-balance',
      functionArgs: [uintCV(clubId), principalCV(holder)],
      network,
      senderAddress: contractAddress,
    });

    setBalance(cvToValue(result));
  };

  const getProposal = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-proposal',
      functionArgs: [uintCV(proposalId)],
      network,
      senderAddress: contractAddress,
    });

    setProposal(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tokenized Sports Club</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Create Club</h2>
            <input placeholder="Club Name" value={clubName} onChange={(e) => setClubName(e.target.value)} />
            <input placeholder="Sport" value={sport} onChange={(e) => setSport(e.target.value)} />
            <input placeholder="Total Tokens" value={totalTokens} onChange={(e) => setTotalTokens(e.target.value)} />
            <input placeholder="Token Price" value={tokenPrice} onChange={(e) => setTokenPrice(e.target.value)} />
            <button onClick={createClub}>Create Club</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Purchase Tokens</h2>
            <input placeholder="Club ID" value={clubId} onChange={(e) => setClubId(e.target.value)} />
            <input placeholder="Tokens" value={tokens} onChange={(e) => setTokens(e.target.value)} />
            <button onClick={purchaseTokens}>Purchase Tokens</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Transfer Tokens</h2>
            <input placeholder="Club ID" value={clubId} onChange={(e) => setClubId(e.target.value)} />
            <input placeholder="Tokens" value={tokens} onChange={(e) => setTokens(e.target.value)} />
            <input placeholder="Recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <button onClick={transferTokens}>Transfer Tokens</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Create Proposal</h2>
            <input placeholder="Club ID" value={clubId} onChange={(e) => setClubId(e.target.value)} />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input placeholder="Voting Period" value={votingPeriod} onChange={(e) => setVotingPeriod(e.target.value)} />
            <button onClick={createProposal}>Create Proposal</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Club Info</h2>
            <input placeholder="Club ID" value={clubId} onChange={(e) => setClubId(e.target.value)} />
            <button onClick={getClubInfo}>Get Club Info</button>
            {clubInfo && <pre>{JSON.stringify(clubInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Balance</h2>
            <input placeholder="Club ID" value={clubId} onChange={(e) => setClubId(e.target.value)} />
            <input placeholder="Holder" value={holder} onChange={(e) => setHolder(e.target.value)} />
            <button onClick={getBalance}>Get Balance</button>
            {balance && <pre>{JSON.stringify(balance, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Proposal</h2>
            <input placeholder="Proposal ID" value={proposalId} onChange={(e) => setProposalId(e.target.value)} />
            <button onClick={getProposal}>Get Proposal</button>
            {proposal && <pre>{JSON.stringify(proposal, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
