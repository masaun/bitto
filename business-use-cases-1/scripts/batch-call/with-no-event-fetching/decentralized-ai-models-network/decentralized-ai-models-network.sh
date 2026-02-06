echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-ai-models-network.clar ..."
npx tsx decentralized-ai-models-network_batch-call_with-no-event-fetching.ts 
