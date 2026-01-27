echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the fixed-wireless-access-network.clar ..."
npx tsx fixed-wireless-access-network_batch-call_with-no-event-fetching.ts 
