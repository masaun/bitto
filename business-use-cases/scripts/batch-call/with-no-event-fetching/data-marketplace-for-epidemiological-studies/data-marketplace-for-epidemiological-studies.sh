echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the data-marketplace-for-epidemiological-studies.clar ..."
npx tsx data-marketplace-for-epidemiological-studies_batch-call_with-no-event-fetching.ts 
