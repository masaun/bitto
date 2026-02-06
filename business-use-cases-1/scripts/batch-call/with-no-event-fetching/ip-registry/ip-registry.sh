echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the ip-registry.clar ..."
npx tsx ip-registry_batch-call_with-no-event-fetching.ts 
