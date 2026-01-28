echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the senior-direct-lending.clar ..."
npx tsx senior-direct-lending_batch-call_with-no-event-fetching.ts 
