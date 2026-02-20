import { 
  callReadOnlyFunction,
  cvToJSON,
  principalCV,
  uintCV,
} from '@stacks/transactions';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Find and load .env file
function findEnvFile(): string | null {
  let currentDir = __dirname || process.cwd();
  
  for (let i = 0; i < 10; i++) {
    const envPath = path.join(currentDir, '.env');
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  return null;
}

const envPath = findEnvFile();
if (envPath) {
  console.log(`Loading env from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

function parseContractIdentifier(envValue: string | undefined, defaultContractName: string): { address: string; name: string } {
  const value = envValue || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.local-city-prosperity';
  
  if (value.includes('.')) {
    const [address, name] = value.split('.');
    return { address, name: name || defaultContractName };
  }
  
  return { address: value, name: defaultContractName };
}

const contractDetails = parseContractIdentifier(
  process.env.LOCAL_CITY_PROSPERITY_CONTRACT_ADDRESS,
  'local-city-prosperity'
);

const SENDER_ADDRESS = process.env.SENDER_ADDRESS || 'SPBD48014EX450A9ED877X6M2SFAZBHYZSVJASWA';
const NETWORK = (process.env.STACKS_NETWORK || 'mainnet') as 'mainnet' | 'testnet';

async function checkParticipantStatus() {
  console.log('\n=== Checking Participant Status ===');
  console.log(`Network: ${NETWORK}`);
  console.log(`Contract: ${contractDetails.address}.${contractDetails.name}`);
  console.log(`Checking address: ${SENDER_ADDRESS}`);
  console.log('');

  try {
    // Check if participant is registered
    const participantResult = await callReadOnlyFunction({
      contractAddress: contractDetails.address,
      contractName: contractDetails.name,
      functionName: 'get-participant',
      functionArgs: [principalCV(SENDER_ADDRESS)],
      network: NETWORK,
      senderAddress: SENDER_ADDRESS,
    });

    const participantData = cvToJSON(participantResult);
    console.log('Participant data:', JSON.stringify(participantData, null, 2));

    if (participantData.success && participantData.value) {
      const participant = participantData.value;
      console.log('\n✓ You are registered as a participant');
      console.log(`  Points: ${participant.points?.value || 0}`);
      console.log(`  Level: ${participant.level?.value || 0}`);
      console.log(`  Active: ${participant.active?.value || false}`);
      
      if (!participant.active?.value) {
        console.log('\n⚠ WARNING: Your participant status is INACTIVE');
        console.log('  You cannot update level or complete quests while inactive');
      }
    } else {
      console.log('\n✗ You are NOT registered as a participant');
      console.log('  You need to call register-participant first');
    }

    // Check total participants
    const totalResult = await callReadOnlyFunction({
      contractAddress: contractDetails.address,
      contractName: contractDetails.name,
      functionName: 'get-total-participants',
      functionArgs: [],
      network: NETWORK,
      senderAddress: SENDER_ADDRESS,
    });

    const totalData = cvToJSON(totalResult);
    console.log(`\nTotal participants: ${totalData.value?.value || 0}`);

    // Check if there are any quests
    console.log('\n=== Checking Quests ===');
    for (let i = 0; i < 5; i++) {
      try {
        const questResult = await callReadOnlyFunction({
          contractAddress: contractDetails.address,
          contractName: contractDetails.name,
          functionName: 'get-quest',
          functionArgs: [uintCV(i)],
          network: NETWORK,
          senderAddress: SENDER_ADDRESS,
        });

        const questData = cvToJSON(questResult);
        if (questData.success && questData.value) {
          console.log(`\nQuest ${i}:`, JSON.stringify(questData.value, null, 2));
        }
      } catch (err) {
        // Quest doesn't exist
      }
    }

    console.log('\n=== Recommendations ===');
    if (!participantData.success || !participantData.value) {
      console.log('1. Call register-participant to register yourself');
    }
    console.log('2. Ask the contract owner to create quests (create-quest)');
    console.log('3. Once quests exist and you are registered, complete-quest');
    console.log('4. After completing a quest, claim-reward');
    console.log('5. You can update-level only if you are registered and active');

  } catch (error) {
    console.error('Error checking status:', error);
  }
}

checkParticipantStatus().catch(console.error);
