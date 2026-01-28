echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-ai-marketplace.clar ..."
npx tsx decentralized-ai-marketplace_batch-call_with-no-event-fetching.ts 
