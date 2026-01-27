echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the micropayment-with-revenue-sharing.clar ..."
npx tsx micropayment-with-revenue-sharing_batch-call_with-no-event-fetching.ts 
