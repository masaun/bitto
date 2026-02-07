echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-telecom-network.clar ..."
npx tsx decentralized-telecom-network_batch-call_with-no-event-fetching.ts 
