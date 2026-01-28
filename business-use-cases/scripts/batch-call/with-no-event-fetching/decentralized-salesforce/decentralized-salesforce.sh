echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-salesforce.clar ..."
npx tsx decentralized-salesforce_batch-call_with-no-event-fetching.ts 
