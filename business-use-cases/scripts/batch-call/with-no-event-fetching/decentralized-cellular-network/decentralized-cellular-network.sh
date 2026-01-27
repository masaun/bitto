echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-cellular-network.clar ..."
npx tsx decentralized-cellular-network_batch-call_with-no-event-fetching.ts 
