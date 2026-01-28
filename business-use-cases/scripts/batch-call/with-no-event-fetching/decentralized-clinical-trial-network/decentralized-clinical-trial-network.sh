echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-clinical-trial-network.clar ..."
npx tsx decentralized-clinical-trial-network_batch-call_with-no-event-fetching.ts 
