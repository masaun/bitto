import { makeContractCall, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const contractAddress = process.env.ZERO_KNOWLEDGE_QUOTE_PROOF_CONTRACT_ADDRESS || '';
const contractName = 'zero-knowledge-quote-proof';

async function batchCallContract() {
  const network = new StacksMainnet();
  
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'register',
    functionArgs: [],
    senderKey: process.env.PRIVATE_KEY || '',
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  console.log('Transaction ID:', broadcastResponse.txid);
}

batchCallContract().catch(console.error);
