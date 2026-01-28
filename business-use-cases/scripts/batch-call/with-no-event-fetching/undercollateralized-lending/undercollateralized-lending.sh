echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the undercollateralized-lending.clar ..."
npx tsx undercollateralized-lending_batch-call_with-no-event-fetching.ts 
