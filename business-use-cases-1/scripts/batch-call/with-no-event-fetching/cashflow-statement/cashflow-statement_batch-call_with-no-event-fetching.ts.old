import { makeContractCall, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const network = new StacksMainnet();
const contractAddress = process.env.CASHFLOW_STATEMENT_CONTRACT_ADDRESS!.split('.')[0];
const contractName = process.env.CASHFLOW_STATEMENT_CONTRACT_ADDRESS!.split('.')[1];
const senderKey = process.env.PRIVATE_KEY!;

async function batchCalls() {
  for (let cycle = 0; cycle < 10; cycle++) {
    console.log(`Starting cycle ${cycle + 1}/10`);
    
    try {
      const registerTx = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'register-company',
        functionArgs: [],
        senderKey,
        network,
        anchorMode: AnchorMode.Any,
      });
      await broadcastTransaction(registerTx, network);
      
      const submitTx = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'submit-statement',
        functionArgs: [],
        senderKey,
        network,
        anchorMode: AnchorMode.Any,
      });
      await broadcastTransaction(submitTx, network);
      
      const updateOperatingTx = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'update-operating-activities',
        functionArgs: [],
        senderKey,
        network,
        anchorMode: AnchorMode.Any,
      });
      await broadcastTransaction(updateOperatingTx, network);
      
      const updateInvestingTx = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'update-investing-activities',
        functionArgs: [],
        senderKey,
        network,
        anchorMode: AnchorMode.Any,
      });
      await broadcastTransaction(updateInvestingTx, network);
      
      const updateFinancingTx = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'update-financing-activities',
        functionArgs: [],
        senderKey,
        network,
        anchorMode: AnchorMode.Any,
      });
      await broadcastTransaction(updateFinancingTx, network);
      
      console.log(`Cycle ${cycle + 1} completed`);
    } catch (error) {
      console.error(`Error in cycle ${cycle + 1}:`, error);
    }
  }
}

batchCalls().catch(console.error);
