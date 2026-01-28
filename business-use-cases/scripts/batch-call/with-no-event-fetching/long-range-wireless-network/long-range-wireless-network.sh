echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the long-range-wireless-network.clar ..."
npx tsx long-range-wireless-network_batch-call_with-no-event-fetching.ts 
