echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the distressed-debt.clar ..."
npx tsx distressed-debt_batch-call_with-no-event-fetching.ts 
