echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-cdn-network.clar ..."
npx tsx decentralized-cdn-network_batch-call_with-no-event-fetching.ts 
