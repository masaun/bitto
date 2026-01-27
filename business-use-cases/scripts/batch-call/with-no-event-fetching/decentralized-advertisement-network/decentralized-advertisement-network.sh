echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-advertisement-network.clar ..."
npx tsx decentralized-advertisement-network_batch-call_with-no-event-fetching.ts 
