echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the perp-dex-for-prediction-market.clar ..."
npx tsx perp-dex-for-prediction-market_batch-call_with-no-event-fetching.ts 
