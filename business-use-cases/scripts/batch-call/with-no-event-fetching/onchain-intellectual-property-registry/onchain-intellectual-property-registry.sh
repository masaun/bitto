echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the onchain-intellectual-property-registry.clar ..."
npx tsx onchain-intellectual-property-registry_batch-call_with-no-event-fetching.ts 
