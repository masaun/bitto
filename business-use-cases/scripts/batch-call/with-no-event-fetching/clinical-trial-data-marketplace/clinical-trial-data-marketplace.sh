echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the clinical-trial-data-marketplace.clar ..."
npx tsx clinical-trial-data-marketplace_batch-call_with-no-event-fetching.ts 
