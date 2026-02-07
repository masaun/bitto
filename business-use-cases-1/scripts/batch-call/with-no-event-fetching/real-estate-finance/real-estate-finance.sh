echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the real-estate-finance.clar ..."
npx tsx real-estate-finance_batch-call_with-no-event-fetching.ts 
