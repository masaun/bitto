echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the gpu-clusters-backed-private-credit.clar ..."
npx tsx gpu-clusters-backed-private-credit_batch-call_with-no-event-fetching.ts 
