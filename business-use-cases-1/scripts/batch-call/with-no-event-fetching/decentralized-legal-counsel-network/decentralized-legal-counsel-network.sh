echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-legal-counsel-network.clar ..."
npx tsx decentralized-legal-counsel-network_batch-call_with-no-event-fetching.ts 
