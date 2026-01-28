echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the cash-flow-modeling.clar ..."
npx tsx cash-flow-modeling_batch-call_with-no-event-fetching.ts 
