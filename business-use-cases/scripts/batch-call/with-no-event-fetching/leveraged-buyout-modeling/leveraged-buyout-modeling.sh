echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the leveraged-buyout-modeling.clar ..."
npx tsx leveraged-buyout-modeling_batch-call_with-no-event-fetching.ts 
