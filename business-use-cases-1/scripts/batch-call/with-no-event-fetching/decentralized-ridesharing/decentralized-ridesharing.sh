echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-ridesharing.clar ..."
npx tsx decentralized-ridesharing_batch-call_with-no-event-fetching.ts 
