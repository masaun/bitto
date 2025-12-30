import { showConnect } from '@stacks/connect';
import { 
  makeContractCall, 
  standardPrincipalCV, 
  uintCV, 
  someCV, 
  noneCV, 
  bufferCV, 
  boolCV,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks';

const network = new StacksMainnet();
const contractAddress = import.meta.env.VITE_RWA_CONTRACT_ADDRESS.split('.')[0];
const contractName = import.meta.env.VITE_RWA_CONTRACT_ADDRESS.split('.')[1];

let userAddress: string | null = null;
let appKit: any = null;

const statusEl = document.getElementById('status')!;

function updateStatus(message: string) {
  statusEl.textContent = message;
}

async function connectHiroWallet() {
  try {
    showConnect({
      appDetails: {
        name: 'RWA Frontend',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        userAddress = data.userSession.loadUserData().profile.stxAddress.mainnet;
        updateStatus(`Connected: ${userAddress}`);
      },
      onCancel: () => {
        updateStatus('Connection cancelled');
      },
      userSession: undefined
    });
  } catch (error) {
    updateStatus('Error connecting to Hiro Wallet');
    console.error(error);
  }
}

async function connectXverseWallet() {
  try {
    showConnect({
      appDetails: {
        name: 'RWA Frontend',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        userAddress = data.userSession.loadUserData().profile.stxAddress.mainnet;
        updateStatus(`Connected: ${userAddress}`);
      },
      onCancel: () => {
        updateStatus('Connection cancelled');
      },
      userSession: undefined
    });
  } catch (error) {
    updateStatus('Error connecting to Xverse Wallet');
    console.error(error);
  }
}

async function connectReownWallet() {
  try {
    const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
    
    const stacksAdapter = new StacksAdapter();
    
    appKit = createAppKit({
      adapters: [stacksAdapter],
      networks: [{
        id: 'stacks',
        name: 'Stacks',
        rpcUrl: 'https://api.mainnet.hiro.so'
      }],
      projectId,
      features: {
        analytics: false
      }
    });

    await appKit.open();
    
    const address = appKit.getAddress();
    if (address) {
      userAddress = address;
      updateStatus(`Connected via Reown: ${userAddress}`);
    }
  } catch (error) {
    updateStatus('Error connecting with Reown');
    console.error(error);
  }
}

async function mint(account: string, amount: number) {
  if (!userAddress) {
    alert('Please connect your wallet first');
    return;
  }

  try {
    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'mint',
      functionArgs: [
        standardPrincipalCV(account),
        uintCV(amount)
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        updateStatus(`Mint transaction submitted: ${data.txId}`);
      }
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus('Error minting tokens');
    console.error(error);
  }
}

async function transfer(amount: number, sender: string, recipient: string, memo?: string) {
  if (!userAddress) {
    alert('Please connect your wallet first');
    return;
  }

  try {
    const memoCV = memo 
      ? someCV(bufferCV(new TextEncoder().encode(memo)))
      : noneCV();

    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'transfer',
      functionArgs: [
        uintCV(amount),
        standardPrincipalCV(sender),
        standardPrincipalCV(recipient),
        memoCV
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        updateStatus(`Transfer transaction submitted: ${data.txId}`);
      }
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus('Error transferring tokens');
    console.error(error);
  }
}

async function forcedTransfer(from: string, to: string, amount: number) {
  if (!userAddress) {
    alert('Please connect your wallet first');
    return;
  }

  try {
    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'forced-transfer',
      functionArgs: [
        standardPrincipalCV(from),
        standardPrincipalCV(to),
        uintCV(amount)
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        updateStatus(`Forced transfer transaction submitted: ${data.txId}`);
      }
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus('Error executing forced transfer');
    console.error(error);
  }
}

async function setFrozenTokens(account: string, amount: number, frozenStatus: boolean) {
  if (!userAddress) {
    alert('Please connect your wallet first');
    return;
  }

  try {
    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'set-frozen-tokens',
      functionArgs: [
        standardPrincipalCV(account),
        uintCV(amount),
        boolCV(frozenStatus)
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        updateStatus(`Set frozen tokens transaction submitted: ${data.txId}`);
      }
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus('Error setting frozen tokens');
    console.error(error);
  }
}

async function setCanTransact(account: string, status: boolean) {
  if (!userAddress) {
    alert('Please connect your wallet first');
    return;
  }

  try {
    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'set-can-transact',
      functionArgs: [
        standardPrincipalCV(account),
        boolCV(status)
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        updateStatus(`Set can transact transaction submitted: ${data.txId}`);
      }
    };

    await makeContractCall(txOptions);
  } catch (error) {
    updateStatus('Error setting can transact');
    console.error(error);
  }
}

document.getElementById('connectHiro')!.addEventListener('click', connectHiroWallet);
document.getElementById('connectXverse')!.addEventListener('click', connectXverseWallet);
document.getElementById('connectReown')!.addEventListener('click', connectReownWallet);

document.getElementById('mintBtn')!.addEventListener('click', () => {
  const account = (document.getElementById('mintAccount') as HTMLInputElement).value;
  const amount = parseInt((document.getElementById('mintAmount') as HTMLInputElement).value);
  
  if (!account || !amount) {
    alert('Please fill in all fields');
    return;
  }
  
  mint(account, amount);
});

document.getElementById('transferBtn')!.addEventListener('click', () => {
  const amount = parseInt((document.getElementById('transferAmount') as HTMLInputElement).value);
  const sender = (document.getElementById('transferSender') as HTMLInputElement).value;
  const recipient = (document.getElementById('transferRecipient') as HTMLInputElement).value;
  const memo = (document.getElementById('transferMemo') as HTMLInputElement).value;
  
  if (!amount || !sender || !recipient) {
    alert('Please fill in all required fields');
    return;
  }
  
  transfer(amount, sender, recipient, memo || undefined);
});

document.getElementById('forcedTransferBtn')!.addEventListener('click', () => {
  const from = (document.getElementById('forcedFrom') as HTMLInputElement).value;
  const to = (document.getElementById('forcedTo') as HTMLInputElement).value;
  const amount = parseInt((document.getElementById('forcedAmount') as HTMLInputElement).value);
  
  if (!from || !to || !amount) {
    alert('Please fill in all fields');
    return;
  }
  
  forcedTransfer(from, to, amount);
});

document.getElementById('setFrozenBtn')!.addEventListener('click', () => {
  const account = (document.getElementById('frozenAccount') as HTMLInputElement).value;
  const amount = parseInt((document.getElementById('frozenAmount') as HTMLInputElement).value);
  const status = (document.getElementById('frozenStatus') as HTMLSelectElement).value === 'true';
  
  if (!account || !amount) {
    alert('Please fill in all fields');
    return;
  }
  
  setFrozenTokens(account, amount, status);
});

document.getElementById('setCanTransactBtn')!.addEventListener('click', () => {
  const account = (document.getElementById('transactAccount') as HTMLInputElement).value;
  const status = (document.getElementById('transactStatus') as HTMLSelectElement).value === 'true';
  
  if (!account) {
    alert('Please fill in all fields');
    return;
  }
  
  setCanTransact(account, status);
});
