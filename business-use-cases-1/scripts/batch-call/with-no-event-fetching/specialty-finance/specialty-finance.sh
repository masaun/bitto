echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the specialty-finance.clar ..."
npx tsx specialty-finance_batch-call_with-no-event-fetching.ts 
