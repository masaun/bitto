echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-geolocation-network.clar ..."
npx tsx decentralized-geolocation-network_batch-call_with-no-event-fetching.ts 
