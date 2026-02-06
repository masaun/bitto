echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the tokenized-equity-platform.clar ..."
npx tsx tokenized-equity-platform_batch-call_with-no-event-fetching.ts 
