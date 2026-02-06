echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the onchain-etf-market.clar ..."
npx tsx onchain-etf-market_batch-call_with-no-event-fetching.ts 
