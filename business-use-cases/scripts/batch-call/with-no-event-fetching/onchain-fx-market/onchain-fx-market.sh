echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the onchain-fx-market.clar ..."
npx tsx onchain-fx-market_batch-call_with-no-event-fetching.ts 
