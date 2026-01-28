echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the incentives-to-deploy-new-solar-panels.clar ..."
npx tsx incentives-to-deploy-new-solar-panels_batch-call_with-no-event-fetching.ts 
