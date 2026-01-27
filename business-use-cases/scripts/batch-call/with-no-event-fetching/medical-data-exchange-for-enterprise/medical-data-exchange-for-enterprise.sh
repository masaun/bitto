echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the medical-data-exchange-for-enterprise.clar ..."
npx tsx medical-data-exchange-for-enterprise_batch-call_with-no-event-fetching.ts 
