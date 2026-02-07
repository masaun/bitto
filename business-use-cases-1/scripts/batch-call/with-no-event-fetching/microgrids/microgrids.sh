echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the microgrids.clar ..."
npx tsx microgrids_batch-call_with-no-event-fetching.ts 
