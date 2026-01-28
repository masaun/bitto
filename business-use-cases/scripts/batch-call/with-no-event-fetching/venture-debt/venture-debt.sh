echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the venture-debt.clar ..."
npx tsx venture-debt_batch-call_with-no-event-fetching.ts 
