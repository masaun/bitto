import { makeContractCall, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const NETWORK = process.env.STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const CONTRACT_NAME = 'insurance-for-ip-breach';
const SENDER_KEY = process.env.SENDER_KEY!;

async function executeBatchCalls() {
  const functionNames = [
    'purchase-policy',
    'file-claim',
    'assess-claim',
    'approve-claim',
    'reject-claim'
  ];

  for (let cycle = 1; cycle <= 10; cycle++) {
    console.log(`\n=== Cycle ${cycle}/10 ===`);
    
    for (const fnName of functionNames) {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: fnName,
        functionArgs: [],
        senderKey: SENDER_KEY,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
      };

      try {
        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
        console.log(`${fnName}: ${broadcastResponse.txid}`);
      } catch (error) {
        console.error(`${fnName} failed:`, error);
      }
    }
  }
}

executeBatchCalls().catch(console.error);
