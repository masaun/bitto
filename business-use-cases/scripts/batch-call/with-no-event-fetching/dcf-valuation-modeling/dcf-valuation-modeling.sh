echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the dcf-valuation-modeling.clar ..."
npx tsx dcf-valuation-modeling_batch-call_with-no-event-fetching.ts 
