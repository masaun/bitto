echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the insurance-for-ip-breach.clar ..."
npx tsx insurance-for-ip-breach_batch-call_with-no-event-fetching.ts 
