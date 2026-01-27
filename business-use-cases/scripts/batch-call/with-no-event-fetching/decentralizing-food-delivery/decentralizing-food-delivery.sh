echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the decentralizing-food-delivery.clar ..."
npx tsx decentralizing-food-delivery_batch-call_with-no-event-fetching.ts 
