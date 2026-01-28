echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the virtual-power-plants.clar ..."
npx tsx virtual-power-plants_batch-call_with-no-event-fetching.ts 
