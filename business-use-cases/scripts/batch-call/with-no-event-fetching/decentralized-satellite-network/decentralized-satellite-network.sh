echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-satellite-network.clar ..."
npx tsx decentralized-satellite-network_batch-call_with-no-event-fetching.ts 
