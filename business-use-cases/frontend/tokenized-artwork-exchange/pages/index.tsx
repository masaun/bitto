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

export default function TokenizedArtworkExchange() {
  const [userData, setUserData] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [creationYear, setCreationYear] = useState('');
  const [medium, setMedium] = useState('');
  const [totalShares, setTotalShares] = useState('');
  const [artworkId, setArtworkId] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [listingId, setListingId] = useState('');
  const [holder, setHolder] = useState('');
  const [artworkInfo, setArtworkInfo] = useState<any>(null);
  const [sharesInfo, setSharesInfo] = useState<any>(null);
  const [listingInfo, setListingInfo] = useState<any>(null);

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
        name: 'Tokenized Artwork Exchange',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const tokenizeArtwork = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'tokenize-artwork',
      functionArgs: [
        stringAsciiCV(title),
        stringAsciiCV(artist),
        uintCV(creationYear),
        stringAsciiCV(medium),
        uintCV(totalShares)
      ],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const createListing = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'create-listing',
      functionArgs: [uintCV(artworkId), uintCV(shares), uintCV(price)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const purchaseShares = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'purchase-shares',
      functionArgs: [uintCV(listingId), uintCV(shares)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const verifyArtwork = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'verify-artwork',
      functionArgs: [uintCV(artworkId)],
      senderKey: userData.profile.stxAddress.mainnet,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    await broadcastTransaction(transaction, network);
  };

  const getArtworkInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-artwork-info',
      functionArgs: [uintCV(artworkId)],
      network,
      senderAddress: contractAddress,
    });

    setArtworkInfo(cvToValue(result));
  };

  const getShares = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-shares',
      functionArgs: [uintCV(artworkId), principalCV(holder)],
      network,
      senderAddress: contractAddress,
    });

    setSharesInfo(cvToValue(result));
  };

  const getListingInfo = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-listing-info',
      functionArgs: [uintCV(listingId)],
      network,
      senderAddress: contractAddress,
    });

    setListingInfo(cvToValue(result));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tokenized Artwork Exchange</h1>
      {!userData ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userData.profile.stxAddress.mainnet}</p>

          <div style={{ marginTop: '20px' }}>
            <h2>Tokenize Artwork</h2>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
            <input placeholder="Creation Year" value={creationYear} onChange={(e) => setCreationYear(e.target.value)} />
            <input placeholder="Medium" value={medium} onChange={(e) => setMedium(e.target.value)} />
            <input placeholder="Total Shares" value={totalShares} onChange={(e) => setTotalShares(e.target.value)} />
            <button onClick={tokenizeArtwork}>Tokenize Artwork</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Create Listing</h2>
            <input placeholder="Artwork ID" value={artworkId} onChange={(e) => setArtworkId(e.target.value)} />
            <input placeholder="Shares" value={shares} onChange={(e) => setShares(e.target.value)} />
            <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <button onClick={createListing}>Create Listing</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Purchase Shares</h2>
            <input placeholder="Listing ID" value={listingId} onChange={(e) => setListingId(e.target.value)} />
            <input placeholder="Shares" value={shares} onChange={(e) => setShares(e.target.value)} />
            <button onClick={purchaseShares}>Purchase Shares</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Verify Artwork</h2>
            <input placeholder="Artwork ID" value={artworkId} onChange={(e) => setArtworkId(e.target.value)} />
            <button onClick={verifyArtwork}>Verify Artwork</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Artwork Info</h2>
            <input placeholder="Artwork ID" value={artworkId} onChange={(e) => setArtworkId(e.target.value)} />
            <button onClick={getArtworkInfo}>Get Artwork Info</button>
            {artworkInfo && <pre>{JSON.stringify(artworkInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Shares</h2>
            <input placeholder="Artwork ID" value={artworkId} onChange={(e) => setArtworkId(e.target.value)} />
            <input placeholder="Holder" value={holder} onChange={(e) => setHolder(e.target.value)} />
            <button onClick={getShares}>Get Shares</button>
            {sharesInfo && <pre>{JSON.stringify(sharesInfo, null, 2)}</pre>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>Get Listing Info</h2>
            <input placeholder="Listing ID" value={listingId} onChange={(e) => setListingId(e.target.value)} />
            <button onClick={getListingInfo}>Get Listing Info</button>
            {listingInfo && <pre>{JSON.stringify(listingInfo, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}
