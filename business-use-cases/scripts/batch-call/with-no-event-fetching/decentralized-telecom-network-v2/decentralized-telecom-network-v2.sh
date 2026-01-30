echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralized-telecom-network-v2.clar ..."
npx tsx decentralized-telecom-network-v2_batch-call_with-no-event-fetching.ts
