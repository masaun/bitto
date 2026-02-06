echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the onchain-kyc.clar ..."
npx tsx onchain-kyc_batch-call_with-no-event-fetching.ts 
