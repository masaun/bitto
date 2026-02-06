echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the prediction-market.clar ..."
npx tsx prediction-market_batch-call_with-no-event-fetching.ts 
