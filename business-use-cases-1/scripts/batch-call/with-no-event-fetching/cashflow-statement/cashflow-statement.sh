echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the cashflow-statement.clar ..."
npx tsx cashflow-statement_batch-call_with-no-event-fetching.ts 
