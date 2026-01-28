echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the asset-based-lending.clar ..."
npx tsx asset-based-lending_batch-call_with-no-event-fetching.ts 