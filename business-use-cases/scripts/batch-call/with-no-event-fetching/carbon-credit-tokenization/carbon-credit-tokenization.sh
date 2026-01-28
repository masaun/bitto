echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the carbon-credit-tokenization.clar ..."
npx tsx carbon-credit-tokenization_batch-call_with-no-event-fetching.ts 
